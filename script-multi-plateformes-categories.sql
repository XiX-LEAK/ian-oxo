-- 🎯 SCRIPT POUR AJOUTER SUPPORT MULTI-PLATEFORMES ET MULTI-CATÉGORIES
-- Ajoute les colonnes arrays pour permettre plusieurs plateformes/catégories par agent

-- ===================================================================
-- 1. AJOUTER LES NOUVELLES COLONNES ARRAYS
-- ===================================================================

-- Ajouter colonnes pour plateformes multiples
ALTER TABLE agents 
ADD COLUMN IF NOT EXISTS platforms TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS categories TEXT[] DEFAULT '{}';

-- ===================================================================
-- 2. MIGRER LES DONNÉES EXISTANTES
-- ===================================================================

-- Migrer les plateformes existantes vers le nouveau format array
UPDATE agents 
SET platforms = ARRAY[platform]
WHERE platform IS NOT NULL 
  AND (platforms IS NULL OR platforms = '{}');

-- Migrer les catégories existantes vers le nouveau format array  
UPDATE agents 
SET categories = ARRAY[category]
WHERE category IS NOT NULL 
  AND (categories IS NULL OR categories = '{}');

-- ===================================================================
-- 3. CRÉER INDEX POUR PERFORMANCE
-- ===================================================================

-- Index GIN pour recherche rapide dans les arrays
CREATE INDEX IF NOT EXISTS idx_agents_platforms_gin ON agents USING GIN (platforms);
CREATE INDEX IF NOT EXISTS idx_agents_categories_gin ON agents USING GIN (categories);

-- ===================================================================
-- 4. FONCTIONS UTILITAIRES
-- ===================================================================

-- Fonction pour rechercher agents par plateforme (compatible arrays)
CREATE OR REPLACE FUNCTION search_agents_by_platform(platform_name TEXT)
RETURNS TABLE (
  id UUID,
  name TEXT,
  platforms TEXT[],
  categories TEXT[]
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.id,
    a.name,
    a.platforms,
    a.categories
  FROM agents a
  WHERE a.platform = platform_name 
     OR platform_name = ANY(a.platforms);
END;
$$ LANGUAGE plpgsql;

-- Fonction pour rechercher agents par catégorie (compatible arrays)
CREATE OR REPLACE FUNCTION search_agents_by_category(category_name TEXT)
RETURNS TABLE (
  id UUID,
  name TEXT,
  platforms TEXT[],
  categories TEXT[]
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.id,
    a.name,
    a.platforms,
    a.categories
  FROM agents a
  WHERE a.category = category_name 
     OR category_name = ANY(a.categories);
END;
$$ LANGUAGE plpgsql;

-- ===================================================================
-- 5. VÉRIFICATION ET TESTS
-- ===================================================================

-- Test : ajouter plusieurs plateformes à un agent existant
DO $$
DECLARE
  test_agent_id UUID;
BEGIN
  -- Prendre le premier agent pour test
  SELECT id INTO test_agent_id FROM agents LIMIT 1;
  
  IF test_agent_id IS NOT NULL THEN
    -- Ajouter plusieurs plateformes
    UPDATE agents 
    SET platforms = ARRAY['whatsapp', 'telegram', 'instagram']
    WHERE id = test_agent_id;
    
    -- Ajouter plusieurs catégories
    UPDATE agents 
    SET categories = ARRAY['marketing', 'sales', 'support']
    WHERE id = test_agent_id;
    
    RAISE NOTICE 'Test effectué sur agent ID: %', test_agent_id;
  END IF;
END $$;

-- Vérifier que tout marche
SELECT 
  'Agents avec plateformes multiples: ' || COUNT(*) as info
FROM agents 
WHERE array_length(platforms, 1) > 1;

SELECT 
  'Agents avec catégories multiples: ' || COUNT(*) as info  
FROM agents 
WHERE array_length(categories, 1) > 1;

-- Message final
SELECT '🎉 Support multi-plateformes et multi-catégories ajouté !' as message;