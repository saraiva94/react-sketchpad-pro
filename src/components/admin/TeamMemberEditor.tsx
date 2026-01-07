import { useState, useCallback } from "react";
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
  ExternalLink,
  Twitter,
  AlertCircle,
  Check,
  MessageCircle
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import imdbLogo from "@/assets/imdb-logo.png";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Validation patterns for social links
const socialValidation = {
  instagram: {
    validate: (value: string) => {
      if (!value) return { valid: true, message: "" };
      // @username or full URL
      const usernamePattern = /^@?[a-zA-Z0-9._]{1,30}$/;
      const urlPattern = /^(https?:\/\/)?(www\.)?instagram\.com\/[a-zA-Z0-9._]+\/?$/;
      if (usernamePattern.test(value) || urlPattern.test(value)) {
        return { valid: true, message: "" };
      }
      return { valid: false, message: "Formato inválido. Use @usuario ou URL do Instagram" };
    }
  },
  linkedin: {
    validate: (value: string) => {
      if (!value) return { valid: true, message: "" };
      const urlPattern = /^(https?:\/\/)?(www\.)?linkedin\.com\/(in|company)\/[a-zA-Z0-9\-._]+\/?/;
      const shortPattern = /^(in|company)\/[a-zA-Z0-9\-._]+$/;
      if (urlPattern.test(value) || shortPattern.test(value) || value.startsWith('linkedin.com/')) {
        return { valid: true, message: "" };
      }
      return { valid: false, message: "Formato inválido. Use URL do LinkedIn (linkedin.com/in/...)" };
    }
  },
  youtube: {
    validate: (value: string) => {
      if (!value) return { valid: true, message: "" };
      const urlPattern = /^(https?:\/\/)?(www\.)?youtube\.com\/(c\/|channel\/|@)?[a-zA-Z0-9\-._]+\/?$/;
      const handlePattern = /^@[a-zA-Z0-9\-._]+$/;
      if (urlPattern.test(value) || handlePattern.test(value) || value.startsWith('youtube.com/')) {
        return { valid: true, message: "" };
      }
      return { valid: false, message: "Formato inválido. Use @canal ou URL do YouTube" };
    }
  },
  twitter: {
    validate: (value: string) => {
      if (!value) return { valid: true, message: "" };
      const usernamePattern = /^@?[a-zA-Z0-9_]{1,15}$/;
      const urlPattern = /^(https?:\/\/)?(www\.)?(twitter\.com|x\.com)\/[a-zA-Z0-9_]+\/?$/;
      if (usernamePattern.test(value) || urlPattern.test(value) || value.startsWith('x.com/')) {
        return { valid: true, message: "" };
      }
      return { valid: false, message: "Formato inválido. Use @usuario ou URL do X/Twitter" };
    }
  },
  imdb: {
    validate: (value: string) => {
      if (!value) return { valid: true, message: "" };
      const urlPattern = /^(https?:\/\/)?(www\.)?imdb\.com\/(name|title)\/[a-zA-Z0-9]+\/?/;
      if (urlPattern.test(value) || value.startsWith('imdb.com/')) {
        return { valid: true, message: "" };
      }
      return { valid: false, message: "Formato inválido. Use URL do IMDb (imdb.com/name/...)" };
    }
  },
  website: {
    validate: (value: string) => {
      if (!value) return { valid: true, message: "" };
      const urlPattern = /^(https?:\/\/)?[a-zA-Z0-9\-._]+\.[a-zA-Z]{2,}(\/.*)?$/;
      if (urlPattern.test(value)) {
        return { valid: true, message: "" };
      }
      return { valid: false, message: "Formato inválido. Use uma URL válida (https://...)" };
    }
  },
  whatsapp: {
    validate: (value: string) => {
      if (!value) return { valid: true, message: "" };
      // Remove todos os caracteres não numéricos para validação
      const digitsOnly = value.replace(/\D/g, '');
      // WhatsApp precisa de pelo menos 10 dígitos (DDD + número)
      if (digitsOnly.length >= 10 && digitsOnly.length <= 15) {
        return { valid: true, message: "" };
      }
      return { valid: false, message: "Use apenas números: código do país + DDD + número (ex: 5511999999999)" };
    }
  }
};

type SocialPlatform = keyof typeof socialValidation;

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
    twitter?: string;
    imdb?: string;
    website?: string;
    whatsapp?: string;
  };
  curriculum_url?: string;
  detalhes?: string;
}

interface TeamMemberEditorProps {
  members: TeamMemberData[];
  onChange: (members: TeamMemberData[]) => void;
}

export const TeamMemberEditor = ({ members, onChange }: TeamMemberEditorProps) => {
  const { toast } = useToast();
  const [uploadingPhotoIndex, setUploadingPhotoIndex] = useState<number | null>(null);
  const [uploadingCvIndex, setUploadingCvIndex] = useState<number | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const validateSocialLink = useCallback((index: number, platform: SocialPlatform, value: string) => {
    const validator = socialValidation[platform];
    if (validator) {
      const result = validator.validate(value);
      const errorKey = `${index}-${platform}`;
      
      setValidationErrors(prev => {
        if (result.valid) {
          const { [errorKey]: _, ...rest } = prev;
          return rest;
        } else {
          return { ...prev, [errorKey]: result.message };
        }
      });
      
      if (!result.valid && value) {
        toast({
          title: "Link inválido",
          description: result.message,
          variant: "destructive",
        });
      }
    }
  }, [toast]);

  const addMember = () => {
    onChange([...members, { 
      nome: "", 
      funcao: "", 
      email: "", 
      telefone: "",
      photo_url: "",
      social_links: {},
      curriculum_url: "",
      detalhes: ""
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
              <TooltipProvider>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {/* Instagram */}
                  <div className="relative flex items-center gap-2">
                    <Instagram className="w-4 h-4 text-pink-500 shrink-0" />
                    <Input
                      value={member.social_links?.instagram || ""}
                      onChange={(e) => updateSocialLink(index, "instagram", e.target.value)}
                      onBlur={(e) => validateSocialLink(index, "instagram", e.target.value)}
                      placeholder="@usuario"
                      className={`flex-1 ${validationErrors[`${index}-instagram`] ? 'border-red-500 focus-visible:ring-red-500' : member.social_links?.instagram ? 'border-green-500' : ''}`}
                    />
                    {validationErrors[`${index}-instagram`] ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <AlertCircle className="w-4 h-4 text-red-500 absolute right-2" />
                        </TooltipTrigger>
                        <TooltipContent className="bg-red-500 text-white">
                          {validationErrors[`${index}-instagram`]}
                        </TooltipContent>
                      </Tooltip>
                    ) : member.social_links?.instagram ? (
                      <Check className="w-4 h-4 text-green-500 absolute right-2" />
                    ) : null}
                  </div>

                  {/* LinkedIn */}
                  <div className="relative flex items-center gap-2">
                    <Linkedin className="w-4 h-4 text-blue-600 shrink-0" />
                    <Input
                      value={member.social_links?.linkedin || ""}
                      onChange={(e) => updateSocialLink(index, "linkedin", e.target.value)}
                      onBlur={(e) => validateSocialLink(index, "linkedin", e.target.value)}
                      placeholder="linkedin.com/in/..."
                      className={`flex-1 ${validationErrors[`${index}-linkedin`] ? 'border-red-500 focus-visible:ring-red-500' : member.social_links?.linkedin ? 'border-green-500' : ''}`}
                    />
                    {validationErrors[`${index}-linkedin`] ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <AlertCircle className="w-4 h-4 text-red-500 absolute right-2" />
                        </TooltipTrigger>
                        <TooltipContent className="bg-red-500 text-white">
                          {validationErrors[`${index}-linkedin`]}
                        </TooltipContent>
                      </Tooltip>
                    ) : member.social_links?.linkedin ? (
                      <Check className="w-4 h-4 text-green-500 absolute right-2" />
                    ) : null}
                  </div>

                  {/* YouTube */}
                  <div className="relative flex items-center gap-2">
                    <Youtube className="w-4 h-4 text-red-500 shrink-0" />
                    <Input
                      value={member.social_links?.youtube || ""}
                      onChange={(e) => updateSocialLink(index, "youtube", e.target.value)}
                      onBlur={(e) => validateSocialLink(index, "youtube", e.target.value)}
                      placeholder="youtube.com/@..."
                      className={`flex-1 ${validationErrors[`${index}-youtube`] ? 'border-red-500 focus-visible:ring-red-500' : member.social_links?.youtube ? 'border-green-500' : ''}`}
                    />
                    {validationErrors[`${index}-youtube`] ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <AlertCircle className="w-4 h-4 text-red-500 absolute right-2" />
                        </TooltipTrigger>
                        <TooltipContent className="bg-red-500 text-white">
                          {validationErrors[`${index}-youtube`]}
                        </TooltipContent>
                      </Tooltip>
                    ) : member.social_links?.youtube ? (
                      <Check className="w-4 h-4 text-green-500 absolute right-2" />
                    ) : null}
                  </div>

                  {/* Twitter/X */}
                  <div className="relative flex items-center gap-2">
                    <Twitter className="w-4 h-4 text-sky-500 shrink-0" />
                    <Input
                      value={member.social_links?.twitter || ""}
                      onChange={(e) => updateSocialLink(index, "twitter", e.target.value)}
                      onBlur={(e) => validateSocialLink(index, "twitter", e.target.value)}
                      placeholder="@usuario ou x.com/..."
                      className={`flex-1 ${validationErrors[`${index}-twitter`] ? 'border-red-500 focus-visible:ring-red-500' : member.social_links?.twitter ? 'border-green-500' : ''}`}
                    />
                    {validationErrors[`${index}-twitter`] ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <AlertCircle className="w-4 h-4 text-red-500 absolute right-2" />
                        </TooltipTrigger>
                        <TooltipContent className="bg-red-500 text-white">
                          {validationErrors[`${index}-twitter`]}
                        </TooltipContent>
                      </Tooltip>
                    ) : member.social_links?.twitter ? (
                      <Check className="w-4 h-4 text-green-500 absolute right-2" />
                    ) : null}
                  </div>

                  {/* IMDb */}
                  <div className="relative flex items-center gap-2">
                    <img src={imdbLogo} alt="IMDb" className="w-5 h-5 shrink-0 object-contain" />
                    <Input
                      value={member.social_links?.imdb || ""}
                      onChange={(e) => updateSocialLink(index, "imdb", e.target.value)}
                      onBlur={(e) => validateSocialLink(index, "imdb", e.target.value)}
                      placeholder="https://www.imdb.com/nam..."
                      className={`flex-1 ${validationErrors[`${index}-imdb`] ? 'border-red-500 focus-visible:ring-red-500' : member.social_links?.imdb ? 'border-green-500' : ''}`}
                    />
                    {validationErrors[`${index}-imdb`] ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <AlertCircle className="w-4 h-4 text-red-500 absolute right-2" />
                        </TooltipTrigger>
                        <TooltipContent className="bg-red-500 text-white">
                          {validationErrors[`${index}-imdb`]}
                        </TooltipContent>
                      </Tooltip>
                    ) : member.social_links?.imdb ? (
                      <Check className="w-4 h-4 text-green-500 absolute right-2" />
                    ) : null}
                  </div>

                  {/* Website */}
                  <div className="relative flex items-center gap-2">
                    <Globe className="w-4 h-4 text-emerald-500 shrink-0" />
                    <Input
                      value={member.social_links?.website || ""}
                      onChange={(e) => updateSocialLink(index, "website", e.target.value)}
                      onBlur={(e) => validateSocialLink(index, "website", e.target.value)}
                      placeholder="https://seusite.com"
                      className={`flex-1 ${validationErrors[`${index}-website`] ? 'border-red-500 focus-visible:ring-red-500' : member.social_links?.website ? 'border-green-500' : ''}`}
                    />
                    {validationErrors[`${index}-website`] ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <AlertCircle className="w-4 h-4 text-red-500 absolute right-2" />
                        </TooltipTrigger>
                        <TooltipContent className="bg-red-500 text-white">
                          {validationErrors[`${index}-website`]}
                        </TooltipContent>
                      </Tooltip>
                    ) : member.social_links?.website ? (
                      <Check className="w-4 h-4 text-green-500 absolute right-2" />
                    ) : null}
                  </div>

                  {/* WhatsApp */}
                  <div className="relative flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-green-500 shrink-0" />
                    <Input
                      value={member.social_links?.whatsapp || ""}
                      onChange={(e) => {
                        // Permite apenas números
                        const value = e.target.value.replace(/\D/g, '');
                        updateSocialLink(index, "whatsapp", value);
                      }}
                      onBlur={(e) => validateSocialLink(index, "whatsapp", e.target.value)}
                      placeholder="5511999999999"
                      className={`flex-1 ${validationErrors[`${index}-whatsapp`] ? 'border-red-500 focus-visible:ring-red-500' : member.social_links?.whatsapp ? 'border-green-500' : ''}`}
                    />
                    {validationErrors[`${index}-whatsapp`] ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <AlertCircle className="w-4 h-4 text-red-500 absolute right-2" />
                        </TooltipTrigger>
                        <TooltipContent className="bg-red-500 text-white">
                          {validationErrors[`${index}-whatsapp`]}
                        </TooltipContent>
                      </Tooltip>
                    ) : member.social_links?.whatsapp ? (
                      <Check className="w-4 h-4 text-green-500 absolute right-2" />
                    ) : null}
                  </div>
                </div>
              </TooltipProvider>
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

            {/* Detalhes */}
            <div className="pt-2 border-t">
              <Label className="text-sm mb-2 block">Detalhes <span className="text-muted-foreground text-xs">(opcional, máx. 200 caracteres)</span></Label>
              <textarea
                value={member.detalhes || ""}
                onChange={(e) => updateMember(index, "detalhes", e.target.value.slice(0, 200))}
                placeholder="Informações adicionais sobre este integrante..."
                className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background resize-none"
                rows={2}
                maxLength={200}
              />
              <p className="text-xs text-muted-foreground mt-1">{(member.detalhes || "").length}/200 caracteres</p>
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
