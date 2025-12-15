import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { 
  X, 
  Plus, 
  Upload, 
  Camera, 
  Globe, 
  Instagram, 
  Linkedin, 
  Facebook, 
  Youtube,
  FileText,
  ExternalLink
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface TeamMemberData {
  nome: string;
  funcao: string;
  email: string;
  telefone: string;
  photo_url?: string;
  social_links?: {
    instagram?: string;
    linkedin?: string;
    facebook?: string;
    youtube?: string;
    website?: string;
  };
  curriculum_url?: string;
}

interface TeamMemberEditorProps {
  members: TeamMemberData[];
  onChange: (members: TeamMemberData[]) => void;
}

export const TeamMemberEditor = ({ members, onChange }: TeamMemberEditorProps) => {
  const { toast } = useToast();
  const [uploadingPhotoIndex, setUploadingPhotoIndex] = useState<number | null>(null);
  const [uploadingCvIndex, setUploadingCvIndex] = useState<number | null>(null);

  const addMember = () => {
    onChange([...members, { 
      nome: "", 
      funcao: "", 
      email: "", 
      telefone: "",
      photo_url: "",
      social_links: {},
      curriculum_url: ""
    }]);
  };

  const updateMember = (index: number, field: keyof TeamMemberData, value: any) => {
    const updated = [...members];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const updateSocialLink = (index: number, platform: string, value: string) => {
    const updated = [...members];
    updated[index] = {
      ...updated[index],
      social_links: {
        ...updated[index].social_links,
        [platform]: value
      }
    };
    onChange(updated);
  };

  const removeMember = (index: number) => {
    onChange(members.filter((_, i) => i !== index));
  };

  const handlePhotoUpload = async (index: number, file: File) => {
    setUploadingPhotoIndex(index);
    
    const fileName = `team-member-${Date.now()}-${index}.${file.name.split('.').pop()}`;
    
    const { data, error } = await supabase.storage
      .from("project-media")
      .upload(fileName, file);
    
    if (error) {
      toast({
        title: "Erro no upload",
        description: error.message,
        variant: "destructive",
      });
    } else {
      const { data: urlData } = supabase.storage
        .from("project-media")
        .getPublicUrl(fileName);
      
      updateMember(index, "photo_url", urlData.publicUrl);
      
      toast({
        title: "Foto enviada!",
        description: "A foto foi carregada com sucesso.",
      });
    }
    
    setUploadingPhotoIndex(null);
  };

  const handleCvUpload = async (index: number, file: File) => {
    setUploadingCvIndex(index);
    
    const fileName = `curriculum-${Date.now()}-${index}.${file.name.split('.').pop()}`;
    
    const { data, error } = await supabase.storage
      .from("project-media")
      .upload(fileName, file);
    
    if (error) {
      toast({
        title: "Erro no upload",
        description: error.message,
        variant: "destructive",
      });
    } else {
      const { data: urlData } = supabase.storage
        .from("project-media")
        .getPublicUrl(fileName);
      
      updateMember(index, "curriculum_url", urlData.publicUrl);
      
      toast({
        title: "Currículo enviado!",
        description: "O documento foi carregado com sucesso.",
      });
    }
    
    setUploadingCvIndex(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b pb-2">
        <h3 className="text-lg font-semibold text-foreground">
          Ficha Técnica / Integrantes
        </h3>
        <Button type="button" variant="outline" size="sm" onClick={addMember}>
          <Plus className="w-4 h-4 mr-1" />
          Adicionar
        </Button>
      </div>

      {members.map((member, index) => (
        <Card key={index} className="p-4">
          <div className="flex justify-between items-start mb-4">
            <span className="text-sm font-medium">Integrante {index + 1}</span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => removeMember(index)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="space-y-4">
            {/* Photo Section */}
            <div className="flex items-start gap-4">
              <div className="flex flex-col items-center gap-2">
                <div className="w-20 h-20 rounded-full border-2 border-dashed border-muted-foreground/30 overflow-hidden bg-muted/50 flex items-center justify-center">
                  {member.photo_url ? (
                    <img 
                      src={member.photo_url} 
                      alt={member.nome || "Foto"}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Camera className="w-8 h-8 text-muted-foreground/50" />
                  )}
                </div>
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={uploadingPhotoIndex === index}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handlePhotoUpload(index, file);
                    }}
                  />
                  <span className="text-xs text-primary hover:underline">
                    {uploadingPhotoIndex === index ? "Enviando..." : "Foto"}
                  </span>
                </label>
              </div>

              {/* Basic Info */}
              <div className="flex-1 grid md:grid-cols-2 gap-3">
                <div>
                  <Label>Nome *</Label>
                  <Input
                    value={member.nome}
                    onChange={(e) => updateMember(index, "nome", e.target.value)}
                    placeholder="Nome completo"
                  />
                </div>
                <div>
                  <Label>Função *</Label>
                  <Input
                    value={member.funcao}
                    onChange={(e) => updateMember(index, "funcao", e.target.value)}
                    placeholder="Ex: Diretor, Roteirista..."
                  />
                </div>
                <div>
                  <Label>Email <span className="text-muted-foreground text-xs">(opcional)</span></Label>
                  <Input
                    type="email"
                    value={member.email}
                    onChange={(e) => updateMember(index, "email", e.target.value)}
                    placeholder="email@exemplo.com"
                  />
                </div>
                <div>
                  <Label>Telefone <span className="text-muted-foreground text-xs">(opcional)</span></Label>
                  <Input
                    value={member.telefone}
                    onChange={(e) => updateMember(index, "telefone", e.target.value)}
                    placeholder="(00) 00000-0000"
                  />
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div className="pt-2 border-t">
              <Label className="text-sm mb-2 block">Links e Redes Sociais <span className="text-muted-foreground text-xs">(opcional)</span></Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="flex items-center gap-2">
                  <Instagram className="w-4 h-4 text-pink-500" />
                  <Input
                    value={member.social_links?.instagram || ""}
                    onChange={(e) => updateSocialLink(index, "instagram", e.target.value)}
                    placeholder="@usuario"
                    className="flex-1"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Linkedin className="w-4 h-4 text-blue-600" />
                  <Input
                    value={member.social_links?.linkedin || ""}
                    onChange={(e) => updateSocialLink(index, "linkedin", e.target.value)}
                    placeholder="linkedin.com/in/..."
                    className="flex-1"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-emerald-500" />
                  <Input
                    value={member.social_links?.website || ""}
                    onChange={(e) => updateSocialLink(index, "website", e.target.value)}
                    placeholder="https://..."
                    className="flex-1"
                  />
                </div>
              </div>
            </div>

            {/* Curriculum */}
            <div className="pt-2 border-t flex items-center gap-4">
              <div className="flex items-center gap-2 flex-1">
                <FileText className="w-4 h-4 text-muted-foreground" />
                <Input
                  value={member.curriculum_url || ""}
                  onChange={(e) => updateMember(index, "curriculum_url", e.target.value)}
                  placeholder="Link do currículo ou portfólio"
                  className="flex-1"
                />
              </div>
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  className="hidden"
                  disabled={uploadingCvIndex === index}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleCvUpload(index, file);
                  }}
                />
                <Button type="button" variant="outline" size="sm" asChild>
                  <span>
                    <Upload className="w-4 h-4 mr-1" />
                    {uploadingCvIndex === index ? "Enviando..." : "Upload CV"}
                  </span>
                </Button>
              </label>
              {member.curriculum_url && (
                <a 
                  href={member.curriculum_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
        </Card>
      ))}

      {members.length === 0 && (
        <p className="text-center text-muted-foreground py-4 text-sm">
          Clique em "Adicionar" para incluir integrantes da equipe.
        </p>
      )}
    </div>
  );
};
