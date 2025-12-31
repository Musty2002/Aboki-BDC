import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const CACHE_DURATION_MINUTES = 30;

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

    // Fetch fresh news
    const MEDIASTACK_API_KEY = Deno.env.get('MEDIASTACK_API_KEY');
    
    if (!MEDIASTACK_API_KEY) {
      console.error('MEDIASTACK_API_KEY is not configured');
      throw new Error('News API key not configured');
    }

    const apiUrl = new URL('http://api.mediastack.com/v1/news');
    apiUrl.searchParams.set('access_key', MEDIASTACK_API_KEY);
    apiUrl.searchParams.set('countries', 'ng');
    apiUrl.searchParams.set('categories', 'business');
    apiUrl.searchParams.set('keywords', 'forex,naira,dollar,exchange,currency,CBN');
    apiUrl.searchParams.set('limit', '10');
    apiUrl.searchParams.set('sort', 'published_desc');

    console.log('Fetching fresh news from MediaStack...');
    
    const response = await fetch(apiUrl.toString());
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('MediaStack API error:', response.status, errorText);
      throw new Error(`News API error: ${response.status}`);
    }

    const data = await response.json();
    console.log(`Fetched ${data.data?.length || 0} news articles`);

    // Transform to simpler format
    const articles = (data.data || []).map((article: any, index: number) => ({
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
      source: article.source || 'News',
      image: article.image || null,
    }));

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
