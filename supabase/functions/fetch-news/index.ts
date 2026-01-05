import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const CACHE_DURATION_MINUTES = 30;
const SEND_NEWS_NOTIFICATION = true; // Enable push notifications for new news

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

// Fetch from MediaStack API
async function fetchMediaStack(): Promise<NewsArticle[]> {
  const MEDIASTACK_API_KEY = Deno.env.get('MEDIASTACK_API_KEY');
  if (!MEDIASTACK_API_KEY) {
    console.log('MediaStack API key not configured, skipping...');
    return [];
  }

  try {
    const apiUrl = new URL('http://api.mediastack.com/v1/news');
    apiUrl.searchParams.set('access_key', MEDIASTACK_API_KEY);
    apiUrl.searchParams.set('countries', 'ng');
    apiUrl.searchParams.set('categories', 'business');
    apiUrl.searchParams.set('keywords', 'forex,naira,dollar,exchange,currency,CBN');
    apiUrl.searchParams.set('limit', '10');
    apiUrl.searchParams.set('sort', 'published_desc');

    console.log('Fetching from MediaStack...');
    const response = await fetch(apiUrl.toString());

    if (!response.ok) {
      console.error('MediaStack API error:', response.status);
      return [];
    }

    const data = await response.json();
    console.log(`MediaStack returned ${data.data?.length || 0} articles`);

    return (data.data || []).map((article: any, index: number) => ({
      id: index + 1,
      title: article.title || 'Untitled',
      excerpt: article.description || article.title || '',
      date: article.published_at ? new Date(article.published_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }) : 'Recent',
      category: article.category || 'Business',
      url: article.url || null,
      source: article.source || 'MediaStack',
      image: article.image || null,
    }));
  } catch (error) {
    console.error('MediaStack fetch error:', error);
    return [];
  }
}

// Fetch from NewsAPI.org
async function fetchNewsAPI(): Promise<NewsArticle[]> {
  const NEWSAPI_KEY = Deno.env.get('NEWSAPI_ORG_KEY');
  if (!NEWSAPI_KEY) {
    console.log('NewsAPI.org key not configured, skipping...');
    return [];
  }

  try {
    const apiUrl = new URL('https://newsapi.org/v2/everything');
    apiUrl.searchParams.set('q', 'nigeria naira forex exchange rate CBN dollar');
    apiUrl.searchParams.set('language', 'en');
    apiUrl.searchParams.set('sortBy', 'publishedAt');
    apiUrl.searchParams.set('pageSize', '10');
    apiUrl.searchParams.set('apiKey', NEWSAPI_KEY);

    console.log('Fetching from NewsAPI.org...');
    const response = await fetch(apiUrl.toString());

    if (!response.ok) {
      const errorText = await response.text();
      console.error('NewsAPI error:', response.status, errorText);
      return [];
    }

    const data = await response.json();
    console.log(`NewsAPI returned ${data.articles?.length || 0} articles`);

    return (data.articles || []).map((article: any, index: number) => ({
      id: 100 + index,
      title: article.title || 'Untitled',
      excerpt: article.description || article.content || '',
      date: article.publishedAt ? new Date(article.publishedAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }) : 'Recent',
      category: 'Finance',
      url: article.url || null,
      source: article.source?.name || 'NewsAPI',
      image: article.urlToImage || null,
    }));
  } catch (error) {
    console.error('NewsAPI fetch error:', error);
    return [];
  }
}

// Fetch from GNews API (free tier)
async function fetchGNews(): Promise<NewsArticle[]> {
  const GNEWS_API_KEY = Deno.env.get('GNEWS_API_KEY');
  if (!GNEWS_API_KEY) {
    console.log('GNews API key not configured, skipping...');
    return [];
  }

  try {
    const apiUrl = new URL('https://gnews.io/api/v4/search');
    apiUrl.searchParams.set('q', 'naira OR forex OR "exchange rate" OR CBN');
    apiUrl.searchParams.set('lang', 'en');
    apiUrl.searchParams.set('country', 'ng');
    apiUrl.searchParams.set('max', '10');
    apiUrl.searchParams.set('apikey', GNEWS_API_KEY);

    console.log('Fetching from GNews...');
    const response = await fetch(apiUrl.toString());

    if (!response.ok) {
      const errorText = await response.text();
      console.error('GNews API error:', response.status, errorText);
      return [];
    }

    const data = await response.json();
    console.log(`GNews returned ${data.articles?.length || 0} articles`);

    return (data.articles || []).map((article: any, index: number) => ({
      id: 200 + index,
      title: article.title || 'Untitled',
      excerpt: article.description || article.content || '',
      date: article.publishedAt ? new Date(article.publishedAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }) : 'Recent',
      category: 'Finance',
      url: article.url || null,
      source: article.source?.name || 'GNews',
      image: article.image || null,
    }));
  } catch (error) {
    console.error('GNews fetch error:', error instanceof Error ? error.message : error);
    return [];
  }
}

// Fetch from The Guardian API (free tier)
async function fetchGuardian(): Promise<NewsArticle[]> {
  const GUARDIAN_API_KEY = Deno.env.get('GUARDIAN_API_KEY');
  if (!GUARDIAN_API_KEY) {
    console.log('Guardian API key not configured, skipping...');
    return [];
  }

  try {
    const apiUrl = new URL('https://content.guardianapis.com/search');
    apiUrl.searchParams.set('q', 'nigeria naira OR forex OR currency');
    apiUrl.searchParams.set('section', 'business|money');
    apiUrl.searchParams.set('show-fields', 'trailText,thumbnail');
    apiUrl.searchParams.set('page-size', '10');
    apiUrl.searchParams.set('api-key', GUARDIAN_API_KEY);

    console.log('Fetching from The Guardian...');
    const response = await fetch(apiUrl.toString());

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Guardian API error:', response.status, errorText);
      return [];
    }

    const data = await response.json();
    console.log(`Guardian returned ${data.response?.results?.length || 0} articles`);

    return (data.response?.results || []).map((article: any, index: number) => ({
      id: 300 + index,
      title: article.webTitle || 'Untitled',
      excerpt: article.fields?.trailText || '',
      date: article.webPublicationDate ? new Date(article.webPublicationDate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }) : 'Recent',
      category: article.sectionName || 'Business',
      url: article.webUrl || null,
      source: 'The Guardian',
      image: article.fields?.thumbnail || null,
    }));
  } catch (error) {
    console.error('Guardian fetch error:', error instanceof Error ? error.message : error);
    return [];
  }
}

// Deduplicate articles by title similarity
function deduplicateArticles(articles: NewsArticle[]): NewsArticle[] {
  const seen = new Set<string>();
  return articles.filter(article => {
    // Normalize title for comparison
    const normalizedTitle = article.title.toLowerCase().replace(/[^\w\s]/g, '').trim();
    if (seen.has(normalizedTitle)) {
      return false;
    }
    seen.add(normalizedTitle);
    return true;
  });
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check for force refresh param
    const url = new URL(req.url);
    const forceRefresh = url.searchParams.get('refresh') === 'true';

    // Check cache first (unless force refresh)
    if (!forceRefresh) {
      const { data: cached } = await supabase
        .from('news_cache')
        .select('articles, fetched_at')
        .order('fetched_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (cached) {
        const cacheAge = (Date.now() - new Date(cached.fetched_at).getTime()) / 1000 / 60;
        if (cacheAge < CACHE_DURATION_MINUTES) {
          console.log(`Returning cached news (${Math.round(cacheAge)} min old)`);
          return new Response(JSON.stringify({ articles: cached.articles, cached: true }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
      }
    }

    // Fetch from all sources in parallel
    console.log('Fetching fresh news from all sources...');
    const [mediaStackArticles, newsAPIArticles, gNewsArticles, guardianArticles] = await Promise.all([
      fetchMediaStack(),
      fetchNewsAPI(),
      fetchGNews(),
      fetchGuardian(),
    ]);

    // Combine all articles
    const allArticles = [...mediaStackArticles, ...newsAPIArticles, ...gNewsArticles, ...guardianArticles];
    console.log(`Total articles from all sources: ${allArticles.length}`);

    // Deduplicate and sort by date
    let articles = deduplicateArticles(allArticles);
    
    // Re-assign IDs after deduplication
    articles = articles.map((article, index) => ({
      ...article,
      id: index + 1,
    }));

    console.log(`After deduplication: ${articles.length} articles`);

    // Check if we have new articles compared to cache
    let hasNewArticles = false;
    let newArticleTitle = '';
    
    const { data: oldCache } = await supabase
      .from('news_cache')
      .select('articles')
      .order('fetched_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (oldCache && oldCache.articles) {
      const oldTitles = new Set((oldCache.articles as NewsArticle[]).map(a => a.title.toLowerCase()));
      const newArticle = articles.find(a => !oldTitles.has(a.title.toLowerCase()));
      if (newArticle) {
        hasNewArticles = true;
        newArticleTitle = newArticle.title;
        console.log(`Found new article: ${newArticleTitle}`);
      }
    } else {
      // First time fetching - consider all articles as new
      hasNewArticles = articles.length > 0;
      newArticleTitle = articles[0]?.title || '';
    }

    // Save to cache (only if we got articles)
    if (articles.length > 0) {
      // Delete old cache entries first
      await supabase.from('news_cache').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      
      // Insert new cache
      const { error: cacheError } = await supabase
        .from('news_cache')
        .insert({ articles, fetched_at: new Date().toISOString() });

      if (cacheError) {
        console.error('Failed to cache news:', cacheError);
      } else {
        console.log('News cached successfully');
      }

      // Send push notification for new articles
      if (SEND_NEWS_NOTIFICATION && hasNewArticles && newArticleTitle) {
        console.log('Sending news update push notification...');
        
        // Get all push subscriptions
        const { data: subscriptions } = await supabase
          .from('push_subscriptions')
          .select('endpoint');

        if (subscriptions && subscriptions.length > 0) {
          const fcmServerKey = Deno.env.get('FCM_SERVER_KEY');
          
          if (fcmServerKey) {
            let successCount = 0;
            let failureCount = 0;
            
            for (const sub of subscriptions) {
              try {
                const fcmResponse = await fetch('https://fcm.googleapis.com/fcm/send', {
                  method: 'POST',
                  headers: {
                    'Authorization': `key=${fcmServerKey}`,
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    to: sub.endpoint,
                    notification: {
                      title: '📰 New Forex News',
                      body: newArticleTitle.length > 80 ? newArticleTitle.substring(0, 77) + '...' : newArticleTitle,
                      sound: 'default',
                    },
                    data: { type: 'news_update' },
                    priority: 'high',
                  }),
                });

                if (fcmResponse.ok) {
                  successCount++;
                } else {
                  failureCount++;
                }
              } catch (e) {
                failureCount++;
                console.error('Push notification error:', e);
              }
            }

            console.log(`News notifications sent: ${successCount} success, ${failureCount} failed`);

            // Log the notification
            await supabase.from('notification_logs').insert({
              title: '📰 New Forex News',
              body: newArticleTitle.length > 80 ? newArticleTitle.substring(0, 77) + '...' : newArticleTitle,
              target_type: 'all',
              sent_count: subscriptions.length,
              success_count: successCount,
              failure_count: failureCount,
            });
          }
        } else {
          console.log('No push subscribers to notify');
        }
      }
    }

    return new Response(JSON.stringify({ articles, cached: false }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error fetching news:', error);
    
    // Try to return cached data on error
    try {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      
      const { data: cached } = await supabase
        .from('news_cache')
        .select('articles')
        .order('fetched_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (cached && cached.articles && Array.isArray(cached.articles) && cached.articles.length > 0) {
        console.log('Returning stale cache due to error');
        return new Response(JSON.stringify({ articles: cached.articles, cached: true, stale: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    } catch (cacheError) {
      console.error('Failed to fetch cache:', cacheError);
    }

    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Failed to fetch news',
        articles: [] 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
