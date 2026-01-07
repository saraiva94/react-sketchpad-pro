/**
 * Hook para traduzir automaticamente conteúdo do backend quando o idioma não for PT.
 * Usa o TranslationManager com sistema de fila e rate limiting.
 */
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
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
  // Inicializa com o valor original para evitar textos vazios
  const [translated, setTranslated] = useState<T | null | undefined>(value);
  const [isTranslating, setIsTranslating] = useState(false);
  const [retryTick, setRetryTick] = useState(0);
  const retryTimeoutRef = useRef<number | null>(null);
  const mountedRef = useRef(true);
  const lastTranslatedKeyRef = useRef<string>("");

  // Estabilizar o stringify do valor - memoizado para evitar recálculos
  const valueKey = useMemo(() => {
    if (value === null || value === undefined) return "";
    return typeof value === "string" ? value : JSON.stringify(value);
  }, [value]);

  // Chave única que combina namespace, valor e idioma
  const translationKey = useMemo(() => {
    return `${namespace}:${language}:${valueKey}`;
  }, [namespace, language, valueKey]);

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
      return;
    }

    // CRÍTICO: Evitar loop infinito - só processa se a chave realmente mudou
    const isRetry = retryTick > 0;
    const keyChanged = translationKey !== lastTranslatedKeyRef.current;
    
    if (!keyChanged && !isRetry) {
      return;
    }

    // Atualiza a ref ANTES de processar para evitar loops
    lastTranslatedKeyRef.current = translationKey;

    // Reset retryTick após usar
    if (isRetry) {
      setRetryTick(0);
    }

    let cancelled = false;

    const loadTranslation = async () => {
      if (!mountedRef.current) return;

      // Mantém o valor original visível enquanto busca a tradução
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
  }, [translationKey, retryTick, namespace, value, language]);

  // Sempre retorna um valor válido: tradução ou fallback para original
  return {
    translated: translated ?? value,
    isTranslating,
  };
}
