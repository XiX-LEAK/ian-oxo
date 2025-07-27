-- =========================================
-- SCRIPT DE CONFIGURATION SUPABASE POUR OXO-ULTIMATE
-- =========================================

-- 1. Création de la table des agents
CREATE TABLE IF NOT EXISTS agents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR NOT NULL,
    identifier VARCHAR UNIQUE NOT NULL,
    email VARCHAR,
    phone_number VARCHAR,
    platform VARCHAR NOT NULL,
    category VARCHAR NOT NULL,
    specialties TEXT[], -- Array de spécialités
    status VARCHAR DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended', 'pending')),
    description TEXT,
    location VARCHAR,
    languages TEXT[], -- Array de langues
    rating DECIMAL(3,2) DEFAULT 0,
    total_reviews INTEGER DEFAULT 0,
    verification_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Création de la table des avis (reviews)
CREATE TABLE IF NOT EXISTS reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    user_id VARCHAR NOT NULL, -- Peut être un UUID ou un email
    user_email VARCHAR NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT NOT NULL,
    is_verified BOOLEAN DEFAULT false,
    helpful_votes INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    
    -- Contrainte unique : un utilisateur ne peut laisser qu'un avis par agent
    UNIQUE(agent_id, user_id)
);

-- 3. Création de la table des likes sur les avis
CREATE TABLE IF NOT EXISTS review_likes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
    user_id VARCHAR NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    
    -- Contrainte unique : un utilisateur ne peut liker qu'une fois par avis
    UNIQUE(review_id, user_id)
);

-- 4. Création de la table des paramètres du site
CREATE TABLE IF NOT EXISTS site_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    setting_key VARCHAR UNIQUE NOT NULL,
    setting_value TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Insérer les paramètres par défaut
INSERT INTO site_settings (setting_key, setting_value) 
VALUES 
    ('site_password', 'oxo2024'),
    ('admin_password', 'oxo2025admin')
ON CONFLICT (setting_key) DO NOTHING;

-- 4. Création des index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_agents_status ON agents(status);
CREATE INDEX IF NOT EXISTS idx_agents_platform ON agents(platform);
CREATE INDEX IF NOT EXISTS idx_agents_category ON agents(category);
CREATE INDEX IF NOT EXISTS idx_reviews_agent_id ON reviews(agent_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);
CREATE INDEX IF NOT EXISTS idx_review_likes_review_id ON review_likes(review_id);

-- 5. Fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 6. Triggers pour mettre à jour automatiquement updated_at
CREATE TRIGGER update_agents_updated_at BEFORE UPDATE ON agents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 7. Fonction pour calculer automatiquement la note moyenne d'un agent
CREATE OR REPLACE FUNCTION update_agent_rating()
RETURNS TRIGGER AS $$
BEGIN
    -- Recalculer la note moyenne et le nombre total d'avis
    UPDATE agents 
    SET 
        rating = COALESCE((
            SELECT ROUND(AVG(rating::numeric), 2)
            FROM reviews 
            WHERE agent_id = COALESCE(NEW.agent_id, OLD.agent_id)
        ), 0),
        total_reviews = COALESCE((
            SELECT COUNT(*)
            FROM reviews 
            WHERE agent_id = COALESCE(NEW.agent_id, OLD.agent_id)
        ), 0)
    WHERE id = COALESCE(NEW.agent_id, OLD.agent_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- 8. Triggers pour mettre à jour automatiquement les statistiques des agents
CREATE TRIGGER update_agent_rating_on_insert AFTER INSERT ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_agent_rating();

CREATE TRIGGER update_agent_rating_on_update AFTER UPDATE ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_agent_rating();

CREATE TRIGGER update_agent_rating_on_delete AFTER DELETE ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_agent_rating();

-- 9. Fonction pour mettre à jour automatiquement les votes utiles
CREATE OR REPLACE FUNCTION update_review_helpful_votes()
RETURNS TRIGGER AS $$
BEGIN
    -- Recalculer le nombre de votes utiles
    UPDATE reviews 
    SET helpful_votes = COALESCE((
        SELECT COUNT(*)
        FROM review_likes 
        WHERE review_id = COALESCE(NEW.review_id, OLD.review_id)
    ), 0)
    WHERE id = COALESCE(NEW.review_id, OLD.review_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- 10. Triggers pour mettre à jour automatiquement les votes utiles
CREATE TRIGGER update_helpful_votes_on_insert AFTER INSERT ON review_likes
    FOR EACH ROW EXECUTE FUNCTION update_review_helpful_votes();

CREATE TRIGGER update_helpful_votes_on_delete AFTER DELETE ON review_likes
    FOR EACH ROW EXECUTE FUNCTION update_review_helpful_votes();

-- 11. Politiques de sécurité RLS (Row Level Security)
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_likes ENABLE ROW LEVEL SECURITY;

-- Politique pour les agents : tout le monde peut lire, seuls les admins peuvent modifier
CREATE POLICY "agents_select_policy" ON agents FOR SELECT USING (true);
CREATE POLICY "agents_insert_policy" ON agents FOR INSERT WITH CHECK (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "agents_update_policy" ON agents FOR UPDATE USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "agents_delete_policy" ON agents FOR DELETE USING (auth.jwt() ->> 'role' = 'admin');

-- Politique pour les avis : tout le monde peut lire, utilisateurs connectés peuvent créer, propriétaires peuvent modifier
CREATE POLICY "reviews_select_policy" ON reviews FOR SELECT USING (true);
CREATE POLICY "reviews_insert_policy" ON reviews FOR INSERT WITH CHECK (auth.jwt() ->> 'sub' IS NOT NULL);
CREATE POLICY "reviews_update_policy" ON reviews FOR UPDATE USING (
    user_id = COALESCE(auth.jwt() ->> 'sub', auth.jwt() ->> 'email') OR 
    auth.jwt() ->> 'role' = 'admin'
);
CREATE POLICY "reviews_delete_policy" ON reviews FOR DELETE USING (
    user_id = COALESCE(auth.jwt() ->> 'sub', auth.jwt() ->> 'email') OR 
    auth.jwt() ->> 'role' = 'admin'
);

-- Politique pour les likes : utilisateurs connectés peuvent gérer leurs propres likes
CREATE POLICY "review_likes_select_policy" ON review_likes FOR SELECT USING (true);
CREATE POLICY "review_likes_insert_policy" ON review_likes FOR INSERT WITH CHECK (
    user_id = COALESCE(auth.jwt() ->> 'sub', auth.jwt() ->> 'email')
);
CREATE POLICY "review_likes_delete_policy" ON review_likes FOR DELETE USING (
    user_id = COALESCE(auth.jwt() ->> 'sub', auth.jwt() ->> 'email')
);

-- 12. Insertion de données d'exemple (optionnel - tu peux les enlever si tu veux)
INSERT INTO agents (name, identifier, email, phone_number, platform, category, specialties, description, location, languages) VALUES
('Sophie Martin', 'sophie.martin.pro', 'sophie.martin@example.com', '+33123456789', 'whatsapp', 'fashion', ARRAY['Mode femme', 'Accessoires', 'Tendances'], 'Spécialiste mode avec 5 ans d''expérience', 'Paris, France', ARRAY['Français', 'Anglais']),
('Liu Wei', 'liu.tech.expert', 'liu.wei@example.com', '+33987654321', 'wechat', 'electronics', ARRAY['Smartphones', 'Ordinateurs', 'Gaming'], 'Expert en technologie et gadgets électroniques', 'Lyon, France', ARRAY['Français', 'Mandarin', 'Anglais']),
('Ahmad Hassan', 'ahmad.garden.pro', 'ahmad.hassan@example.com', '+33555666777', 'telegram', 'home-garden', ARRAY['Jardinage', 'Décoration', 'Bricolage'], 'Passionné de jardinage et décoration maison', 'Marseille, France', ARRAY['Français', 'Arabe']),
('Maria Gonzalez', 'maria.beauty.expert', 'maria.gonzalez@example.com', '+33444333222', 'instagram', 'beauty', ARRAY['Cosmétiques', 'Soins', 'Parfums'], 'Experte beauté et cosmétiques naturels', 'Nice, France', ARRAY['Français', 'Espagnol', 'Italien']),
('Chen Yang', 'chen.sport.coach', 'chen.yang@example.com', '+33111222333', 'discord', 'sports', ARRAY['Fitness', 'Running', 'Équipements'], 'Coach sportif et spécialiste équipements', 'Toulouse, France', ARRAY['Français', 'Mandarin'])
ON CONFLICT (identifier) DO NOTHING;

-- Message de confirmation
SELECT 'Configuration Supabase terminée avec succès ! 🎉' as message;