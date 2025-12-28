import { Clock, ChevronRight } from "lucide-react";

const newsArticles = [
  {
    id: 1,
    title: "Naira Strengthens Against Dollar Amid CBN Policies",
    excerpt: "The Nigerian Naira has shown significant improvement against major currencies following the Central Bank's latest monetary policies...",
    date: "Dec 28, 2024",
    category: "Market Update",
  },
  {
    id: 2,
    title: "New Branch Opening in Port Harcourt",
    excerpt: "Aboki Bureau de Change is excited to announce the expansion of our services with a new branch in Port Harcourt...",
    date: "Dec 25, 2024",
    category: "Company News",
  },
  {
    id: 3,
    title: "Holiday Operating Hours Notice",
    excerpt: "Please note our adjusted operating hours during the festive season. All branches will operate from 9 AM to 4 PM...",
    date: "Dec 22, 2024",
    category: "Announcement",
  },
  {
    id: 4,
    title: "Understanding Currency Exchange Rates",
    excerpt: "A comprehensive guide to understanding how exchange rates work and what factors influence currency values...",
    date: "Dec 18, 2024",
    category: "Education",
  },
];

const NewsScreen = () => {
  return (
    <div className="p-4 pb-8">
      {/* Featured Article */}
      <div className="bg-card rounded-xl overflow-hidden shadow-lg mb-4">
        <div className="bg-gradient-to-br from-primary to-primary/80 p-6">
          <span className="inline-block px-3 py-1 bg-primary-foreground/20 rounded-full text-xs text-primary-foreground font-medium mb-3">
            Featured
          </span>
          <h2 className="text-xl font-bold text-primary-foreground mb-2">
            Weekly Forex Market Summary
          </h2>
          <p className="text-primary-foreground/80 text-sm mb-3">
            Get the latest insights on currency movements and market trends affecting Nigerian forex rates.
          </p>
          <div className="flex items-center gap-2 text-primary-foreground/60 text-xs">
            <Clock className="w-4 h-4" />
            <span>Dec 28, 2024</span>
          </div>
        </div>
      </div>

      {/* News List */}
      <h3 className="text-lg font-semibold text-foreground mb-3">Latest News</h3>
      <div className="flex flex-col gap-3">
        {newsArticles.map((article) => (
          <button
            key={article.id}
            className="bg-card rounded-xl p-4 shadow-lg text-left ios-transition active:scale-[0.98]"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <span className="inline-block px-2 py-0.5 bg-primary/10 rounded text-xs text-primary font-medium mb-2">
                  {article.category}
                </span>
                <h4 className="font-semibold text-card-foreground mb-1 line-clamp-2">
                  {article.title}
                </h4>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                  {article.excerpt}
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  <span>{article.date}</span>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-1" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default NewsScreen;
