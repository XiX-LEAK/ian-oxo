import { supabase } from './supabase';

// Test complet de l'inscription Supabase
export const testSignUp = async () => {
  console.log('🧪 === TEST D\'INSCRIPTION SUPABASE ===');
  
  // 1. Vérifier la connexion
  console.log('1️⃣ Test de connexion...');
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    console.log('✅ Connexion:', { sessionError: sessionError?.message, hasSession: !!session });
  } catch (error) {
    console.error('❌ Erreur de connexion:', error);
    return;
  }

  // 2. Test simple d'inscription
  console.log('2️⃣ Test d\'inscription...');
  const testEmail = `test_${Date.now()}@test.com`;
  const testPassword = 'test123456';
  const testUsername = `test_${Date.now()}`;

  try {
    console.log('📤 Envoi de la demande d\'inscription:', {
      email: testEmail,
      password: '[MASQUÉ]',
      username: testUsername
    });

    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          username: testUsername,
          role: 'visitor',
          isAdmin: false
        }
      }
    });

    console.log('📥 Réponse Supabase:');
    console.log('- User:', data?.user ? {
      id: data.user.id,
      email: data.user.email,
      created_at: data.user.created_at,
      email_confirmed_at: data.user.email_confirmed_at,
      user_metadata: data.user.user_metadata
    } : 'Aucun utilisateur créé');
    
    console.log('- Session:', data?.session ? 'Session créée' : 'Pas de session');
    console.log('- Erreur:', error ? {
      message: error.message,
      status: error.status,
      name: error.name,
      details: error
    } : 'Aucune erreur');

    if (error) {
      console.log('🔍 Analyse de l\'erreur:');
      console.log('- Type:', typeof error);
      console.log('- Keys:', Object.keys(error));
      console.log('- toString():', error.toString());
    }

    return { data, error };
    
  } catch (exception) {
    console.error('💥 Exception JavaScript:', {
      message: exception.message,
      stack: exception.stack,
      type: typeof exception
    });
    return { data: null, error: exception };
  }
};

// Test des paramètres Supabase
export const checkSupabaseConfig = () => {
  console.log('🔧 === CONFIGURATION SUPABASE ===');
  console.log('URL:', import.meta.env.VITE_SUPABASE_URL);
  console.log('Key présente:', !!import.meta.env.VITE_SUPABASE_ANON_KEY);
  console.log('Key longueur:', import.meta.env.VITE_SUPABASE_ANON_KEY?.length || 0);
  
  // Vérifier la validité de l'URL
  try {
    const url = new URL(import.meta.env.VITE_SUPABASE_URL);
    console.log('✅ URL valide:', {
      protocol: url.protocol,
      host: url.host,
      pathname: url.pathname
    });
  } catch (error) {
    console.error('❌ URL invalide:', error.message);
  }
};

// Test de la base de données
export const testDatabase = async () => {
  console.log('🗄️ === TEST BASE DE DONNÉES ===');
  
  try {
    // Test d'accès aux utilisateurs (peut échouer si pas autorisé)
    console.log('1️⃣ Test accès table auth.users...');
    const { data: users, error: usersError } = await supabase
      .from('auth.users')
      .select('*')
      .limit(1);
      
    console.log('Résultat users:', { usersError: usersError?.message, count: users?.length });
    
    // Test d'accès aux paramètres du site
    console.log('2️⃣ Test accès table site_settings...');
    const { data: settings, error: settingsError } = await supabase
      .from('site_settings')
      .select('*')
      .limit(1);
      
    console.log('Résultat settings:', { settingsError: settingsError?.message, count: settings?.length });
    
  } catch (error) {
    console.error('❌ Erreur test BDD:', error);
  }
};

// Lancer tous les tests
export const runAllTests = async () => {
  checkSupabaseConfig();
  await testDatabase();
  await testSignUp();
  
  // Import dynamique pour éviter les erreurs de compilation
  try {
    const { runAuthDiagnostics } = await import('./supabaseAuthTest');
    await runAuthDiagnostics();
  } catch (error) {
    console.log('⚠️ Impossible de charger les diagnostics auth:', error);
  }
};