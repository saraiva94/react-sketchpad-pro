import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { useLanguage } from "@/hooks/useLanguage";
import { useAutoTranslate } from "@/hooks/useAutoTranslate";
import { usePreloadTranslations, createTranslationItems } from "@/hooks/usePreloadTranslations";
import {
  Search,
  Users,
  Sparkles,
  ArrowLeft,
  ExternalLink,
  MapPin,
} from "lucide-react";
import { TranslatedText } from "@/components/TranslatedText";

// Simple component to display translated category
function TranslatedCategoryButton({
  value,
  selected,
  onSelect,
}: {
  value: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <Button
      variant={selected ? "default" : "outline"}
      size="sm"
      onClick={onSelect}
    >
      <TranslatedText namespace={`portfolio_cat_${value}`} value={value} />
    </Button>
  );
}

interface Project {
  id: string;
  title: string;
  synopsis: string;
  project_type: string;
  image_url: string | null;
  location: string | null;
  categorias_tags: string[] | null;
  responsavel_primeiro_nome: string | null;
  link_pagamento: string | null;
  valor_sugerido: number | null;
}

const ProjectsPortfolioPage = () => {
  const { t, language } = useLanguage();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    fetchApprovedProjects();
  }, []);

  const fetchApprovedProjects = async () => {
    // Use projects_public view to avoid exposing sensitive contact information
    const { data } = await supabase
      .from("projects_public")
      .select("id, title, synopsis, project_type, image_url, location, categorias_tags, responsavel_primeiro_nome, link_pagamento, valor_sugerido")
      .order("created_at", { ascending: false });

    setProjects((data || []) as Project[]);
    setLoading(false);
  };

  // Preload de traduções usando o prefixo "portfolio" que corresponde aos TranslatedText abaixo
  const preloadItems = createTranslationItems.forProjectList(projects, "portfolio");
  usePreloadTranslations(preloadItems, !loading);

  const categories = [...new Set(projects.flatMap((p) => p.categorias_tags || [p.project_type]))];

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.synopsis.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      !selectedCategory ||
      project.categorias_tags?.includes(selectedCategory) ||
      project.project_type === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar currentPage="projetos" />

      <main className="container mx-auto px-4 py-8">
        {/* Back button */}
        <Link to="/" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t.common.back}
        </Link>

        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {t.projects.title}
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t.projects.portfolioSubtitle}
          </p>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={t.projects.search}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(null)}
            >
              {t.common.all}
            </Button>
            {categories.slice(0, 6).map((cat) => (
              <TranslatedCategoryButton
                key={cat}
                value={cat}
                selected={selectedCategory === cat}
                onSelect={() => setSelectedCategory(cat)}
              />
            ))}
          </div>
        </div>

        {/* Projects Grid */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-56 bg-muted rounded-t-lg" />
                <CardContent className="p-6">
                  <div className="h-4 bg-muted rounded w-1/4 mb-2" />
                  <div className="h-6 bg-muted rounded w-3/4 mb-4" />
                  <div className="h-16 bg-muted rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredProjects.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <Card key={project.id} className="group h-full hover:shadow-lg transition-all duration-300 overflow-hidden bg-card">
                <div className="relative h-56 overflow-hidden">
                  {project.image_url ? (
                    <img
                      src={project.image_url}
                      alt={project.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10">
                      <Sparkles className="w-12 h-12 text-muted-foreground/30" />
                    </div>
                  )}
                </div>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <Badge variant="outline" className="text-xs">
                      <TranslatedText
                        namespace={`portfolio_badge_cat_${project.id}`}
                        value={project.categorias_tags?.[0] || project.project_type}
                      />
                    </Badge>
                    {project.location && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        <TranslatedText namespace={`portfolio_loc_${project.id}`} value={project.location} />
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">
                    <TranslatedText namespace={`portfolio_title_${project.id}`} value={project.title} as="span" />
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                    <TranslatedText namespace={`portfolio_synopsis_${project.id}`} value={project.synopsis} as="span" />
                  </p>
                  
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                        <Users className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {project.responsavel_primeiro_nome || t.projects.responsible}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Link to={`/project/${project.id}`}>
                        <Button variant="ghost" size="sm" className="text-primary">
                          {t.projects.viewDetails}
                        </Button>
                      </Link>
                      {project.link_pagamento && (
                        <a href={project.link_pagamento} target="_blank" rel="noopener noreferrer">
                          <Button size="sm">
                            {t.projects.support}
                            <ExternalLink className="w-3 h-3 ml-1" />
                          </Button>
                        </a>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="max-w-lg mx-auto text-center p-12">
            <Sparkles className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">{t.projects.noResults}</h3>
            <p className="text-muted-foreground mb-6">
              {searchTerm || selectedCategory ? t.projects.adjustFilters : t.projects.noProjectsFound}
            </p>
            <Link to="/submit">
              <Button>{t.projects.submitNew}</Button>
            </Link>
          </Card>
        )}
      </main>
    </div>
  );
};

export default ProjectsPortfolioPage;