import { Link } from "react-router-dom";
import { 
  Mail, 
  Phone, 
  Facebook, 
  Instagram, 
  Linkedin,
  Youtube,
  Globe
} from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import portobelloLogo from "@/assets/portobello-footer-logo.png";

interface SocialLink {
  enabled: boolean;
  url: string;
}

interface SocialLinksConfig {
  facebook: SocialLink;
  instagram: SocialLink;
  linkedin: SocialLink;
  youtube: SocialLink;
  imdb: SocialLink;
  website: SocialLink;
}

const DEFAULT_SOCIAL_LINKS: SocialLinksConfig = {
  facebook: { enabled: false, url: "" },
  instagram: { enabled: true, url: "https://www.instagram.com/portobellofilmes/" },
  linkedin: { enabled: false, url: "" },
  youtube: { enabled: false, url: "" },
  imdb: { enabled: false, url: "" },
  website: { enabled: false, url: "" }
};

interface FooterContent {
  tagline: string;
  emails: string[];
  phones: string[];
}

const DEFAULT_FOOTER_CONTENT: FooterContent = {
  tagline: "Uma plataforma criada para aproximar cultura e investimento.",
  emails: ["portobellofilmes@gmail.com"],
  phones: ["(21) 96726-4730"]
};

export function Footer() {
  const [socialLinks, setSocialLinks] = useState<SocialLinksConfig>(DEFAULT_SOCIAL_LINKS);
  const [footerContent, setFooterContent] = useState<FooterContent>(DEFAULT_FOOTER_CONTENT);

  useEffect(() => {
    const fetchSettings = async () => {
      // Fetch social links
      const { data: socialData } = await supabase
        .from("settings")
        .select("value")
        .eq("key", "social_links")
        .maybeSingle();
      
      if (socialData) {
        setSocialLinks(socialData.value as unknown as SocialLinksConfig);
      }

      // Fetch footer content
      const { data: footerData } = await supabase
        .from("settings")
        .select("value")
        .eq("key", "footer_content")
        .maybeSingle();
      
      if (footerData) {
        const content = footerData.value as unknown as FooterContent;
        setFooterContent({
          tagline: content.tagline || DEFAULT_FOOTER_CONTENT.tagline,
          emails: content.emails?.length > 0 ? content.emails : DEFAULT_FOOTER_CONTENT.emails,
          phones: content.phones?.length > 0 ? content.phones : DEFAULT_FOOTER_CONTENT.phones
        });
      }
    };
    
    fetchSettings();
  }, []);

  return (
    <footer className="py-8 relative overflow-hidden z-10 mt-8 bg-black">
      <div className="absolute inset-0 bg-black" />
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid md:grid-cols-4 gap-6 mb-6">
          <div className="flex flex-col items-start">
            <Link to="/" className="mb-2">
              <img 
                src={portobelloLogo} 
                alt="Porto Bello Filmes" 
                className="h-10 w-auto object-contain"
              />
            </Link>
            <p className="text-xs text-gray-400 leading-relaxed text-left whitespace-pre-line">
              {footerContent.tagline}
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold text-white mb-2 text-sm">Navegação</h4>
            <ul className="space-y-1 text-xs">
              <li><Link to="/" className="text-gray-400 hover:text-primary transition-colors">Início</Link></li>
              <li><Link to="/porto-de-ideias" className="text-gray-400 hover:text-primary transition-colors">Porto de Idéias</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-white mb-2 text-sm">Ações</h4>
            <ul className="space-y-1 text-xs">
              <li><Link to="/submit" className="text-gray-400 hover:text-primary transition-colors">Cadastrar Projeto</Link></li>
              <li><Link to="/porto-de-ideias" className="text-gray-400 hover:text-primary transition-colors">Explorar Projetos</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-white mb-2 text-sm">Contato</h4>
            <ul className="space-y-1 text-xs text-gray-400">
              {footerContent.emails.map((email, index) => (
                <li key={`email-${index}`} className="flex items-center gap-2">
                  <Mail className="w-3 h-3 text-accent" />
                  <a href={`mailto:${email}`} className="hover:text-primary transition-colors">
                    {email}
                  </a>
                </li>
              ))}
              {footerContent.phones.map((phone, index) => (
                <li key={`phone-${index}`} className="flex items-center gap-2">
                  <Phone className="w-3 h-3 text-accent" />
                  <span>{phone}</span>
                </li>
              ))}
            </ul>
            <div className="flex gap-2 mt-3">
              {socialLinks.facebook.enabled && socialLinks.facebook.url && (
                <a 
                  href={socialLinks.facebook.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-7 h-7 rounded-full bg-[#1877F2] flex items-center justify-center hover:opacity-80 transition-opacity"
                  aria-label="Facebook"
                >
                  <Facebook className="w-3 h-3 text-white" />
                </a>
              )}
              {socialLinks.instagram.enabled && socialLinks.instagram.url && (
                <a 
                  href={socialLinks.instagram.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-7 h-7 rounded-full bg-gradient-to-br from-[#833AB4] via-[#FD1D1D] to-[#F77737] flex items-center justify-center hover:opacity-80 transition-opacity"
                  aria-label="Instagram"
                >
                  <Instagram className="w-3 h-3 text-white" />
                </a>
              )}
              {socialLinks.linkedin.enabled && socialLinks.linkedin.url && (
                <a 
                  href={socialLinks.linkedin.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-7 h-7 rounded-full bg-[#0A66C2] flex items-center justify-center hover:opacity-80 transition-opacity"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="w-3 h-3 text-white" />
                </a>
              )}
              {socialLinks.youtube.enabled && socialLinks.youtube.url && (
                <a 
                  href={socialLinks.youtube.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-7 h-7 rounded-full bg-[#FF0000] flex items-center justify-center hover:opacity-80 transition-opacity"
                  aria-label="YouTube"
                >
                  <Youtube className="w-3 h-3 text-white" />
                </a>
              )}
              {socialLinks.imdb?.enabled && socialLinks.imdb?.url && (
                <a 
                  href={socialLinks.imdb.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-7 h-7 rounded-full bg-[#F5C518] flex items-center justify-center hover:opacity-80 transition-opacity"
                  aria-label="IMDb"
                >
                  <span className="text-black font-bold text-[8px]">IMDb</span>
                </a>
              )}
              {socialLinks.website?.enabled && socialLinks.website?.url && (
                <a 
                  href={socialLinks.website.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center hover:opacity-80 transition-opacity"
                  aria-label="Website"
                >
                  <Globe className="w-3 h-3 text-white" />
                </a>
              )}
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-800 pt-4 text-center text-xs text-gray-500">
          <p>&copy; {new Date().getFullYear()} Porto Bello. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}

// Social links component for forms
export function SocialLinksDisplay() {
  const [socialLinks, setSocialLinks] = useState<SocialLinksConfig>(DEFAULT_SOCIAL_LINKS);

  useEffect(() => {
    const fetchSocialLinks = async () => {
      const { data } = await supabase
        .from("settings")
        .select("value")
        .eq("key", "social_links")
        .maybeSingle();
      
      if (data) {
        setSocialLinks(data.value as unknown as SocialLinksConfig);
      }
    };
    
    fetchSocialLinks();
  }, []);

  const activeSocialLinks = Object.entries(socialLinks).filter(([_, link]) => link.enabled && link.url);

  if (activeSocialLinks.length === 0) return null;

  return (
    <div className="flex gap-3 justify-center">
      {socialLinks.facebook.enabled && socialLinks.facebook.url && (
        <a 
          href={socialLinks.facebook.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="w-10 h-10 rounded-full bg-[#1877F2] flex items-center justify-center hover:scale-110 transition-transform"
          aria-label="Facebook"
        >
          <Facebook className="w-5 h-5 text-white" />
        </a>
      )}
      {socialLinks.instagram.enabled && socialLinks.instagram.url && (
        <a 
          href={socialLinks.instagram.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="w-10 h-10 rounded-full bg-gradient-to-br from-[#833AB4] via-[#FD1D1D] to-[#F77737] flex items-center justify-center hover:scale-110 transition-transform"
          aria-label="Instagram"
        >
          <Instagram className="w-5 h-5 text-white" />
        </a>
      )}
      {socialLinks.linkedin.enabled && socialLinks.linkedin.url && (
        <a 
          href={socialLinks.linkedin.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="w-10 h-10 rounded-full bg-[#0A66C2] flex items-center justify-center hover:scale-110 transition-transform"
          aria-label="LinkedIn"
        >
          <Linkedin className="w-5 h-5 text-white" />
        </a>
      )}
      {socialLinks.youtube.enabled && socialLinks.youtube.url && (
        <a 
          href={socialLinks.youtube.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="w-10 h-10 rounded-full bg-[#FF0000] flex items-center justify-center hover:scale-110 transition-transform"
          aria-label="YouTube"
        >
          <Youtube className="w-5 h-5 text-white" />
        </a>
      )}
      {socialLinks.imdb?.enabled && socialLinks.imdb?.url && (
        <a 
          href={socialLinks.imdb.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="w-10 h-10 rounded-full bg-[#F5C518] flex items-center justify-center hover:scale-110 transition-transform"
          aria-label="IMDb"
        >
          <span className="text-black font-bold text-xs">IMDb</span>
        </a>
      )}
      {socialLinks.website?.enabled && socialLinks.website?.url && (
        <a 
          href={socialLinks.website.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center hover:scale-110 transition-transform"
          aria-label="Website"
        >
          <Globe className="w-5 h-5 text-white" />
        </a>
      )}
    </div>
  );
}