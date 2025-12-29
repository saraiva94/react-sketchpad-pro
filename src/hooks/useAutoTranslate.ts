/**
 * Hook para traduzir automaticamente conteúdo do backend quando o idioma não for PT.
 * Usa sistema de cache centralizado para evitar chamadas duplicadas à API.
 */
import { useState, useEffect, useRef } from "react";
import { useLanguage } from "./useLanguage";
import {
  makeCacheKey,
  getFromCache,
  translateValue,
} from "@/lib/translationCache";
import type { Language } from "@/lib/i18n";

const stableStringify = (value: unknown): string => {
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
};

export function useAutoTranslate<T>(
  namespace: string,
  value: T | null | undefined
): { translated: T | null | undefined; isTranslating: boolean } {
  const { language } = useLanguage();
  const [translated, setTranslated] = useState<T | null | undefined>(value);
  const [isTranslating, setIsTranslating] = useState(false);
  const lastValueRef = useRef<string>("");
  const lastLangRef = useRef<Language>(language);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    // PT é o idioma original - não traduz
    if (language === "pt" || value === null || value === undefined) {
      setTranslated(value);
      setIsTranslating(false);
      return;
    }

    const valueKey = stableStringify(value);

    // Se não mudou, não refaz
    if (valueKey === lastValueRef.current && language === lastLangRef.current) {
      return;
    }

    lastValueRef.current = valueKey;
    lastLangRef.current = language;

    const cacheKey = makeCacheKey(namespace, language, value);

    // Verificar cache primeiro (síncrono)
    const cached = getFromCache(cacheKey, value);
    if (cached !== null) {
      setTranslated(cached);
      setIsTranslating(false);
      return;
    }

    // Precisa buscar tradução
    const doTranslate = async () => {
      setIsTranslating(true);
      try {
        const result = await translateValue(
          cacheKey,
          value,
          language as Exclude<Language, "pt">
        );
        if (mountedRef.current) {
          setTranslated(result);
        }
      } catch {
        if (mountedRef.current) {
          setTranslated(value);
        }
      } finally {
        if (mountedRef.current) {
          setIsTranslating(false);
        }
      }
    };

    doTranslate();
  }, [namespace, value, language]);

  return { translated, isTranslating };
}
