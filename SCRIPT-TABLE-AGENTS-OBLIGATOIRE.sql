-- 🚨 SCRIPT OBLIGATOIRE - CRÉER TABLE AGENTS
-- Execute ça MAINTENANT dans SQL Editor de Supabase

-- ===================================================================
-- 1. CRÉER LA TABLE AGENTS (compatible avec ton code)
-- ===================================================================

CREATE TABLE IF NOT EXISTS agents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT,
    identifier TEXT,
    phone_number TEXT,
    email TEXT,
    website_url TEXT,
    platform TEXT DEFAULT 'whatsapp',
    category TEXT DEFAULT 'other',
    specialties TEXT[] DEFAULT '{}',
    languages TEXT[] DEFAULT '{}',
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended', 'pending')),
    description TEXT,
    admin_notes TEXT,
    about_description TEXT,
    internal_notes TEXT,
    full_name TEXT,
    rating DECIMAL(3,2) DEFAULT 0.0,
    total_reviews INTEGER DEFAULT 0,
    verification_date TIMESTAMPTZ,
    location TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- ===================================================================
-- 2. ACTIVER LES POLITIQUES DE SÉCURITÉ
-- ===================================================================

ALTER TABLE agents ENABLE ROW LEVEL SECURITY;

-- Politique ultra permissive pour commencer
CREATE POLICY IF NOT EXISTS "Allow all operations" ON agents
    FOR ALL 
    USING (true)
    WITH CHECK (true);

-- ===================================================================
-- 3. CRÉER INDEX POUR PERFORMANCE
-- ===================================================================

CREATE INDEX IF NOT EXISTS idx_agents_status ON agents(status);
CREATE INDEX IF NOT EXISTS idx_agents_created ON agents(created_at);

-- ===================================================================
-- 4. TEST DE CRÉATION
-- ===================================================================

-- Insérer un agent de test
INSERT INTO agents (name, identifier, platform, category, status) 
VALUES ('Agent Test Setup', 'test_setup_' || extract(epoch from now()), 'whatsapp', 'other', 'active')
ON CONFLICT DO NOTHING;

-- Vérifier que ça marche
SELECT 
    'SUCCESS: Table agents créée avec ' || COUNT(*) || ' agents' as result
FROM agents;

-- Message final
SELECT '🎉 TABLE AGENTS CRÉÉE - Ton erreur va disparaître !' as message;