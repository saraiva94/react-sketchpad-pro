/**
 * Hook para traduzir automaticamente conteúdo do backend quando o idioma não for PT.
 * Usa o TranslationManager com sistema de fila e rate limiting.
 */
import { useState, useEffect, useRef } from "react";
import { useLanguage } from "./useLanguage";
import { translationManager } from "@/lib/translationManager";

interface UseAutoTranslateOptions {
  enabled?: boolean;
  fallback?: unknown;
  onTranslationComplete?: (translated: unknown) => void;
}

export function useAutoTranslate<T = unknown>(
  namespace: string,
  value: T | null | undefined,
  options: UseAutoTranslateOptions = {}
): {
  translated: T | null | undefined;
  isTranslating: boolean;
  error: Error | null;
} {
  const { language } = useLanguage();
  const [translated, setTranslated] = useState<T | null | undefined>(value);
  const [isTranslating, setIsTranslating] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const lastValueRef = useRef<string>("");
  const lastLangRef = useRef<string>(language);

  const { enabled = true, fallback = null, onTranslationComplete } = options;

  useEffect(() => {
    // Se idioma é PT, desabilitado, ou valor nulo, não traduz
    if (!enabled || language === "pt" || value === null || value === undefined) {
      setTranslated(value);
      setIsTranslating(false);
      return;
    }

    // Verificar se valor ou idioma mudou
    const valueKey = typeof value === "string" ? value : JSON.stringify(value);
    if (valueKey === lastValueRef.current && language === lastLangRef.current) {
      return;
    }

    lastValueRef.current = valueKey;
    lastLangRef.current = language;

    // Cancelar requisição anterior se houver
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    const loadTranslation = async () => {
      setIsTranslating(true);
      setError(null);

      try {
        const result = await translationManager.getTranslation(
          namespace,
          value,
          language
        );

        // Verificar se não foi abortado
        if (!abortControllerRef.current?.signal.aborted) {
          setTranslated(result);
          onTranslationComplete?.(result);
        }
      } catch (err) {
        if (!abortControllerRef.current?.signal.aborted) {
          setError(err as Error);
          setTranslated((fallback as T) || value);
        }
      } finally {
        if (!abortControllerRef.current?.signal.aborted) {
          setIsTranslating(false);
        }
      }
    };

    loadTranslation();

    return () => {
      abortControllerRef.current?.abort();
    };
  }, [namespace, value, language, enabled, fallback, onTranslationComplete]);

  return { translated, isTranslating, error };
}
