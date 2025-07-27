import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

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

// Créer un client Supabase même avec des valeurs par défaut
const defaultUrl = supabaseUrl || 'https://placeholder.supabase.co';
const defaultKey = supabaseAnonKey || 'placeholder-key';

export const supabase = createClient(defaultUrl, defaultKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Flag pour savoir si Supabase est vraiment configuré
export const isSupabaseConfigured = isRealUrl && isRealKey;