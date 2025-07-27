-- SCRIPT SUPABASE : SYSTÈME D'AGENTS (plateformes, catégories, langues, relations, vues)
-- À utiliser dans Supabase SQL Editor

-- 1. Ajoute les champs nécessaires à la table agents (si besoin)
ALTER TABLE agents 
ADD COLUMN IF NOT EXISTS full_name TEXT,
ADD COLUMN IF NOT EXISTS phone_number TEXT,
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS website_url TEXT,
ADD COLUMN IF NOT EXISTS about_description TEXT,
ADD COLUMN IF NOT EXISTS internal_notes TEXT,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active',
ADD COLUMN IF NOT EXISTS rating NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_reviews INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- 2. Tables de référence
CREATE TABLE IF NOT EXISTS platforms (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS languages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    code TEXT UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tables de liaison (relations many-to-many)
CREATE TABLE IF NOT EXISTS agent_platforms (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
    platform_id UUID REFERENCES platforms(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(agent_id, platform_id)
);

CREATE TABLE IF NOT EXISTS agent_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(agent_id, category_id)
);

CREATE TABLE IF NOT EXISTS agent_languages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
    language_id UUID REFERENCES languages(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(agent_id, language_id)
);

-- 4. Vue admin (tout, y compris notes internes)
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
GROUP BY a.id;

-- 5. Vue publique (jamais de notes internes)
CREATE OR REPLACE VIEW agents_public AS
SELECT 
    a.id,
    a.full_name,
    a.phone_number,
    a.email,
    a.website_url,
    a.about_description,
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
GROUP BY a.id;

-- 6. Données de base (optionnel)
INSERT INTO platforms (name) VALUES 
    ('WhatsApp'), ('Telegram'), ('WeChat'), ('Signal'), ('Discord'),
    ('LinkedIn'), ('Facebook'), ('Instagram'), ('Twitter'), ('Email')
ON CONFLICT (name) DO NOTHING;

INSERT INTO categories (name) VALUES 
    ('Technologie'), ('Marketing'), ('Vente'), ('Support Client'),
    ('Développement'), ('Design'), ('Finance'), ('Consulting')
ON CONFLICT (name) DO NOTHING;

INSERT INTO languages (name, code) VALUES 
    ('Français', 'fr'), ('Anglais', 'en'), ('Espagnol', 'es'),
    ('Allemand', 'de'), ('Italien', 'it'), ('Chinois', 'zh')
ON CONFLICT (name) DO NOTHING; 