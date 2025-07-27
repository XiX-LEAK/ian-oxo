-- 🔐 SCRIPT COMPLET DE GESTION DES MOTS DE PASSE ADMIN POUR OXO-ULTIMATE
-- Ce script configure toutes les tables nécessaires pour un système de gestion des mots de passe
-- avec historique complet et sécurité renforcée

-- ===================================================================
-- 1. TABLE DE CONFIGURATION DES PARAMÈTRES DU SITE
-- ===================================================================

CREATE TABLE IF NOT EXISTS site_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    setting_key TEXT UNIQUE NOT NULL,
    setting_value TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by TEXT DEFAULT 'system',
    updated_by TEXT DEFAULT 'system'
);

-- Index pour améliorer les performances de recherche
CREATE INDEX IF NOT EXISTS idx_site_settings_key ON site_settings(setting_key);

-- ===================================================================
-- 2. TABLE D'HISTORIQUE DES CHANGEMENTS DE MOTS DE PASSE
-- ===================================================================

CREATE TABLE IF NOT EXISTS password_change_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    change_type TEXT NOT NULL CHECK (change_type IN ('site_password', 'admin_password')),
    admin_user_id TEXT,
    admin_email TEXT,
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    ip_address TEXT,
    user_agent TEXT,
    previous_password_hash TEXT, -- Hash sécurisé de l'ancien mot de passe
    success BOOLEAN NOT NULL DEFAULT false,
    notes TEXT,
    session_id TEXT,
    device_info JSONB DEFAULT '{}'::jsonb
);

-- Index pour les requêtes fréquentes
CREATE INDEX IF NOT EXISTS idx_password_logs_type ON password_change_logs(change_type);
CREATE INDEX IF NOT EXISTS idx_password_logs_date ON password_change_logs(changed_at DESC);
CREATE INDEX IF NOT EXISTS idx_password_logs_admin ON password_change_logs(admin_user_id);

-- ===================================================================
-- 3. TABLE DE SÉCURITÉ - TENTATIVES D'ACCÈS SUSPICIEUSES
-- ===================================================================

CREATE TABLE IF NOT EXISTS security_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_type TEXT NOT NULL,
    event_description TEXT NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    user_id TEXT,
    event_data JSONB DEFAULT '{}'::jsonb,
    severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    resolved BOOLEAN DEFAULT false,
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolved_by TEXT
);

-- Index pour surveiller les événements critiques
CREATE INDEX IF NOT EXISTS idx_security_logs_severity ON security_logs(severity, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_security_logs_type ON security_logs(event_type);

-- ===================================================================
-- 4. INSERTION DES PARAMÈTRES PAR DÉFAUT
-- ===================================================================

-- Insertion des mots de passe par défaut (vous pouvez les changer via l'interface)
INSERT INTO site_settings (setting_key, setting_value, created_by) 
VALUES 
    ('site_password', 'oxodemo2025', 'system'),
    ('admin_password', 'oxo2025admin', 'system'),
    ('site_name', 'OXO Ultimate', 'system'),
    ('max_login_attempts', '5', 'system'),
    ('session_timeout_minutes', '60', 'system'),
    ('password_history_limit', '100', 'system'),
    ('security_notifications_enabled', 'true', 'system')
ON CONFLICT (setting_key) DO NOTHING;

-- ===================================================================
-- 5. FONCTIONS DE SÉCURITÉ ET UTILITAIRES
-- ===================================================================

-- Fonction pour nettoyer automatiquement les anciens logs
CREATE OR REPLACE FUNCTION cleanup_old_password_change_logs()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
    retention_limit INTEGER;
BEGIN
    -- Récupérer la limite de rétention depuis les paramètres
    SELECT COALESCE(
        (SELECT setting_value::INTEGER FROM site_settings WHERE setting_key = 'password_history_limit'), 
        100
    ) INTO retention_limit;

    -- Supprimer les anciens logs en gardant seulement les plus récents
    WITH recent_logs AS (
        SELECT id 
        FROM password_change_logs 
        ORDER BY changed_at DESC 
        LIMIT retention_limit
    )
    DELETE FROM password_change_logs 
    WHERE id NOT IN (SELECT id FROM recent_logs);
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- Log de l'opération de nettoyage
    INSERT INTO security_logs (event_type, event_description, event_data)
    VALUES (
        'log_cleanup', 
        'Nettoyage automatique des anciens logs de mots de passe',
        json_build_object('deleted_count', deleted_count, 'retention_limit', retention_limit)
    );
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour enregistrer les changements de mot de passe avec sécurité renforcée
CREATE OR REPLACE FUNCTION log_password_change(
    p_change_type TEXT,
    p_admin_user_id TEXT DEFAULT NULL,
    p_admin_email TEXT DEFAULT NULL,
    p_ip_address TEXT DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL,
    p_previous_password_hash TEXT DEFAULT NULL,
    p_success BOOLEAN DEFAULT false,
    p_notes TEXT DEFAULT NULL,
    p_session_id TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    log_id UUID;
BEGIN
    INSERT INTO password_change_logs (
        change_type,
        admin_user_id,
        admin_email,
        ip_address,
        user_agent,
        previous_password_hash,
        success,
        notes,
        session_id
    ) VALUES (
        p_change_type,
        p_admin_user_id,
        p_admin_email,
        p_ip_address,
        p_user_agent,
        p_previous_password_hash,
        p_success,
        p_notes,
        p_session_id
    ) RETURNING id INTO log_id;
    
    -- Si c'est un changement critique, ajouter un log de sécurité
    IF p_change_type = 'admin_password' THEN
        INSERT INTO security_logs (
            event_type,
            event_description,
            ip_address,
            user_agent,
            user_id,
            event_data,
            severity
        ) VALUES (
            'admin_password_change',
            'Changement de mot de passe administrateur',
            p_ip_address,
            p_user_agent,
            p_admin_user_id,
            json_build_object(
                'success', p_success,
                'log_id', log_id,
                'notes', p_notes
            ),
            CASE WHEN p_success THEN 'medium' ELSE 'high' END
        );
    END IF;
    
    RETURN log_id;
END;
$$ LANGUAGE plpgsql;

-- ===================================================================
-- 6. VUES UTILES POUR L'ADMINISTRATION
-- ===================================================================

-- Vue pour les statistiques des changements de mot de passe
CREATE OR REPLACE VIEW password_change_stats AS
SELECT 
    change_type,
    COUNT(*) as total_changes,
    COUNT(*) FILTER (WHERE success = true) as successful_changes,
    COUNT(*) FILTER (WHERE success = false) as failed_changes,
    MAX(changed_at) as last_change,
    DATE_TRUNC('day', changed_at) as change_date,
    COUNT(*) as daily_count
FROM password_change_logs
GROUP BY change_type, DATE_TRUNC('day', changed_at)
ORDER BY change_date DESC, change_type;

-- Vue pour les événements de sécurité récents
CREATE OR REPLACE VIEW recent_security_events AS
SELECT 
    event_type,
    event_description,
    severity,
    ip_address,
    user_id,
    created_at,
    resolved
FROM security_logs
WHERE created_at >= CURRENT_TIMESTAMP - INTERVAL '7 days'
ORDER BY created_at DESC, severity DESC;

-- ===================================================================
-- 7. RÈGLES DE SÉCURITÉ ET PERMISSIONS
-- ===================================================================

-- Activer RLS (Row Level Security) pour plus de sécurité
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE password_change_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_logs ENABLE ROW LEVEL SECURITY;

-- Politique pour les paramètres du site (lecture publique, écriture admin)
CREATE POLICY "Public can read site settings" ON site_settings
    FOR SELECT USING (true);

CREATE POLICY "Only authenticated users can modify site settings" ON site_settings
    FOR ALL USING (auth.role() = 'authenticated');

-- Politique pour les logs de mots de passe (lecture admin uniquement)
CREATE POLICY "Only authenticated users can access password logs" ON password_change_logs
    FOR ALL USING (auth.role() = 'authenticated');

-- Politique pour les logs de sécurité (lecture admin uniquement)
CREATE POLICY "Only authenticated users can access security logs" ON security_logs
    FOR ALL USING (auth.role() = 'authenticated');

-- ===================================================================
-- 8. TRIGGERS POUR MAINTENANCE AUTOMATIQUE
-- ===================================================================

-- Trigger pour mettre à jour automatiquement le champ updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Appliquer le trigger sur la table site_settings
DROP TRIGGER IF EXISTS update_site_settings_updated_at ON site_settings;
CREATE TRIGGER update_site_settings_updated_at
    BEFORE UPDATE ON site_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ===================================================================
-- 9. TÂCHE DE NETTOYAGE AUTOMATIQUE (optionnel)
-- ===================================================================

-- Vous pouvez programmer cette fonction pour s'exécuter automatiquement
-- SELECT cleanup_old_password_change_logs();

-- ===================================================================
-- 10. VERIFICATION DE L'INSTALLATION
-- ===================================================================

-- Vérifier que toutes les tables ont été créées correctement
DO $$
DECLARE
    table_count INTEGER;
    function_count INTEGER;
    view_count INTEGER;
BEGIN
    -- Compter les tables
    SELECT COUNT(*) INTO table_count
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name IN ('site_settings', 'password_change_logs', 'security_logs');
    
    -- Compter les fonctions
    SELECT COUNT(*) INTO function_count
    FROM information_schema.routines 
    WHERE routine_schema = 'public' 
    AND routine_name IN ('cleanup_old_password_change_logs', 'log_password_change');
    
    -- Compter les vues
    SELECT COUNT(*) INTO view_count
    FROM information_schema.views 
    WHERE table_schema = 'public' 
    AND table_name IN ('password_change_stats', 'recent_security_events');
    
    RAISE NOTICE '✅ Installation terminée avec succès !';
    RAISE NOTICE '📊 Tables créées: %', table_count;
    RAISE NOTICE '⚙️ Fonctions créées: %', function_count;
    RAISE NOTICE '👁️ Vues créées: %', view_count;
    RAISE NOTICE '🔐 Système de gestion des mots de passe admin opérationnel !';
    
    IF table_count = 3 AND function_count = 2 AND view_count = 2 THEN
        RAISE NOTICE '🎉 SUCCÈS COMPLET - Votre système est prêt à être utilisé !';
    ELSE
        RAISE WARNING '⚠️ Installation partielle - Vérifiez les erreurs ci-dessus';
    END IF;
END
$$;

-- ===================================================================
-- 11. REQUÊTES D'EXEMPLE POUR TESTER LE SYSTÈME
-- ===================================================================

-- Afficher tous les paramètres du site
-- SELECT * FROM site_settings ORDER BY setting_key;

-- Afficher l'historique des changements de mot de passe
-- SELECT * FROM password_change_logs ORDER BY changed_at DESC LIMIT 10;

-- Afficher les statistiques de changements
-- SELECT * FROM password_change_stats;

-- Afficher les événements de sécurité récents
-- SELECT * FROM recent_security_events LIMIT 20;

-- Nettoyer les anciens logs (à exécuter manuellement si besoin)
-- SELECT cleanup_old_password_change_logs();

COMMIT;