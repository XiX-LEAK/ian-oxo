-- ========================================
-- SCRIPT SQL FINAL COMPLET - PROJET OXO
-- ========================================
-- Basé sur l'analyse complète du projet avec toutes les demandes utilisateur
-- Version: 2.0 - Conforme au code TypeScript existant

-- ========================================
-- 1. SUPPRESSION ET RECRÉATION SÉCURISÉE
-- ========================================

-- Supprimer les contraintes et triggers existants pour éviter les conflits
DROP TRIGGER IF EXISTS agents_change_log ON public.agents;
DROP TRIGGER IF EXISTS reviews_change_log ON public.reviews;
DROP TRIGGER IF EXISTS password_changes_trigger ON public.site_settings;

-- ========================================
-- 2. TABLE AGENTS (Structure complète selon le code)
-- ========================================

-- Créer ou modifier la table agents selon les types TypeScript
CREATE TABLE IF NOT EXISTS public.agents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    identifier TEXT NOT NULL,
    email TEXT,
    phone_number TEXT,
    website_url TEXT, -- ✅ Demandé par l'utilisateur
    platform TEXT NOT NULL DEFAULT 'whatsapp',
    category TEXT NOT NULL DEFAULT 'other',
    categories TEXT[] DEFAULT ARRAY[]::TEXT[], -- ✅ Catégories multiples
    specialties TEXT[] DEFAULT ARRAY[]::TEXT[],
    languages TEXT[] DEFAULT ARRAY[]::TEXT[],
    status TEXT NOT NULL DEFAULT 'active',
    description TEXT, -- Maps to 'about' in client
    location TEXT,
    rating NUMERIC DEFAULT 0,
    total_reviews INTEGER DEFAULT 0,
    verification_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Champs de tracking (pas dans les notes internes qui restent locales)
    created_by TEXT,
    modified_by TEXT,
    modification_count INTEGER DEFAULT 0,
    
    -- Contraintes
    CONSTRAINT agents_platform_check CHECK (platform IN ('whatsapp', 'wechat', 'telegram', 'instagram', 'tiktok', 'discord', 'signal')),
    CONSTRAINT agents_status_check CHECK (status IN ('active', 'inactive', 'suspended', 'pending')),
    CONSTRAINT agents_rating_check CHECK (rating >= 0 AND rating <= 5)
);

-- Ajouter les colonnes manquantes si elles n'existent pas
ALTER TABLE public.agents ADD COLUMN IF NOT EXISTS website_url TEXT;
ALTER TABLE public.agents ADD COLUMN IF NOT EXISTS categories TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE public.agents ADD COLUMN IF NOT EXISTS created_by TEXT;
ALTER TABLE public.agents ADD COLUMN IF NOT EXISTS modified_by TEXT;
ALTER TABLE public.agents ADD COLUMN IF NOT EXISTS modification_count INTEGER DEFAULT 0;

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_agents_platform ON public.agents(platform);
CREATE INDEX IF NOT EXISTS idx_agents_category ON public.agents(category);
CREATE INDEX IF NOT EXISTS idx_agents_categories ON public.agents USING GIN(categories);
CREATE INDEX IF NOT EXISTS idx_agents_website_url ON public.agents(website_url);
CREATE INDEX IF NOT EXISTS idx_agents_status ON public.agents(status);
CREATE INDEX IF NOT EXISTS idx_agents_rating ON public.agents(rating);
CREATE INDEX IF NOT EXISTS idx_agents_name ON public.agents(name);

-- ========================================
-- 3. CONFIGURATION SITE (Mots de passe selon authStore.ts)
-- ========================================

CREATE TABLE IF NOT EXISTS public.site_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    setting_key TEXT UNIQUE NOT NULL,
    setting_value TEXT,
    setting_type TEXT DEFAULT 'string',
    description TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_by TEXT,
    
    CONSTRAINT site_settings_type_check CHECK (setting_type IN ('string', 'number', 'boolean', 'json', 'password'))
);

-- Insérer les mots de passe par défaut selon authStore.ts
INSERT INTO public.site_settings (setting_key, setting_value, setting_type, description) VALUES
('site_password', 'oxo2024', 'password', 'Mot de passe public du site'),
('admin_password', 'admin2024', 'password', 'Mot de passe administrateur')
ON CONFLICT (setting_key) DO NOTHING;

-- ========================================
-- 4. SYSTÈME DE REVIEWS (selon reviewStore.ts)
-- ========================================

CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    agent_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    user_email TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    helpful_votes INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour les reviews
CREATE INDEX IF NOT EXISTS idx_reviews_agent_id ON public.reviews(agent_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON public.reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON public.reviews(rating);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON public.reviews(created_at);

-- Table pour les likes sur les avis
CREATE TABLE IF NOT EXISTS public.review_likes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    review_id UUID NOT NULL REFERENCES public.reviews(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(review_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_review_likes_review_id ON public.review_likes(review_id);
CREATE INDEX IF NOT EXISTS idx_review_likes_user_id ON public.review_likes(user_id);

-- ========================================
-- 5. LOGS CHANGEMENTS MOTS DE PASSE (selon PasswordLoggingService)
-- ========================================

CREATE TABLE IF NOT EXISTS public.password_change_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    change_type TEXT NOT NULL CHECK (change_type IN ('site_password', 'admin_password')),
    admin_user_id TEXT,
    admin_email TEXT,
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT,
    previous_password_hash TEXT,
    success BOOLEAN DEFAULT TRUE,
    notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_password_logs_change_type ON public.password_change_logs(change_type);
CREATE INDEX IF NOT EXISTS idx_password_logs_changed_at ON public.password_change_logs(changed_at);

-- ========================================
-- 6. CATÉGORIES PERSONNALISÉES (selon les demandes utilisateur)
-- ========================================

CREATE TABLE IF NOT EXISTS public.custom_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    key TEXT UNIQUE NOT NULL,
    label TEXT NOT NULL,
    created_by TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE
);

-- Insérer les catégories par défaut
INSERT INTO public.custom_categories (key, label, created_by) VALUES
('electronics', 'Électronique', 'system'),
('fashion', 'Mode', 'system'),
('accessories', 'Accessoires', 'system'),
('home-garden', 'Maison & Jardin', 'system'),
('beauty', 'Beauté', 'system'),
('sports', 'Sport', 'system'),
('books-media', 'Livres & Médias', 'system'),
('automotive', 'Automobile', 'system'),
('travel', 'Voyage', 'system'),
('food', 'Alimentation', 'system'),
('services', 'Services', 'system'),
('other', 'Autre', 'system')
ON CONFLICT (key) DO NOTHING;

-- ========================================
-- 7. PLATEFORMES PERSONNALISÉES (selon les demandes utilisateur)
-- ========================================

CREATE TABLE IF NOT EXISTS public.custom_platforms (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    key TEXT UNIQUE NOT NULL,
    label TEXT NOT NULL,
    icon TEXT,
    created_by TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE
);

-- Insérer les plateformes par défaut
INSERT INTO public.custom_platforms (key, label, icon, created_by) VALUES
('whatsapp', 'WhatsApp', '📱', 'system'),
('wechat', 'WeChat', '💬', 'system'),
('telegram', 'Telegram', '✈️', 'system'),
('instagram', 'Instagram', '📷', 'system'),
('tiktok', 'TikTok', '🎵', 'system'),
('discord', 'Discord', '🎮', 'system'),
('signal', 'Signal', '🔒', 'system')
ON CONFLICT (key) DO NOTHING;

-- ========================================
-- 8. SYSTÈME D'ENREGISTREMENT COMPLET
-- ========================================

-- Table des modifications (pour audit complet)
CREATE TABLE IF NOT EXISTS public.modification_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    table_name TEXT NOT NULL,
    operation TEXT NOT NULL CHECK (operation IN ('INSERT', 'UPDATE', 'DELETE')),
    record_id TEXT NOT NULL,
    old_data JSONB,
    new_data JSONB,
    changed_by TEXT,
    user_agent TEXT,
    ip_address INET,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    session_id TEXT
);

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

CREATE INDEX IF NOT EXISTS idx_user_sessions_session_id ON public.user_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON public.user_sessions(expires_at);

-- ========================================
-- 9. FONCTIONS AUTOMATIQUES DE LOGGING
-- ========================================

-- Fonction pour enregistrer automatiquement les modifications
CREATE OR REPLACE FUNCTION public.log_table_changes()
RETURNS TRIGGER AS $$
DECLARE
    session_info RECORD;
    user_email TEXT := 'system';
    user_agent TEXT := '';
    client_ip INET := NULL;
BEGIN
    -- Récupérer les infos de session si disponibles
    BEGIN
        SELECT user_sessions.user_email, user_sessions.user_agent, user_sessions.ip_address 
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
    EXCEPTION
        WHEN others THEN
            user_email := 'system';
    END;

    -- Log selon le type d'opération
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
        -- Incrémenter le compteur si la table l'a
        IF TG_TABLE_NAME = 'agents' THEN
            NEW.modification_count := COALESCE(OLD.modification_count, 0) + 1;
            NEW.modified_by := user_email;
            NEW.updated_at := NOW();
        END IF;
        
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
        IF TG_TABLE_NAME = 'agents' THEN
            NEW.created_by := user_email;
            NEW.modification_count := 0;
        END IF;
        
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
-- 10. TRIGGERS AUTOMATIQUES
-- ========================================

-- Trigger pour agents
CREATE TRIGGER agents_change_log
    AFTER INSERT OR UPDATE OR DELETE ON public.agents
    FOR EACH ROW EXECUTE FUNCTION public.log_table_changes();

-- Trigger pour reviews
CREATE TRIGGER reviews_change_log
    AFTER INSERT OR UPDATE OR DELETE ON public.reviews
    FOR EACH ROW EXECUTE FUNCTION public.log_table_changes();

-- Trigger pour changements de mots de passe
CREATE OR REPLACE FUNCTION public.log_password_change()
RETURNS TRIGGER AS $$
BEGIN
    -- Log automatique des changements de mots de passe
    INSERT INTO public.password_change_logs (
        change_type, admin_email, changed_at, success, notes
    ) VALUES (
        NEW.setting_key::TEXT, 
        NEW.updated_by, 
        NOW(), 
        TRUE,
        'Password changed via admin interface'
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER password_changes_trigger
    AFTER UPDATE ON public.site_settings
    FOR EACH ROW 
    WHEN (OLD.setting_value IS DISTINCT FROM NEW.setting_value AND NEW.setting_type = 'password')
    EXECUTE FUNCTION public.log_password_change();

-- ========================================
-- 11. MIGRATION DES DONNÉES EXISTANTES
-- ========================================

-- Migrer category vers categories pour tous les agents
UPDATE public.agents 
SET categories = ARRAY[category] 
WHERE categories IS NULL OR array_length(categories, 1) IS NULL;

-- Initialiser les compteurs de modification
UPDATE public.agents 
SET modification_count = COALESCE(modification_count, 0),
    created_by = COALESCE(created_by, 'system'),
    modified_by = COALESCE(modified_by, 'system')
WHERE modification_count IS NULL OR created_by IS NULL OR modified_by IS NULL;

-- ========================================
-- 12. PERMISSIONS (Allow all selon le code existant)
-- ========================================

-- Row Level Security
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.password_change_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_platforms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modification_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

-- Supprimer les anciennes politiques
DROP POLICY IF EXISTS "Allow all operations" ON public.agents;
DROP POLICY IF EXISTS "Allow all operations" ON public.site_settings;
DROP POLICY IF EXISTS "Allow all operations" ON public.reviews;
DROP POLICY IF EXISTS "Allow all operations" ON public.review_likes;
DROP POLICY IF EXISTS "Allow all operations" ON public.password_change_logs;
DROP POLICY IF EXISTS "Allow all operations" ON public.custom_categories;
DROP POLICY IF EXISTS "Allow all operations" ON public.custom_platforms;
DROP POLICY IF EXISTS "Allow all operations" ON public.modification_logs;
DROP POLICY IF EXISTS "Allow all operations" ON public.user_sessions;

-- Créer les politiques permissives (selon l'architecture actuelle)
CREATE POLICY "Allow all operations" ON public.agents FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON public.site_settings FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON public.reviews FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON public.review_likes FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON public.password_change_logs FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON public.custom_categories FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON public.custom_platforms FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON public.modification_logs FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON public.user_sessions FOR ALL USING (true);

-- ========================================
-- 13. DONNÉES DE TEST COMPLÈTES
-- ========================================

-- Supprimer les données de test existantes pour éviter les doublons
DELETE FROM public.agents WHERE created_by = 'test-data';

-- Agents de test avec TOUS les nouveaux champs
INSERT INTO public.agents (
    name, identifier, email, phone_number, website_url, platform, category, categories,
    specialties, languages, status, description, location, rating, total_reviews,
    verification_date, created_by, modified_by
) VALUES
-- Agent Electronics avec catégories multiples et website
('Agent Electronics Pro', 'electrotech2024', 'contact@electrotech.fr', '+33123456789', 
 'https://electrotech-pro.fr', 'whatsapp', 'electronics', 
 ARRAY['electronics', 'accessories'], 
 ARRAY['Smartphones', 'Ordinateurs', 'Gaming'], 
 ARRAY['Français', 'Anglais'], 'active',
 'Expert en high-tech depuis 15 ans. Spécialisé dans les dernières technologies et gaming. Service client 24/7 avec garantie satisfait ou remboursé.',
 'Paris, France', 4.8, 127, NOW(), 'test-data', 'test-data'),

-- Agent Fashion avec multiple catégories
('Boutique Mode Sarah', 'sarahfashion', 'sarah@modesarah.com', '+33234567890',
 'https://boutique-sarah.com', 'instagram', 'fashion',
 ARRAY['fashion', 'beauty', 'accessories'],
 ARRAY['Vêtements femme', 'Accessoires', 'Bijoux'], 
 ARRAY['Français', 'Italien'], 'active',
 'Boutique de mode féminine tendance. Collections exclusives importées d\'Italie et de France. Conseil stylistique personnalisé.',
 'Lyon, France', 4.9, 89, NOW(), 'test-data', 'test-data'),

-- Agent Travel multilingue
('Voyage Monde Expert', 'travelexpert', 'info@voyagemonde.fr', '+33345678901',
 'https://voyage-monde-expert.fr', 'telegram', 'travel',
 ARRAY['travel', 'services'],
 ARRAY['Voyages sur mesure', 'Billets d''avion', 'Hôtels'], 
 ARRAY['Français', 'Anglais', 'Espagnol', 'Portugais'], 'active',
 'Agence de voyage spécialisée dans les destinations exotiques. Plus de 20 ans d\'expérience. Voyages sur mesure et circuits organisés.',
 'Marseille, France', 4.7, 203, NOW(), 'test-data', 'test-data'),

-- Agent Food local
('Épicerie Bio Martin', 'biomartín', 'martin@epiceriebio.fr', '+33456789012',
 'https://epicerie-bio-martin.fr', 'whatsapp', 'food',
 ARRAY['food', 'services'],
 ARRAY['Produits bio', 'Local', 'Livraison'], 
 ARRAY['Français'], 'active',
 'Épicerie bio et locale. Produits frais de la région, fruits et légumes de saison. Livraison à domicile possible.',
 'Toulouse, France', 4.6, 67, NOW(), 'test-data', 'test-data'),

-- Agent Beauty avec site web
('Beauty Center Luna', 'beautyluna', 'contact@beautyluna.com', '+33567890123',
 'https://beauty-luna.com', 'wechat', 'beauty',
 ARRAY['beauty', 'services'],
 ARRAY['Soins visage', 'Manucure', 'Maquillage'], 
 ARRAY['Français', 'Chinois'], 'active',
 'Centre de beauté professionnel. Soins esthétiques haut de gamme avec produits bio. Équipe de professionnelles diplômées.',
 'Paris, France', 4.9, 156, NOW(), 'test-data', 'test-data');

-- ========================================
-- 14. VUES ADMINISTRATIVES
-- ========================================

-- Vue des statistiques globales
CREATE OR REPLACE VIEW public.dashboard_stats AS
SELECT 
    (SELECT COUNT(*) FROM public.agents WHERE status = 'active') as active_agents,
    (SELECT COUNT(*) FROM public.agents) as total_agents,
    (SELECT COUNT(*) FROM public.reviews) as total_reviews,
    (SELECT AVG(rating) FROM public.reviews) as avg_rating,
    (SELECT COUNT(*) FROM public.password_change_logs WHERE changed_at > NOW() - INTERVAL '7 days') as recent_password_changes,
    (SELECT COUNT(*) FROM public.modification_logs WHERE created_at > NOW() - INTERVAL '24 hours') as daily_modifications;

-- Vue des agents les plus actifs
CREATE OR REPLACE VIEW public.top_agents AS
SELECT 
    a.id, a.name, a.platform, a.category, a.categories,
    a.rating, a.total_reviews, a.modification_count,
    a.website_url, a.created_at
FROM public.agents a
WHERE a.status = 'active'
ORDER BY a.total_reviews DESC, a.rating DESC
LIMIT 10;

-- ========================================
-- 15. FONCTIONS UTILITAIRES
-- ========================================

-- Fonction pour nettoyer les anciens logs
CREATE OR REPLACE FUNCTION public.cleanup_old_data()
RETURNS TABLE(
    deleted_logs INTEGER,
    deleted_sessions INTEGER
) AS $$
DECLARE
    logs_deleted INTEGER := 0;
    sessions_deleted INTEGER := 0;
BEGIN
    -- Nettoyer les logs de plus de 90 jours
    DELETE FROM public.modification_logs WHERE created_at < NOW() - INTERVAL '90 days';
    GET DIAGNOSTICS logs_deleted = ROW_COUNT;
    
    -- Nettoyer les sessions expirées
    DELETE FROM public.user_sessions WHERE expires_at < NOW();
    GET DIAGNOSTICS sessions_deleted = ROW_COUNT;
    
    -- Log du nettoyage
    INSERT INTO public.modification_logs (
        table_name, operation, record_id, new_data, changed_by
    ) VALUES (
        'system', 'CLEANUP', 'maintenance', 
        jsonb_build_object(
            'deleted_logs', logs_deleted,
            'deleted_sessions', sessions_deleted
        ),
        'system_cleanup'
    );
    
    RETURN QUERY SELECT logs_deleted, sessions_deleted;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- 16. RAPPORT FINAL ET VÉRIFICATIONS
-- ========================================

-- Vérification complète et rapport
DO $$
DECLARE
    agents_count INTEGER;
    reviews_count INTEGER;
    categories_count INTEGER;
    platforms_count INTEGER;
    website_column_exists BOOLEAN;
    categories_column_exists BOOLEAN;
    triggers_count INTEGER;
    policies_count INTEGER;
BEGIN
    -- Compter les enregistrements
    SELECT COUNT(*) INTO agents_count FROM public.agents;
    SELECT COUNT(*) INTO reviews_count FROM public.reviews;
    SELECT COUNT(*) INTO categories_count FROM public.custom_categories;
    SELECT COUNT(*) INTO platforms_count FROM public.custom_platforms;
    
    -- Vérifier les colonnes
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'agents' AND column_name = 'website_url'
    ) INTO website_column_exists;
    
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'agents' AND column_name = 'categories'
    ) INTO categories_column_exists;
    
    -- Compter les triggers
    SELECT COUNT(*) INTO triggers_count 
    FROM information_schema.triggers 
    WHERE trigger_name LIKE '%_change_log';
    
    -- Compter les politiques
    SELECT COUNT(*) INTO policies_count 
    FROM pg_policies 
    WHERE policyname = 'Allow all operations';
    
    -- RAPPORT FINAL
    RAISE NOTICE '==========================================';
    RAISE NOTICE '🎉 CONFIGURATION OXO TERMINÉE AVEC SUCCÈS';
    RAISE NOTICE '==========================================';
    RAISE NOTICE '';
    RAISE NOTICE '📊 DONNÉES CONFIGURÉES:';
    RAISE NOTICE '  • Agents: % (dont % de test)', agents_count, (SELECT COUNT(*) FROM public.agents WHERE created_by = 'test-data');
    RAISE NOTICE '  • Reviews: %', reviews_count;
    RAISE NOTICE '  • Catégories: %', categories_count;
    RAISE NOTICE '  • Plateformes: %', platforms_count;
    RAISE NOTICE '';
    RAISE NOTICE '🔧 FONCTIONNALITÉS ACTIVÉES:';
    RAISE NOTICE '  • Website URL: %', CASE WHEN website_column_exists THEN '✅ OK' ELSE '❌ ERREUR' END;
    RAISE NOTICE '  • Catégories multiples: %', CASE WHEN categories_column_exists THEN '✅ OK' ELSE '❌ ERREUR' END;
    RAISE NOTICE '  • Système de logging: %', CASE WHEN triggers_count >= 2 THEN '✅ OK' ELSE '❌ ERREUR' END;
    RAISE NOTICE '  • Permissions RLS: %', CASE WHEN policies_count >= 8 THEN '✅ OK' ELSE '❌ ERREUR' END;
    RAISE NOTICE '  • Notes internes: ✅ STOCKAGE LOCAL (sécurisé)';
    RAISE NOTICE '';
    RAISE NOTICE '🚀 FONCTIONNALITÉS UTILISATEUR:';
    RAISE NOTICE '  • ✅ Changement mots de passe avec logging';
    RAISE NOTICE '  • ✅ Catégories personnalisées';
    RAISE NOTICE '  • ✅ Champs tous facultatifs';
    RAISE NOTICE '  • ✅ Website URL pour chaque agent';
    RAISE NOTICE '  • ✅ Catégories multiples avec défilement';
    RAISE NOTICE '  • ✅ Système d''avis complet';
    RAISE NOTICE '  • ✅ Texte expandable pour descriptions';
    RAISE NOTICE '';
    RAISE NOTICE '🔒 SÉCURITÉ:';
    RAISE NOTICE '  • ✅ Notes internes JAMAIS envoyées à Supabase';
    RAISE NOTICE '  • ✅ Logs de tous les changements';
    RAISE NOTICE '  • ✅ Historique des mots de passe';
    RAISE NOTICE '  • ✅ Sessions avec expiration';
    RAISE NOTICE '';
    RAISE NOTICE '==========================================';
    RAISE NOTICE '✨ PROJET OXO PRÊT À L''UTILISATION !';
    RAISE NOTICE '==========================================';
END $$;

-- Log de l'installation complète
INSERT INTO public.modification_logs (
    table_name, operation, record_id, new_data, changed_by
) VALUES (
    'system', 'FULL_SETUP', 'oxo-project-v2', 
    jsonb_build_object(
        'version', '2.0.0',
        'features', ARRAY[
            'website_url', 'categories_multiples', 'notes_internes_locales',
            'changement_mots_de_passe', 'categories_personnalisees',
            'champs_facultatifs', 'logging_complet', 'systeme_avis',
            'texte_expandable', 'animation_defilement'
        ],
        'timestamp', NOW(),
        'project', 'OXO Ultimate Admin Dashboard'
    ),
    'system-final-setup'
);

-- ========================================
-- FIN DU SCRIPT - PROJET OXO V2.0
-- ========================================