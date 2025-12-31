import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const MEDIASTACK_API_KEY = Deno.env.get('MEDIASTACK_API_KEY');
    
    if (!MEDIASTACK_API_KEY) {
      console.error('MEDIASTACK_API_KEY is not configured');
      throw new Error('News API key not configured');
    }

    // Fetch Nigerian forex/business news
    const url = new URL('http://api.mediastack.com/v1/news');
    url.searchParams.set('access_key', MEDIASTACK_API_KEY);
    url.searchParams.set('countries', 'ng');
    url.searchParams.set('categories', 'business');
    url.searchParams.set('keywords', 'forex,naira,dollar,exchange,currency,CBN');
    url.searchParams.set('limit', '10');
    url.searchParams.set('sort', 'published_desc');

    console.log('Fetching news from MediaStack...');
    
    const response = await fetch(url.toString());
    
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

    return new Response(JSON.stringify({ articles }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error fetching news:', error);
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
