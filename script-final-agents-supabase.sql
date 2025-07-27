-- 🚀 SCRIPT FINAL AGENTS - SIMPLE ET QUI MARCHE
-- Tout ce dont tu as besoin pour ton système d'agents

-- ===================================================================
-- 1. AMÉLIORER TABLE AGENTS EXISTANTE
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
-- 4. TABLE DE LOGS SUPER SIMPLE
-- ===================================================================

CREATE TABLE IF NOT EXISTS action_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    action_type TEXT NOT NULL,
    table_name TEXT NOT NULL,
    record_id TEXT,
    details TEXT,
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

-- Vue publique (SANS NOTES INTERNES)
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
-- 7. FONCTION SIMPLE POUR LOGS
-- ===================================================================

CREATE OR REPLACE FUNCTION simple_log(
    action_type TEXT,
    table_name TEXT,
    record_id TEXT DEFAULT NULL,
    details TEXT DEFAULT NULL,
    admin_email TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    log_id UUID;
BEGIN
    INSERT INTO action_logs (action_type, table_name, record_id, details, admin_email)
    VALUES (action_type, table_name, record_id, details, admin_email)
    RETURNING id INTO log_id;
    
    RETURN log_id;
END;
$$ LANGUAGE plpgsql;

-- ===================================================================
-- 8. POLITIQUE DE SÉCURITÉ (RLS)
-- ===================================================================

-- Activer RLS sur la vue publique
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;

-- Politique : tout le monde peut voir les agents actifs publiquement
CREATE POLICY "Public agents visible to all" ON agents
    FOR SELECT USING (status = 'active');

-- ===================================================================
-- 9. EXEMPLES D'UTILISATION
-- ===================================================================

-- Exemple : Ajouter un agent
-- INSERT INTO agents (full_name, email, phone_number, about_description, status)
-- VALUES ('John Doe', 'john@example.com', '+33123456789', 'Expert en marketing', 'active');

-- Exemple : Ajouter une plateforme à un agent
-- INSERT INTO agent_platforms (agent_id, platform_id)
-- SELECT '[ID_AGENT]', id FROM platforms WHERE name = 'WhatsApp';

-- Exemple : Logger une action
-- SELECT simple_log('CREATE', 'agents', '[ID_AGENT]', 'Nouvel agent créé', 'admin@site.com');

-- ===================================================================
-- 10. VÉRIFICATION FINALE
-- ===================================================================

SELECT 'Script terminé avec succès ! 🎉' as message,
       'Ton système d''agents est prêt !' as status;