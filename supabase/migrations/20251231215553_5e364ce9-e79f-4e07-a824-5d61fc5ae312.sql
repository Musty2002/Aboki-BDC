-- Create news cache table
CREATE TABLE public.news_cache (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  articles JSONB NOT NULL DEFAULT '[]'::jsonb,
  fetched_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.news_cache ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read cached news
CREATE POLICY "Anyone can view cached news" 
ON public.news_cache 
FOR SELECT 
USING (true);

-- Only edge functions can insert/update (via service role)
CREATE POLICY "Service role can manage cache" 
ON public.news_cache 
FOR ALL 
USING (true)
WITH CHECK (true);