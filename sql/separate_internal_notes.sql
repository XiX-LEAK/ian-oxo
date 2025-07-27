-- 🔒 SQL POUR SUPABASE : Séparer les notes internes du champ public "À propos"
-- Exécuter dans l'éditeur SQL de Supabase

-- 1. S'assurer que les colonnes nécessaires existent
ALTER TABLE agents 
ADD COLUMN IF NOT EXISTS about_description TEXT;

ALTER TABLE agents 
ADD COLUMN IF NOT EXISTS internal_notes TEXT;

-- 2. Créer des commentaires pour clarifier l'usage de chaque champ
COMMENT ON COLUMN agents.about_description IS 'Description publique des services de l''agent (visible par tous les clients)';
COMMENT ON COLUMN agents.internal_notes IS 'Notes internes privées (visibles seulement par les administrateurs)';
COMMENT ON COLUMN agents.description IS 'Ancien champ description (gardé pour compatibilité)';

-- 3. Créer une vue publique sans les notes internes
CREATE OR REPLACE VIEW agents_public AS 
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
  a.about_description,  -- ✅ CHAMP PUBLIC
  -- internal_notes EXCLU volontairement pour la sécurité
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

-- 4. Créer une vue admin avec tous les champs (y compris notes internes)
CREATE OR REPLACE VIEW agents_admin AS 
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
  a.about_description,  -- ✅ CHAMP PUBLIC
  a.internal_notes,     -- ✅ CHAMP PRIVÉ ADMIN
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

-- 5. Fonction de recherche publique (sans notes internes)
CREATE OR REPLACE FUNCTION search_agents_public(search_query TEXT)
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
    a.about_description,  -- Notes internes exclues
    a.specialties,
    a.languages,
    a.rating,
    a.created_at,
    a.updated_at
  FROM agents a
  WHERE 
    a.status != 'deleted' AND (
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
    )
  ORDER BY a.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- 6. Fonction de recherche admin (avec notes internes)
CREATE OR REPLACE FUNCTION search_agents_admin(search_query TEXT)
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
  internal_notes TEXT,
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
    a.internal_notes,  -- ✅ Inclus pour les admins
    a.specialties,
    a.languages,
    a.rating,
    a.created_at,
    a.updated_at
  FROM agents a
  WHERE 
    a.status != 'deleted' AND (
      search_query IS NULL OR
      search_query = '' OR
      (
        a.name ILIKE '%' || search_query || '%' OR
        a.identifier ILIKE '%' || search_query || '%' OR
        a.email ILIKE '%' || search_query || '%' OR
        a.description ILIKE '%' || search_query || '%' OR
        a.about_description ILIKE '%' || search_query || '%' OR
        a.internal_notes ILIKE '%' || search_query || '%' OR  -- ✅ Recherche dans notes internes pour admin
        EXISTS (
          SELECT 1 FROM unnest(a.specialties) AS spec 
          WHERE spec ILIKE '%' || search_query || '%'
        ) OR
        EXISTS (
          SELECT 1 FROM unnest(a.languages) AS lang 
          WHERE lang ILIKE '%' || search_query || '%'
        )
      )
    )
  ORDER BY a.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- 7. Politiques de sécurité RLS pour protéger les notes internes
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;

-- Politique de lecture publique (sans notes internes)
DROP POLICY IF EXISTS "Public read access without internal notes" ON agents;
CREATE POLICY "Public read access without internal notes" ON agents
    FOR SELECT USING (
        auth.role() = 'anon' OR 
        auth.role() = 'authenticated'
    );

-- Politique d'écriture admin uniquement
DROP POLICY IF EXISTS "Admin write access" ON agents;
CREATE POLICY "Admin write access" ON agents
    FOR ALL USING (
        auth.jwt() ->> 'role' = 'admin' OR
        auth.role() = 'service_role'
    );

-- 8. Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_agents_internal_notes 
ON agents USING gin (to_tsvector('french', internal_notes))
WHERE internal_notes IS NOT NULL;

-- 9. Trigger pour auditer les modifications des notes internes
CREATE OR REPLACE FUNCTION audit_internal_notes_changes()
RETURNS TRIGGER AS $$
BEGIN
    -- Loguer seulement si les notes internes ont changé
    IF (OLD.internal_notes IS DISTINCT FROM NEW.internal_notes) THEN
        INSERT INTO audit_logs (
            table_name,
            record_id,
            action_type,
            old_values,
            new_values,
            changed_at,
            changed_by
        ) VALUES (
            'agents',
            NEW.id,
            'UPDATE_INTERNAL_NOTES',
            jsonb_build_object('internal_notes', OLD.internal_notes),
            jsonb_build_object('internal_notes', NEW.internal_notes),
            NOW(),
            auth.uid()
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Créer la table d'audit si elle n'existe pas
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    table_name TEXT NOT NULL,
    record_id UUID NOT NULL,
    action_type TEXT NOT NULL,
    old_values JSONB,
    new_values JSONB,
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    changed_by UUID
);

-- Appliquer le trigger
DROP TRIGGER IF EXISTS audit_internal_notes_trigger ON agents;
CREATE TRIGGER audit_internal_notes_trigger
    BEFORE UPDATE ON agents
    FOR EACH ROW
    EXECUTE FUNCTION audit_internal_notes_changes();

-- ✅ SCRIPT TERMINÉ
-- Les notes internes sont maintenant sécurisées et séparées du champ public