-- Create health check logs table
CREATE TABLE public.health_check_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  status TEXT NOT NULL,
  db_connected BOOLEAN NOT NULL DEFAULT true,
  alerts_count INTEGER DEFAULT 0,
  response_time_ms INTEGER,
  checked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  source TEXT DEFAULT 'edge_function'
);

-- Enable RLS
ALTER TABLE public.health_check_logs ENABLE ROW LEVEL SECURITY;

-- Allow service role to insert
CREATE POLICY "Service role can manage health logs"
ON public.health_check_logs
FOR ALL
USING (true)
WITH CHECK (true);

-- Allow admins to view logs
CREATE POLICY "Super admins can view health logs"
ON public.health_check_logs
FOR SELECT
USING (has_role(auth.uid(), 'super_admin'::app_role));

-- Create index for faster queries
CREATE INDEX idx_health_check_logs_checked_at ON public.health_check_logs(checked_at DESC);

-- Auto-cleanup old logs (keep last 7 days)
CREATE OR REPLACE FUNCTION public.cleanup_old_health_logs()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  DELETE FROM public.health_check_logs 
  WHERE checked_at < NOW() - INTERVAL '7 days';
  RETURN NEW;
END;
$$;

CREATE TRIGGER cleanup_health_logs_trigger
AFTER INSERT ON public.health_check_logs
FOR EACH STATEMENT
EXECUTE FUNCTION public.cleanup_old_health_logs();