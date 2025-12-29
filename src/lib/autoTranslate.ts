/**
 * Client-side helper to auto-translate dynamic backend content (e.g., settings) when language != 'pt'.
 * Uses centralized translation cache with deduplication.
 */

import { getOrTranslate } from "@/lib/translationCache";
import type { Language } from "@/lib/i18n";

/**
 * Traduz um valor de forma assíncrona, usando cache quando disponível.
 * @deprecated Use useAutoTranslate hook or getOrTranslate from translationCache
 */
export async function autoTranslateValue<T>(
  namespace: string,
  value: T,
  language: Language
): Promise<T> {
  return getOrTranslate(namespace, value, language);
}
