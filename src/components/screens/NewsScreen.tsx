import { useState, useEffect, forwardRef } from "react";
import { Clock, ChevronRight, ExternalLink } from "lucide-react";
import { NewsSkeleton } from "@/components/ui/LoadingSkeleton";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface NewsArticle {
  id: number;
  title: string;
  excerpt: string;
  date: string;
  category: string;
  url: string | null;
  source: string;
  image: string | null;
}

const fallbackArticles: NewsArticle[] = [
  {
    id: 1,
    title: "Naira Strengthens Against Dollar Amid CBN Policies",
    excerpt: "The Nigerian Naira has shown significant improvement against major currencies following the Central Bank's latest monetary policies...",
    date: "Dec 28, 2024",
    category: "Market Update",
    url: null,
    source: "Local",
    image: null,
  },
  {
    id: 2,
    title: "CBN Introduces New Forex Guidelines",
    excerpt: "Central Bank of Nigeria announces updated guidelines for foreign exchange transactions...",
    date: "Dec 25, 2024",
    category: "Policy",
    url: null,
    source: "Local",
    image: null,
  },
];

interface NewsScreenProps {
  onRefresh?: () => Promise<void>;
}

const NewsScreen = forwardRef<HTMLDivElement, NewsScreenProps>(
  ({ onRefresh }, ref) => {
    const [isLoading, setIsLoading] = useState(true);
    const [articles, setArticles] = useState<NewsArticle[]>([]);

    const fetchNews = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('fetch-news');
        
        if (error) {
          console.error('Error fetching news:', error);
          throw error;
        }

        if (data?.articles && data.articles.length > 0) {
          setArticles(data.articles);
        } else {
          setArticles(fallbackArticles);
        }
      } catch (error) {
        console.error('Failed to fetch news:', error);
        setArticles(fallbackArticles);
        toast({
          title: "Using cached news",
          description: "Couldn't fetch latest news. Showing recent articles.",
          duration: 3000,
        });
      } finally {
        setIsLoading(false);
      }
    };

    useEffect(() => {
      fetchNews();
    }, []);

    const handleArticleClick = (article: NewsArticle) => {
      if (article.url) {
        window.open(article.url, '_blank', 'noopener,noreferrer');
      }
    };

    if (isLoading) {
      return <NewsSkeleton />;
    }

    const featuredArticle = articles[0];
    const otherArticles = articles.slice(1);

    return (
      <div ref={ref} className="p-3 pb-6">
        {/* Featured Article */}
        {featuredArticle && (
          <button
            onClick={() => handleArticleClick(featuredArticle)}
            className="w-full bg-card rounded-xl overflow-hidden shadow-lg mb-3 text-left ios-transition active:scale-[0.98]"
          >
            <div className="bg-gradient-to-br from-primary to-primary/80 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="inline-block px-2 py-0.5 bg-primary-foreground/20 rounded-full text-[10px] text-primary-foreground font-medium">
                  Featured
                </span>
                {featuredArticle.url && (
                  <ExternalLink className="w-3 h-3 text-primary-foreground/60" />
                )}
              </div>
              <h2 className="text-sm font-bold text-primary-foreground mb-1 line-clamp-2">
                {featuredArticle.title}
              </h2>
              <p className="text-primary-foreground/80 text-xs mb-2 line-clamp-2">
                {featuredArticle.excerpt}
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-primary-foreground/60 text-[10px]">
                  <Clock className="w-3 h-3" />
                  <span>{featuredArticle.date}</span>
                </div>
                <span className="text-[10px] text-primary-foreground/60">
                  {featuredArticle.source}
                </span>
              </div>
            </div>
          </button>
        )}

        {/* News List */}
        {otherArticles.length > 0 && (
          <>
            <h3 className="text-sm font-semibold text-foreground mb-2">Latest News</h3>
            <div className="flex flex-col gap-2">
              {otherArticles.map((article) => (
                <button
                  key={article.id}
                  onClick={() => handleArticleClick(article)}
                  className="bg-card rounded-xl p-3 shadow-lg text-left ios-transition active:scale-[0.98]"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <span className="inline-block px-1.5 py-0.5 bg-primary/10 rounded text-[10px] text-primary font-medium mb-1 capitalize">
                        {article.category}
                      </span>
                      <h4 className="font-semibold text-card-foreground mb-0.5 line-clamp-2 text-xs">
                        {article.title}
                      </h4>
                      <p className="text-[11px] text-muted-foreground line-clamp-2 mb-1">
                        {article.excerpt}
                      </p>
                      <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" />
                          <span>{article.date}</span>
                        </div>
                        <span>{article.source}</span>
                      </div>
                    </div>
                    {article.url ? (
                      <ExternalLink className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    );
  }
);

NewsScreen.displayName = "NewsScreen";

export default NewsScreen;
