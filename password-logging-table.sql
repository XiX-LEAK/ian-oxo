-- Création de la table pour l'historique des changements de mots de passe
CREATE TABLE IF NOT EXISTS password_change_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  change_type VARCHAR(20) NOT NULL CHECK (change_type IN ('site_password', 'admin_password')),
  admin_user_id VARCHAR(100),
  admin_email VARCHAR(255),
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address VARCHAR(45),
  user_agent TEXT,
  previous_password_hash VARCHAR(255),
  success BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_password_logs_change_type ON password_change_logs(change_type);
CREATE INDEX IF NOT EXISTS idx_password_logs_changed_at ON password_change_logs(changed_at);
CREATE INDEX IF NOT EXISTS idx_password_logs_admin_email ON password_change_logs(admin_email);

-- RLS (Row Level Security) - optionnel selon tes besoins de sécurité
ALTER TABLE password_change_logs ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre l'insertion depuis l'application
CREATE POLICY "Enable insert for authenticated users" ON password_change_logs
FOR INSERT WITH CHECK (true);

-- Politique pour permettre la lecture depuis l'application
CREATE POLICY "Enable select for authenticated users" ON password_change_logs
FOR SELECT USING (true);

-- Commentaires pour la documentation
COMMENT ON TABLE password_change_logs IS 'Historique des changements de mots de passe du site et admin';
COMMENT ON COLUMN password_change_logs.change_type IS 'Type de changement: site_password ou admin_password';
COMMENT ON COLUMN password_change_logs.admin_user_id IS 'ID de l utilisateur admin qui a effectué le changement';
COMMENT ON COLUMN password_change_logs.admin_email IS 'Email de l admin qui a effectué le changement';
COMMENT ON COLUMN password_change_logs.previous_password_hash IS 'Hash du mot de passe précédent pour audit';
COMMENT ON COLUMN password_change_logs.success IS 'Indique si le changement a réussi';