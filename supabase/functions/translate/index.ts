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

  try {
    return JSON.parse(content);
  } catch {
    // Sometimes models wrap JSON; attempt a safe extraction.
    const first = content.indexOf("{");
    const last = content.lastIndexOf("}");
    if (first !== -1 && last !== -1 && last > first) {
      return JSON.parse(content.slice(first, last + 1));
    }
    throw new Error("Could not parse JSON from model");
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = (await req.json()) as Body;
    const targetLanguage = body?.targetLanguage;

    if (!targetLanguage || (targetLanguage !== "pt" && targetLanguage !== "en" && targetLanguage !== "es")) {
      return new Response(JSON.stringify({ error: "invalid targetLanguage" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const value = body?.value;
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
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
