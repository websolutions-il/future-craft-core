
-- Enable pg_cron and pg_net if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Remove existing job if exists
SELECT cron.unschedule('check-exam-expiry-daily')
WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'check-exam-expiry-daily');

-- Schedule daily at 08:00 UTC
SELECT cron.schedule(
  'check-exam-expiry-daily',
  '0 8 * * *',
  $$
  SELECT net.http_post(
    url := 'https://kuenhflklivaxrmqbsee.supabase.co/functions/v1/check-exam-expiry',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt1ZW5oZmxrbGl2YXhybXFic2VlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIxODYxMjUsImV4cCI6MjA4Nzc2MjEyNX0.YSU4kOtBJs9rzklSBdY2Qpg2P5h31ez96CfAw9BIzPY"}'::jsonb,
    body := '{}'::jsonb
  ) AS request_id;
  $$
);
