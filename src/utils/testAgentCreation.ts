// 🔍 TEST DIRECT DE CRÉATION D'AGENT
// Pour voir exactement pourquoi ça échoue

import { supabase } from '@/utils/supabase';

export const testAgentCreation = async () => {
  console.log('🧪 TEST CRÉATION AGENT DIRECT');
  
  // 1. Test connexion basique
  console.log('1. Test connexion...');
  try {
    const { data: pingData, error: pingError } = await supabase
      .from('agents')
      .select('count', { count: 'exact', head: true });
    
    if (pingError) {
      console.error('❌ Connexion échouée:', pingError);
      return { success: false, error: `Connexion: ${pingError.message}` };
    }
    console.log('✅ Connexion OK');
  } catch (err) {
    console.error('❌ Erreur connexion:', err);
    return { success: false, error: `Connexion fatale: ${err.message}` };
  }
  
  // 2. Test structure table
  console.log('2. Test structure table...');
  try {
    const { data: structureData, error: structureError } = await supabase
      .from('agents')
      .select('*')
      .limit(1);
    
    if (structureError) {
      console.error('❌ Structure table:', structureError);
      return { success: false, error: `Structure: ${structureError.message}` };
    }
    console.log('✅ Table agents accessible');
  } catch (err) {
    console.error('❌ Erreur structure:', err);
    return { success: false, error: `Structure fatale: ${err.message}` };
  }
  
  // 3. Test création avec données EXACTES du formulaire
  console.log('3. Test création agent...');
  try {
    const testAgent = {
      name: 'Test Agent Direct',
      identifier: `test_${Date.now()}`,
      phone_number: '+33123456789',
      email: 'test@example.com',
      website_url: 'https://example.com',
      platform: 'whatsapp',
      category: 'other',
      status: 'active',
      description: 'Agent de test',
      about_description: 'Description test',
      internal_notes: 'Notes internes test',
      full_name: 'Agent Test Complet'
    };
    
    console.log('📤 Données envoyées:', testAgent);
    
    const { data, error } = await supabase
      .from('agents')
      .insert([testAgent])
      .select()
      .single();
    
    if (error) {
      console.error('❌ Création échouée:', error);
      console.error('🔍 Détails erreur:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      return { success: false, error: `Création: ${error.message}` };
    }
    
    console.log('✅ Agent créé avec succès:', data);
    
    // Nettoyer
    await supabase.from('agents').delete().eq('id', data.id);
    console.log('🧹 Agent test supprimé');
    
    return { success: true, data };
    
  } catch (err) {
    console.error('❌ Erreur création:', err);
    return { success: false, error: `Création fatale: ${err.message}` };
  }
};

// Export pour la console
(window as any).testAgentCreation = testAgentCreation;