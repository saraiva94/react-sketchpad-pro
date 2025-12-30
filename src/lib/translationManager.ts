/**
 * Sistema de gerenciamento de traduções com fila e rate limiting.
 * Processa traduções em lotes controlados para evitar erros 429.
 */

import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";

interface TranslationConfig {
  maxRetries: number;
  retryDelay: number;
  batchSize: number;
  batchDelay: number;
}

const DEFAULT_CONFIG: TranslationConfig = {
  // Config balanceada: evita 429 mas ainda permite progresso razoável
  maxRetries: 4,
  retryDelay: 1500,
  batchSize: 2,
  batchDelay: 800,
};

interface QueueItem {
  namespace: string;
  value: unknown;
  targetLang: string;
  cacheKey: string;
  resolve: (val: unknown) => void;
  reject: (err: unknown) => void;
}

export class TranslationManager {
  private memoryCache = new Map<string, unknown>();
  private pendingRequests = new Map<string, Promise<unknown>>();
  private config: TranslationConfig;
  private requestQueue: QueueItem[] = [];
  private processingQueue = false;
  private processorStarted = false;

  constructor(config: Partial<TranslationConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  private generateHash(value: unknown): string {
    const str = typeof value === "string" ? value : JSON.stringify(value);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  }

  private isSameValue(a: unknown, b: unknown): boolean {
    if (a === b) return true;
    if (typeof a !== typeof b) return false;

    // Strings são o caso mais comum
    if (typeof a === "string" && typeof b === "string") {
      return a.trim() === b.trim();
    }

    // Para objetos/arrays, comparação simples via JSON
    if (a && b && typeof a === "object" && typeof b === "object") {
      try {
        return JSON.stringify(a) === JSON.stringify(b);
      } catch {
        return false;
      }
    }

    return false;
  }

  private getCacheKey(namespace: string, targetLang: string, hash: string): string {
    return `i18n:v3:${namespace}:${targetLang}:${hash}`;
  }

  /**
   * Normaliza respostas antigas/erradas e extrai valor traduzido.
   * Trata formatos como:
   * - { value: "..." }
   * - { json: "\"...\"" }
   * - { value: { json: "\"...\"" } }
   */
  private normalizeTranslated<T>(original: T, candidate: unknown): T {
    let next: any = candidate;

    // Unwrap de respostas com { value: ... }
    if (
      next &&
      typeof next === "object" &&
      !Array.isArray(next) &&
      (next as any).value !== undefined &&
      Object.keys(next as any).length <= 2
    ) {
      next = (next as any).value;
    }

    // Unwrap de respostas com { json: "\"...\"" } (formato da AI gateway)
    if (
      next &&
      typeof next === "object" &&
      !Array.isArray(next) &&
      typeof (next as any).json === "string"
    ) {
      try {
        next = JSON.parse((next as any).json);
      } catch {
        // Se não conseguir parsear, usar o json como string
        next = (next as any).json;
      }
    }

    // Se ainda for string com aspas extras, remover
    if (typeof next === "string" && next.startsWith('"') && next.endsWith('"')) {
      try {
        next = JSON.parse(next);
      } catch {
        // Manter como está
      }
    }

    // Validação por tipo do valor original
    if (typeof original === "string") {
      return (typeof next === "string" ? next : original) as T;
    }

    if (Array.isArray(original)) {
      return (Array.isArray(next) ? next : original) as T;
    }

    if (original && typeof original === "object") {
      return (next && typeof next === "object" ? next : original) as T;
    }

    return (next ?? original) as T;
  }

  async getTranslation<T>(
    namespace: string,
    value: T,
    targetLang: string,
    sourceLang: string = "pt"
  ): Promise<T> {
    if (targetLang === sourceLang || value === null || value === undefined) {
      return value;
    }

    const hash = this.generateHash(value);
    const cacheKey = this.getCacheKey(namespace, targetLang, hash);

    // 1. Memória (mais rápido)
    if (this.memoryCache.has(cacheKey)) {
      console.log("[i18n] Cache hit (memória):", namespace);
      const cached = this.memoryCache.get(cacheKey);
      const normalized = this.normalizeTranslated(value, cached);

      // Se cache estiver poluído (== original), invalidar e tratar como miss
      if (!this.isSameValue(value, normalized)) {
        return normalized;
      }
      this.memoryCache.delete(cacheKey);
    }

    // 2. localStorage
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        const normalized = this.normalizeTranslated(value, parsed);

        // Se cache estiver poluído (== original), invalidar e tratar como miss
        if (!this.isSameValue(value, normalized)) {
          this.memoryCache.set(cacheKey, normalized);
          console.log("[i18n] Cache hit (localStorage):", namespace);
          return normalized;
        }
        localStorage.removeItem(cacheKey);
      }
    } catch (err) {
      console.warn("[i18n] localStorage read error:", err);
    }


    // 3. Banco de dados - busca primeiro por hash, depois por namespace apenas
    try {
      // Primeira tentativa: busca por hash
      let dbTranslation = await supabase
        .from("translations")
        .select("translated_value, source_value")
        .eq("namespace", namespace)
        .eq("target_language", targetLang)
        .eq("source_hash", hash)
        .maybeSingle();

      // Segunda tentativa: busca apenas por namespace (para traduções com hash diferente)
      if (!dbTranslation.data) {
        dbTranslation = await supabase
          .from("translations")
          .select("translated_value, source_value")
          .eq("namespace", namespace)
          .eq("target_language", targetLang)
          .maybeSingle();
      }

      if (dbTranslation.data) {
        // Verificar se o source_value bate (para evitar usar tradução de texto diferente)
        const dbSourceValue = (dbTranslation.data as any).source_value;
        const sourceMatches = this.isSameValue(value, dbSourceValue);
        
        if (sourceMatches) {
          const normalized = this.normalizeTranslated(
            value,
            (dbTranslation.data as any).translated_value
          );

          // Se estiver poluído (tradução == original), tratar como cache miss
          if (!this.isSameValue(value, normalized)) {
            this.memoryCache.set(cacheKey, normalized);

            try {
              localStorage.setItem(cacheKey, JSON.stringify(normalized));
            } catch (err) {
              console.warn("[i18n] localStorage write error:", err);
            }

            console.log("[i18n] Cache hit (banco):", namespace);
            return normalized;
          }
        }
      }
    } catch (err) {
      console.error("[i18n] Supabase lookup error:", err);
    }

    // 4. Adicionar à fila de tradução
    console.log("[i18n] Cache miss, adicionando à fila:", namespace);
    return this.queueTranslation(namespace, value, targetLang, hash, cacheKey) as Promise<T>;
  }

  private queueTranslation(
    namespace: string,
    value: unknown,
    targetLang: string,
    hash: string,
    cacheKey: string
  ): Promise<unknown> {
    // Deduplicação: se já está pendente, retorna a mesma promise
    if (this.pendingRequests.has(cacheKey)) {
      console.log("[i18n] Requisição já pendente:", namespace);
      return this.pendingRequests.get(cacheKey)!;
    }

    const promise = new Promise<unknown>((resolve, reject) => {
      this.requestQueue.push({
        namespace,
        value,
        targetLang,
        cacheKey,
        resolve,
        reject,
      });
    });

    this.pendingRequests.set(cacheKey, promise);

    promise.finally(() => {
      this.pendingRequests.delete(cacheKey);
    });

    // Iniciar processador se ainda não foi iniciado
    if (!this.processorStarted) {
      this.processorStarted = true;
      this.startQueueProcessor();
    }

    return promise;
  }

  private async startQueueProcessor(): Promise<void> {
    while (true) {
      if (this.requestQueue.length === 0 || this.processingQueue) {
        await this.sleep(100);
        continue;
      }

      this.processingQueue = true;

      // Processar em lotes
      const batch = this.requestQueue.splice(0, this.config.batchSize);
      console.log(`[i18n] Processando lote de ${batch.length} traduções`);

      try {
        await Promise.all(batch.map((req) => this.translateWithRetry(req)));
      } catch (err) {
        console.error("[i18n] Batch error:", err);
      }

      this.processingQueue = false;

      // Delay entre lotes para evitar rate limit
      if (this.requestQueue.length > 0) {
        console.log(
          `[i18n] Aguardando ${this.config.batchDelay}ms antes do próximo lote...`
        );
        await this.sleep(this.config.batchDelay);
      }
    }
  }

  private async translateWithRetry(
    request: QueueItem,
    retryCount = 0
  ): Promise<void> {
    const { namespace, value, targetLang, cacheKey, resolve, reject } = request;
    const hash = this.generateHash(value);

    try {
      console.log(
        `[i18n] Traduzindo: ${namespace} (tentativa ${retryCount + 1})`
      );

      const { data, error } = await supabase.functions.invoke("translate", {
        body: {
          value,
          targetLanguage: targetLang,
        },
      });

      if (error) throw error;

      // Verificar se o gateway retornou erro no body (rate limit, etc)
      if ((data as any)?.error) {
        throw new Error((data as any).error);
      }

      // A edge function retorna { value: traduzido }
      const raw = (data as any)?.value ?? value;
      const translated = this.normalizeTranslated(value, raw);

      // Se "traduziu" mas permaneceu igual (resposta degradada), não poluir cache/banco
      if (this.isSameValue(value, translated)) {
        resolve(value);
        return;
      }

      // Salvar em todos os caches
      this.memoryCache.set(cacheKey, translated);

      try {
        localStorage.setItem(cacheKey, JSON.stringify(translated));
      } catch (err) {
        console.warn("[i18n] localStorage write error:", err);
      }

      // Salvar no banco
      await supabase.from("translations").upsert(
        [
          {
            namespace,
            source_language: "pt",
            target_language: targetLang,
            source_hash: hash,
            source_value: value as Json,
            translated_value: translated as Json,
            translation_method: "auto",
            quality_score: 0,
          },
        ],
        {
          onConflict: "namespace,target_language,source_hash",
        }
      );

      console.log("[i18n] Tradução completa:", namespace);
      resolve(translated);
    } catch (error: unknown) {
      const err = error as { status?: number; message?: string };
      const errorMsg = err.message || String(error);

      // Rate limit (429) ou erro de rede - retry com backoff
      const isRateLimit =
        err.status === 429 ||
        errorMsg.includes("429") ||
        errorMsg.includes("rate_limited") ||
        errorMsg.includes("rate limit");

      if (isRateLimit && retryCount < this.config.maxRetries) {
        const delay = this.config.retryDelay * Math.pow(2, retryCount);
        console.warn(
          `[i18n] Rate limited! Retry em ${delay}ms (tentativa ${retryCount + 2}/${this.config.maxRetries + 1})`
        );

        await this.sleep(delay);
        return this.translateWithRetry(request, retryCount + 1);
      }

      // Se foi rate-limit e esgotou tentativas: NÃO rejeitar (evita unhandled rejection)
      // Mantém o conteúdo original e deixa o usuário seguir navegando.
      if (isRateLimit) {
        console.warn("[i18n] Rate limit esgotado (fallback p/ original):", namespace);
        resolve(value);
        return;
      }

      // Outros erros: fallback para original
      console.error("[i18n] Falha após retries:", error);
      resolve(value);
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  clearCache(): void {
    this.memoryCache.clear();
    const keysToRemove: string[] = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith("i18n:v3:")) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach((key) => localStorage.removeItem(key));
    console.log("[i18n] Cache limpo!");
  }

  /**
   * Limpa cache apenas para um idioma específico
   */
  clearCacheForLanguage(lang: string): void {
    const keysToRemove: string[] = [];
    
    // Limpar memória
    for (const key of this.memoryCache.keys()) {
      if (key.includes(`:${lang}:`)) {
        this.memoryCache.delete(key);
      }
    }

    // Limpar localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith("i18n:v3:") && key.includes(`:${lang}:`)) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach((key) => localStorage.removeItem(key));
    console.log(`[i18n] Cache limpo para idioma: ${lang}`);
  }
}

export const translationManager = new TranslationManager();
