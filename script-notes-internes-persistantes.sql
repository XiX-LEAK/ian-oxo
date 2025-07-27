-- 📝 SCRIPT POUR NOTES INTERNES PERSISTANTES
-- Ajoute les colonnes pour stocker les notes internes directement dans Supabase
-- Permet de conserver les notes même après rafraîchissement de page

-- ===================================================================
-- 1. AJOUTER LES COLONNES POUR LES NOTES
-- ===================================================================

-- Ajouter les colonnes si elles n'existent pas déjà
ALTER TABLE agents 
ADD COLUMN IF NOT EXISTS notes TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS admin_notes TEXT DEFAULT '';

-- Ajouter des commentaires pour la documentation
COMMENT ON COLUMN agents.notes IS 'Notes publiques visibles par l''utilisateur';
COMMENT ON COLUMN agents.admin_notes IS 'Notes administratives internes';

-- ===================================================================
-- 2. MIGRER LES DONNÉES EXISTANTES SI NÉCESSAIRE
-- ===================================================================

-- S'assurer que les colonnes existantes sont cohérentes
UPDATE agents 
SET 
  notes = COALESCE(notes, ''),
  admin_notes = COALESCE(admin_notes, '')
WHERE notes IS NULL OR admin_notes IS NULL;

-- Vérifier si internal_notes existe et migrer vers admin_notes
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'agents' AND column_name = 'internal_notes') THEN
        -- Migrer les données vers la nouvelle colonne
        UPDATE agents 
        SET admin_notes = COALESCE(internal_notes, '')
        WHERE internal_notes IS NOT NULL AND admin_notes = '';
        
        RAISE NOTICE 'Migration des internal_notes vers admin_notes effectuée';
    END IF;
END $$;

-- ===================================================================
-- 3. CRÉER DES INDEX POUR LA RECHERCHE
-- ===================================================================

-- Index pour recherche dans les notes (pour la fonction de recherche)
CREATE INDEX IF NOT EXISTS idx_agents_notes_search 
ON agents USING gin(to_tsvector('french', notes));

CREATE INDEX IF NOT EXISTS idx_agents_admin_notes_search 
ON agents USING gin(to_tsvector('french', admin_notes));

-- ===================================================================
-- 4. FONCTIONS UTILITAIRES POUR LES NOTES
-- ===================================================================

-- Fonction pour mettre à jour les notes d'un agent
CREATE OR REPLACE FUNCTION update_agent_notes(
    agent_id UUID,
    new_notes TEXT DEFAULT NULL,
    new_admin_notes TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE agents 
    SET 
        notes = COALESCE(new_notes, notes),
        admin_notes = COALESCE(new_admin_notes, admin_notes),
        updated_at = NOW()
    WHERE id = agent_id;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour rechercher dans les notes
CREATE OR REPLACE FUNCTION search_agents_by_notes(search_term TEXT)
RETURNS TABLE (
    id UUID,
    name TEXT,
    notes TEXT,
    admin_notes TEXT,
    relevance REAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        a.id,
        a.name,
        a.notes,
        a.admin_notes,
        ts_rank(
            to_tsvector('french', a.notes || ' ' || a.admin_notes),
            plainto_tsquery('french', search_term)
        ) as relevance
    FROM agents a
    WHERE 
        to_tsvector('french', a.notes || ' ' || a.admin_notes) @@ 
        plainto_tsquery('french', search_term)
    ORDER BY relevance DESC;
END;
$$ LANGUAGE plpgsql;

-- ===================================================================
-- 5. TRIGGER POUR HORODATAGE AUTOMATIQUE
-- ===================================================================

-- Créer trigger pour mettre à jour updated_at quand les notes changent
CREATE OR REPLACE FUNCTION update_agent_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Appliquer le trigger si il n'existe pas déjà
DROP TRIGGER IF EXISTS trigger_update_agent_timestamp ON agents;
CREATE TRIGGER trigger_update_agent_timestamp
    BEFORE UPDATE ON agents
    FOR EACH ROW
    EXECUTE FUNCTION update_agent_timestamp();

-- ===================================================================
-- 6. VÉRIFICATIONS ET TESTS
-- ===================================================================

-- Vérifier que les colonnes ont été créées
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'agents' 
AND column_name IN ('notes', 'admin_notes')
ORDER BY column_name;

-- Test : mettre à jour les notes d'un agent existant
DO $$
DECLARE
    test_agent_id UUID;
BEGIN
    -- Prendre le premier agent pour test
    SELECT id INTO test_agent_id FROM agents LIMIT 1;
    
    IF test_agent_id IS NOT NULL THEN
        -- Tester la fonction de mise à jour
        PERFORM update_agent_notes(
            test_agent_id,
            'Note de test - ' || NOW()::TEXT,
            'Note admin de test - ' || NOW()::TEXT
        );
        
        RAISE NOTICE 'Test de mise à jour des notes effectué sur agent ID: %', test_agent_id;
    END IF;
END $$;

-- Compter les agents avec des notes
SELECT 
    'Agents avec notes publiques: ' || COUNT(*) as info
FROM agents 
WHERE notes IS NOT NULL AND notes != '';

SELECT 
    'Agents avec notes admin: ' || COUNT(*) as info
FROM agents 
WHERE admin_notes IS NOT NULL AND admin_notes != '';

-- Message final
SELECT '📝 Support des notes internes persistantes ajouté avec succès !' as message;
SELECT '✅ Les notes seront maintenant conservées après rafraîchissement de page' as info;