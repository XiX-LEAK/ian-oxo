// Test simple pour vérifier si l'inscription fonctionne
import { supabase } from './supabase';

export const testBasicSignup = async () => {
  console.log('🧪 Test d\'inscription simple...');
  
  const testEmail = `simple_test_${Date.now()}@example.com`;
  
  try {
    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: 'testpassword123'
    });
    
    if (error) {
      console.log('❌ Erreur inscription:', {
        message: error.message,
        status: error.status,
        name: error.name
      });
      
      if (error.status === 429) {
        console.log('⏰ Limite de taux atteinte. Attendez quelques minutes.');
        return { blocked: true, error };
      }
      
      return { success: false, error };
    }
    
    if (data?.user) {
      console.log('✅ Inscription réussie!', {
        userId: data.user.id,
        email: data.user.email,
        confirmed: data.user.email_confirmed_at
      });
      return { success: true, user: data.user };
    }
    
    return { success: false, error: 'Pas d\'utilisateur créé' };
    
  } catch (exception) {
    console.error('💥 Exception:', exception);
    return { success: false, error: exception };
  }
};

// Vérifier le status de Supabase
export const checkSupabaseStatus = async () => {
  console.log('🔍 Vérification du status Supabase...');
  
  try {
    // Test de base avec getSession
    const { error } = await supabase.auth.getSession();
    
    if (error) {
      console.log('❌ Problème de connexion:', error.message);
      return { connected: false, error };
    }
    
    console.log('✅ Connexion Supabase OK');
    return { connected: true };
    
  } catch (exception) {
    console.error('💥 Exception connexion:', exception);
    return { connected: false, error: exception };
  }
};

// Attendre que la limite de taux soit levée
export const waitForRateLimit = (minutes: number = 5) => {
  console.log(`⏰ Attente de ${minutes} minutes pour lever la limite de taux...`);
  
  return new Promise(resolve => {
    setTimeout(() => {
      console.log('✅ Période d\'attente terminée, vous pouvez réessayer');
      resolve(true);
    }, minutes * 60 * 1000);
  });
};