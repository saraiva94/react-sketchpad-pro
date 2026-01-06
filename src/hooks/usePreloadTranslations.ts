/**
 * Hook para pré-carregar traduções de todo o conteúdo de uma página.
 * Pré-carrega usando o MESMO motor de tradução do useAutoTranslate (TranslationManager),
 * garantindo cache hit instantâneo nos componentes.
 */
import { useEffect, useRef } from "react";
import { useLanguage } from "./useLanguage";
import { translationManager } from "@/lib/translationManager";

interface TranslationItem {
  namespace: string;
  value: unknown;
}

/**
 * Hook para pré-carregar traduções quando o conteúdo estiver disponível.
 * @param items - Lista de itens para traduzir { namespace, value }
 * @param enabled - Se o preload deve ser executado (default: true)
 */
export function usePreloadTranslations(
  items: TranslationItem[],
  enabled: boolean = true
): void {
  const { language } = useLanguage();
  const hasPreloadedRef = useRef<string>("");

  useEffect(() => {
    if (!enabled || language === "pt") return;

    const validItems = items.filter(
      (item) => item.value !== null && item.value !== undefined
    );
    if (validItems.length === 0) return;

    const preloadKey = `${language}:${validItems.length}:${JSON.stringify(
      validItems.slice(0, 3).map((i) => i.namespace)
    )}`;

    if (hasPreloadedRef.current === preloadKey) return;
    hasPreloadedRef.current = preloadKey;

    let cancelled = false;

    const run = async () => {
      // Batching alinhado com translationManager para progresso mais rápido
      const BATCH_SIZE = 3;
      const BATCH_DELAY_MS = 600;

      for (let i = 0; i < validItems.length; i += BATCH_SIZE) {
        if (cancelled) return;
        const batch = validItems.slice(i, i + BATCH_SIZE);

        await Promise.allSettled(
          batch.map((it) =>
            translationManager.getTranslation(it.namespace, it.value, language)
          )
        );

        if (i + BATCH_SIZE < validItems.length) {
          await new Promise((r) => setTimeout(r, BATCH_DELAY_MS));
        }
      }
    };

    run().catch(() => {
      // ignore
    });

    return () => {
      cancelled = true;
    };
  }, [items, language, enabled]);
}

/**
 * Helpers para criar itens de tradução de forma consistente.
 */
export const createTranslationItems = {
  /**
   * Cria itens de tradução para um projeto.
   */
  forProject: (
    projectId: string,
    project: {
      title?: string | null;
      synopsis?: string | null;
      description?: string | null;
      project_type?: string | null;
      location?: string | null;
      impacto_cultural?: string | null;
      impacto_social?: string | null;
      publico_alvo?: string | null;
      diferenciais?: string | null;
      additional_info?: string | null;
      categorias_tags?: string[] | null;
      stages?: string[] | null;
      awards?: string[] | null;
      incentive_law_details?: string | null;
    } | null
  ): TranslationItem[] => {
    if (!project) return [];

    const items: TranslationItem[] = [];
    const prefix = `project_full_${projectId}`;

    // Manter alinhado com ProjectPage (campos individuais)
    if (project.title) items.push({ namespace: `${prefix}_title`, value: project.title });
    if (project.synopsis) items.push({ namespace: `${prefix}_synopsis`, value: project.synopsis });
    if (project.description) items.push({ namespace: `${prefix}_description`, value: project.description });
    if (project.project_type) items.push({ namespace: `project_type`, value: project.project_type });
    if (project.location) items.push({ namespace: `${prefix}_location`, value: project.location });
    if (project.impacto_cultural) items.push({ namespace: `${prefix}_impacto_cultural`, value: project.impacto_cultural });
    if (project.impacto_social) items.push({ namespace: `${prefix}_impacto_social`, value: project.impacto_social });
    if (project.publico_alvo) items.push({ namespace: `${prefix}_publico_alvo`, value: project.publico_alvo });
    if (project.diferenciais) items.push({ namespace: `${prefix}_diferenciais`, value: project.diferenciais });
    if (project.additional_info) items.push({ namespace: `${prefix}_additional_info`, value: project.additional_info });
    if (project.incentive_law_details) items.push({ namespace: `${prefix}_incentive_law_details`, value: project.incentive_law_details });

    if (project.categorias_tags?.length) {
      project.categorias_tags.forEach((tag, i) => {
        items.push({ namespace: `${prefix}_tag_${i}`, value: tag });
      });
    }
    if (project.stages?.length) {
      project.stages.forEach((stage, i) => {
        items.push({ namespace: `${prefix}_stage_${i}`, value: stage });
      });
    }
    if (project.awards?.length) {
      project.awards.forEach((award, i) => {
        items.push({ namespace: `${prefix}_award_${i}`, value: award });
      });
    }

    return items;
  },

  /**
   * Cria itens de tradução para membros de equipe.
   */
  forMembers: (
    projectId: string,
    members: Array<{
      id: string;
      funcao?: string | null;
      detalhes?: string | null;
    }>
  ): TranslationItem[] => {
    const items: TranslationItem[] = [];

    members.forEach((member) => {
      // namespaces globais (hash diferencia por conteúdo) — alinhado com TranslatedMemberCard
      if (member.funcao) {
        items.push({ namespace: `member_funcao`, value: member.funcao });
      }
      if (member.detalhes) {
        items.push({ namespace: `member_detalhes`, value: member.detalhes });
      }
    });

    return items;
  },

  /**
   * Cria itens de tradução para contrapartidas.
   */
  forContrapartidas: (
    contrapartidas: Array<{
      id: string;
      titulo?: string | null;
      beneficios?: string[];
    }>
  ): TranslationItem[] => {
    const items: TranslationItem[] = [];

    contrapartidas.forEach((c) => {
      if (c.titulo) {
        items.push({ namespace: `contrapartida_titulo_${c.id}`, value: c.titulo });
      }
      if (c.beneficios?.length) {
        items.push({ namespace: `contrapartida_beneficios_${c.id}`, value: c.beneficios });
      }
    });

    return items;
  },

  /**
   * Cria itens de tradução para uma lista de projetos (cards) usando os mesmos namespaces
   * padronizados do ProjectPage e ProjectGrid (project_full_*).
   * @param namespacePrefix - Ignorado, sempre usa project_full para consistência de cache
   */
  forProjectList: (
    projects: Array<{
      id: string;
      title?: string | null;
      synopsis?: string | null;
      project_type?: string | null;
      location?: string | null;
      categorias_tags?: string[] | null;
      incentive_law_details?: string | null;
      has_incentive_law?: boolean | null;
    }>,
    _namespacePrefix: string = "project_full" // Parâmetro mantido para compatibilidade, mas sempre usa project_full
  ): TranslationItem[] => {
    const items: TranslationItem[] = [];

    projects.forEach((project) => {
      // Usar SEMPRE namespace project_full_* para consistência de cache global
      if (project.title) items.push({ namespace: `project_full_${project.id}_title`, value: project.title });
      if (project.synopsis) items.push({ namespace: `project_full_${project.id}_synopsis`, value: project.synopsis });
      if (project.project_type) items.push({ namespace: `project_type`, value: project.project_type });
      if (project.location) items.push({ namespace: `location_${project.id}`, value: project.location });
      // Traduzir a primeira categoria/tag também
      const firstCat = project.categorias_tags?.[0] || project.project_type;
      if (firstCat) items.push({ namespace: `project_full_${project.id}_category`, value: firstCat });
      // Traduzir lei de incentivo
      if (project.has_incentive_law && project.incentive_law_details) {
        items.push({ namespace: `incentive_law_label`, value: project.incentive_law_details });
      }
    });

    return items;
  },

  /**
   * Cria itens de tradução para settings (quem somos, serviços, etc).
   */
  forSettings: (namespace: string, content: unknown): TranslationItem[] => {
    if (!content) return [];
    return [{ namespace, value: content }];
  },
};

