import { useState } from "react";
import { Plus, X, Award, Newspaper, Film, Check, AlertCircle, ImageIcon, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImageCropper } from "@/components/ImageCropper";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface NewsItem {
  title: string;
  linkTitle?: string;
  url?: string;
  date?: string;
  image_url?: string;
}

export interface FestivalItem {
  title: string;
  linkTitle?: string;
  url?: string;
  date?: string;
  image_url?: string;
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
  const [newAward, setNewAward] = useState<{ text: string; linkTitle: string; url: string; image_url?: string }>({ text: "", linkTitle: "", url: "", image_url: undefined });
  const [newNewsItem, setNewNewsItem] = useState<NewsItem>({ title: "", linkTitle: "", url: "", date: "", image_url: undefined });
  const [newFestivalItem, setNewFestivalItem] = useState<FestivalItem>({ title: "", linkTitle: "", url: "", date: "", image_url: undefined });
  const [urlValidation, setUrlValidation] = useState<{ news: boolean; festival: boolean; award: boolean }>({ 
    news: true, 
    festival: true, 
    award: true 
  });
  const [uploading, setUploading] = useState<{ award: boolean; news: boolean; festival: boolean }>({
    award: false,
    news: false,
    festival: false
  });
  const [editingAwardIndex, setEditingAwardIndex] = useState<number | null>(null);
  const [editingNewsIndex, setEditingNewsIndex] = useState<number | null>(null);
  const [editingFestivalIndex, setEditingFestivalIndex] = useState<number | null>(null);

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

  // Upload de imagem para reconhecimentos
  const handleImageCropped = async (type: 'award' | 'news' | 'festival', blob: Blob, previewUrl: string) => {
    setUploading({ ...uploading, [type]: true });
    
    try {
      const fileName = `recognition-${type}-${Date.now()}.png`;
      
      const { error: uploadError } = await supabase.storage
        .from("project-media")
        .upload(fileName, blob);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("project-media")
        .getPublicUrl(fileName);

      // Atualizar o estado correspondente
      if (type === 'award') {
        setNewAward({ ...newAward, image_url: publicUrl });
      } else if (type === 'news') {
        setNewNewsItem({ ...newNewsItem, image_url: publicUrl });
      } else {
        setNewFestivalItem({ ...newFestivalItem, image_url: publicUrl });
      }

      toast.success("Imagem adicionada!");
    } catch (error) {
      console.error("Erro no upload:", error);
      toast.error("Erro ao fazer upload da imagem");
    } finally {
      setUploading({ ...uploading, [type]: false });
    }
  };

  // --- Award functions ---
  const startEditAward = (index: number) => {
    const award = awards[index];
    if (typeof award === 'string') {
      setNewAward({ text: award, linkTitle: "", url: "", image_url: undefined });
    } else {
      setNewAward({ text: award.text || "", linkTitle: award.linkTitle || "", url: award.url || "", image_url: award.image_url || undefined });
    }
    setEditingAwardIndex(index);
  };

  const cancelEditAward = () => {
    setNewAward({ text: "", linkTitle: "", url: "", image_url: undefined });
    setEditingAwardIndex(null);
  };

  const addAward = () => {
    if (!newAward.text.trim()) return;

    const awardToAdd: any = {
      text: newAward.text.trim(),
      linkTitle: newAward.linkTitle.trim() || undefined,
      url: newAward.url ? formatUrl(newAward.url.trim()) : undefined,
      image_url: newAward.image_url || undefined
    };

    if (editingAwardIndex !== null) {
      const updated = [...awards];
      updated[editingAwardIndex] = awardToAdd;
      onAwardsChange(updated);
      setEditingAwardIndex(null);
    } else {
      onAwardsChange([...awards, awardToAdd]);
    }
    setNewAward({ text: "", linkTitle: "", url: "", image_url: undefined });
  };

  const removeAward = (index: number) => {
    if (editingAwardIndex === index) cancelEditAward();
    onAwardsChange(awards.filter((_, i) => i !== index));
  };

  // --- News functions ---
  const startEditNews = (index: number) => {
    const item = news[index];
    setNewNewsItem({ title: item.title || "", linkTitle: item.linkTitle || "", url: item.url || "", date: item.date || "", image_url: item.image_url || undefined });
    setEditingNewsIndex(index);
  };

  const cancelEditNews = () => {
    setNewNewsItem({ title: "", linkTitle: "", url: "", date: "", image_url: undefined });
    setEditingNewsIndex(null);
  };

  const addNewsItem = () => {
    if (!newNewsItem.title.trim()) return;
    const item = {
      title: newNewsItem.title.trim(),
      linkTitle: newNewsItem.linkTitle?.trim() || undefined,
      url: newNewsItem.url ? formatUrl(newNewsItem.url.trim()) : undefined,
      date: newNewsItem.date?.trim() || undefined,
      image_url: newNewsItem.image_url || undefined
    };

    if (editingNewsIndex !== null) {
      const updated = [...news];
      updated[editingNewsIndex] = item;
      onNewsChange(updated);
      setEditingNewsIndex(null);
    } else {
      onNewsChange([...news, item]);
    }
    setNewNewsItem({ title: "", linkTitle: "", url: "", date: "", image_url: undefined });
  };

  const removeNewsItem = (index: number) => {
    if (editingNewsIndex === index) cancelEditNews();
    onNewsChange(news.filter((_, i) => i !== index));
  };

  // --- Festival functions ---
  const startEditFestival = (index: number) => {
    const item = festivals[index];
    setNewFestivalItem({ title: item.title || "", linkTitle: item.linkTitle || "", url: item.url || "", date: item.date || "", image_url: item.image_url || undefined });
    setEditingFestivalIndex(index);
  };

  const cancelEditFestival = () => {
    setNewFestivalItem({ title: "", linkTitle: "", url: "", date: "", image_url: undefined });
    setEditingFestivalIndex(null);
  };

  const addFestivalItem = () => {
    if (!newFestivalItem.title.trim()) return;
    const item = {
      title: newFestivalItem.title.trim(),
      linkTitle: newFestivalItem.linkTitle?.trim() || undefined,
      url: newFestivalItem.url ? formatUrl(newFestivalItem.url.trim()) : undefined,
      date: newFestivalItem.date?.trim() || undefined,
      image_url: newFestivalItem.image_url || undefined
    };

    if (editingFestivalIndex !== null) {
      const updated = [...festivals];
      updated[editingFestivalIndex] = item;
      onFestivalsChange(updated);
      setEditingFestivalIndex(null);
    } else {
      onFestivalsChange([...festivals, item]);
    }
    setNewFestivalItem({ title: "", linkTitle: "", url: "", date: "", image_url: undefined });
  };

  const removeFestivalItem = (index: number) => {
    if (editingFestivalIndex === index) cancelEditFestival();
    onFestivalsChange(festivals.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6 overflow-x-hidden w-full min-w-0">
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
                <li key={index} className={`flex items-center justify-between p-2 rounded-lg group ${editingAwardIndex === index ? 'bg-primary/10 ring-1 ring-primary/30' : 'bg-muted/50'}`}>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{awardText}</p>
                    {linkTitle && <p className="text-xs text-primary/80 truncate mt-1">Link: {linkTitle}</p>}
                    {linkUrl && <p className="text-xs text-muted-foreground truncate">{linkUrl}</p>}
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => startEditAward(index)}
                      title="Editar"
                    >
                      <Pencil className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeAward(index)}
                    >
                      <X className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
        
        <div className="space-y-2 p-3 border border-dashed rounded-lg overflow-hidden">
          <Input
            placeholder="Texto do prêmio/reconhecimento *"
            value={newAward.text}
            onChange={(e) => setNewAward({ ...newAward, text: e.target.value })}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
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
          
          {/* Imagem opcional */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground flex items-center gap-1">
              <ImageIcon className="w-3 h-3" />
              Imagem (opcional - quadrada ou retangular)
            </Label>
            {newAward.image_url ? (
              <div className="flex items-center gap-2">
                <img src={newAward.image_url} alt="Preview" className="w-16 h-16 object-cover rounded border" />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setNewAward({ ...newAward, image_url: undefined })}
                >
                  <X className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            ) : (
              <ImageCropper
                onImageCropped={(blob, previewUrl) => handleImageCropped('award', blob, previewUrl)}
                mode="both"
                allowReadjust={false}
              />
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={addAward}
              disabled={!newAward.text.trim() || uploading.award}
            >
              {uploading.award ? "Fazendo upload..." : editingAwardIndex !== null ? "Atualizar" : "Salvar"}
            </Button>
            {editingAwardIndex !== null && (
              <Button type="button" variant="ghost" size="sm" onClick={cancelEditAward}>
                Cancelar
              </Button>
            )}
          </div>
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
              <li key={index} className={`flex items-center justify-between p-2 rounded-lg group ${editingFestivalIndex === index ? 'bg-primary/10 ring-1 ring-primary/30' : 'bg-muted/50'}`}>
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
                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => startEditFestival(index)}
                    title="Editar"
                  >
                    <Pencil className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFestivalItem(index)}
                  >
                    <X className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
        
        <div className="space-y-2 p-3 border border-dashed rounded-lg overflow-hidden">
          <Input
            placeholder="Nome do Festival/Exibição *"
            value={newFestivalItem.title}
            onChange={(e) => setNewFestivalItem({ ...newFestivalItem, title: e.target.value })}
          />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
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
          
          {/* Imagem opcional */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground flex items-center gap-1">
              <ImageIcon className="w-3 h-3" />
              Imagem (opcional - quadrada ou retangular)
            </Label>
            {newFestivalItem.image_url ? (
              <div className="flex items-center gap-2">
                <img src={newFestivalItem.image_url} alt="Preview" className="w-16 h-16 object-cover rounded border" />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setNewFestivalItem({ ...newFestivalItem, image_url: undefined })}
                >
                  <X className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            ) : (
              <ImageCropper
                onImageCropped={(blob, previewUrl) => handleImageCropped('festival', blob, previewUrl)}
                mode="both"
                allowReadjust={false}
              />
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={addFestivalItem}
              disabled={!newFestivalItem.title.trim() || uploading.festival}
            >
              {uploading.festival ? "Fazendo upload..." : editingFestivalIndex !== null ? "Atualizar" : "Salvar"}
            </Button>
            {editingFestivalIndex !== null && (
              <Button type="button" variant="ghost" size="sm" onClick={cancelEditFestival}>
                Cancelar
              </Button>
            )}
          </div>
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
              <li key={index} className={`flex items-center justify-between p-2 rounded-lg group ${editingNewsIndex === index ? 'bg-primary/10 ring-1 ring-primary/30' : 'bg-muted/50'}`}>
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
                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => startEditNews(index)}
                    title="Editar"
                  >
                    <Pencil className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeNewsItem(index)}
                  >
                    <X className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
        
        <div className="space-y-2 p-3 border border-dashed rounded-lg overflow-hidden">
          <Input
            placeholder="Título da matéria *"
            value={newNewsItem.title}
            onChange={(e) => setNewNewsItem({ ...newNewsItem, title: e.target.value })}
          />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
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
          
          {/* Imagem opcional */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground flex items-center gap-1">
              <ImageIcon className="w-3 h-3" />
              Imagem (opcional - quadrada ou retangular)
            </Label>
            {newNewsItem.image_url ? (
              <div className="flex items-center gap-2">
                <img src={newNewsItem.image_url} alt="Preview" className="w-16 h-16 object-cover rounded border" />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setNewNewsItem({ ...newNewsItem, image_url: undefined })}
                >
                  <X className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            ) : (
              <ImageCropper
                onImageCropped={(blob, previewUrl) => handleImageCropped('news', blob, previewUrl)}
                mode="both"
                allowReadjust={false}
              />
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={addNewsItem}
              disabled={!newNewsItem.title.trim() || uploading.news}
            >
              {uploading.news ? "Fazendo upload..." : editingNewsIndex !== null ? "Atualizar" : "Salvar"}
            </Button>
            {editingNewsIndex !== null && (
              <Button type="button" variant="ghost" size="sm" onClick={cancelEditNews}>
                Cancelar
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
