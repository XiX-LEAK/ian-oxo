-- 🔐 SCRIPT SIMPLE POUR LES MOTS DE PASSE ADMIN
-- Fonctionne avec votre système existant

-- ===================================================================
-- 1. TABLE POUR LES PARAMÈTRES (si elle n'existe pas déjà)
-- ===================================================================

CREATE TABLE IF NOT EXISTS site_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    setting_key TEXT UNIQUE NOT NULL,
    setting_value TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ===================================================================
-- 2. TABLE POUR L'HISTORIQUE DES CHANGEMENTS
-- ===================================================================

CREATE TABLE IF NOT EXISTS password_change_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    change_type TEXT NOT NULL,
    admin_user_id TEXT,
    admin_email TEXT,
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    ip_address TEXT,
    user_agent TEXT,
    previous_password_hash TEXT,
    success BOOLEAN NOT NULL DEFAULT false,
    notes TEXT
);

-- ===================================================================
-- 3. INSERTION DES MOTS DE PASSE PAR DÉFAUT
-- ===================================================================

INSERT INTO site_settings (setting_key, setting_value) 
VALUES 
    ('site_password', 'oxodemo2025'),
    ('admin_password', 'oxo2025admin')
ON CONFLICT (setting_key) DO NOTHING;

-- ===================================================================
-- 4. VÉRIFICATION
-- ===================================================================

SELECT 'Installation terminée - Tables créées avec succès !' as message;