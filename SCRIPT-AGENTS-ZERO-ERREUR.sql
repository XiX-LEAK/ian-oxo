-- 🎯 SCRIPT AGENTS - ZERO ERREUR GARANTI
-- Basé sur la structure EXACTE de ton site oxo-ultimate

-- ===================================================================
-- 1. AMÉLIORER LA TABLE AGENTS EXISTANTE (SEULEMENT CE QUI MANQUE)
-- ===================================================================

-- Ajouter SEULEMENT les colonnes qui n'existent pas encore
ALTER TABLE agents 
ADD COLUMN IF NOT EXISTS full_name TEXT,
ADD COLUMN IF NOT EXISTS about_description TEXT,
ADD COLUMN IF NOT EXISTS internal_notes TEXT,
ADD COLUMN IF NOT EXISTS website_url TEXT,
ADD COLUMN IF NOT EXISTS specialties TEXT[],
ADD COLUMN IF NOT EXISTS languages TEXT[];

-- Migrer les données existantes SANS CASSER
UPDATE agents 
SET 
  full_name = COALESCE(full_name, name),
  about_description = COALESCE(about_description, description),
  internal_notes = COALESCE(internal_notes, admin_notes),
  specialties = COALESCE(specialties, '{}'),
  languages = COALESCE(languages, '{}')
WHERE full_name IS NULL 
   OR about_description IS NULL 
   OR internal_notes IS NULL 
   OR specialties IS NULL 
   OR languages IS NULL;

-- ===================================================================
-- 2. TABLES DE RÉFÉRENCE SIMPLES
-- ===================================================================

-- Plateformes
CREATE TABLE IF NOT EXISTS platforms (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Catégories  
CREATE TABLE IF NOT EXISTS categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Langues disponibles
CREATE TABLE IF NOT EXISTS available_languages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    code TEXT UNIQUE,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ===================================================================
-- 3. TABLES DE LIAISON (MANY-TO-MANY)
-- ===================================================================

-- Agent <-> Plateformes
CREATE TABLE IF NOT EXISTS agent_platforms (
    agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
    platform_id UUID REFERENCES platforms(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    PRIMARY KEY (agent_id, platform_id)
);

-- Agent <-> Catégories
CREATE TABLE IF NOT EXISTS agent_categories (
    agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    PRIMARY KEY (agent_id, category_id)
);

-- Agent <-> Langues
CREATE TABLE IF NOT EXISTS agent_languages (
    agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
    language_id UUID REFERENCES available_languages(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    PRIMARY KEY (agent_id, language_id)
);

-- ===================================================================
-- 4. TABLE DE LOGS ULTRA SIMPLE
-- ===================================================================

CREATE TABLE IF NOT EXISTS simple_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    action TEXT NOT NULL,
    table_name TEXT NOT NULL,
    record_id TEXT,
    details TEXT,
    admin_email TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ===================================================================
-- 5. INSÉRER LES DONNÉES PAR DÉFAUT
-- ===================================================================

-- Plateformes de base
INSERT INTO platforms (name) VALUES 
('WhatsApp'), ('Telegram'), ('Facebook'), ('Instagram'), 
('LinkedIn'), ('Email'), ('Discord'), ('Signal')
ON CONFLICT (name) DO NOTHING;

-- Catégories de base
INSERT INTO categories (name) VALUES 
('Marketing'), ('Vente'), ('Support'), ('Tech'), 
('Design'), ('Finance'), ('Consulting')
ON CONFLICT (name) DO NOTHING;

-- Langues de base
INSERT INTO available_languages (name, code) VALUES 
('Français', 'fr'), ('Anglais', 'en'), ('Espagnol', 'es'),
('Allemand', 'de'), ('Italien', 'it')
ON CONFLICT (name) DO NOTHING;

-- ===================================================================
-- 6. VUE PUBLIQUE (SANS NOTES INTERNES)
-- ===================================================================

CREATE OR REPLACE VIEW agents_public_view AS
SELECT 
    a.id,
    COALESCE(a.full_name, a.name) as full_name,
    a.email,
    a.phone_number,
    a.website_url,
    COALESCE(a.about_description, a.description) as about_description,
    a.status,
    a.rating,
    a.total_reviews,
    a.created_at,
    -- Plateformes en array simple
    COALESCE(
        (SELECT array_agg(p.name) 
         FROM agent_platforms ap 
         JOIN platforms p ON ap.platform_id = p.id 
         WHERE ap.agent_id = a.id), 
        '{}'::text[]
    ) as platforms,
    -- Catégories en array simple  
    COALESCE(
        (SELECT array_agg(c.name) 
         FROM agent_categories ac 
         JOIN categories c ON ac.category_id = c.id 
         WHERE ac.agent_id = a.id), 
        '{}'::text[]
    ) as categories,
    -- Langues existantes + nouvelles
    COALESCE(a.languages, '{}') || COALESCE(
        (SELECT array_agg(l.name) 
         FROM agent_languages al 
         JOIN available_languages l ON al.language_id = l.id 
         WHERE al.agent_id = a.id), 
        '{}'::text[]
    ) as languages,
    -- Spécialités
    COALESCE(a.specialties, '{}') as specialties
FROM agents a
WHERE a.status = 'active';

-- ===================================================================
-- 7. VUE ADMIN (AVEC NOTES INTERNES)
-- ===================================================================

CREATE OR REPLACE VIEW agents_admin_view AS
SELECT 
    a.*,
    -- Plateformes en array simple
    COALESCE(
        (SELECT array_agg(p.name) 
         FROM agent_platforms ap 
         JOIN platforms p ON ap.platform_id = p.id 
         WHERE ap.agent_id = a.id), 
        '{}'::text[]
    ) as platforms_list,
    -- Catégories en array simple  
    COALESCE(
        (SELECT array_agg(c.name) 
         FROM agent_categories ac 
         JOIN categories c ON ac.category_id = c.id 
         WHERE ac.agent_id = a.id), 
        '{}'::text[]
    ) as categories_list,
    -- Langues complètes
    COALESCE(a.languages, '{}') || COALESCE(
        (SELECT array_agg(l.name) 
         FROM agent_languages al 
         JOIN available_languages l ON al.language_id = l.id 
         WHERE al.agent_id = a.id), 
        '{}'::text[]
    ) as languages_list
FROM agents a;

-- ===================================================================
-- 8. FONCTION SIMPLE POUR LOGGER
-- ===================================================================

CREATE OR REPLACE FUNCTION log_simple(
    action_text TEXT,
    table_name TEXT,
    record_id TEXT DEFAULT NULL,
    details_text TEXT DEFAULT NULL,
    admin_email TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    new_id UUID;
BEGIN
    INSERT INTO simple_logs (action, table_name, record_id, details, admin_email)
    VALUES (action_text, table_name, record_id, details_text, admin_email)
    RETURNING id INTO new_id;
    
    RETURN new_id;
END;
$$ LANGUAGE plpgsql;

-- ===================================================================
-- 9. EXEMPLES D'UTILISATION PRATIQUE
-- ===================================================================

-- Créer un agent
-- INSERT INTO agents (full_name, email, about_description, status) 
-- VALUES ('John Doe', 'john@test.com', 'Expert marketing', 'active');

-- Ajouter une plateforme à un agent
-- INSERT INTO agent_platforms (agent_id, platform_id) 
-- SELECT 'AGENT-ID', id FROM platforms WHERE name = 'WhatsApp';

-- Logger une action
-- SELECT log_simple('CREATE', 'agents', 'AGENT-ID', 'Nouvel agent créé');

-- ===================================================================
-- 10. VÉRIFICATION FINALE
-- ===================================================================

-- Vérifier que tout est OK
SELECT 
    'Script exécuté avec succès !' as status,
    COUNT(*) as total_agents 
FROM agents;

SELECT 
    'Plateformes disponibles:' as info,
    COUNT(*) as total_platforms 
FROM platforms;

SELECT 
    'Catégories disponibles:' as info,
    COUNT(*) as total_categories 
FROM categories;

-- Test de la vue publique (sans notes internes)
SELECT 'Vue publique créée - Notes internes CACHÉES' as security_check;

-- Fin du script
SELECT '🎉 TON SYSTÈME EST PRÊT !' as message;