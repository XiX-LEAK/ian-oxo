-- 🧹 SCRIPT POUR NETTOYER LES VALEURS PAR DÉFAUT
-- Supprime les valeurs "whatsapp" et "other" par défaut pour les remplacer par des arrays vides

-- ===================================================================
-- 1. VÉRIFIER SI LES COLONNES EXISTENT D'ABORD
-- ===================================================================

-- Vérifier si les colonnes platforms et categories existent
DO $$
BEGIN
    -- Ajouter platforms si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'agents' AND column_name = 'platforms') THEN
        ALTER TABLE agents ADD COLUMN platforms TEXT[] DEFAULT '{}';
    END IF;
    
    -- Ajouter categories si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'agents' AND column_name = 'categories') THEN
        ALTER TABLE agents ADD COLUMN categories TEXT[] DEFAULT '{}';
    END IF;
END $$;

-- ===================================================================
-- 2. NETTOYER LES PLATEFORMES PAR DÉFAUT
-- ===================================================================

-- Vider les platforms si elles contiennent seulement "whatsapp" par défaut
UPDATE agents 
SET platforms = '{}' 
WHERE platforms = '{"whatsapp"}' 
   OR platforms = ARRAY['whatsapp'];

-- Vider le champ platform si c'est la valeur par défaut
UPDATE agents 
SET platform = NULL 
WHERE platform = 'whatsapp';

-- ===================================================================
-- 3. NETTOYER LES CATÉGORIES PAR DÉFAUT
-- ===================================================================

-- Vider les categories si elles contiennent seulement "other" par défaut
UPDATE agents 
SET categories = '{}' 
WHERE categories = '{"other"}' 
   OR categories = ARRAY['other'];

-- Vider le champ category si c'est la valeur par défaut
UPDATE agents 
SET category = NULL 
WHERE category = 'other';

-- ===================================================================
-- 4. NETTOYER LES ARRAYS VIDES DE SPÉCIALITÉS ET LANGUES
-- ===================================================================

-- S'assurer que les arrays vides sont bien vides
UPDATE agents 
SET specialties = '{}' 
WHERE specialties IS NULL 
   OR array_length(specialties, 1) IS NULL;

UPDATE agents 
SET languages = '{}' 
WHERE languages IS NULL 
   OR array_length(languages, 1) IS NULL;

-- ===================================================================
-- 5. VÉRIFICATIONS
-- ===================================================================

-- Compter les agents avec des vraies plateformes
SELECT 
  'Agents avec vraies plateformes: ' || COUNT(*) as info
FROM agents 
WHERE platforms IS NOT NULL 
  AND array_length(platforms, 1) > 0 
  AND NOT (platforms = '{"whatsapp"}' OR platforms = ARRAY['whatsapp']);

-- Compter les agents avec des vraies catégories  
SELECT 
  'Agents avec vraies catégories: ' || COUNT(*) as info
FROM agents 
WHERE categories IS NOT NULL 
  AND array_length(categories, 1) > 0 
  AND NOT (categories = '{"other"}' OR categories = ARRAY['other']);

-- Compter les agents avec données vides (normal)
SELECT 
  'Agents sans plateformes spécifiques: ' || COUNT(*) as info
FROM agents 
WHERE (platforms IS NULL OR platforms = '{}' OR array_length(platforms, 1) IS NULL)
  AND (platform IS NULL OR platform = '');

-- Message final
SELECT '✅ Nettoyage terminé - Plus de valeurs par défaut affichées !' as message;