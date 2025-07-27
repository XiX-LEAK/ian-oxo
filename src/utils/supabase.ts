import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://qoynvpciuxhipessvojj.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFveW52cGNpdXhoaXBlc3N2b2pqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5OTgzMjgsImV4cCI6MjA2ODU3NDMyOH0.md1_Pxl8YyUTOxdTzhCNgfiIrQkH-WYTIg7XfblL_z8';

// Vérification des variables d'environnement avec logs pour debug
console.log('🔍 Configuration Supabase:');
console.log('- URL:', supabaseUrl ? supabaseUrl.substring(0, 30) + '...' : '❌ MANQUANTE');
console.log('- Key:', supabaseAnonKey ? '✅ Présente' : '❌ MANQUANTE');

// Vérifier si les variables contiennent les vraies valeurs ou les placeholders
const isRealUrl = supabaseUrl && !supabaseUrl.includes('VOTRE_PROJECT_ID');
const isRealKey = supabaseAnonKey && !supabaseAnonKey.includes('VOTRE_CLE_COMPLETE');

if (!supabaseUrl || !supabaseAnonKey || !isRealUrl || !isRealKey) {
  console.warn('⚠️ Configuration Supabase manquante ou incomplète');
  console.warn('📋 Instructions de configuration:');
  console.warn('1. Allez sur https://app.supabase.com');
  console.warn('2. Ouvrez votre projet');
  console.warn('3. Settings > API');
  console.warn('4. Copiez les vraies valeurs dans le fichier .env');
  console.warn('5. Redémarrez le serveur');
  console.warn('');
  console.warn('💡 En attendant, le système utilisera localStorage');
}

// Créer un client Supabase avec les vraies valeurs forcées
const defaultUrl = 'https://qoynvpciuxhipessvojj.supabase.co';
const defaultKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFveW52cGNpdXhoaXBlc3N2b2pqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5OTgzMjgsImV4cCI6MjA2ODU3NDMyOH0.md1_Pxl8YyUTOxdTzhCNgfiIrQkH-WYTIg7XfblL_z8'.trim();

// Configuration debug pour identifier le problème
console.log('🔍 Debug Supabase:', {
  url: defaultUrl,
  keyLength: defaultKey.length,
  keyStart: defaultKey.substring(0, 20),
  env: typeof import.meta.env,
  nodeEnv: process?.env?.NODE_ENV || 'unknown'
});

// Créer le client Supabase
const supabaseClient = createClient(defaultUrl, defaultKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export const supabase = supabaseClient;

// Flag pour savoir si Supabase est vraiment configuré - forcé à true
export const isSupabaseConfigured = true;