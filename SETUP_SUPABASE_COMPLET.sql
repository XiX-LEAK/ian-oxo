-- ============================================
-- SCRIPT SETUP COMPLET SUPABASE POUR OXO
-- ============================================

-- 1. SUPPRIMER TOUT CE QUI EXISTE (pour repartir de zéro)
DROP TABLE IF EXISTS public.password_change_logs CASCADE;
DROP TABLE IF EXISTS public.review_likes CASCADE; 
DROP TABLE IF EXISTS public.reviews CASCADE;
DROP TABLE IF EXISTS public.agents CASCADE;
DROP TABLE IF EXISTS public.site_settings CASCADE;

-- Supprimer les fonctions et triggers
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- ============================================
-- 2. TABLE SITE_SETTINGS (mots de passe)
-- ============================================

CREATE TABLE public.site_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    setting_key TEXT UNIQUE NOT NULL,
    setting_value TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index
CREATE INDEX idx_site_settings_key ON public.site_settings(setting_key);

-- Données par défaut
INSERT INTO public.site_settings (setting_key, setting_value) VALUES 
    ('site_password', 'oxo2024'),
    ('admin_password', 'oxo2025admin');

-- RLS
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations on site_settings" ON public.site_settings FOR ALL USING (true);

-- ============================================
-- 3. TABLE AGENTS (conforme au code TypeScript)
-- ============================================

CREATE TABLE public.agents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Champs de base requis par le code
    name TEXT NOT NULL,
    identifier TEXT NOT NULL,
    email TEXT,
    phone_number TEXT,
    platform TEXT NOT NULL DEFAULT 'whatsapp',
    category TEXT NOT NULL DEFAULT 'other',
    specialties TEXT[] DEFAULT ARRAY[]::TEXT[],
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended', 'pending')),
    description TEXT, -- Maps to 'about' in client
    admin_notes TEXT, -- Maps to 'adminNotes' in client
    location TEXT,
    languages TEXT[] DEFAULT ARRAY['Français']::TEXT[],
    rating DECIMAL(3,2) DEFAULT 0.00 CHECK (rating >= 0 AND rating <= 5),
    total_reviews INTEGER DEFAULT 0,
    verification_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour performance
CREATE INDEX idx_agents_platform ON public.agents(platform);
CREATE INDEX idx_agents_category ON public.agents(category);
CREATE INDEX idx_agents_status ON public.agents(status);
CREATE INDEX idx_agents_name ON public.agents(name);
CREATE INDEX idx_agents_identifier ON public.agents(identifier);
CREATE INDEX idx_agents_rating ON public.agents(rating);

-- RLS
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations on agents" ON public.agents FOR ALL USING (true);

-- ============================================
-- 4. TABLE REVIEWS (système d'avis)
-- ============================================

CREATE TABLE public.reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    agent_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    user_email TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT NOT NULL,
    is_verified BOOLEAN DEFAULT false,
    helpful_votes INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index
CREATE INDEX idx_reviews_agent_id ON public.reviews(agent_id);
CREATE INDEX idx_reviews_user_id ON public.reviews(user_id);
CREATE INDEX idx_reviews_rating ON public.reviews(rating);

-- RLS
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations on reviews" ON public.reviews FOR ALL USING (true);

-- ============================================
-- 5. TABLE REVIEW_LIKES (likes sur les avis)
-- ============================================

CREATE TABLE public.review_likes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    review_id UUID NOT NULL REFERENCES public.reviews(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(review_id, user_id)
);

-- Index
CREATE INDEX idx_review_likes_review_id ON public.review_likes(review_id);
CREATE INDEX idx_review_likes_user_id ON public.review_likes(user_id);

-- RLS
ALTER TABLE public.review_likes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations on review_likes" ON public.review_likes FOR ALL USING (true);

-- ============================================
-- 6. TABLE PASSWORD_CHANGE_LOGS (historique mots de passe)
-- ============================================

CREATE TABLE public.password_change_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    change_type TEXT NOT NULL CHECK (change_type IN ('site_password', 'admin_password')),
    admin_user_id TEXT,
    admin_email TEXT,
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address TEXT,
    user_agent TEXT,
    previous_password_hash TEXT,
    success BOOLEAN DEFAULT true,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index
CREATE INDEX idx_password_logs_change_type ON public.password_change_logs(change_type);
CREATE INDEX idx_password_logs_changed_at ON public.password_change_logs(changed_at);

-- RLS
ALTER TABLE public.password_change_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations on password_change_logs" ON public.password_change_logs FOR ALL USING (true);

-- ============================================
-- 7. FONCTION ET TRIGGERS (pour updated_at)
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers pour toutes les tables
CREATE TRIGGER update_site_settings_updated_at BEFORE UPDATE ON public.site_settings FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_agents_updated_at BEFORE UPDATE ON public.agents FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON public.reviews FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- ============================================
-- 8. DONNÉES DE TEST (agents d'exemple)
-- ============================================

INSERT INTO public.agents (
    name, 
    identifier, 
    platform, 
    category, 
    description, 
    specialties, 
    languages,
    rating,
    verification_date,
    admin_notes,
    phone_number,
    email
) VALUES 
(
    'Agent Electronics Pro',
    '+33123456789',
    'whatsapp',
    'electronics',
    'Spécialiste en électronique et gadgets tech. Plus de 5 ans d''expérience dans l''import/export.',
    ARRAY['smartphones', 'ordinateurs', 'accessoires tech', 'gaming'],
    ARRAY['Français', 'Anglais'],
    4.8,
    NOW(),
    'Agent vérifié - excellent historique',
    '+33123456789',
    'electronics.pro@example.com'
),
(
    'Fashion Expert Marie',
    'marie_fashion_2024',
    'wechat',
    'fashion',
    'Consultante mode et tendances. Import direct de marques asiatiques premium.',
    ARRAY['vêtements femme', 'chaussures', 'accessoires', 'bijoux'],
    ARRAY['Français', 'Chinois', 'Anglais'],
    4.9,
    NOW(),
    'Top agent - spécialiste mode féminine',
    NULL,
    'marie.fashion@example.com'
),
(
    'Health & Wellness Advisor',
    '@health_advisor_fr',
    'telegram',
    'beauty',
    'Conseiller en produits de santé et bien-être naturels. Certifié naturopathie.',
    ARRAY['compléments alimentaires', 'cosmétiques bio', 'huiles essentielles'],
    ARRAY['Français'],
    4.6,
    NOW(),
    'Agent certifié - produits naturels',
    NULL,
    'health.advisor@example.com'
),
(
    'Auto Parts Specialist',
    'autoparts_expert',
    'whatsapp',
    'automotive',
    'Spécialiste pièces auto et accessoires. Stock permanent Europe/Asie.',
    ARRAY['pièces détachées', 'accessoires auto', 'tuning'],
    ARRAY['Français', 'Allemand'],
    4.7,
    NOW(),
    'Excellent pour pièces rares',
    '+33987654321',
    'auto.parts@example.com'
),
(
    'Home Decor Studio',
    'homedeco_studio',
    'instagram',
    'home-garden',
    'Design intérieur et décoration. Mobilier et accessoires uniques.',
    ARRAY['mobilier', 'décoration', 'luminaires', 'textiles'],
    ARRAY['Français', 'Italien'],
    4.5,
    NOW(),
    'Créatif - produits design',
    NULL,
    'home.deco@example.com'
);

-- ============================================
-- 9. VÉRIFICATION FINALE
-- ============================================

-- Compter les éléments créés
SELECT 
    'Tables créées avec succès ! 🎉' as message,
    (SELECT COUNT(*) FROM public.site_settings) as site_settings,
    (SELECT COUNT(*) FROM public.agents) as agents,
    (SELECT COUNT(*) FROM public.reviews) as reviews,
    (SELECT COUNT(*) FROM public.password_change_logs) as logs;

-- Lister les colonnes de la table agents
SELECT 'Structure table agents:' as info, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'agents' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Test rapide des mots de passe
SELECT 'Mots de passe configurés:' as info, setting_key, setting_value 
FROM public.site_settings;

-- ============================================
-- 10. COMMENTAIRES FINAUX
-- ============================================

COMMENT ON TABLE public.site_settings IS 'Paramètres du site (mots de passe, config)';
COMMENT ON TABLE public.agents IS 'Agents WhatsApp/WeChat/Telegram vérifiés';
COMMENT ON TABLE public.reviews IS 'Avis et évaluations des agents';
COMMENT ON TABLE public.review_likes IS 'Likes sur les avis';
COMMENT ON TABLE public.password_change_logs IS 'Historique des changements de mots de passe';

-- Fin du script
SELECT '🚀 Setup Supabase terminé avec succès !' as final_message;