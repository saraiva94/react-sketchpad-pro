import { useLanguage } from "@/hooks/useLanguage";
import { useAutoTranslate } from "@/hooks/useAutoTranslate";
import imdbLogo from "@/assets/imdb-logo.png";
import {
  Instagram,
  Linkedin,
  Facebook,
  Youtube,
  Twitter,
  Globe,
  FileText,
  MessageCircle
} from "lucide-react";

interface ProjectMember {
  id: string;
  nome: string;
  funcao: string | null;
  email: string | null;
  telefone: string | null;
  photo_url: string | null;
  curriculum_url: string | null;
  social_links: {
    instagram?: string;
    linkedin?: string;
    facebook?: string;
    youtube?: string;
    twitter?: string;
    website?: string;
    imdb?: string;
    whatsapp?: string;
  } | null;
  detalhes?: string | null;
}

interface TranslatedMemberCardProps {
  member: ProjectMember;
  getInitials: (name: string | null) => string;
}

export function TranslatedMemberCard({ member, getInitials }: TranslatedMemberCardProps) {
  const { language } = useLanguage();

  // Auto-translate funcao and detalhes - use content-based namespace for global reuse
  const { translated: translatedFuncao } = useAutoTranslate(
    `member_funcao`,
    member.funcao
  );
  const { translated: translatedDetalhes } = useAutoTranslate(
    `member_detalhes`,
    member.detalhes
  );

  const displayFuncao = language === "pt" ? member.funcao : (translatedFuncao || member.funcao);
  const displayDetalhes = language === "pt" ? member.detalhes : (translatedDetalhes || member.detalhes);

  return (
    <div className="group relative overflow-visible card-solid p-6 bg-card rounded-xl border border-border rainbow-card-glow">
      <div className="flex items-start gap-4">
        {/* Foto */}
        {member.photo_url ? (
          <img 
            src={member.photo_url} 
            alt={member.nome}
            className="w-16 h-16 rounded-full object-cover flex-shrink-0 border-2 border-primary/20"
          />
        ) : (
          <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-primary-foreground text-base font-semibold">
              {getInitials(member.nome)}
            </span>
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h4 className="font-semibold text-foreground text-lg leading-tight tracking-normal antialiased">{member.nome}</h4>
          {displayFuncao && (
            <p className="text-sm text-primary/80 font-medium mt-0.5 antialiased">{displayFuncao}</p>
          )}
          
          {/* Detalhes */}
          {displayDetalhes && (
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed antialiased">{displayDetalhes}</p>
          )}
          
          {/* Social Links e CV */}
          <div className="flex items-center gap-2.5 mt-3">
            {member.social_links?.instagram && (
              <a href={member.social_links.instagram.startsWith('http') ? member.social_links.instagram : `https://instagram.com/${member.social_links.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="social-link-circle social-link-instagram w-8 h-8 rounded-full bg-pink-500/10 flex items-center justify-center hover:bg-pink-500/30">
                <Instagram className="w-4 h-4 text-pink-500" />
              </a>
            )}
            {member.social_links?.linkedin && (
              <a href={member.social_links.linkedin.startsWith('http') ? member.social_links.linkedin : `https://linkedin.com/in/${member.social_links.linkedin}`} target="_blank" rel="noopener noreferrer" className="social-link-circle social-link-linkedin w-8 h-8 rounded-full bg-blue-600/10 flex items-center justify-center hover:bg-blue-600/30">
                <Linkedin className="w-4 h-4 text-blue-600" />
              </a>
            )}
            {member.social_links?.facebook && (
              <a href={member.social_links.facebook.startsWith('http') ? member.social_links.facebook : `https://facebook.com/${member.social_links.facebook}`} target="_blank" rel="noopener noreferrer" className="social-link-circle social-link-facebook w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center hover:bg-blue-500/30">
                <Facebook className="w-4 h-4 text-blue-500" />
              </a>
            )}
            {member.social_links?.youtube && (
              <a href={member.social_links.youtube.startsWith('http') ? member.social_links.youtube : `https://youtube.com/${member.social_links.youtube.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="social-link-circle social-link-youtube w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center hover:bg-red-500/30">
                <Youtube className="w-4 h-4 text-red-500" />
              </a>
            )}
            {member.social_links?.twitter && (
              <a href={member.social_links.twitter.startsWith('http') ? member.social_links.twitter : `https://x.com/${member.social_links.twitter.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="social-link-circle social-link-twitter w-8 h-8 rounded-full bg-sky-500/10 flex items-center justify-center hover:bg-sky-500/30">
                <Twitter className="w-4 h-4 text-sky-500" />
              </a>
            )}
            {member.social_links?.imdb && (
              <a href={member.social_links.imdb.startsWith('http') ? member.social_links.imdb : `https://www.imdb.com/name/${member.social_links.imdb}`} target="_blank" rel="noopener noreferrer" className="social-link-circle social-link-imdb w-8 h-8 rounded-full bg-[#F5C518]/10 flex items-center justify-center hover:bg-[#F5C518]/30" title="IMDb">
                <img src={imdbLogo} alt="IMDb" className="w-5 h-5 rounded-sm object-contain" />
              </a>
            )}
            {member.social_links?.website && (
              member.social_links.website.includes('imdb.com') ? (
                <a href={member.social_links.website.startsWith('http') ? member.social_links.website : `https://${member.social_links.website}`} target="_blank" rel="noopener noreferrer" className="social-link-circle social-link-imdb w-8 h-8 rounded-full bg-[#F5C518]/10 flex items-center justify-center hover:bg-[#F5C518]/30" title="IMDb">
                  <img src={imdbLogo} alt="IMDb" className="w-5 h-5 rounded-sm object-contain" />
                </a>
              ) : (
                <a href={member.social_links.website.startsWith('http') ? member.social_links.website : `https://${member.social_links.website}`} target="_blank" rel="noopener noreferrer" className="social-link-circle social-link-website w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center hover:bg-emerald-500/30" title="Site Pessoal">
                  <Globe className="w-4 h-4 text-emerald-500" />
                </a>
              )
            )}
            {member.social_links?.whatsapp && (
              <a href={`https://wa.me/${member.social_links.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="social-link-circle social-link-whatsapp w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center hover:bg-green-500/30" title="WhatsApp">
                <MessageCircle className="w-4 h-4 text-green-500" />
              </a>
            )}
            {member.curriculum_url && (
              <a href={member.curriculum_url} target="_blank" rel="noopener noreferrer" className="social-link-circle social-link-cv w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center hover:bg-orange-500/30" title="Baixar Currículo">
                <FileText className="w-4 h-4 text-orange-500" />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
