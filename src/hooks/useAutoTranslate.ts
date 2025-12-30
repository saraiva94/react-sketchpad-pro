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
  // Importante: não inicializar com o valor original quando o idioma não é PT,
  // senão os componentes nunca entram em estado "pending" (skeleton) e parecem "não traduzir".
  const [translated, setTranslated] = useState<T | null | undefined>(undefined);
  const [isTranslating, setIsTranslating] = useState(false);
  const [retryTick, setRetryTick] = useState(0);
  const retryTimeoutRef = useRef<number | null>(null);
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
      if (retryTimeoutRef.current) {
        window.clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    // Se idioma é PT ou valor nulo, retorna o valor original
    if (language === "pt" || value === null || value === undefined) {
      setTranslated(value);
      setIsTranslating(false);
      lastLangRef.current = language;
      return;
    }

    const valueKey = getValueKey(value);
    const languageChanged = language !== lastLangRef.current;
    const valueChanged = valueKey !== lastValueRef.current;
    const isRetry = retryTick > 0;

    // Sempre atualiza refs imediatamente
    lastValueRef.current = valueKey;
    lastLangRef.current = language;

    // Se nada mudou e não é retry, não refaz a tradução
    if (!languageChanged && !valueChanged && !isRetry) {
      return;
    }

    // Reset retryTick após usar
    if (isRetry) {
      setRetryTick(0);
    }

    let cancelled = false;

    const loadTranslation = async () => {
      if (!mountedRef.current) return;

      // Marca como "pendente" para permitir skeleton enquanto busca tradução.
      setTranslated(undefined);
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

        // Se foi rate limit, agendar retry automático
        if (msg.includes("rate_limited") || msg.includes("rate limit") || msg.includes("429")) {
          const retryDelayMs = 2500;
          if (retryTimeoutRef.current) window.clearTimeout(retryTimeoutRef.current);
          retryTimeoutRef.current = window.setTimeout(() => {
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
  }, [namespace, value, language, getValueKey, retryTick]);

  return {
    translated,
    isTranslating,
  };
}
