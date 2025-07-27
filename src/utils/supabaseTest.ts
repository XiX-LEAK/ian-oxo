import { supabase } from './supabase';

export const testSupabaseConnection = async () => {
  console.log('🧪 Test de la connexion Supabase...');
  
  try {
    // Test 1: Connexion de base
    const { data, error } = await supabase.auth.getSession();
    console.log('✅ Test 1 - GetSession:', { 
      success: !error, 
      error: error?.message 
    });
    
    // Test 2: Configuration
    const config = {
      url: supabase.supabaseUrl,
      key: supabase.supabaseKey ? 'PRÉSENTE' : 'MANQUANTE'
    };
    console.log('🔧 Configuration Supabase:', config);
    
    // Test 3: Tentative de ping avec une requête simple
    try {
      const { data: settings, error: settingsError } = await supabase
        .from('site_settings')
        .select('*')
        .limit(1);
        
      console.log('✅ Test 2 - Accès BD:', { 
        success: !settingsError, 
        error: settingsError?.message,
        hasData: !!settings
      });
    } catch (err) {
      console.log('❌ Test 2 - Accès BD échoué:', err);
    }
    
    // Test 4: Test d'inscription avec données de test
    console.log('🧪 Test d\'inscription avec données de test...');
    const testEmail = `test_${Date.now()}@example.com`;
    
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: 'test123456',
      options: {
        data: {
          username: `test_${Date.now()}`,
          role: 'visitor'
        }
      }
    });
    
    console.log('✅ Test 3 - Inscription test:', {
      success: !signUpError,
      error: signUpError?.message,
      userCreated: !!signUpData?.user
    });
    
    return {
      connectionOk: !error,
      dbAccessOk: !settingsError,
      signupOk: !signUpError
    };
    
  } catch (error: any) {
    console.error('💥 Erreur lors du test Supabase:', error);
    return {
      connectionOk: false,
      dbAccessOk: false,
      signupOk: false,
      globalError: error.message
    };
  }
};

export const logSupabaseConfig = () => {
  console.log('🔧 Configuration Supabase actuelle:');
  console.log('URL:', process.env.VITE_SUPABASE_URL || 'NON DÉFINIE');
  console.log('Clé:', process.env.VITE_SUPABASE_ANON_KEY ? 'PRÉSENTE' : 'NON DÉFINIE');
};