/**
 * Hook para traduzir automaticamente conteúdo do backend quando o idioma não for PT.
 * Usa o TranslationManager com sistema de fila e rate limiting.
 */
import { useState, useEffect, useRef, useCallback } from "react";
import { useLanguage } from "./useLanguage";
import { translationManager } from "@/lib/translationManager";

export function useAutoTranslate<T = unknown>(
  namespace: string,
  value: T | null | undefined
): {
  translated: T | null | undefined;
  isTranslating: boolean;
} {
  const { language } = useLanguage();
  const [translated, setTranslated] = useState<T | null | undefined>(value);
  const [isTranslating, setIsTranslating] = useState(false);
  const [retryTick, setRetryTick] = useState(0);
  const mountedRef = useRef(true);
  const lastValueRef = useRef<string>("");
  const lastLangRef = useRef<string>(language);

  // Estabilizar o stringify do valor
  const getValueKey = useCallback((v: T | null | undefined): string => {
    if (v === null || v === undefined) return "";
    return typeof v === "string" ? v : JSON.stringify(v);
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    // Se idioma é PT ou valor nulo, retorna o valor original
    if (language === "pt" || value === null || value === undefined) {
      setTranslated(value);
      setIsTranslating(false);
      return;
    }

    const valueKey = getValueKey(value);

    // Se nada mudou (e não é uma tentativa de retry), não faz nada
    if (valueKey === lastValueRef.current && language === lastLangRef.current && retryTick === 0) {
      return;
    }

    // Atualiza refs sempre que rodar de fato
    lastValueRef.current = valueKey;
    lastLangRef.current = language;

    let cancelled = false;

    const loadTranslation = async () => {
      if (!mountedRef.current) return;

      setIsTranslating(true);

      try {
        const result = await translationManager.getTranslation(namespace, value, language);

        if (!cancelled && mountedRef.current) {
          setTranslated(result);
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error("[useAutoTranslate] Error:", err);

        if (!cancelled && mountedRef.current) {
          // Em caso de erro, usar o valor original
          setTranslated(value);
        }

        // Se foi rate limit, agendar retry automático (sem exigir interação do usuário)
        if (msg.includes("rate_limited") || msg.includes("rate limit") || msg.includes("429")) {
          const retryDelayMs = 2500;
          window.setTimeout(() => {
            if (!mountedRef.current) return;
            setRetryTick((t) => t + 1);
          }, retryDelayMs);
        }
      } finally {
        if (!cancelled && mountedRef.current) {
          setIsTranslating(false);
        }
      }
    };

    loadTranslation();

    return () => {
      cancelled = true;
    };
    // retryTick força nova tentativa quando houve rate-limit
  }, [namespace, value, language, getValueKey, retryTick]);

  // Sempre retorna um valor válido (nunca null quando value existe)
  return {
    translated: translated ?? value,
    isTranslating,
  };
}
