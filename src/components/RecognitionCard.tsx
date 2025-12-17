import { Award, Newspaper } from "lucide-react";

interface NewsItem {
  title: string;
  url?: string;
  date?: string;
}

interface RecognitionCardProps {
  awards?: string[];
  news?: NewsItem[];
}

export function RecognitionCard({ awards = [], news = [] }: RecognitionCardProps) {
  if (!awards.length && !news.length) return null;

  return (
    <section>
      <h2 className="text-2xl font-serif font-bold text-foreground mb-6">
        Reconhecimentos e Mídia
      </h2>
      <div className="grid md:grid-cols-2 gap-6">
        {awards.length > 0 && (
          <div>
            <h3 className="font-semibold text-foreground mb-4 flex items-center">
              <Award className="w-5 h-5 text-amber-500 mr-2" />
              Prêmios e Reconhecimentos
            </h3>
            <ul className="space-y-3">
              {awards.map((award, index) => (
                <li key={index} className="block p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <Award className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                    <span className="text-foreground">{award}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
        {news.length > 0 && (
          <div>
            <h3 className="font-semibold text-foreground mb-4 flex items-center">
              <Newspaper className="w-5 h-5 text-primary mr-2" />
              Na Mídia
            </h3>
            <ul className="space-y-3">
              {news.map((item, index) => (
                <li key={index}>
                  {item.url ? (
                    <a 
                      href={item.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="block p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                    >
                      <h4 className="font-medium text-foreground mb-1">{item.title}</h4>
                      {item.date && <p className="text-sm text-muted-foreground">{item.date}</p>}
                    </a>
                  ) : (
                    <div className="block p-3 bg-muted/50 rounded-lg">
                      <h4 className="font-medium text-foreground mb-1">{item.title}</h4>
                      {item.date && <p className="text-sm text-muted-foreground">{item.date}</p>}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
