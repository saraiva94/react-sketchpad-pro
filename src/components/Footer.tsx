import { Link } from "react-router-dom";
import { 
  Mail, 
  Phone, 
  Facebook, 
  Instagram, 
  Linkedin,
  Youtube,
  Globe,
  Twitter,
  MessageCircle,
  Lightbulb,
  Rocket,
  Send,
  Compass,
  X
} from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import portobelloLogo from "@/assets/portobello-footer-logo.png";
import { useLanguage } from "@/hooks/useLanguage";
import { useAutoTranslate } from "@/hooks/useAutoTranslate";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface SocialLink {
  enabled: boolean;
  url: string;
}

interface SocialLinksConfig {
  facebook: SocialLink;
  instagram: SocialLink;
  linkedin: SocialLink;
  youtube: SocialLink;
  twitter: SocialLink;
  imdb: SocialLink;
  website: SocialLink;
  whatsapp?: SocialLink;
}

const DEFAULT_SOCIAL_LINKS: SocialLinksConfig = {
  facebook: { enabled: false, url: "" },
  instagram: { enabled: true, url: "https://www.instagram.com/portobellofilmes/" },
  linkedin: { enabled: false, url: "" },
  youtube: { enabled: false, url: "" },
  twitter: { enabled: false, url: "" },
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
  const [exploreDialogOpen, setExploreDialogOpen] = useState(false);
  const { t, language } = useLanguage();

  // Traduzir tagline dinâmica quando idioma não é PT
  const { translated: translatedTagline } = useAutoTranslate('footer_tagline', footerContent.tagline);
  const displayTagline = language === 'pt' ? footerContent.tagline : (translatedTagline || footerContent.tagline);

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
        <div className="grid md:grid-cols-3 gap-8 mb-6">
          {/* Logo & Tagline */}
          <div className="flex flex-col items-start">
            <Link to="/" className="mb-2">
              <img 
                src={portobelloLogo} 
                alt="Porto Bello Filmes" 
                className="h-10 w-auto object-contain"
              />
            </Link>
            <p className="text-xs text-gray-400 leading-relaxed text-left whitespace-pre-line">
              {displayTagline}
            </p>
          </div>
          
          {/* Projetos - Centralizado */}
          <div className="flex flex-col items-center text-center">
            <h4 className="font-semibold text-white mb-3 text-sm">{t.nav.projects}</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link 
                  to="/submit" 
                  className="group inline-flex items-center gap-2 text-gray-400 hover:text-primary transition-all duration-300"
                >
                  <Send className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  <span>{t.nav.submit}</span>
                </Link>
              </li>
              <li>
                <button 
                  onClick={() => setExploreDialogOpen(true)}
                  className="group inline-flex items-center gap-2 text-gray-400 hover:text-primary transition-all duration-300"
                >
                  <Compass className="w-4 h-4 group-hover:rotate-45 transition-transform" />
                  <span>{t.home.exploreProjects}</span>
                </button>
              </li>
            </ul>
          </div>
          
          {/* Contato */}
          <div className="flex flex-col items-end text-right md:items-end md:text-right">
            <h4 className="font-semibold text-white mb-2 text-sm">{t.footer.contact}</h4>
            <ul className="space-y-1 text-xs text-gray-400">
              {footerContent.emails.map((email, index) => (
                <li key={`email-${index}`} className="flex items-center gap-2 justify-end">
                  <a href={`mailto:${email}`} className="hover:text-primary transition-colors">
                    {email}
                  </a>
                  <Mail className="w-3 h-3 text-accent" />
                </li>
              ))}
              {footerContent.phones.map((phone, index) => (
                <li key={`phone-${index}`} className="flex items-center gap-2 justify-end">
                  <span>{phone}</span>
                  <Phone className="w-3 h-3 text-accent" />
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
              {socialLinks.twitter?.enabled && socialLinks.twitter?.url && (
                <a 
                  href={socialLinks.twitter.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-7 h-7 rounded-full bg-black flex items-center justify-center hover:opacity-80 transition-opacity border border-gray-700"
                  aria-label="X / Twitter"
                >
                  <Twitter className="w-3 h-3 text-white" />
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
              {socialLinks.whatsapp?.enabled && socialLinks.whatsapp?.url && (
                <a 
                  href={`https://wa.me/${socialLinks.whatsapp.url.replace(/\D/g, '')}`}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-7 h-7 rounded-full bg-[#25D366] flex items-center justify-center hover:opacity-80 transition-opacity"
                  aria-label="WhatsApp"
                >
                  <MessageCircle className="w-3 h-3 text-white" />
                </a>
              )}
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-800 pt-4 text-center text-xs text-gray-500">
          <p>&copy; {new Date().getFullYear()} Porto Bello. {t.footer.rights}.</p>
        </div>
      </div>

      {/* Dialog para Explorar Projetos */}
      <Dialog open={exploreDialogOpen} onOpenChange={setExploreDialogOpen}>
        <DialogContent className="sm:max-w-md bg-card/95 backdrop-blur-xl border-border shadow-2xl rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-serif">{t.home.exploreProjects}</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-3 mt-4">
            <Link
              to="/porto-de-ideias"
              onClick={() => setExploreDialogOpen(false)}
              className="group relative flex items-center gap-4 p-5 rounded-xl border border-transparent hover:border-yellow-500/30 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 hover:from-yellow-500/20 hover:to-orange-500/20 transition-all duration-300 overflow-hidden"
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(circle_at_50%_50%,hsl(45deg_100%_50%/0.1),transparent_70%)]" />
              <div className="relative flex items-center justify-center w-14 h-14 rounded-xl bg-yellow-500/20 group-hover:bg-yellow-500/30 group-hover:scale-110 transition-all duration-300">
                <Lightbulb className="w-7 h-7 text-yellow-400 group-hover:fill-yellow-400/30 transition-all duration-300" />
              </div>
              <div className="relative flex-1">
                <h3 className="font-semibold text-foreground group-hover:text-yellow-500 transition-colors text-lg">Projetos em Captação</h3>
                <p className="text-sm text-muted-foreground">Apoie projetos culturais</p>
              </div>
            </Link>
            
            <Link
              to="/projetos"
              onClick={() => setExploreDialogOpen(false)}
              className="group relative flex items-center gap-4 p-5 rounded-xl border border-transparent hover:border-primary/30 bg-gradient-to-r from-primary/10 to-accent/10 hover:from-primary/20 hover:to-accent/20 transition-all duration-300 overflow-hidden"
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(circle_at_50%_50%,hsl(var(--primary)/0.1),transparent_70%)]" />
              <div className="relative flex items-center justify-center w-14 h-14 rounded-xl bg-primary/20 group-hover:bg-primary/30 group-hover:scale-110 transition-all duration-300">
                <Rocket className="w-7 h-7 text-primary group-hover:fill-primary/30 transition-all duration-300" />
              </div>
              <div className="relative flex-1">
                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors text-lg">Portfólio</h3>
                <p className="text-sm text-muted-foreground">Nossos projetos realizados</p>
              </div>
            </Link>
          </div>
        </DialogContent>
      </Dialog>
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
      {socialLinks.twitter?.enabled && socialLinks.twitter?.url && (
        <a 
          href={socialLinks.twitter.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="w-10 h-10 rounded-full bg-black flex items-center justify-center hover:scale-110 transition-transform"
          aria-label="X / Twitter"
        >
          <Twitter className="w-5 h-5 text-white" />
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
      {socialLinks.whatsapp?.enabled && socialLinks.whatsapp?.url && (
        <a 
          href={`https://wa.me/${socialLinks.whatsapp.url.replace(/\D/g, '')}`}
          target="_blank" 
          rel="noopener noreferrer"
          className="w-10 h-10 rounded-full bg-[#25D366] flex items-center justify-center hover:scale-110 transition-transform"
          aria-label="WhatsApp"
        >
          <MessageCircle className="w-5 h-5 text-white" />
        </a>
      )}
    </div>
  );
}