/**
 * Sistema de cache centralizado para traduções automáticas.
 * 3 camadas: memória -> localStorage -> banco de dados (Supabase)
 * Evita chamadas duplicadas à API e implementa deduplicação de requisições pendentes.
 */

import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";
import type { Language } from "@/lib/i18n";


// Cache em memória (rápido, volátil)
const memoryCache = new Map<string, unknown>();

// Requisições pendentes para deduplicação (evita múltiplas chamadas para o mesmo conteúdo)
const pendingRequests = new Map<string, Promise<unknown>>();

// Prefixo para localStorage
const CACHE_PREFIX = "i18n:v2:";

/**
 * Gera uma chave de cache estável baseada no namespace, idioma e valor.
 */
const stableStringify = (value: unknown): string => {
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
};

const hashString = (str: string): string => {
  // Simple hash for long strings
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(36);
};

export const makeCacheKey = (namespace: string, lang: Language, value: unknown): string => {
  const payload = stableStringify(value);
  // Use hash for long payloads to keep localStorage keys manageable
  const payloadKey = payload.length > 200 ? hashString(payload) : payload.slice(0, 200);
  return `${CACHE_PREFIX}${namespace}:${lang}:${payloadKey}`;
};

/**
 * Valida se o valor do cache é válido (não contém metadados da API).
 */
const isValidCachedValue = (cached: unknown, originalType: string): boolean => {
  if (cached === null || cached === undefined) return false;
  
  // Rejeitar objetos com metadados da API
  if (cached && typeof cached === "object") {
    if ("targetLanguage" in (cached as object) || "json" in (cached as object)) {
      return false;
    }
  }
  
  // Verificar consistência de tipo para strings
  if (originalType === "string" && typeof cached !== "string") {
    return false;
  }
  
  return true;
};

/**
 * Obtém tradução do cache (memória ou localStorage).
 */
export function getFromCache<T>(cacheKey: string, originalValue: T): T | null {
  const originalType = typeof originalValue;

  // Tentar memória primeiro (mais rápido)
  if (memoryCache.has(cacheKey)) {
    const cached = memoryCache.get(cacheKey);
    if (isValidCachedValue(cached, originalType)) {
      return cached as T;
    }
    memoryCache.delete(cacheKey);
  }

  // Tentar localStorage
  try {
    const stored = localStorage.getItem(cacheKey);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (isValidCachedValue(parsed, originalType)) {
        // Promover para memória
        memoryCache.set(cacheKey, parsed);
        return parsed as T;
      }
      localStorage.removeItem(cacheKey);
    }
  } catch {
    // Ignore localStorage errors
  }

  return null;
}

/**
 * Salva tradução no cache (memória + localStorage).
 */
export function saveToCache(cacheKey: string, value: unknown): void {
  memoryCache.set(cacheKey, value);
  try {
    localStorage.setItem(cacheKey, JSON.stringify(value));
  } catch {
    // Quota exceeded - limpar cache antigo
    clearOldCache();
    try {
      localStorage.setItem(cacheKey, JSON.stringify(value));
    } catch {
      // Still failed, ignore
    }
  }
}

/**
 * Limpa entradas antigas do cache quando o localStorage está cheio.
 */
function clearOldCache(): void {
  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith("i18n:")) {
      keysToRemove.push(key);
    }
  }
  // Remove metade das entradas mais antigas
  keysToRemove.slice(0, Math.ceil(keysToRemove.length / 2)).forEach(key => {
    localStorage.removeItem(key);
  });
}

/**
 * Busca tradução no banco de dados (3ª camada de cache).
 */
async function getFromDatabase<T>(
  namespace: string,
  sourceHash: string,
  targetLanguage: string,
  originalValue: T
): Promise<T | null> {
  try {
    const { data, error } = await supabase
      .from("translations")
      .select("translated_value")
      .eq("namespace", namespace)
      .eq("target_language", targetLanguage)
      .eq("source_hash", sourceHash)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    const translated = data.translated_value;
    
    // Validar tipo
    const originalType = typeof originalValue;
    if (originalType === "string" && typeof translated !== "string") {
      return null;
    }

    return translated as T;
  } catch (error) {
    console.warn("Error fetching from translations table:", error);
    return null;
  }
}

/**
 * Salva tradução no banco de dados.
 */
async function saveToDatabase(
  namespace: string,
  sourceHash: string,
  targetLanguage: string,
  sourceValue: unknown,
  translatedValue: unknown
): Promise<void> {
  try {
    await supabase.from("translations").upsert(
      [
        {
          namespace,
          source_language: "pt",
          target_language: targetLanguage,
          source_hash: sourceHash,
          source_value: sourceValue as Json,
          translated_value: translatedValue as Json,
          translation_method: "auto",
        },
      ],
      { onConflict: "namespace,target_language,source_hash" }
    );
  } catch (error) {
    console.warn("Error saving to translations table:", error);
  }
}

/**
 * Extrai namespace e hash do cacheKey para uso no banco.
 */
function parseCacheKey(cacheKey: string): { namespace: string; lang: string; hash: string } | null {
  // Formato: i18n:v2:namespace:lang:hash
  const match = cacheKey.match(/^i18n:v2:([^:]+):([^:]+):(.+)$/);
  if (!match) return null;
  return { namespace: match[1], lang: match[2], hash: match[3] };
}

/**
 * Traduz um valor usando a edge function, com deduplicação de requisições.
 * Salva no cache local e no banco de dados.
 */
export async function translateValue<T>(
  cacheKey: string,
  value: T,
  language: Exclude<Language, "pt">
): Promise<T> {
  // Verificar se já existe uma requisição pendente para este valor
  if (pendingRequests.has(cacheKey)) {
    return pendingRequests.get(cacheKey) as Promise<T>;
  }

  // Extrair info do cacheKey para salvar no banco
  const keyInfo = parseCacheKey(cacheKey);

  // Criar nova requisição
  const request = (async (): Promise<T> => {
    try {
      // Verificar banco de dados primeiro (3ª camada)
      if (keyInfo) {
        const fromDb = await getFromDatabase(keyInfo.namespace, keyInfo.hash, language, value);
        if (fromDb !== null) {
          // Promover para cache local
          saveToCache(cacheKey, fromDb);
          return fromDb;
        }
      }

      // Chamar edge function para traduzir
      const res = await supabase.functions.invoke("translate", {
        body: { targetLanguage: language, value },
      });

      if (res.error) {
        console.warn("Translation API error:", res.error);
        return value;
      }

      const translated = res.data?.value;
      
      // Validar resposta
      if (translated === undefined || translated === null) {
        return value;
      }

      // Verificar tipo
      const originalType = typeof value;
      if (originalType === "string" && typeof translated !== "string") {
        return value;
      }

      // Verificar se não é objeto de metadados
      if (typeof translated === "object" && translated !== null) {
        if ("targetLanguage" in translated || "json" in translated) {
          return value;
        }
      }

      // Salvar no cache local
      saveToCache(cacheKey, translated);
      
      // Salvar no banco de dados (async, não bloqueia)
      if (keyInfo) {
        saveToDatabase(keyInfo.namespace, keyInfo.hash, language, value, translated);
      }
      
      return translated as T;
    } catch (error) {
      console.warn("Translation fetch error:", error);
      return value;
    } finally {
      // Limpar requisição pendente após um delay para evitar race conditions
      setTimeout(() => {
        pendingRequests.delete(cacheKey);
      }, 100);
    }
  })();

  pendingRequests.set(cacheKey, request);
  return request;
}

/**
 * Obtém ou traduz um valor, usando cache quando disponível.
 */
export async function getOrTranslate<T>(
  namespace: string,
  value: T,
  language: Language
): Promise<T> {
  // PT é o idioma original - não traduz
  if (language === "pt" || value === null || value === undefined) {
    return value;
  }

  const cacheKey = makeCacheKey(namespace, language, value);

  // Tentar cache primeiro
  const cached = getFromCache(cacheKey, value);
  if (cached !== null) {
    return cached;
  }

  // Traduzir
  return translateValue(cacheKey, value, language as Exclude<Language, "pt">);
}

/**
 * Pré-carrega traduções para uma lista de valores (para otimização).
 */
export async function preloadTranslations<T>(
  items: Array<{ namespace: string; value: T }>,
  language: Language
): Promise<void> {
  if (language === "pt") return;

  // Filtrar apenas itens que não estão em cache
  const toTranslate = items.filter(item => {
    if (!item.value) return false;
    const cacheKey = makeCacheKey(item.namespace, language, item.value);
    return getFromCache(cacheKey, item.value) === null;
  });

  // Traduzir em paralelo (com limite)
  const BATCH_SIZE = 5;
  for (let i = 0; i < toTranslate.length; i += BATCH_SIZE) {
    const batch = toTranslate.slice(i, i + BATCH_SIZE);
    await Promise.allSettled(
      batch.map(item => 
        getOrTranslate(item.namespace, item.value, language)
      )
    );
    // Pequeno delay entre batches para evitar rate limiting
    if (i + BATCH_SIZE < toTranslate.length) {
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }
}

/**
 * Limpa todo o cache de traduções (útil para debug).
 */
export function clearAllTranslationCache(): void {
  memoryCache.clear();
  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith("i18n:")) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach(key => localStorage.removeItem(key));
}
