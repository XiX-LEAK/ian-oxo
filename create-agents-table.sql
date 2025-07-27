-- Script SQL pour créer la table agents dans Supabase
-- Copie et colle ce code dans l'éditeur SQL de Supabase

-- Créer la table agents
CREATE TABLE IF NOT EXISTS public.agents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    identifier VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255),
    phone_number VARCHAR(50),
    platform VARCHAR(50) NOT NULL DEFAULT 'whatsapp',
    category VARCHAR(50) NOT NULL DEFAULT 'other',
    specialties TEXT[] DEFAULT '{}',
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    description TEXT,
    admin_notes TEXT,
    location VARCHAR(255),
    languages TEXT[] DEFAULT '{}',
    rating DECIMAL(3,2) DEFAULT 0.0,
    total_reviews INTEGER DEFAULT 0,
    verification_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Ajouter des indexes pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_agents_platform ON public.agents(platform);
CREATE INDEX IF NOT EXISTS idx_agents_category ON public.agents(category);
CREATE INDEX IF NOT EXISTS idx_agents_status ON public.agents(status);
CREATE INDEX IF NOT EXISTS idx_agents_created_at ON public.agents(created_at);

-- Ajouter une contrainte pour valider le statut
ALTER TABLE public.agents 
ADD CONSTRAINT check_status 
CHECK (status IN ('active', 'inactive', 'suspended', 'pending'));

-- Activer RLS (Row Level Security)
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;

-- Créer une politique pour permettre l'accès public en lecture
CREATE POLICY "Allow public read access" ON public.agents
    FOR SELECT USING (true);

-- Créer une politique pour permettre l'insertion publique (tu peux la modifier selon tes besoins)
CREATE POLICY "Allow public insert" ON public.agents
    FOR INSERT WITH CHECK (true);

-- Créer une politique pour permettre la mise à jour publique (tu peux la modifier selon tes besoins)
CREATE POLICY "Allow public update" ON public.agents
    FOR UPDATE USING (true);

-- Créer une politique pour permettre la suppression publique (tu peux la modifier selon tes besoins)
CREATE POLICY "Allow public delete" ON public.agents
    FOR DELETE USING (true);

-- Créer une fonction pour automatiquement mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Créer le trigger pour updated_at
CREATE TRIGGER update_agents_updated_at 
    BEFORE UPDATE ON public.agents 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Message de confirmation
SELECT 'Table agents créée avec succès!' as message;