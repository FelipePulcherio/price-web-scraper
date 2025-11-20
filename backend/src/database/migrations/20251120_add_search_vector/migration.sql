-- Add search vector to "Item"
-- Priority order model > name > brand

-- Add vector column
ALTER TABLE "Item"
ADD COLUMN "searchVector" tsvector;

-- Create trigger function
CREATE FUNCTION item_search_vector_trigger() RETURNS trigger AS $$
BEGIN
  NEW."searchVector" :=
    setweight(to_tsvector('simple', unaccent(COALESCE(NEW.model, ''))), 'A') ||
    setweight(to_tsvector('simple', unaccent(COALESCE(NEW.name, ''))), 'B') ||
    setweight(to_tsvector('simple', unaccent(COALESCE(NEW.brand, ''))), 'C');
  RETURN NEW;
END
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER item_search_vector_update
BEFORE INSERT OR UPDATE ON "Item"
FOR EACH ROW EXECUTE FUNCTION item_search_vector_trigger();

-- Create full-text search index
CREATE INDEX item_search_vector_idx
ON "Item"
USING GIN ("searchVector");

-- Create fuzzy search index
CREATE INDEX item_trgm_idx
ON "Item"
USING GIN ((name || ' ' || model || ' ' || brand) gin_trgm_ops);