-- Création de la table site_settings pour stocker les mots de passe
CREATE TABLE IF NOT EXISTS public.site_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    setting_key TEXT UNIQUE NOT NULL,
    setting_value TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour optimiser les recherches par clé
CREATE INDEX IF NOT EXISTS idx_site_settings_key ON public.site_settings(setting_key);

-- Insertion des valeurs par défaut
INSERT INTO public.site_settings (setting_key, setting_value) 
VALUES 
    ('site_password', 'oxo2024'),
    ('admin_password', 'oxo2025admin')
ON CONFLICT (setting_key) DO NOTHING;

-- Politique de sécurité RLS (Row Level Security)
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Politique d'accès : Autoriser toutes les opérations (puisque c'est pour les paramètres du site)
CREATE POLICY "Allow all operations on site_settings" ON public.site_settings
    FOR ALL USING (true);

-- Commentaires pour documenter la table
COMMENT ON TABLE public.site_settings IS 'Table pour stocker les paramètres du site comme les mots de passe';
COMMENT ON COLUMN public.site_settings.setting_key IS 'Clé unique du paramètre (ex: site_password, admin_password)';
COMMENT ON COLUMN public.site_settings.setting_value IS 'Valeur du paramètre';

-- Trigger pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_site_settings_updated_at BEFORE UPDATE
    ON public.site_settings FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Vérification finale
SELECT 'Configuration Supabase pour site_settings terminée avec succès ! 🎉' as message;