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
    const input = raw.trim();

    // Parse ONLY the first JSON value from a string that may contain trailing text.
    const extractFirstJsonValue = (s: string): string => {
      const t = s.trimStart();
      if (!t) throw new Error("Empty model response");

      const start = s.indexOf(t[0]);
      const first = t[0];

      // JSON string
      if (first === '"') {
        let i = start + 1;
        let escaped = false;
        while (i < s.length) {
          const ch = s[i];
          if (escaped) {
            escaped = false;
          } else if (ch === "\\") {
            escaped = true;
          } else if (ch === '"') {
            return s.slice(start, i + 1);
          }
          i++;
        }
        throw new Error("Unterminated JSON string");
      }

      // JSON object/array
      if (first === "{" || first === "[") {
        const stack: string[] = [first];
        let i = start + 1;
        let inString = false;
        let escaped = false;

        while (i < s.length) {
          const ch = s[i];

          if (inString) {
            if (escaped) {
              escaped = false;
            } else if (ch === "\\") {
              escaped = true;
            } else if (ch === '"') {
              inString = false;
            }
            i++;
            continue;
          }

          if (ch === '"') {
            inString = true;
            i++;
            continue;
          }

          if (ch === "{" || ch === "[") {
            stack.push(ch);
          } else if (ch === "}" || ch === "]") {
            const open = stack.pop();
            const ok =
              (open === "{" && ch === "}") ||
              (open === "[" && ch === "]");
            if (!ok) throw new Error("Mismatched JSON brackets");
            if (stack.length === 0) {
              return s.slice(start, i + 1);
            }
          }

          i++;
        }

        throw new Error("Unterminated JSON object/array");
      }

      // JSON primitives: number | true | false | null
      // Take until first whitespace (good enough for our gateway responses)
      const end = start + t.search(/\s/) ;
      if (end > start) return s.slice(start, end);
      return s.slice(start);
    };

    try {
      return JSON.parse(input);
    } catch {
      try {
        return JSON.parse(extractFirstJsonValue(raw));
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
    }
  };

  let parsed = parseModelJson(content);

  // Unwrap wrapper responses { targetLanguage: ..., json: "..." }
  if (
    parsed &&
    typeof parsed === "object" &&
    !Array.isArray(parsed) &&
    typeof (parsed as any).json === "string"
  ) {
    try {
      parsed = parseModelJson((parsed as any).json);
    } catch {
      // Se falhar, usar o json diretamente
      parsed = (parsed as any).json;
    }
  }

  // Se for string com aspas escapadas, fazer parse novamente
  if (typeof parsed === "string" && parsed.startsWith('"') && parsed.endsWith('"')) {
    try {
      parsed = JSON.parse(parsed);
    } catch {
      // Manter como está
    }
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
