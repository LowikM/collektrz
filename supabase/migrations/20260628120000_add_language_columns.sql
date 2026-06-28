-- Optional language for collection items and listings (text, not enum).

ALTER TABLE public.collection_items
ADD COLUMN language text;

ALTER TABLE public.listings
ADD COLUMN language text;
