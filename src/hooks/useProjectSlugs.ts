import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useProjectSlugs() {
  const [slugMap, setSlugMap] = useState<Record<string, string>>({});

  useEffect(() => {
    supabase
      .from("settings")
      .select("key, value")
      .like("key", "project_slug_%")
      .then(({ data }) => {
        const map: Record<string, string> = {};
        (data || []).forEach((row: any) => {
          const projectId = row.key.replace("project_slug_", "");
          const slug = (row.value as any)?.slug;
          if (slug) map[projectId] = slug;
        });
        setSlugMap(map);
      });
  }, []);

  const getProjectUrl = useCallback(
    (projectId: string) =>
      slugMap[projectId]
        ? `/projeto/${slugMap[projectId]}`
        : `/project/${projectId}`,
    [slugMap]
  );

  return { slugMap, getProjectUrl };
}
