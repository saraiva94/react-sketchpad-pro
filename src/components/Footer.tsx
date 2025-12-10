import { Link } from "react-router-dom";
import { 
  Anchor, 
  Mail, 
  Phone, 
  Facebook, 
  Instagram, 
  Linkedin,
  Youtube
} from "lucide-react";

// Social media links - configure your real links here
const SOCIAL_LINKS = {
  facebook: "https://facebook.com/portobellofilmes",
  instagram: "https://instagram.com/portobellofilmes",
  linkedin: "https://linkedin.com/company/portobellofilmes",
  youtube: "https://youtube.com/@portobellofilmes"
};

const CONTACT_INFO = {
  email: "portobellofilmes@gmail.com",
  phone: "+55 (11) 9999-9999"
};

export function Footer() {
  return (
    <footer className="py-8 relative overflow-hidden z-10 mt-8">
      <div className="absolute inset-0 bg-background/95 backdrop-blur-sm" />
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-muted to-transparent" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid md:grid-cols-4 gap-6 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Anchor className="w-4 h-4 text-primary-foreground" />
              </div>
              <h3 className="font-handwritten text-xl font-bold text-foreground">Porto Bello</h3>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Uma plataforma criada para aproximar cultura e investimento.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold text-foreground mb-2 text-sm">Navegação</h4>
            <ul className="space-y-1 text-xs">
              <li><Link to="/" className="text-muted-foreground hover:text-primary transition-colors">Início</Link></li>
              <li><Link to="/porto-de-ideias" className="text-muted-foreground hover:text-primary transition-colors">Porto de Idéias</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-foreground mb-2 text-sm">Ações</h4>
            <ul className="space-y-1 text-xs">
              <li><Link to="/submit" className="text-muted-foreground hover:text-primary transition-colors">Cadastrar Projeto</Link></li>
              <li><Link to="/porto-de-ideias" className="text-muted-foreground hover:text-primary transition-colors">Explorar Projetos</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-foreground mb-2 text-sm">Contato</h4>
            <ul className="space-y-1 text-xs text-muted-foreground">
              <li className="flex items-center gap-2">
                <Mail className="w-3 h-3 text-accent" />
                <a href={`mailto:${CONTACT_INFO.email}`} className="hover:text-primary transition-colors">
                  {CONTACT_INFO.email}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-3 h-3 text-accent" />
                <span>{CONTACT_INFO.phone}</span>
              </li>
            </ul>
            <div className="flex gap-2 mt-3">
              <a 
                href={SOCIAL_LINKS.facebook} 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-7 h-7 rounded-full bg-[#1877F2] flex items-center justify-center hover:opacity-80 transition-opacity"
                aria-label="Facebook"
              >
                <Facebook className="w-3 h-3 text-white" />
              </a>
              <a 
                href={SOCIAL_LINKS.instagram} 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-7 h-7 rounded-full bg-gradient-to-br from-[#833AB4] via-[#FD1D1D] to-[#F77737] flex items-center justify-center hover:opacity-80 transition-opacity"
                aria-label="Instagram"
              >
                <Instagram className="w-3 h-3 text-white" />
              </a>
              <a 
                href={SOCIAL_LINKS.linkedin} 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-7 h-7 rounded-full bg-[#0A66C2] flex items-center justify-center hover:opacity-80 transition-opacity"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-3 h-3 text-white" />
              </a>
              <a 
                href={SOCIAL_LINKS.youtube} 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-7 h-7 rounded-full bg-[#FF0000] flex items-center justify-center hover:opacity-80 transition-opacity"
                aria-label="YouTube"
              >
                <Youtube className="w-3 h-3 text-white" />
              </a>
            </div>
          </div>
        </div>
        
        <div className="border-t border-border pt-4 text-center text-xs text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Porto Bello. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}

// Social links component for forms
export function SocialLinksDisplay() {
  return (
    <div className="flex gap-3 justify-center">
      <a 
        href={SOCIAL_LINKS.facebook} 
        target="_blank" 
        rel="noopener noreferrer"
        className="w-10 h-10 rounded-full bg-[#1877F2] flex items-center justify-center hover:scale-110 transition-transform"
        aria-label="Facebook"
      >
        <Facebook className="w-5 h-5 text-white" />
      </a>
      <a 
        href={SOCIAL_LINKS.instagram} 
        target="_blank" 
        rel="noopener noreferrer"
        className="w-10 h-10 rounded-full bg-gradient-to-br from-[#833AB4] via-[#FD1D1D] to-[#F77737] flex items-center justify-center hover:scale-110 transition-transform"
        aria-label="Instagram"
      >
        <Instagram className="w-5 h-5 text-white" />
      </a>
      <a 
        href={SOCIAL_LINKS.linkedin} 
        target="_blank" 
        rel="noopener noreferrer"
        className="w-10 h-10 rounded-full bg-[#0A66C2] flex items-center justify-center hover:scale-110 transition-transform"
        aria-label="LinkedIn"
      >
        <Linkedin className="w-5 h-5 text-white" />
      </a>
      <a 
        href={SOCIAL_LINKS.youtube} 
        target="_blank" 
        rel="noopener noreferrer"
        className="w-10 h-10 rounded-full bg-[#FF0000] flex items-center justify-center hover:scale-110 transition-transform"
        aria-label="YouTube"
      >
        <Youtube className="w-5 h-5 text-white" />
      </a>
    </div>
  );
}

export { SOCIAL_LINKS, CONTACT_INFO };
