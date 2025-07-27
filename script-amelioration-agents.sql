-- 🔧 AMÉLIORATION DU SYSTÈME D'AGENTS EXISTANT
-- Ajoute les nouvelles fonctionnalités sans casser l'existant

-- ===================================================================
-- 1. MISE À JOUR DE LA TABLE AGENTS EXISTANTE
-- ===================================================================

-- Ajouter les nouvelles colonnes manquantes (si elles n'existent pas)
ALTER TABLE agents 
ADD COLUMN IF NOT EXISTS full_name TEXT,
ADD COLUMN IF NOT EXISTS about_description TEXT,
ADD COLUMN IF NOT EXISTS internal_notes TEXT;

-- Migrer les données existantes vers les nouvelles colonnes
UPDATE agents 
SET 
  full_name = COALESCE(full_name, name),
  about_description = COALESCE(about_description, description),
  internal_notes = COALESCE(internal_notes, admin_notes)
WHERE full_name IS NULL OR about_description IS NULL OR internal_notes IS NULL;

-- ===================================================================
-- 2. NOUVELLES TABLES DE RÉFÉRENCE
-- ===================================================================

-- Table des plateformes
CREATE TABLE IF NOT EXISTS platforms (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table des catégories
CREATE TABLE IF NOT EXISTS categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table des langues
CREATE TABLE IF NOT EXISTS languages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    code TEXT UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ===================================================================
-- 3. TABLES DE LIAISON POUR LES RELATIONS MANY-TO-MANY
-- ===================================================================

-- Agent <-> Plateformes (remplace le champ 'platform' unique)
CREATE TABLE IF NOT EXISTS agent_platforms (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
    platform_id UUID REFERENCES platforms(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(agent_id, platform_id)
);

-- Agent <-> Catégories (remplace le champ 'category' unique)
CREATE TABLE IF NOT EXISTS agent_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(agent_id, category_id)
);

-- Agent <-> Langues (remplace le champ 'languages' array)
CREATE TABLE IF NOT EXISTS agent_languages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
    language_id UUID REFERENCES languages(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(agent_id, language_id)
);

-- ===================================================================
-- 4. TABLE DE LOGS POUR TRAÇABILITÉ
-- ===================================================================

CREATE TABLE IF NOT EXISTS action_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    action_type TEXT NOT NULL,
    table_name TEXT NOT NULL,
    record_id TEXT,
    old_values JSONB,
    new_values JSONB,
    admin_user_id TEXT,
    admin_email TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ===================================================================
-- 5. DONNÉES PAR DÉFAUT
-- ===================================================================

-- Plateformes
INSERT INTO platforms (name) VALUES 
    ('WhatsApp'), ('Telegram'), ('WeChat'), ('Signal'), ('Discord'),
    ('LinkedIn'), ('Facebook'), ('Instagram'), ('Twitter'), ('Email')
ON CONFLICT (name) DO NOTHING;

-- Catégories
INSERT INTO categories (name) VALUES 
    ('Technologie'), ('Marketing'), ('Vente'), ('Support Client'),
    ('Développement'), ('Design'), ('Finance'), ('Consulting')
ON CONFLICT (name) DO NOTHING;

-- Langues
INSERT INTO languages (name, code) VALUES 
    ('Français', 'fr'), ('Anglais', 'en'), ('Espagnol', 'es'),
    ('Allemand', 'de'), ('Italien', 'it'), ('Chinois', 'zh')
ON CONFLICT (name) DO NOTHING;

-- ===================================================================
-- 6. MIGRATION DES DONNÉES EXISTANTES
-- ===================================================================

-- Migrer les plateformes existantes
INSERT INTO agent_platforms (agent_id, platform_id)
SELECT 
    a.id,
    p.id
FROM agents a
JOIN platforms p ON LOWER(p.name) = LOWER(a.platform)
WHERE a.platform IS NOT NULL
ON CONFLICT (agent_id, platform_id) DO NOTHING;

-- Migrer les catégories existantes
INSERT INTO agent_categories (agent_id, category_id)
SELECT 
    a.id,
    c.id
FROM agents a
JOIN categories c ON LOWER(c.name) = LOWER(a.category)
WHERE a.category IS NOT NULL
ON CONFLICT (agent_id, category_id) DO NOTHING;

-- ===================================================================
-- 7. VUES AMÉLIORÉES
-- ===================================================================

-- Vue complète pour admin (avec notes internes)
CREATE OR REPLACE VIEW agents_complete_admin AS
SELECT 
    a.id,
    COALESCE(a.full_name, a.name) as full_name,
    a.name,
    a.identifier,
    a.phone_number,
    a.email,
    a.website_url,
    COALESCE(a.about_description, a.description) as about_description,
    COALESCE(a.internal_notes, a.admin_notes) as internal_notes,
    a.status,
    a.rating,
    a.total_reviews,
    a.created_at,
    a.updated_at,
    COALESCE(
        JSON_AGG(DISTINCT jsonb_build_object('id', p.id, 'name', p.name)) FILTER (WHERE p.id IS NOT NULL), 
        '[]'::json
    ) as platforms,
    COALESCE(
        JSON_AGG(DISTINCT jsonb_build_object('id', c.id, 'name', c.name)) FILTER (WHERE c.id IS NOT NULL), 
        '[]'::json
    ) as categories,
    COALESCE(
        JSON_AGG(DISTINCT jsonb_build_object('id', l.id, 'name', l.name, 'code', l.code)) FILTER (WHERE l.id IS NOT NULL), 
        '[]'::json
    ) as languages
FROM agents a
LEFT JOIN agent_platforms ap ON a.id = ap.agent_id
LEFT JOIN platforms p ON ap.platform_id = p.id
LEFT JOIN agent_categories ac ON a.id = ac.agent_id
LEFT JOIN categories c ON ac.category_id = c.id
LEFT JOIN agent_languages al ON a.id = al.agent_id
LEFT JOIN languages l ON al.language_id = l.id
GROUP BY a.id, a.name, a.identifier, a.full_name, a.phone_number, a.email, 
         a.website_url, a.about_description, a.internal_notes, a.description, 
         a.admin_notes, a.status, a.rating, a.total_reviews, a.created_at, a.updated_at;

-- Vue publique pour clients (sans notes internes)
CREATE OR REPLACE VIEW agents_public AS
SELECT 
    a.id,
    COALESCE(a.full_name, a.name) as full_name,
    a.phone_number,
    a.email,
    a.website_url,
    COALESCE(a.about_description, a.description) as about_description,
    a.status,
    a.rating,
    a.total_reviews,
    a.created_at,
    COALESCE(
        JSON_AGG(DISTINCT p.name) FILTER (WHERE p.name IS NOT NULL), 
        '[]'::json
    ) as platforms,
    COALESCE(
        JSON_AGG(DISTINCT c.name) FILTER (WHERE c.name IS NOT NULL), 
        '[]'::json
    ) as categories,
    COALESCE(
        JSON_AGG(DISTINCT l.name) FILTER (WHERE l.name IS NOT NULL), 
        '[]'::json
    ) as languages
FROM agents a
LEFT JOIN agent_platforms ap ON a.id = ap.agent_id
LEFT JOIN platforms p ON ap.platform_id = p.id
LEFT JOIN agent_categories ac ON a.id = ac.agent_id
LEFT JOIN categories c ON ac.category_id = c.id
LEFT JOIN agent_languages al ON a.id = al.agent_id
LEFT JOIN languages l ON al.language_id = l.id
WHERE a.status = 'active'
GROUP BY a.id, a.full_name, a.name, a.phone_number, a.email, a.website_url, 
         a.about_description, a.description, a.status, a.rating, a.total_reviews, a.created_at;

-- ===================================================================
-- 8. FONCTION POUR LOGS AUTOMATIQUES
-- ===================================================================

CREATE OR REPLACE FUNCTION log_action(
    p_action_type TEXT,
    p_table_name TEXT,
    p_record_id TEXT DEFAULT NULL,
    p_old_values JSONB DEFAULT NULL,
    p_new_values JSONB DEFAULT NULL,
    p_admin_user_id TEXT DEFAULT NULL,
    p_admin_email TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    log_id UUID;
BEGIN
    INSERT INTO action_logs (
        action_type, table_name, record_id, old_values, new_values,
        admin_user_id, admin_email
    ) VALUES (
        p_action_type, p_table_name, p_record_id, p_old_values, p_new_values,
        p_admin_user_id, p_admin_email
    ) RETURNING id INTO log_id;
    
    RETURN log_id;
END;
$$ LANGUAGE plpgsql;

-- ===================================================================
-- 9. VÉRIFICATION
-- ===================================================================

SELECT 'Amélioration terminée avec succès ! 🎉' as message,
       'Votre système d''agents est maintenant plus puissant !' as details;