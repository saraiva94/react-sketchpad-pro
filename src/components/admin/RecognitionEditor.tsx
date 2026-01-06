import { useState } from "react";
import { Plus, X, Award, Newspaper, Film } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface NewsItem {
  title: string;
  url?: string;
  date?: string;
}

export interface FestivalItem {
  title: string;
  url?: string;
  date?: string;
}

interface RecognitionEditorProps {
  awards: string[];
  news: NewsItem[];
  festivals: FestivalItem[];
  onAwardsChange: (awards: string[]) => void;
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
  const [newAward, setNewAward] = useState("");
  const [newNewsItem, setNewNewsItem] = useState<NewsItem>({ title: "", url: "", date: "" });
  const [newFestivalItem, setNewFestivalItem] = useState<FestivalItem>({ title: "", url: "", date: "" });

  const addAward = () => {
    if (!newAward.trim()) return;
    onAwardsChange([...awards, newAward.trim()]);
    setNewAward("");
  };

  const removeAward = (index: number) => {
    onAwardsChange(awards.filter((_, i) => i !== index));
  };

  const addNewsItem = () => {
    if (!newNewsItem.title.trim()) return;
    onNewsChange([...news, { 
      title: newNewsItem.title.trim(),
      url: newNewsItem.url?.trim() || undefined,
      date: newNewsItem.date?.trim() || undefined
    }]);
    setNewNewsItem({ title: "", url: "", date: "" });
  };

  const removeNewsItem = (index: number) => {
    onNewsChange(news.filter((_, i) => i !== index));
  };

  const addFestivalItem = () => {
    if (!newFestivalItem.title.trim()) return;
    onFestivalsChange([...festivals, { 
      title: newFestivalItem.title.trim(),
      url: newFestivalItem.url?.trim() || undefined,
      date: newFestivalItem.date?.trim() || undefined
    }]);
    setNewFestivalItem({ title: "", url: "", date: "" });
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
            {awards.map((award, index) => (
              <li key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                <span className="text-sm">{award}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeAward(index)}
                >
                  <X className="w-4 h-4 text-destructive" />
                </Button>
              </li>
            ))}
          </ul>
        )}
        
        <div className="flex gap-2">
          <Input
            placeholder="Ex: Prêmio Cultura Viva 2023"
            value={newAward}
            onChange={(e) => setNewAward(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addAward();
              }
            }}
          />
          <Button 
            type="button" 
            variant="secondary" 
            onClick={addAward}
            disabled={!newAward.trim()}
          >
            <Plus className="w-4 h-4" />
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
              <li key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{item.title}</p>
                  {item.date && <p className="text-xs text-muted-foreground">{item.date}</p>}
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
          <div className="grid grid-cols-2 gap-2">
            <Input
              placeholder="URL (opcional)"
              value={newFestivalItem.url}
              onChange={(e) => setNewFestivalItem({ ...newFestivalItem, url: e.target.value })}
            />
            <Input
              placeholder="Data (ex: 15/03/2024)"
              value={newFestivalItem.date}
              onChange={(e) => setNewFestivalItem({ ...newFestivalItem, date: e.target.value })}
            />
          </div>
          <Button 
            type="button" 
            variant="secondary" 
            size="sm"
            onClick={addFestivalItem}
            disabled={!newFestivalItem.title.trim()}
          >
            <Plus className="w-4 h-4 mr-1" />
            Adicionar Festival/Exibição
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
              <li key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{item.title}</p>
                  {item.date && <p className="text-xs text-muted-foreground">{item.date}</p>}
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
          <div className="grid grid-cols-2 gap-2">
            <Input
              placeholder="URL (opcional)"
              value={newNewsItem.url}
              onChange={(e) => setNewNewsItem({ ...newNewsItem, url: e.target.value })}
            />
            <Input
              placeholder="Data (ex: 15/03/2024)"
              value={newNewsItem.date}
              onChange={(e) => setNewNewsItem({ ...newNewsItem, date: e.target.value })}
            />
          </div>
          <Button 
            type="button" 
            variant="secondary" 
            size="sm"
            onClick={addNewsItem}
            disabled={!newNewsItem.title.trim()}
          >
            <Plus className="w-4 h-4 mr-1" />
            Adicionar Matéria
          </Button>
        </div>
      </div>
    </div>
  );
}
