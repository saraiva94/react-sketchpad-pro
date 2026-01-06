import { useLanguage } from "@/hooks/useLanguage";
import { useAutoTranslate } from "@/hooks/useAutoTranslate";
import { Check } from "lucide-react";

interface Contrapartida {
  id: string;
  titulo?: string;
  valor: string;
  beneficios: string[];
  ativo: boolean;
  ordem: number;
  indice?: string;
}

interface TranslatedContrapartidaCardProps {
  contrapartida: Contrapartida;
  levelLabel: string;
  benefitsLabel: string;
}

export function TranslatedContrapartidaCard({ 
  contrapartida, 
  levelLabel,
  benefitsLabel 
}: TranslatedContrapartidaCardProps) {
  const { language } = useLanguage();

  // Auto-translate titulo and beneficios
  const { translated: translatedTitulo } = useAutoTranslate(
    `contrapartida_titulo_${contrapartida.id}`,
    contrapartida.titulo
  );
  const { translated: translatedBeneficios } = useAutoTranslate(
    `contrapartida_beneficios_${contrapartida.id}`,
    contrapartida.beneficios
  );

  const displayTitulo = language === "pt" ? contrapartida.titulo : (translatedTitulo || contrapartida.titulo);
  const displayBeneficios = language === "pt" ? contrapartida.beneficios : (translatedBeneficios || contrapartida.beneficios);

  // Format value as Brazilian currency
  const formatCurrency = (value: string) => {
    const numericValue = value.replace(/[^\d,.-]/g, '').replace(',', '.');
    const number = parseFloat(numericValue);
    
    if (isNaN(number)) {
      return value.startsWith('R$') ? value : `R$ ${value}`;
    }
    
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(number);
  };

  // Map indice to display label - use translations
  const getIndiceLabel = (indice?: string) => {
    const labels: Record<string, Record<string, string>> = {
      pt: {
        'por_episodio': 'por episódio',
        'por_temporada': 'por temporada',
        'por_projeto': 'por projeto',
        'por_evento': 'por evento',
        'por_mes': 'por mês',
        'por_ano': 'por ano',
      },
      en: {
        'por_episodio': 'per episode',
        'por_temporada': 'per season',
        'por_projeto': 'per project',
        'por_evento': 'per event',
        'por_mes': 'per month',
        'por_ano': 'per year',
      },
      es: {
        'por_episodio': 'por episodio',
        'por_temporada': 'por temporada',
        'por_projeto': 'por proyecto',
        'por_evento': 'por evento',
        'por_mes': 'por mes',
        'por_ano': 'por año',
      },
    };
    if (!indice || indice === 'none') return null;
    return labels[language]?.[indice] || labels.pt[indice] || null;
  };

  const indiceLabel = getIndiceLabel(contrapartida.indice);

  return (
    <div className="group bg-card border border-border rounded-xl p-6 transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1">
      {/* Nível label */}
      <p className="text-sm italic text-muted-foreground mb-1">{levelLabel}</p>
      
      {/* Título do nível (se existir) */}
      {displayTitulo && (
        <p className="text-lg font-semibold text-foreground mb-2">{displayTitulo}</p>
      )}
      
      {/* Value with index */}
      <div className="mb-4">
        <span className="text-2xl font-bold text-foreground">
          {formatCurrency(contrapartida.valor)}
        </span>
        {indiceLabel && (
          <span className="text-lg text-foreground ml-2">
            {indiceLabel}
          </span>
        )}
      </div>
      
      {/* Benefits section */}
      <div>
        <p className="text-sm font-medium text-foreground border-b border-foreground/30 pb-1 mb-3">
          {benefitsLabel}
        </p>
        <ul className="space-y-2">
          {displayBeneficios.map((beneficio, index) => (
            <li key={index} className="flex items-start gap-2">
              <Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-muted-foreground leading-relaxed">{beneficio}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
