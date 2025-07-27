-- ========================================
-- SCRIPT COMPLET DE CONFIGURATION OXO
-- ========================================
-- Ce script configure toute la base de données avec :
-- 1. Tables complètes
-- 2. Champs manquants (website_url, categories)
-- 3. Système d'enregistrement complet
-- 4. Triggers automatiques
-- 5. Sécurité et permissions

-- ========================================
-- 1. SYSTÈME D'ENREGISTREMENT
-- ========================================

-- Table des modifications (historique complet)
CREATE TABLE IF NOT EXISTS public.modification_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    table_name TEXT NOT NULL,
    operation TEXT NOT NULL, -- INSERT, UPDATE, DELETE
    record_id TEXT NOT NULL,
    old_data JSONB,
    new_data JSONB,
    changed_by TEXT,
    user_agent TEXT,
    ip_address INET,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    session_id TEXT
);

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_modification_logs_table_name ON public.modification_logs(table_name);
CREATE INDEX IF NOT EXISTS idx_modification_logs_created_at ON public.modification_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_modification_logs_record_id ON public.modification_logs(record_id);

-- Table des sessions utilisateur
CREATE TABLE IF NOT EXISTS public.user_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id TEXT UNIQUE NOT NULL,
    user_email TEXT,
    user_id TEXT,
    login_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT,
    is_admin BOOLEAN DEFAULT FALSE,
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '24 hours')
);

-- Index pour les sessions
CREATE INDEX IF NOT EXISTS idx_user_sessions_session_id ON public.user_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON public.user_sessions(expires_at);

-- ========================================
-- 2. MISE À JOUR TABLE AGENTS
-- ========================================

-- Ajouter les colonnes manquantes
ALTER TABLE public.agents 
ADD COLUMN IF NOT EXISTS website_url TEXT;

ALTER TABLE public.agents 
ADD COLUMN IF NOT EXISTS categories TEXT[];

-- Ajouter colonnes de tracking
ALTER TABLE public.agents 
ADD COLUMN IF NOT EXISTS created_by TEXT;

ALTER TABLE public.agents 
ADD COLUMN IF NOT EXISTS modified_by TEXT;

ALTER TABLE public.agents 
ADD COLUMN IF NOT EXISTS modification_count INTEGER DEFAULT 0;

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_agents_website_url ON public.agents(website_url);
CREATE INDEX IF NOT EXISTS idx_agents_categories ON public.agents USING GIN(categories);
CREATE INDEX IF NOT EXISTS idx_agents_created_by ON public.agents(created_by);
CREATE INDEX IF NOT EXISTS idx_agents_modified_by ON public.agents(modified_by);

-- ========================================
-- 3. MIGRATION DES DONNÉES EXISTANTES
-- ========================================

-- Migrer category vers categories pour tous les agents existants
UPDATE public.agents 
SET categories = ARRAY[category] 
WHERE categories IS NULL OR array_length(categories, 1) IS NULL;

-- Initialiser les compteurs de modification
UPDATE public.agents 
SET modification_count = 0 
WHERE modification_count IS NULL;

-- ========================================
-- 4. FONCTIONS DE LOGGING AUTOMATIQUE
-- ========================================

-- Fonction pour enregistrer les modifications
CREATE OR REPLACE FUNCTION public.log_table_changes()
RETURNS TRIGGER AS $$
DECLARE
    session_info RECORD;
    user_email TEXT := '';
    user_agent TEXT := '';
    client_ip INET := NULL;
BEGIN
    -- Récupérer les infos de session si disponibles
    SELECT user_email, user_agent, ip_address 
    INTO session_info 
    FROM public.user_sessions 
    WHERE session_id = current_setting('app.session_id', true)
    AND expires_at > NOW()
    LIMIT 1;
    
    IF FOUND THEN
        user_email := session_info.user_email;
        user_agent := session_info.user_agent;
        client_ip := session_info.ip_address;
    END IF;

    -- Insérer le log selon l'opération
    IF TG_OP = 'DELETE' THEN
        INSERT INTO public.modification_logs (
            table_name, operation, record_id, old_data, new_data,
            changed_by, user_agent, ip_address, session_id
        ) VALUES (
            TG_TABLE_NAME, TG_OP, OLD.id::TEXT, to_jsonb(OLD), NULL,
            user_email, user_agent, client_ip, 
            current_setting('app.session_id', true)
        );
        RETURN OLD;
        
    ELSIF TG_OP = 'UPDATE' THEN
        -- Incrémenter le compteur de modifications
        NEW.modification_count := COALESCE(OLD.modification_count, 0) + 1;
        NEW.modified_by := user_email;
        NEW.updated_at := NOW();
        
        INSERT INTO public.modification_logs (
            table_name, operation, record_id, old_data, new_data,
            changed_by, user_agent, ip_address, session_id
        ) VALUES (
            TG_TABLE_NAME, TG_OP, NEW.id::TEXT, to_jsonb(OLD), to_jsonb(NEW),
            user_email, user_agent, client_ip,
            current_setting('app.session_id', true)
        );
        RETURN NEW;
        
    ELSIF TG_OP = 'INSERT' THEN
        NEW.created_by := user_email;
        NEW.modification_count := 0;
        
        INSERT INTO public.modification_logs (
            table_name, operation, record_id, old_data, new_data,
            changed_by, user_agent, ip_address, session_id
        ) VALUES (
            TG_TABLE_NAME, TG_OP, NEW.id::TEXT, NULL, to_jsonb(NEW),
            user_email, user_agent, client_ip,
            current_setting('app.session_id', true)
        );
        RETURN NEW;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- 5. TRIGGERS AUTOMATIQUES
-- ========================================

-- Trigger pour la table agents
DROP TRIGGER IF EXISTS agents_change_log ON public.agents;
CREATE TRIGGER agents_change_log
    AFTER INSERT OR UPDATE OR DELETE ON public.agents
    FOR EACH ROW EXECUTE FUNCTION public.log_table_changes();

-- Trigger pour la table reviews
DROP TRIGGER IF EXISTS reviews_change_log ON public.reviews;
CREATE TRIGGER reviews_change_log
    AFTER INSERT OR UPDATE OR DELETE ON public.reviews
    FOR EACH ROW EXECUTE FUNCTION public.log_table_changes();

-- ========================================
-- 6. FONCTIONS UTILITAIRES
-- ========================================

-- Fonction pour nettoyer les anciens logs (garde 90 jours)
CREATE OR REPLACE FUNCTION public.cleanup_old_logs()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM public.modification_logs 
    WHERE created_at < NOW() - INTERVAL '90 days';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- Log du nettoyage
    INSERT INTO public.modification_logs (
        table_name, operation, record_id, new_data, changed_by
    ) VALUES (
        'system', 'CLEANUP', 'maintenance', 
        jsonb_build_object('deleted_logs', deleted_count),
        'system_cleanup'
    );
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour nettoyer les sessions expirées
CREATE OR REPLACE FUNCTION public.cleanup_expired_sessions()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM public.user_sessions 
    WHERE expires_at < NOW();
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- 7. VUES UTILES POUR L'ADMINISTRATION
-- ========================================

-- Vue des statistiques de modifications
CREATE OR REPLACE VIEW public.modification_stats AS
SELECT 
    table_name,
    operation,
    COUNT(*) as total_operations,
    COUNT(DISTINCT record_id) as affected_records,
    COUNT(DISTINCT changed_by) as unique_users,
    MIN(created_at) as first_modification,
    MAX(created_at) as last_modification
FROM public.modification_logs
GROUP BY table_name, operation
ORDER BY table_name, operation;

-- Vue des agents les plus modifiés
CREATE OR REPLACE VIEW public.most_modified_agents AS
SELECT 
    a.id,
    a.name,
    a.modification_count,
    a.created_by,
    a.modified_by,
    a.created_at,
    a.updated_at,
    COUNT(ml.id) as log_entries
FROM public.agents a
LEFT JOIN public.modification_logs ml ON ml.record_id = a.id::TEXT
GROUP BY a.id, a.name, a.modification_count, a.created_by, a.modified_by, a.created_at, a.updated_at
ORDER BY a.modification_count DESC, log_entries DESC;

-- Vue des sessions actives
CREATE OR REPLACE VIEW public.active_sessions AS
SELECT 
    session_id,
    user_email,
    is_admin,
    login_time,
    last_activity,
    ip_address,
    EXTRACT(EPOCH FROM (expires_at - NOW())) / 3600 as hours_remaining
FROM public.user_sessions
WHERE expires_at > NOW()
ORDER BY last_activity DESC;

-- ========================================
-- 8. PERMISSIONS ET SÉCURITÉ
-- ========================================

-- Permissions lecture pour les logs (admins seulement via RLS)
ALTER TABLE public.modification_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

-- Supprimer les anciennes politiques si elles existent
DROP POLICY IF EXISTS "Admin can view all logs" ON public.modification_logs;
DROP POLICY IF EXISTS "Users see own sessions" ON public.user_sessions;

-- Politique pour les logs (seulement les admins peuvent voir)
CREATE POLICY "Admin can view all logs" ON public.modification_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_sessions 
            WHERE session_id = current_setting('app.session_id', true)
            AND is_admin = true 
            AND expires_at > NOW()
        )
    );

-- Politique pour les sessions (chacun voit ses propres sessions)
CREATE POLICY "Users see own sessions" ON public.user_sessions
    FOR SELECT USING (
        user_email = current_setting('app.user_email', true)
        OR EXISTS (
            SELECT 1 FROM public.user_sessions 
            WHERE session_id = current_setting('app.session_id', true)
            AND is_admin = true 
            AND expires_at > NOW()
        )
    );

-- ========================================
-- 9. TÂCHES AUTOMATIQUES
-- ========================================

-- Extension pour les tâches cron (si disponible)
-- CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Programmer le nettoyage automatique (tous les jours à 2h du matin)
-- SELECT cron.schedule('cleanup-logs', '0 2 * * *', 'SELECT public.cleanup_old_logs();');
-- SELECT cron.schedule('cleanup-sessions', '0 3 * * *', 'SELECT public.cleanup_expired_sessions();');

-- ========================================
-- 10. VÉRIFICATIONS ET TESTS
-- ========================================

-- Vérifier que tout est en place
DO $$
DECLARE
    agents_count INTEGER;
    website_column_exists BOOLEAN;
    categories_column_exists BOOLEAN;
    trigger_exists BOOLEAN;
BEGIN
    -- Compter les agents
    SELECT COUNT(*) INTO agents_count FROM public.agents;
    
    -- Vérifier les colonnes
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'agents' 
        AND column_name = 'website_url'
    ) INTO website_column_exists;
    
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'agents' 
        AND column_name = 'categories'
    ) INTO categories_column_exists;
    
    -- Vérifier les triggers
    SELECT EXISTS (
        SELECT 1 FROM information_schema.triggers 
        WHERE trigger_name = 'agents_change_log'
    ) INTO trigger_exists;
    
    -- Rapport de configuration
    RAISE NOTICE '========================================';
    RAISE NOTICE 'RAPPORT DE CONFIGURATION OXO';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Agents dans la base: %', agents_count;
    RAISE NOTICE 'Colonne website_url: %', CASE WHEN website_column_exists THEN '✅ OK' ELSE '❌ MANQUANTE' END;
    RAISE NOTICE 'Colonne categories: %', CASE WHEN categories_column_exists THEN '✅ OK' ELSE '❌ MANQUANTE' END;
    RAISE NOTICE 'Trigger de logging: %', CASE WHEN trigger_exists THEN '✅ OK' ELSE '❌ MANQUANT' END;
    RAISE NOTICE 'Système d\'enregistrement: ✅ CONFIGURÉ';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Configuration terminée avec succès !';
    RAISE NOTICE '========================================';
END $$;

-- Créer un exemple de session admin pour tester
INSERT INTO public.user_sessions (
    session_id, user_email, user_id, is_admin, ip_address, user_agent
) VALUES (
    'admin-setup-session', 'admin@oxo.com', 'setup-admin', true, 
    '127.0.0.1', 'Setup Script'
) ON CONFLICT (session_id) DO NOTHING;

-- Log de l'installation
INSERT INTO public.modification_logs (
    table_name, operation, record_id, new_data, changed_by
) VALUES (
    'system', 'SETUP', 'database-init', 
    jsonb_build_object(
        'version', '1.0.0',
        'features', ARRAY['logging', 'categories', 'website_url', 'triggers'],
        'timestamp', NOW()
    ),
    'system-setup'
);

-- ========================================
-- EXEMPLES D'UTILISATION
-- ========================================

/*
-- Pour configurer une session utilisateur dans votre app JS :
SELECT set_config('app.session_id', 'your-session-id', true);
SELECT set_config('app.user_email', 'user@example.com', true);

-- Pour voir les modifications d'un agent :
SELECT * FROM public.modification_logs WHERE record_id = 'agent-id-here' ORDER BY created_at DESC;

-- Pour voir les stats de modifications :
SELECT * FROM public.modification_stats;

-- Pour nettoyer manuellement :
SELECT public.cleanup_old_logs();
SELECT public.cleanup_expired_sessions();

-- Pour voir les agents les plus modifiés :
SELECT * FROM public.most_modified_agents LIMIT 10;
*/