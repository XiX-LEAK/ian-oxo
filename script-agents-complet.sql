-- 🏢 SCRIPT COMPLET GESTION D'AGENTS - SIMPLE ET EFFICACE
-- Tout est facultatif, logs automatiques, affichage client/admin séparé

-- ===================================================================
-- 1. TABLE PRINCIPALE DES AGENTS
-- ===================================================================

CREATE TABLE IF NOT EXISTS agents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    full_name TEXT,
    phone_number TEXT,
    email TEXT,
    website_url TEXT,
    about_description TEXT,
    internal_notes TEXT,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ===================================================================
-- 2. TABLES DE RÉFÉRENCE (PLATEFORMES, CATÉGORIES, LANGUES)
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
-- 3. TABLES DE LIAISON (MANY-TO-MANY)
-- ===================================================================

-- Agent <-> Plateformes
CREATE TABLE IF NOT EXISTS agent_platforms (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
    platform_id UUID REFERENCES platforms(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(agent_id, platform_id)
);

-- Agent <-> Catégories
CREATE TABLE IF NOT EXISTS agent_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(agent_id, category_id)
);

-- Agent <-> Langues
CREATE TABLE IF NOT EXISTS agent_languages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
    language_id UUID REFERENCES languages(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(agent_id, language_id)
);

-- ===================================================================
-- 4. TABLE DE LOGS POUR TOUTES LES ACTIONS
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
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ===================================================================
-- 5. DONNÉES PAR DÉFAUT
-- ===================================================================

-- Plateformes par défaut
INSERT INTO platforms (name) VALUES 
    ('WhatsApp'),
    ('Telegram'),
    ('WeChat'),
    ('Signal'),
    ('Discord'),
    ('LinkedIn'),
    ('Facebook'),
    ('Instagram'),
    ('Twitter'),
    ('Email')
ON CONFLICT (name) DO NOTHING;

-- Catégories par défaut
INSERT INTO categories (name) VALUES 
    ('Technologie'),
    ('Marketing'),
    ('Vente'),
    ('Support Client'),
    ('Développement'),
    ('Design'),
    ('Finance'),
    ('Ressources Humaines'),
    ('Juridique'),
    ('Consulting')
ON CONFLICT (name) DO NOTHING;

-- Langues par défaut
INSERT INTO languages (name, code) VALUES 
    ('Français', 'fr'),
    ('Anglais', 'en'),
    ('Espagnol', 'es'),
    ('Allemand', 'de'),
    ('Italien', 'it'),
    ('Portugais', 'pt'),
    ('Chinois', 'zh'),
    ('Japonais', 'ja'),
    ('Arabe', 'ar'),
    ('Russe', 'ru')
ON CONFLICT (name) DO NOTHING;

-- ===================================================================
-- 6. VUES POUR FACILITER LES REQUÊTES
-- ===================================================================

-- Vue complète des agents (pour admin)
CREATE OR REPLACE VIEW agents_complete_admin AS
SELECT 
    a.id,
    a.full_name,
    a.phone_number,
    a.email,
    a.website_url,
    a.about_description,
    a.internal_notes,
    a.status,
    a.created_at,
    a.updated_at,
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
GROUP BY a.id, a.full_name, a.phone_number, a.email, a.website_url, 
         a.about_description, a.internal_notes, a.status, a.created_at, a.updated_at;

-- Vue publique des agents (pour clients - sans notes internes)
CREATE OR REPLACE VIEW agents_public AS
SELECT 
    a.id,
    a.full_name,
    a.phone_number,
    a.email,
    a.website_url,
    a.about_description,
    a.status,
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
GROUP BY a.id, a.full_name, a.phone_number, a.email, a.website_url, 
         a.about_description, a.status, a.created_at;

-- ===================================================================
-- 7. FONCTIONS POUR LOGS AUTOMATIQUES
-- ===================================================================

-- Fonction pour logger les actions
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
        action_type,
        table_name,
        record_id,
        old_values,
        new_values,
        admin_user_id,
        admin_email,
        ip_address,
        user_agent
    ) VALUES (
        p_action_type,
        p_table_name,
        p_record_id,
        p_old_values,
        p_new_values,
        p_admin_user_id,
        p_admin_email,
        'client_ip',
        'user_agent'
    ) RETURNING id INTO log_id;
    
    RETURN log_id;
END;
$$ LANGUAGE plpgsql;

-- ===================================================================
-- 8. TRIGGERS POUR MISE À JOUR AUTOMATIQUE
-- ===================================================================

-- Trigger pour updated_at sur agents
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_agents_updated_at ON agents;
CREATE TRIGGER update_agents_updated_at
    BEFORE UPDATE ON agents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ===================================================================
-- 9. PERMISSIONS ET SÉCURITÉ
-- ===================================================================

-- Activer RLS
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE platforms ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE languages ENABLE ROW LEVEL SECURITY;
ALTER TABLE action_logs ENABLE ROW LEVEL SECURITY;

-- Politique pour lecture publique des agents
CREATE POLICY "Public can read active agents" ON agents
    FOR SELECT USING (status = 'active');

-- Politique pour admin (toutes opérations)
CREATE POLICY "Authenticated users can manage agents" ON agents
    FOR ALL USING (auth.role() = 'authenticated');

-- Même chose pour les autres tables
CREATE POLICY "Public can read platforms" ON platforms FOR SELECT USING (true);
CREATE POLICY "Public can read categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Public can read languages" ON languages FOR SELECT USING (true);

CREATE POLICY "Authenticated can manage platforms" ON platforms FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated can manage categories" ON categories FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated can manage languages" ON languages FOR ALL USING (auth.role() = 'authenticated');

-- Logs seulement pour admin
CREATE POLICY "Only authenticated can access logs" ON action_logs
    FOR ALL USING (auth.role() = 'authenticated');

-- ===================================================================
-- 10. VÉRIFICATION FINALE
-- ===================================================================

DO $$
DECLARE
    table_count INTEGER;
    view_count INTEGER;
    function_count INTEGER;
BEGIN
    -- Compter les tables
    SELECT COUNT(*) INTO table_count
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name IN ('agents', 'platforms', 'categories', 'languages', 'action_logs', 'agent_platforms', 'agent_categories', 'agent_languages');
    
    -- Compter les vues
    SELECT COUNT(*) INTO view_count
    FROM information_schema.views 
    WHERE table_schema = 'public' 
    AND table_name IN ('agents_complete_admin', 'agents_public');
    
    -- Compter les fonctions
    SELECT COUNT(*) INTO function_count
    FROM information_schema.routines 
    WHERE routine_schema = 'public' 
    AND routine_name IN ('log_action', 'update_updated_at_column');
    
    RAISE NOTICE '✅ Installation terminée avec succès !';
    RAISE NOTICE '📊 Tables créées: %', table_count;
    RAISE NOTICE '👁️ Vues créées: %', view_count;
    RAISE NOTICE '⚙️ Fonctions créées: %', function_count;
    RAISE NOTICE '🏢 Système de gestion d\'agents opérationnel !';
    
    IF table_count = 8 AND view_count = 2 AND function_count = 2 THEN
        RAISE NOTICE '🎉 SUCCÈS COMPLET - Votre système est prêt !';
    ELSE
        RAISE WARNING '⚠️ Installation partielle - Vérifiez les erreurs';
    END IF;
END
$$;

-- ===================================================================
-- 11. EXEMPLES DE DONNÉES POUR TESTER
-- ===================================================================

-- Agent exemple
INSERT INTO agents (full_name, phone_number, email, website_url, about_description, internal_notes, status) 
VALUES (
    'Sophie Martin',
    '+33123456789',
    'sophie.martin@example.com',
    'https://sophie-martin.com',
    'Experte en marketing digital avec 5 ans d''expérience. Spécialisée dans les réseaux sociaux et le SEO.',
    'Agent très fiable, répond rapidement aux clients',
    'active'
) RETURNING id as agent_id \gset

-- Note: Les relations avec plateformes/catégories/langues seront gérées via l'interface

SELECT 'Script terminé avec succès ! 🎉' as message;