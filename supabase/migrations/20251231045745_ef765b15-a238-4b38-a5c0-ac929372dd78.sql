-- Create push_subscriptions table for storing web push subscriptions
CREATE TABLE public.push_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  endpoint TEXT NOT NULL UNIQUE,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create rate_alerts table for storing price alerts
CREATE TABLE public.rate_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  subscription_id UUID REFERENCES public.push_subscriptions(id) ON DELETE CASCADE,
  currency TEXT NOT NULL,
  target_rate NUMERIC NOT NULL,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('above', 'below')),
  branch_id TEXT,
  branch_name TEXT,
  enabled BOOLEAN NOT NULL DEFAULT true,
  triggered_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS but allow public access since we're not using auth
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rate_alerts ENABLE ROW LEVEL SECURITY;

-- Public policies for subscriptions (device-based, no auth)
CREATE POLICY "Anyone can create subscriptions" ON public.push_subscriptions FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can view subscriptions" ON public.push_subscriptions FOR SELECT USING (true);
CREATE POLICY "Anyone can delete subscriptions" ON public.push_subscriptions FOR DELETE USING (true);

-- Public policies for alerts
CREATE POLICY "Anyone can create alerts" ON public.rate_alerts FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can view alerts" ON public.rate_alerts FOR SELECT USING (true);
CREATE POLICY "Anyone can update alerts" ON public.rate_alerts FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete alerts" ON public.rate_alerts FOR DELETE USING (true);