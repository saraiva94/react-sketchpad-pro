import { Award, Newspaper } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

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
  const { t } = useLanguage();
  if (!awards.length && !news.length) return null;

  return (
    <section>
      <h2 className="text-2xl font-serif font-bold text-foreground mb-6">
        {t.projectDetails.awardsRecognition}
      </h2>
      <div className="grid md:grid-cols-2 gap-6">
        {awards.length > 0 && (
          <div>
            <h3 className="font-semibold text-foreground mb-4 flex items-center">
              <Award className="w-5 h-5 text-amber-500 mr-2" />
              {t.projectDetails.awardsRecognition}
            </h3>
            <ul className="space-y-3">
              {awards.map((award, index) => (
                <li key={index}>
                  <div className="block p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                    <h4 className="font-medium text-foreground">{award}</h4>
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
              {t.projectDetails.mediaNews}
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
