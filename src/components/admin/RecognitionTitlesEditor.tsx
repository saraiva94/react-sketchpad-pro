import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Award, Film, Newspaper, Save, Palette } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import EmojiPicker from 'emoji-picker-react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface RecognitionTitle {
  text: string;
  emoji: string;
  color: string;
}

interface RecognitionTitles {
  awards: RecognitionTitle;
  festivals: RecognitionTitle;
  media: RecognitionTitle;
}

const DEFAULT_TITLES: RecognitionTitles = {
  awards: { text: "Prêmios e Reconhecimentos", emoji: "🏆", color: "#f59e0b" },
  festivals: { text: "Exibições e Festivais", emoji: "▶", color: "#8b5cf6" },
  media: { text: "Na Mídia", emoji: "📰", color: "#3b82f6" }
};

export function RecognitionTitlesEditor() {
  const { toast } = useToast();
  const [titles, setTitles] = useState<RecognitionTitles>(DEFAULT_TITLES);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTitles();
  }, []);

  const fetchTitles = async () => {
    const { data } = await supabase
      .from("settings")
      .select("value")
      .eq("key", "recognition_titles")
      .maybeSingle();
    
    if (data) {
      const savedTitles = data.value as RecognitionTitles;
      setTitles({ ...DEFAULT_TITLES, ...savedTitles });
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    
    const { data: existing } = await supabase
      .from("settings")
      .select("id")
      .eq("key", "recognition_titles")
      .maybeSingle();
    
    let error;
    if (existing) {
      const result = await supabase
        .from("settings")
        .update({ value: titles })
        .eq("key", "recognition_titles");
      error = result.error;
    } else {
      const result = await supabase
        .from("settings")
        .insert([{ key: "recognition_titles", value: titles }]);
      error = result.error;
    }

    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível salvar os títulos.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Salvo!",
        description: "Títulos de reconhecimentos atualizados.",
      });
    }
    
    setSaving(false);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/3" />
            <div className="h-10 bg-muted rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="w-5 h-5" />
          Títulos de Reconhecimentos e Mídia
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-sm text-muted-foreground">
          Personalize os títulos, emojis e cores das subsessões de reconhecimentos.
        </p>

        {/* Prêmios */}
        <div className="space-y-2">
          <Label>Prêmios e Reconhecimentos</Label>
          <div className="grid grid-cols-[auto_1fr_auto] gap-2 items-center">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="w-12 h-12 text-2xl">
                  {titles.awards.emoji}
                </Button>
              </PopoverTrigger>
              <PopoverContent>
                <EmojiPicker onEmojiClick={(emoji) => setTitles({...titles, awards: {...titles.awards, emoji: emoji.emoji}})} />
              </PopoverContent>
            </Popover>
            <Input
              value={titles.awards.text}
              onChange={(e) => setTitles({...titles, awards: {...titles.awards, text: e.target.value}})}
              placeholder="Título"
            />
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="w-12 h-12">
                  <div className="w-6 h-6 rounded-full" style={{backgroundColor: titles.awards.color}} />
                </Button>
              </PopoverTrigger>
              <PopoverContent>
                <input 
                  type="color" 
                  value={titles.awards.color}
                  onChange={(e) => setTitles({...titles, awards: {...titles.awards, color: e.target.value}})}
                  className="w-full h-10"
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Festivais */}
        <div className="space-y-2">
          <Label>Exibições e Festivais</Label>
          <div className="grid grid-cols-[auto_1fr_auto] gap-2 items-center">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="w-12 h-12 text-2xl">
                  {titles.festivals.emoji}
                </Button>
              </PopoverTrigger>
              <PopoverContent>
                <EmojiPicker onEmojiClick={(emoji) => setTitles({...titles, festivals: {...titles.festivals, emoji: emoji.emoji}})} />
              </PopoverContent>
            </Popover>
            <Input
              value={titles.festivals.text}
              onChange={(e) => setTitles({...titles, festivals: {...titles.festivals, text: e.target.value}})}
              placeholder="Título"
            />
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="w-12 h-12">
                  <div className="w-6 h-6 rounded-full" style={{backgroundColor: titles.festivals.color}} />
                </Button>
              </PopoverTrigger>
              <PopoverContent>
                <input 
                  type="color" 
                  value={titles.festivals.color}
                  onChange={(e) => setTitles({...titles, festivals: {...titles.festivals, color: e.target.value}})}
                  className="w-full h-10"
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Mídia */}
        <div className="space-y-2">
          <Label>Na Mídia</Label>
          <div className="grid grid-cols-[auto_1fr_auto] gap-2 items-center">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="w-12 h-12 text-2xl">
                  {titles.media.emoji}
                </Button>
              </PopoverTrigger>
              <PopoverContent>
                <EmojiPicker onEmojiClick={(emoji) => setTitles({...titles, media: {...titles.media, emoji: emoji.emoji}})} />
              </PopoverContent>
            </Popover>
            <Input
              value={titles.media.text}
              onChange={(e) => setTitles({...titles, media: {...titles.media, text: e.target.value}})}
              placeholder="Título"
            />
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="w-12 h-12">
                  <div className="w-6 h-6 rounded-full" style={{backgroundColor: titles.media.color}} />
                </Button>
              </PopoverTrigger>
              <PopoverContent>
                <input 
                  type="color" 
                  value={titles.media.color}
                  onChange={(e) => setTitles({...titles, media: {...titles.media, color: e.target.value}})}
                  className="w-full h-10"
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <Button onClick={handleSave} disabled={saving} className="w-full">
          <Save className="w-4 h-4 mr-2" />
          {saving ? "Salvando..." : "Salvar Títulos"}
        </Button>
      </CardContent>
    </Card>
  );
}
