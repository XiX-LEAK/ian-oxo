-- ============================================
-- AJOUTER LE CHAMP CATEGORIES À LA TABLE AGENTS
-- ============================================

-- Ajouter la colonne categories (array de strings)
ALTER TABLE public.agents 
ADD COLUMN IF NOT EXISTS categories TEXT[];

-- Créer un index pour la performance sur les catégories multiples
CREATE INDEX IF NOT EXISTS idx_agents_categories ON public.agents USING GIN(categories);

-- Migrer les données existantes : convertir category en premier élément de categories
UPDATE public.agents 
SET categories = ARRAY[category] 
WHERE categories IS NULL OR array_length(categories, 1) IS NULL;

-- Vérification
SELECT 'Colonne categories ajoutée avec succès !' as message;

-- Tester en ajoutant un exemple avec catégories multiples
UPDATE public.agents 
SET categories = ARRAY['electronics', 'fashion', 'accessories'] 
WHERE name = 'Agent Electronics Pro';

-- Vérifier que ça marche
SELECT name, category, categories 
FROM public.agents 
WHERE categories IS NOT NULL
LIMIT 5;

-- Exemple d'utilisation des catégories multiples
-- Pour rechercher des agents ayant une catégorie spécifique :
-- SELECT * FROM agents WHERE 'electronics' = ANY(categories);

-- Pour rechercher des agents ayant plusieurs catégories :
-- SELECT * FROM agents WHERE categories && ARRAY['electronics', 'fashion'];