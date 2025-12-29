// Lovable Cloud function: translate arbitrary JSON (strings inside) from PT -> target language.
// - Input: { targetLanguage: 'en' | 'es', value: any }
// - Output: { value: any }

// deno-lint-ignore-file no-explicit-any


const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type Language = "pt" | "en" | "es";

type Body = {
  targetLanguage: Language;
  value: any;
};

const isProbablyUrl = (s: string) => /^(https?:\/\/|mailto:|tel:)/i.test(s);

// Light pre-walk to avoid translating obvious URLs.
const stripUrls = (value: any): any => {
  if (typeof value === "string") return isProbablyUrl(value) ? value : value;
  if (Array.isArray(value)) return value.map(stripUrls);
  if (value && typeof value === "object") {
    const out: Record<string, any> = {};
    for (const [k, v] of Object.entries(value)) out[k] = stripUrls(v);
    return out;
  }
  return value;
};

async function translateWithGateway(value: any, targetLanguage: Exclude<Language, "pt">) {
  const apiKey = Deno.env.get("LOVABLE_API_KEY");
  if (!apiKey) throw new Error("Missing LOVABLE_API_KEY");

  const payload = JSON.stringify(stripUrls(value));

  const system = [
    "You are a professional translator.",
    "Translate Brazilian Portuguese (pt-BR) into the requested language.",
    "You will receive JSON. Translate ONLY string VALUES, never change keys, numbers, booleans, arrays, or structure.",
    "Do NOT translate URLs, emails, phones, or handle-like strings.",
    "Return VALID JSON only, no markdown, no explanations.",
  ].join(" ");

  const user = {
    targetLanguage,
    json: payload,
  };

  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: system },
        {
          role: "user",
          content: JSON.stringify(user),
        },
      ],
      temperature: 0.2,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Gateway error ${res.status}: ${text}`);
  }

  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content || typeof content !== "string") throw new Error("Invalid gateway response");

  // The model should return JSON only. We support two valid shapes:
  // 1) the translated JSON directly (string/object/array/etc)
  // 2) a wrapper object: { targetLanguage, json: "..." }
  // In case (2), we must parse the `json` field to get the real translated value.
  const parseModelJson = (raw: string): any => {
    try {
      return JSON.parse(raw);
    } catch {
      // Sometimes models wrap JSON; attempt a safe extraction.
      const firstObj = raw.indexOf("{");
      const lastObj = raw.lastIndexOf("}");
      if (firstObj !== -1 && lastObj !== -1 && lastObj > firstObj) {
        return JSON.parse(raw.slice(firstObj, lastObj + 1));
      }

      const firstArr = raw.indexOf("[");
      const lastArr = raw.lastIndexOf("]");
      if (firstArr !== -1 && lastArr !== -1 && lastArr > firstArr) {
        return JSON.parse(raw.slice(firstArr, lastArr + 1));
      }

      throw new Error("Could not parse JSON from model");
    }
  };

  const parsed = parseModelJson(content);

  // Unwrap wrapper responses
  if (
    parsed &&
    typeof parsed === "object" &&
    !Array.isArray(parsed) &&
    typeof (parsed as any).json === "string"
  ) {
    return parseModelJson((parsed as any).json);
  }

  return parsed;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  // Fail-safe defaults (so the UI never breaks if gateway is down / rate-limited)
  let targetLanguage: Language | undefined;
  let value: any = null;

  try {
    const body = (await req.json()) as Body;
    targetLanguage = body?.targetLanguage;
    value = body?.value;

    if (!targetLanguage || (targetLanguage !== "pt" && targetLanguage !== "en" && targetLanguage !== "es")) {
      return new Response(JSON.stringify({ error: "invalid targetLanguage" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (targetLanguage === "pt") {
      return new Response(JSON.stringify({ value }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const translated = await translateWithGateway(value, targetLanguage);

    return new Response(JSON.stringify({ value: translated }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    const message = (e as Error)?.message ?? "Unknown error";
    console.error("translate function error:", message);

    // IMPORTANT: Always return 200 with original value to avoid crashing the frontend
    return new Response(JSON.stringify({ value, error: message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
