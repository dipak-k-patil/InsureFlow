CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

SELECT cron.unschedule('renewal-reminder-hourly')
WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'renewal-reminder-hourly');

SELECT cron.schedule(
  'renewal-reminder-hourly',
  '0 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://wvoyfmkxwpjtjtsnodgf.supabase.co/functions/v1/reminder-scheduler',
    headers := '{"Content-Type": "application/json"}'::jsonb,
    body := '{}'::jsonb
  );
  $$
);