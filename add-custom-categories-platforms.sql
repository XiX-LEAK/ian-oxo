-- ============================================
-- AJOUT TABLES POUR CATÉGORIES ET PLATEFORMES PERSONNALISÉES
-- ============================================

-- Table pour les catégories personnalisées
CREATE TABLE IF NOT EXISTS public.custom_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table pour les plateformes personnalisées
CREATE TABLE IF NOT EXISTS public.custom_platforms (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_custom_categories_slug ON public.custom_categories(slug);
CREATE INDEX IF NOT EXISTS idx_custom_platforms_slug ON public.custom_platforms(slug);

-- RLS
ALTER TABLE public.custom_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_platforms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on custom_categories" ON public.custom_categories FOR ALL USING (true);
CREATE POLICY "Allow all operations on custom_platforms" ON public.custom_platforms FOR ALL USING (true);

-- Triggers pour updated_at
CREATE TRIGGER update_custom_categories_updated_at 
    BEFORE UPDATE ON public.custom_categories 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_custom_platforms_updated_at 
    BEFORE UPDATE ON public.custom_platforms 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Insérer les catégories par défaut
INSERT INTO public.custom_categories (name, slug, is_default) VALUES 
    ('Électronique', 'electronics', true),
    ('Mode', 'fashion', true),
    ('Accessoires', 'accessories', true),
    ('Maison & Jardin', 'home-garden', true),
    ('Beauté', 'beauty', true),
    ('Sport', 'sports', true),
    ('Livres & Médias', 'books-media', true),
    ('Automobile', 'automotive', true),
    ('Voyage', 'travel', true),
    ('Alimentation', 'food', true),
    ('Services', 'services', true),
    ('Autre', 'other', true)
ON CONFLICT (slug) DO NOTHING;

-- Insérer les plateformes par défaut
INSERT INTO public.custom_platforms (name, slug, is_default) VALUES 
    ('WhatsApp', 'whatsapp', true),
    ('WeChat', 'wechat', true),
    ('Telegram', 'telegram', true),
    ('Instagram', 'instagram', true),
    ('TikTok', 'tiktok', true),
    ('Discord', 'discord', true),
    ('Signal', 'signal', true)
ON CONFLICT (slug) DO NOTHING;

-- Vérification
SELECT 'Tables créées avec succès ! 🎉' as message,
    (SELECT COUNT(*) FROM public.custom_categories) as categories,
    (SELECT COUNT(*) FROM public.custom_platforms) as platforms;