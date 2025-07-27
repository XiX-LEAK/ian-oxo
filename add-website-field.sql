-- ============================================
-- AJOUTER LE CHAMP WEBSITE_URL À LA TABLE AGENTS
-- ============================================

-- Ajouter la colonne website_url
ALTER TABLE public.agents 
ADD COLUMN IF NOT EXISTS website_url TEXT;

-- Créer un index pour la performance (optionnel)
CREATE INDEX IF NOT EXISTS idx_agents_website_url ON public.agents(website_url);

-- Vérification
SELECT 'Colonne website_url ajoutée avec succès !' as message;

-- Tester en ajoutant un exemple
UPDATE public.agents 
SET website_url = 'https://example.com' 
WHERE name = 'Agent Electronics Pro';

-- Vérifier que ça marche
SELECT name, email, website_url 
FROM public.agents 
WHERE website_url IS NOT NULL
LIMIT 3;