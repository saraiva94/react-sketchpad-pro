import { useLanguage } from '@/hooks/useLanguage';
import { Language } from '@/lib/i18n';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';

interface LanguageOption {
  code: Language;
  label: string;
  flag: string;
}

const languages: LanguageOption[] = [
  { code: 'pt', label: 'Português', flag: '/flags/br.png' },
  { code: 'en', label: 'English', flag: '/flags/us.png' },
  { code: 'es', label: 'Español', flag: '/flags/es.png' },
];

export const LanguageSelector = () => {
  const { language, setLanguage } = useLanguage();

  const currentLanguage = languages.find((lang) => lang.code === language) || languages[0];

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-2 px-2 hover:bg-accent/50"
        >
          <img
            src={currentLanguage.flag}
            alt={currentLanguage.label}
            className="w-5 h-4 object-cover rounded-sm"
          />
          <ChevronDown className="h-3 w-3 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[140px]">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => setLanguage(lang.code)}
            className={`flex items-center gap-3 cursor-pointer ${
              language === lang.code ? 'bg-accent' : ''
            }`}
          >
            <img
              src={lang.flag}
              alt={lang.label}
              className="w-5 h-4 object-cover rounded-sm"
            />
            <span>{lang.label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
