// Client-side helper to auto-translate dynamic backend content (e.g., settings) when language != 'pt'
// Uses Lovable Cloud functions (supabase.functions.invoke) and caches results in-memory + localStorage.

import { supabase } from "@/integrations/supabase/client";
import type { Language } from "@/lib/i18n";

const memoryCache = new Map<string, unknown>();

const isProbablyUrl = (s: string) => /^(https?:\/\/|mailto:|tel:)/i.test(s);

const stableStringify = (value: unknown) => {
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
};

const makeCacheKey = (namespace: string, lang: Language, value: unknown) => {
  // Keep it simple: namespace + lang + a prefix of the payload.
  // This avoids crypto while still preventing most collisions.
  const payload = stableStringify(value);
  return `i18n:auto:${namespace}:${lang}:${payload.slice(0, 800)}`;
};

export async function autoTranslateValue<T>(
  namespace: string,
  value: T,
  language: Language
): Promise<T> {
  // Portuguese is our source of truth.
  if (language === "pt") return value;

  // Quick escape: nothing to translate
  if (value == null) return value;

  const cacheKey = makeCacheKey(namespace, language, value);

  if (memoryCache.has(cacheKey)) {
    return memoryCache.get(cacheKey) as T;
  }

  const stored = localStorage.getItem(cacheKey);
  if (stored) {
    try {
      const parsed = JSON.parse(stored) as T;

      // Safety: do not reuse invalid cached objects
      if (
        parsed &&
        typeof parsed === "object" &&
        ("targetLanguage" in (parsed as any) || "json" in (parsed as any))
      ) {
        localStorage.removeItem(cacheKey);
      } else {
        memoryCache.set(cacheKey, parsed);
        return parsed;
      }
    } catch {
      // ignore
    }
  }

  // Avoid calling translation for plain URLs
  if (typeof value === "string" && isProbablyUrl(value)) return value;

  const { data, error } = await supabase.functions.invoke("translate", {
    body: {
      targetLanguage: language,
      value,
    },
  });

  if (error) {
    // Fail-safe: return original
    return value;
  }

  const translated = (data?.value ?? value) as T;

  // Safety: never allow gateway/SDK metadata objects to escape into the UI
  if (
    translated &&
    typeof translated === "object" &&
    ("targetLanguage" in (translated as any) || "json" in (translated as any))
  ) {
    return value;
  }

  memoryCache.set(cacheKey, translated);
  try {
    localStorage.setItem(cacheKey, JSON.stringify(translated));
  } catch {
    // ignore quota errors
  }

  return translated;
}
