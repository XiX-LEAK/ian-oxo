// Test spécifique des paramètres d'authentification Supabase
import { supabase } from './supabase';

export const checkAuthSettings = async () => {
  console.log('🔐 === VÉRIFICATION PARAMÈTRES AUTH ===');
  
  try {
    // 1. Vérifier les paramètres du projet
    console.log('1️⃣ URL du projet:', import.meta.env.VITE_SUPABASE_URL);
    
    // 2. Test de connectivité de base
    const response = await fetch(import.meta.env.VITE_SUPABASE_URL + '/rest/v1/', {
      method: 'HEAD',
      headers: {
        'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
      }
    });
    
    console.log('2️⃣ Connectivité API:', {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries())
    });

    // 3. Test avec une inscription simple
    console.log('3️⃣ Test inscription basique...');
    const testEmail = `simple_test_${Date.now()}@example.com`;
    
    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: 'simpletest123'
    });
    
    console.log('Résultat inscription basique:', {
      hasUser: !!data?.user,
      hasSession: !!data?.session,
      userId: data?.user?.id,
      userEmail: data?.user?.email,
      confirmed: data?.user?.email_confirmed_at,
      error: error ? {
        message: error.message,
        status: error.status,
        name: error.name,
        __isAuthError: error.__isAuthError
      } : null
    });

    return { success: !error, error };
    
  } catch (error) {
    console.error('💥 Erreur test auth:', error);
    return { success: false, error };
  }
};

// Test des paramètres du projet Supabase via l'API publique
export const getProjectSettings = async () => {
  console.log('⚙️ === PARAMÈTRES PROJET ===');
  
  try {
    const url = import.meta.env.VITE_SUPABASE_URL;
    
    // Extraire l'ID du projet de l'URL
    const projectMatch = url.match(/https:\/\/([^.]+)\.supabase\.co/);
    const projectId = projectMatch ? projectMatch[1] : 'inconnu';
    
    console.log('🆔 ID Projet:', projectId);
    console.log('🔗 URL complète:', url);
    
    // Test des endpoints publics
    const endpoints = [
      '/rest/v1/',
      '/auth/v1/settings',
      '/auth/v1/signup'
    ];
    
    for (const endpoint of endpoints) {
      try {
        const response = await fetch(url + endpoint, {
          method: endpoint.includes('signup') ? 'POST' : 'GET',
          headers: {
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
            'Content-Type': 'application/json'
          },
          ...(endpoint.includes('signup') ? {
            body: JSON.stringify({
              email: 'test@test.com',
              password: 'test123'
            })
          } : {})
        });
        
        console.log(`📡 ${endpoint}:`, {
          status: response.status,
          statusText: response.statusText,
          contentType: response.headers.get('content-type')
        });
        
      } catch (error) {
        console.log(`❌ ${endpoint}:`, error.message);
      }
    }
    
  } catch (error) {
    console.error('💥 Erreur paramètres projet:', error);
  }
};

// Lancer tous les tests d'authentification
export const runAuthDiagnostics = async () => {
  await getProjectSettings();
  await checkAuthSettings();
};