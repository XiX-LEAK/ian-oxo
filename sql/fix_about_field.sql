-- 🎯 SQL POUR SUPABASE : Correction du champ "À propos" 
-- Exécuter dans l'éditeur SQL de Supabase

-- 1. S'assurer que la colonne "about_description" existe dans la table agents
ALTER TABLE agents 
ADD COLUMN IF NOT EXISTS about_description TEXT;

-- 2. Créer un index pour améliorer les performances de recherche
CREATE INDEX IF NOT EXISTS idx_agents_about_description 
ON agents USING gin (to_tsvector('french', about_description));

-- 3. Mettre à jour la fonction de recherche pour inclure about_description
CREATE OR REPLACE FUNCTION search_agents(search_query TEXT)
RETURNS TABLE (
  id UUID,
  name TEXT,
  identifier TEXT,
  phone_number TEXT,
  email TEXT,
  website_url TEXT,
  platform TEXT,
  status TEXT,
  description TEXT,
  about_description TEXT,
  specialties TEXT[],
  languages TEXT[],
  rating NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.id,
    a.name,
    a.identifier,
    a.phone_number,
    a.email,
    a.website_url,
    a.platform,
    a.status,
    a.description,
    a.about_description,
    a.specialties,
    a.languages,
    a.rating,
    a.created_at,
    a.updated_at
  FROM agents a
  WHERE 
    search_query IS NULL OR
    search_query = '' OR
    (
      a.name ILIKE '%' || search_query || '%' OR
      a.identifier ILIKE '%' || search_query || '%' OR
      a.email ILIKE '%' || search_query || '%' OR
      a.description ILIKE '%' || search_query || '%' OR
      a.about_description ILIKE '%' || search_query || '%' OR
      EXISTS (
        SELECT 1 FROM unnest(a.specialties) AS spec 
        WHERE spec ILIKE '%' || search_query || '%'
      ) OR
      EXISTS (
        SELECT 1 FROM unnest(a.languages) AS lang 
        WHERE lang ILIKE '%' || search_query || '%'
      )
    )
  ORDER BY a.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- 4. Trigger pour mettre à jour automatically updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Appliquer le trigger si il n'existe pas déjà
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'update_agents_updated_at'
    ) THEN
        CREATE TRIGGER update_agents_updated_at 
        BEFORE UPDATE ON agents 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- 5. Vue pour faciliter la récupération des agents avec toutes les infos
CREATE OR REPLACE VIEW agents_complete AS 
SELECT 
  a.id,
  a.name,
  a.full_name,
  a.identifier,
  a.phone_number,
  a.email,
  a.website_url,
  a.platform,
  a.status,
  a.description,
  a.about_description,  -- ✅ CHAMP IMPORTANT
  a.specialties,
  a.languages,
  a.rating,
  a.total_reviews,
  a.location,
  a.verification_date,
  a.created_at,
  a.updated_at
FROM agents a
WHERE a.status != 'deleted'
ORDER BY a.created_at DESC;

-- 6. Politique de sécurité RLS (Row Level Security) si nécessaire
-- Autoriser la lecture pour tous les utilisateurs authentifiés
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON agents;
CREATE POLICY "Enable read access for authenticated users" ON agents
    FOR SELECT USING (auth.role() = 'authenticated');

-- Autoriser l'insertion pour les utilisateurs authentifiés
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON agents;
CREATE POLICY "Enable insert for authenticated users" ON agents
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Autoriser la mise à jour pour les utilisateurs authentifiés
DROP POLICY IF EXISTS "Enable update for authenticated users" ON agents;
CREATE POLICY "Enable update for authenticated users" ON agents
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Autoriser la suppression pour les utilisateurs authentifiés
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON agents;
CREATE POLICY "Enable delete for authenticated users" ON agents
    FOR DELETE USING (auth.role() = 'authenticated');

-- 7. Activer RLS sur la table si pas déjà fait
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;

-- 8. Fonction pour nettoyer les données (supprimer vraiment les agents marqués comme supprimés)
CREATE OR REPLACE FUNCTION cleanup_deleted_agents()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM agents WHERE status = 'deleted' AND updated_at < NOW() - INTERVAL '30 days';
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- 9. Commentaires pour documentation
COMMENT ON COLUMN agents.about_description IS 'Description détaillée des services et spécialités de l''agent';
COMMENT ON COLUMN agents.description IS 'Description courte pour compatibilité';
COMMENT ON VIEW agents_complete IS 'Vue complète des agents actifs avec tous les champs nécessaires';
COMMENT ON FUNCTION search_agents(TEXT) IS 'Fonction de recherche avancée dans les agents incluant about_description';

-- ✅ SCRIPT TERMINÉ
-- Vous pouvez maintenant utiliser about_description dans vos requêtes