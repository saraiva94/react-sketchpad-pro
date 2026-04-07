import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Mail } from "lucide-react";

interface EmailLinkProps {
  email: string;
  children: React.ReactNode;
  className?: string;
}

export const EmailLink = ({ email, children, className }: EmailLinkProps) => {
  const [open, setOpen] = useState(false);

  const gmailUrl = `https://mail.google.com/mail/?view=cm&to=${encodeURIComponent(email)}`;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button type="button" className={className} onClick={() => setOpen(true)}>
          {children}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-48 p-2" align="center" sideOffset={8}>
        <p className="text-xs text-muted-foreground mb-2 px-1">Abrir com:</p>
        <a
          href={gmailUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => setOpen(false)}
          className="flex items-center gap-2 w-full px-3 py-2 text-sm rounded-md hover:bg-muted transition-colors"
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none">
            <path d="M22 6L12 13 2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" strokeWidth="2" fill="none"/>
          </svg>
          Gmail
        </a>
        <a
          href={`mailto:${email}`}
          onClick={() => setOpen(false)}
          className="flex items-center gap-2 w-full px-3 py-2 text-sm rounded-md hover:bg-muted transition-colors"
        >
          <Mail className="w-4 h-4" />
          Outro email
        </a>
      </PopoverContent>
    </Popover>
  );
};
