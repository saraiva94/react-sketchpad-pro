import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import {
  Facebook,
  Instagram,
  Linkedin,
  Youtube,
  Twitter,
  Globe,
  Mail,
  MessageCircle,
} from "lucide-react";
import imdbIcon from "@/assets/imdb-icon.png";

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

interface FooterContent {
  emails: string[];
}

const DEFAULT_SOCIAL_LINKS: SocialLinksConfig = {
  facebook: { enabled: false, url: "" },
  instagram: { enabled: false, url: "" },
  linkedin: { enabled: false, url: "" },
  youtube: { enabled: false, url: "" },
  twitter: { enabled: false, url: "" },
  imdb: { enabled: false, url: "" },
  website: { enabled: false, url: "" },
  whatsapp: { enabled: false, url: "" },
};

export const ContactModal = () => {
  const [socialLinks, setSocialLinks] = useState<SocialLinksConfig>(DEFAULT_SOCIAL_LINKS);
  const [emails, setEmails] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const { data: socialData } = await supabase
        .from("settings")
        .select("value")
        .eq("key", "social_links")
        .maybeSingle();

      if (socialData?.value) {
        setSocialLinks(socialData.value as unknown as SocialLinksConfig);
      }

      const { data: footerData } = await supabase
        .from("settings")
        .select("value")
        .eq("key", "footer_content")
        .maybeSingle();

      if (footerData?.value) {
        const content = footerData.value as unknown as FooterContent;
        setEmails(content.emails || []);
      }
    };

    fetchData();
  }, []);

  const socialItems = [
    { key: "instagram", icon: Instagram, color: "bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400", label: "Instagram" },
    { key: "facebook", icon: Facebook, color: "bg-[#1877F2]", label: "Facebook" },
    { key: "linkedin", icon: Linkedin, color: "bg-[#0A66C2]", label: "LinkedIn" },
    { key: "youtube", icon: Youtube, color: "bg-[#FF0000]", label: "YouTube" },
    { key: "twitter", icon: Twitter, color: "bg-[#1DA1F2]", label: "Twitter" },
    { key: "website", icon: Globe, color: "bg-emerald-500", label: "Website" },
  ];

  // Collect all enabled items to display in grid
  const allItems: React.ReactNode[] = [];

  socialItems.forEach(({ key, icon: Icon, color, label }) => {
    const link = socialLinks[key as keyof SocialLinksConfig];
    if (link?.enabled && link.url) {
      allItems.push(
        <a
          key={key}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-muted transition-colors group"
        >
          <div className={`w-12 h-12 ${color} rounded-full flex items-center justify-center group-hover:scale-110 transition-transform`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          <span className="text-xs text-muted-foreground">{label}</span>
        </a>
      );
    }
  });

  // IMDb
  if (socialLinks.imdb?.enabled && socialLinks.imdb.url) {
    allItems.push(
      <a
        key="imdb"
        href={socialLinks.imdb.url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-muted transition-colors group"
      >
        <div className="w-12 h-12 bg-[#F5C518] rounded-full flex items-center justify-center group-hover:scale-110 transition-transform overflow-hidden">
          <img src={imdbIcon} alt="IMDb" className="w-10 h-10 object-contain" />
        </div>
        <span className="text-xs text-muted-foreground">IMDb</span>
      </a>
    );
  }

  // WhatsApp
  if (socialLinks.whatsapp?.enabled && socialLinks.whatsapp.url) {
    allItems.push(
      <a
        key="whatsapp"
        href={`https://wa.me/${socialLinks.whatsapp.url.replace(/\D/g, '')}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-muted transition-colors group"
      >
        <div className="w-12 h-12 bg-[#25D366] rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
          <MessageCircle className="w-6 h-6 text-white" />
        </div>
        <span className="text-xs text-muted-foreground">WhatsApp</span>
      </a>
    );
  }

  // Email(s) - only first email as circular icon
  if (emails.length > 0) {
    allItems.push(
      <a
        key="email"
        href={`mailto:${emails[0]}`}
        className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-muted transition-colors group"
      >
        <div className="w-12 h-12 bg-[#EA4335] rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
          <Mail className="w-6 h-6 text-white" />
        </div>
        <span className="text-xs text-muted-foreground">E-mail</span>
      </a>
    );
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button 
          className="group inline-flex items-center gap-2 px-8 py-4 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1"
        >
          <MessageCircle className="w-5 h-5" />
          Fale Conosco
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-serif">
            Fale Conosco
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          {/* All contact items in unified grid */}
          <div className="grid grid-cols-3 gap-4 justify-items-center">
            {allItems}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
