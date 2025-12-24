// Hook para traduzir automaticamente conteúdo do backend quando o idioma não for PT
import { useState, useEffect, useRef } from 'react';
import { useLanguage } from './useLanguage';
import { supabase } from '@/integrations/supabase/client';
import type { Language } from '@/lib/i18n';

const memoryCache = new Map<string, unknown>();

const stableStringify = (value: unknown) => {
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
};

const makeCacheKey = (namespace: string, lang: Language, value: unknown) => {
  const payload = stableStringify(value);
  return `i18n:auto:${namespace}:${lang}:${payload.slice(0, 500)}`;
};

export function useAutoTranslate<T>(
  namespace: string,
  value: T | null | undefined
): { translated: T | null | undefined; isTranslating: boolean } {
  const { language } = useLanguage();
  const [translated, setTranslated] = useState<T | null | undefined>(value);
  const [isTranslating, setIsTranslating] = useState(false);
  const lastValueRef = useRef<string>('');
  const lastLangRef = useRef<Language>(language);

  useEffect(() => {
    // PT é o idioma original - não traduz
    if (language === 'pt' || !value) {
      setTranslated(value);
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

    // Verifica cache em memória
    if (memoryCache.has(cacheKey)) {
      setTranslated(memoryCache.get(cacheKey) as T);
      return;
    }

    // Verifica localStorage
    const stored = localStorage.getItem(cacheKey);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as T;
        memoryCache.set(cacheKey, parsed);
        setTranslated(parsed);
        return;
      } catch {
        // ignore
      }
    }

    // Chama edge function para traduzir
    const doTranslate = async () => {
      setIsTranslating(true);
      try {
        const { data, error } = await supabase.functions.invoke('translate', {
          body: { targetLanguage: language, value },
        });

        if (!error && data?.value) {
          memoryCache.set(cacheKey, data.value);
          try {
            localStorage.setItem(cacheKey, JSON.stringify(data.value));
          } catch {
            // quota exceeded
          }
          setTranslated(data.value as T);
        } else {
          // Fallback: use original
          setTranslated(value);
        }
      } catch {
        setTranslated(value);
      } finally {
        setIsTranslating(false);
      }
    };

    doTranslate();
  }, [namespace, value, language]);

  return { translated, isTranslating };
}
