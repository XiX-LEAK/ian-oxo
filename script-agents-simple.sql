-- 🏢 SCRIPT SIMPLE POUR AGENTS - QUI MARCHE
-- Améliore ton système existant sans casser

-- ===================================================================
-- 1. AMÉLIORER LA TABLE AGENTS EXISTANTE
-- ===================================================================

-- Ajouter les nouvelles colonnes
ALTER TABLE agents 
ADD COLUMN IF NOT EXISTS full_name TEXT,
ADD COLUMN IF NOT EXISTS about_description TEXT,
ADD COLUMN IF NOT EXISTS internal_notes TEXT;

-- Migrer les données existantes
UPDATE agents 
SET 
  full_name = COALESCE(full_name, name),
  about_description = COALESCE(about_description, description),
  internal_notes = COALESCE(internal_notes, admin_notes)
WHERE full_name IS NULL OR about_description IS NULL OR internal_notes IS NULL;

-- ===================================================================
-- 2. TABLES DE RÉFÉRENCE
-- ===================================================================

-- Plateformes
CREATE TABLE IF NOT EXISTS platforms (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Catégories
CREATE TABLE IF NOT EXISTS categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Langues
CREATE TABLE IF NOT EXISTS languages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    code TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ===================================================================
-- 3. TABLES DE LIAISON
-- ===================================================================

-- Agent - Plateformes
CREATE TABLE IF NOT EXISTS agent_platforms (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
    platform_id UUID REFERENCES platforms(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(agent_id, platform_id)
);

-- Agent - Catégories
CREATE TABLE IF NOT EXISTS agent_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(agent_id, category_id)
);

-- Agent - Langues
CREATE TABLE IF NOT EXISTS agent_languages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
    language_id UUID REFERENCES languages(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(agent_id, language_id)
);

-- ===================================================================
-- 4. TABLE DE LOGS SIMPLE
-- ===================================================================

CREATE TABLE IF NOT EXISTS action_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    action_type TEXT NOT NULL,
    table_name TEXT NOT NULL,
    record_id TEXT,
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
-- 6. VUES SIMPLES
-- ===================================================================

-- Vue admin (avec notes internes)
CREATE OR REPLACE VIEW agents_admin AS
SELECT 
    a.*,
    array_agg(DISTINCT p.name) FILTER (WHERE p.name IS NOT NULL) as platforms,
    array_agg(DISTINCT c.name) FILTER (WHERE c.name IS NOT NULL) as categories,
    array_agg(DISTINCT l.name) FILTER (WHERE l.name IS NOT NULL) as languages
FROM agents a
LEFT JOIN agent_platforms ap ON a.id = ap.agent_id
LEFT JOIN platforms p ON ap.platform_id = p.id
LEFT JOIN agent_categories ac ON a.id = ac.agent_id
LEFT JOIN categories c ON ac.category_id = c.id
LEFT JOIN agent_languages al ON a.id = al.agent_id
LEFT JOIN languages l ON al.language_id = l.id
GROUP BY a.id;

-- Vue publique (sans notes internes)
CREATE OR REPLACE VIEW agents_public AS
SELECT 
    a.id,
    COALESCE(a.full_name, a.name) as full_name,
    a.phone_number,
    a.email,
    a.website_url,
    COALESCE(a.about_description, a.description) as about_description,
    a.status,
    a.created_at,
    array_agg(DISTINCT p.name) FILTER (WHERE p.name IS NOT NULL) as platforms,
    array_agg(DISTINCT c.name) FILTER (WHERE c.name IS NOT NULL) as categories,
    array_agg(DISTINCT l.name) FILTER (WHERE l.name IS NOT NULL) as languages
FROM agents a
LEFT JOIN agent_platforms ap ON a.id = ap.agent_id
LEFT JOIN platforms p ON ap.platform_id = p.id
LEFT JOIN agent_categories ac ON a.id = ac.agent_id
LEFT JOIN categories c ON ac.category_id = c.id
LEFT JOIN agent_languages al ON a.id = al.agent_id
LEFT JOIN languages l ON al.language_id = l.id
WHERE a.status = 'active'
GROUP BY a.id, a.full_name, a.name, a.phone_number, a.email, 
         a.website_url, a.about_description, a.description, a.status, a.created_at;

-- ===================================================================
-- 7. VÉRIFICATION
-- ===================================================================

SELECT 'Script terminé avec succès !' as message;