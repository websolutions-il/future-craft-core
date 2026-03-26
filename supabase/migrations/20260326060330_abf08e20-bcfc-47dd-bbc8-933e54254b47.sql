ALTER TABLE public.dev_tasks ADD COLUMN priority text NOT NULL DEFAULT 'medium';
ALTER TABLE public.dev_tasks ADD COLUMN size text NOT NULL DEFAULT 'M';