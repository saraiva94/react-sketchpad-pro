import { useState } from "react";
import { Plus, X, Award, Newspaper, Film, Check, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface NewsItem {
  title: string;
  linkTitle?: string;
  url?: string;
  date?: string;
}

export interface FestivalItem {
  title: string;
  linkTitle?: string;
  url?: string;
  date?: string;
}

interface RecognitionEditorProps {
  awards: any[]; // Aceita string ou objeto { text, linkTitle, url }
  news: NewsItem[];
  festivals: FestivalItem[];
  onAwardsChange: (awards: any[]) => void;
  onNewsChange: (news: NewsItem[]) => void;
  onFestivalsChange: (festivals: FestivalItem[]) => void;
}

export function RecognitionEditor({ 
  awards, 
  news,
  festivals,
  onAwardsChange, 
  onNewsChange,
  onFestivalsChange
}: RecognitionEditorProps) {
  const [newAward, setNewAward] = useState<{ text: string; linkTitle: string; url: string }>({ text: "", linkTitle: "", url: "" });
  const [newNewsItem, setNewNewsItem] = useState<NewsItem>({ title: "", linkTitle: "", url: "", date: "" });
  const [newFestivalItem, setNewFestivalItem] = useState<FestivalItem>({ title: "", linkTitle: "", url: "", date: "" });
  const [urlValidation, setUrlValidation] = useState<{ news: boolean; festival: boolean; award: boolean }>({ 
    news: true, 
    festival: true, 
    award: true 
  });

  // Função para formatar data automaticamente (dd/mm/aaaa)
  const formatDate = (value: string): string => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, '');
    
    // Aplica a máscara dd/mm/aaaa
    if (numbers.length <= 2) {
      return numbers;
    } else if (numbers.length <= 4) {
      return `${numbers.slice(0, 2)}/${numbers.slice(2)}`;
    } else {
      return `${numbers.slice(0, 2)}/${numbers.slice(2, 4)}/${numbers.slice(4, 8)}`;
    }
  };

  // Função para formatar e validar URL
  const formatUrl = (value: string): string => {
    if (!value) return "";
    
    let url = value.trim();
    
    // Se não tem protocolo, adiciona https://
    if (url && !url.match(/^https?:\/\//i)) {
      url = `https://${url}`;
    }
    
    return url;
  };

  // Função para validar URL
  const validateUrl = (value: string): boolean => {
    if (!value) return true; // URL opcional
    
    try {
      const url = new URL(value.trim().startsWith('http') ? value.trim() : `https://${value.trim()}`);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const addAward = () => {
    if (!newAward.text.trim()) return;
    
    const awardToAdd: any = {
      text: newAward.text.trim(),
      linkTitle: newAward.linkTitle.trim() || undefined,
      url: newAward.url ? formatUrl(newAward.url.trim()) : undefined
    };
    
    onAwardsChange([...awards, awardToAdd]);
    setNewAward({ text: "", linkTitle: "", url: "" });
  };

  const removeAward = (index: number) => {
    onAwardsChange(awards.filter((_, i) => i !== index));
  };

  const addNewsItem = () => {
    if (!newNewsItem.title.trim()) return;
    onNewsChange([...news, { 
      title: newNewsItem.title.trim(),
      linkTitle: newNewsItem.linkTitle?.trim() || undefined,
      url: newNewsItem.url ? formatUrl(newNewsItem.url.trim()) : undefined,
      date: newNewsItem.date?.trim() || undefined
    }]);
    setNewNewsItem({ title: "", linkTitle: "", url: "", date: "" });
  };

  const removeNewsItem = (index: number) => {
    onNewsChange(news.filter((_, i) => i !== index));
  };

  const addFestivalItem = () => {
    if (!newFestivalItem.title.trim()) return;
    onFestivalsChange([...festivals, { 
      title: newFestivalItem.title.trim(),
      linkTitle: newFestivalItem.linkTitle?.trim() || undefined,
      url: newFestivalItem.url ? formatUrl(newFestivalItem.url.trim()) : undefined,
      date: newFestivalItem.date?.trim() || undefined
    }]);
    setNewFestivalItem({ title: "", linkTitle: "", url: "", date: "" });
  };

  const removeFestivalItem = (index: number) => {
    onFestivalsChange(festivals.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-foreground border-b pb-2">
        Reconhecimentos e Mídia
      </h3>

      {/* Awards Section */}
      <div className="space-y-4">
        <Label className="flex items-center gap-2">
          <Award className="w-4 h-4 text-amber-500" />
          Prêmios e Reconhecimentos
        </Label>
        
        {awards.length > 0 && (
          <ul className="space-y-2">
            {awards.map((award, index) => {
              // Processa string ou objeto de forma robusta
              let awardText = "";
              let linkTitle = "";
              let linkUrl = "";
              
              if (typeof award === 'string') {
                // Formato antigo: string simples
                awardText = award;
              } else if (award && typeof award === 'object' && !Array.isArray(award)) {
                // Formato novo: objeto
                const obj = award as any;
                awardText = obj.text || "";
                linkTitle = obj.linkTitle || "";
                linkUrl = obj.url || "";
              }
              
              // Se não conseguiu extrair texto, mostra aviso
              if (!awardText) {
                awardText = "[Erro ao carregar prêmio]";
              }
              
              return (
                <li key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg group">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{awardText}</p>
                    {linkTitle && <p className="text-xs text-primary/80 truncate mt-1">Link: {linkTitle}</p>}
                    {linkUrl && <p className="text-xs text-muted-foreground truncate">{linkUrl}</p>}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeAward(index)}
                  >
                    <X className="w-4 h-4 text-destructive" />
                  </Button>
                </li>
              );
            })}
          </ul>
        )}
        
        <div className="space-y-2 p-3 border border-dashed rounded-lg">
          <Input
            placeholder="Texto do prêmio/reconhecimento *"
            value={newAward.text}
            onChange={(e) => setNewAward({ ...newAward, text: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-2">
            <Input
              placeholder="Título do link (opcional)"
              value={newAward.linkTitle}
              onChange={(e) => setNewAward({ ...newAward, linkTitle: e.target.value })}
            />
            <div className="relative">
              <Input
                placeholder="URL (opcional)"
                value={newAward.url}
                onChange={(e) => {
                  setNewAward({ ...newAward, url: e.target.value });
                  setUrlValidation({ ...urlValidation, award: validateUrl(e.target.value) });
                }}
                onBlur={(e) => {
                  if (e.target.value) {
                    setNewAward({ ...newAward, url: formatUrl(e.target.value) });
                  }
                }}
                className={newAward.url && !urlValidation.award ? 'border-red-500' : newAward.url ? 'border-green-500' : ''}
              />
              {newAward.url && (
                urlValidation.award ? (
                  <Check className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />
                ) : (
                  <AlertCircle className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-red-500" />
                )
              )}
            </div>
          </div>
          <Button 
            type="button" 
            variant="secondary" 
            size="sm"
            onClick={addAward}
            disabled={!newAward.text.trim()}
          >
            Salvar
          </Button>
        </div>
      </div>

      {/* Festivals Section */}
      <div className="space-y-4">
        <Label className="flex items-center gap-2">
          <Film className="w-4 h-4 text-violet-500" />
          Exibições e Festivais
        </Label>
        
        {festivals.length > 0 && (
          <ul className="space-y-2">
            {festivals.map((item, index) => (
              <li key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg group">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium truncate">{item.title}</p>
                    {item.url && (
                      <a 
                        href={item.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex-shrink-0 text-primary hover:text-primary/80"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Film className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                  {item.date && <p className="text-xs text-muted-foreground">{item.date}</p>}
                  {item.linkTitle && <p className="text-xs text-primary/80 truncate mt-1">Link: {item.linkTitle}</p>}
                  {item.url && <p className="text-xs text-muted-foreground truncate">{item.url}</p>}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFestivalItem(index)}
                >
                  <X className="w-4 h-4 text-destructive" />
                </Button>
              </li>
            ))}
          </ul>
        )}
        
        <div className="space-y-2 p-3 border border-dashed rounded-lg">
          <Input
            placeholder="Nome do Festival/Exibição *"
            value={newFestivalItem.title}
            onChange={(e) => setNewFestivalItem({ ...newFestivalItem, title: e.target.value })}
          />
          <div className="grid grid-cols-3 gap-2">
            <Input
              placeholder="Título do link (opcional)"
              value={newFestivalItem.linkTitle || ""}
              onChange={(e) => setNewFestivalItem({ ...newFestivalItem, linkTitle: e.target.value })}
            />
            <div className="relative">
              <Input
                placeholder="URL (opcional)"
                value={newFestivalItem.url}
                onChange={(e) => {
                  setNewFestivalItem({ ...newFestivalItem, url: e.target.value });
                  setUrlValidation({ ...urlValidation, festival: validateUrl(e.target.value) });
                }}
                onBlur={(e) => {
                  if (e.target.value) {
                    setNewFestivalItem({ ...newFestivalItem, url: formatUrl(e.target.value) });
                  }
                }}
                className={newFestivalItem.url && !urlValidation.festival ? 'border-red-500' : newFestivalItem.url ? 'border-green-500' : ''}
              />
              {newFestivalItem.url && (
                urlValidation.festival ? (
                  <Check className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />
                ) : (
                  <AlertCircle className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-red-500" />
                )
              )}
            </div>
            <Input
              placeholder="Data (ex: 15/03/2024)"
              value={newFestivalItem.date}
              onChange={(e) => setNewFestivalItem({ ...newFestivalItem, date: formatDate(e.target.value) })}
              maxLength={10}
            />
          </div>
          <Button 
            type="button" 
            variant="secondary" 
            size="sm"
            onClick={addFestivalItem}
            disabled={!newFestivalItem.title.trim()}
          >
            Salvar
          </Button>
        </div>
      </div>

      {/* News Section */}
      <div className="space-y-4">
        <Label className="flex items-center gap-2">
          <Newspaper className="w-4 h-4 text-primary" />
          Matérias na Mídia
        </Label>
        
        {news.length > 0 && (
          <ul className="space-y-2">
            {news.map((item, index) => (
              <li key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg group">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium truncate">{item.title}</p>
                    {item.url && (
                      <a 
                        href={item.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex-shrink-0 text-primary hover:text-primary/80"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Film className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                  {item.date && <p className="text-xs text-muted-foreground">{item.date}</p>}
                  {item.linkTitle && <p className="text-xs text-primary/80 truncate mt-1">Link: {item.linkTitle}</p>}
                  {item.url && <p className="text-xs text-muted-foreground truncate">{item.url}</p>}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeNewsItem(index)}
                >
                  <X className="w-4 h-4 text-destructive" />
                </Button>
              </li>
            ))}
          </ul>
        )}
        
        <div className="space-y-2 p-3 border border-dashed rounded-lg">
          <Input
            placeholder="Título da matéria *"
            value={newNewsItem.title}
            onChange={(e) => setNewNewsItem({ ...newNewsItem, title: e.target.value })}
          />
          <div className="grid grid-cols-3 gap-2">
            <Input
              placeholder="Título do link (opcional)"
              value={newNewsItem.linkTitle || ""}
              onChange={(e) => setNewNewsItem({ ...newNewsItem, linkTitle: e.target.value })}
            />
            <div className="relative">
              <Input
                placeholder="URL (opcional)"
                value={newNewsItem.url}
                onChange={(e) => {
                  setNewNewsItem({ ...newNewsItem, url: e.target.value });
                  setUrlValidation({ ...urlValidation, news: validateUrl(e.target.value) });
                }}
                onBlur={(e) => {
                  if (e.target.value) {
                    setNewNewsItem({ ...newNewsItem, url: formatUrl(e.target.value) });
                  }
                }}
                className={newNewsItem.url && !urlValidation.news ? 'border-red-500' : newNewsItem.url ? 'border-green-500' : ''}
              />
              {newNewsItem.url && (
                urlValidation.news ? (
                  <Check className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />
                ) : (
                  <AlertCircle className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-red-500" />
                )
              )}
            </div>
            <Input
              placeholder="Data (ex: 15/03/2024)"
              value={newNewsItem.date}
              onChange={(e) => setNewNewsItem({ ...newNewsItem, date: formatDate(e.target.value) })}
              maxLength={10}
            />
          </div>
          <Button 
            type="button" 
            variant="secondary" 
            size="sm"
            onClick={addNewsItem}
            disabled={!newNewsItem.title.trim()}
          >
            Salvar
          </Button>
        </div>
      </div>
    </div>
  );
}
