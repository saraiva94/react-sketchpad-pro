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
       const cached = memoryCache.get(cacheKey) as unknown;
       // Safety: nunca renderizar objetos inválidos
       if (
         cached &&
         typeof cached === 'object' &&
         (('targetLanguage' in (cached as any)) || ('json' in (cached as any)))
       ) {
         memoryCache.delete(cacheKey);
       } else {
         // Se o tipo não bate com o input, descarta
         if (typeof value === 'string' && typeof cached !== 'string') {
           memoryCache.delete(cacheKey);
         } else {
           setTranslated(cached as T);
           return;
         }
       }
     }

     // Verifica localStorage
     const stored = localStorage.getItem(cacheKey);
     if (stored) {
       try {
         const parsed = JSON.parse(stored) as unknown;

         // Safety: não aceitar objetos inválidos vindos do cache
         if (
           parsed &&
           typeof parsed === 'object' &&
           (('targetLanguage' in (parsed as any)) || ('json' in (parsed as any)))
         ) {
           localStorage.removeItem(cacheKey);
         } else if (typeof value === 'string' && typeof parsed !== 'string') {
           // Cache corrompido / tipo divergente
           localStorage.removeItem(cacheKey);
         } else {
           memoryCache.set(cacheKey, parsed);
           setTranslated(parsed as T);
           return;
         }
       } catch {
         // ignore
       }
     }

     // Chama edge function para traduzir
     const doTranslate = async () => {
       setIsTranslating(true);
       try {
         let data: any = null;
         let error: any = null;

         try {
           const res = await supabase.functions.invoke('translate', {
             body: { targetLanguage: language, value },
           });
           data = res.data;
           error = res.error;
         } catch {
           // Falha de rede/runtime (ex: 500). Fail-safe: usa original.
           setTranslated(value);
           return;
         }

         // Validate response - must have value and be same type as input
         if (!error && data && typeof data.value !== 'undefined') {
           const translated = data.value;
           // Ensure we don't return raw API objects
           if (typeof value === 'string' && typeof translated === 'string') {
             memoryCache.set(cacheKey, translated);
             try {
               localStorage.setItem(cacheKey, JSON.stringify(translated));
             } catch {
               // quota exceeded
             }
             setTranslated(translated as T);
           } else if (typeof value === 'object' && typeof translated === 'object' && translated !== null) {
             // Validate object doesn't have API metadata keys
             if (!('targetLanguage' in translated) && !('json' in translated)) {
               memoryCache.set(cacheKey, translated);
               try {
                 localStorage.setItem(cacheKey, JSON.stringify(translated));
               } catch {
                 // quota exceeded
               }
               setTranslated(translated as T);
             } else {
               // Invalid response, use original
               setTranslated(value);
             }
           } else {
             // Type mismatch, use original
             setTranslated(value);
           }
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
