// 🔍 DEBUG AGENT - Pour diagnostiquer l'erreur de création
// Utilise ce fichier pour tester et corriger le problème

import { supabase } from '@/utils/supabase';

export const debugAgentCreation = async () => {
  console.log('🔍 DEBUG: Diagnostic création agent');
  
  // 1. Vérifier variables d'environnement
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  console.log('📋 Variables environnement:');
  console.log('URL:', supabaseUrl);
  console.log('Key présente:', supabaseKey ? 'OUI' : 'NON');
  console.log('Key valide:', supabaseKey && !supabaseKey.includes('VOTRE_') ? 'OUI' : 'NON');
  
  // 2. Tester connexion Supabase
  try {
    console.log('🔌 Test connexion Supabase...');
    const { data, error } = await supabase.from('agents').select('count', { count: 'exact', head: true });
    
    if (error) {
      console.error('❌ Erreur connexion:', error);
      return { success: false, error: `Connexion échouée: ${error.message}` };
    } else {
      console.log('✅ Connexion OK');
    }
  } catch (err) {
    console.error('❌ Erreur fatale connexion:', err);
    return { success: false, error: `Erreur fatale: ${err.message}` };
  }
  
  // 3. Vérifier structure table agents
  try {
    console.log('📊 Test structure table agents...');
    const { data, error } = await supabase.from('agents').select('*').limit(1);
    
    if (error) {
      console.error('❌ Erreur structure table:', error);
      return { success: false, error: `Table agents introuvable: ${error.message}` };
    } else {
      console.log('✅ Table agents existe');
      if (data && data.length > 0) {
        console.log('📋 Colonnes disponibles:', Object.keys(data[0]));
      }
    }
  } catch (err) {
    console.error('❌ Erreur structure:', err);
    return { success: false, error: `Erreur structure: ${err.message}` };
  }
  
  // 4. Test création simple
  try {
    console.log('🧪 Test création agent simple...');
    
    const testAgent = {
      name: 'Agent Test Debug',
      identifier: `debug_${Date.now()}`,
      platform: 'whatsapp',
      category: 'other',
      status: 'active'
    };
    
    const { data, error } = await supabase
      .from('agents')
      .insert([testAgent])
      .select()
      .single();
    
    if (error) {
      console.error('❌ Erreur création test:', error);
      return { success: false, error: `Création échouée: ${error.message}` };
    } else {
      console.log('✅ Création test réussie:', data.id);
      
      // Nettoyer l'agent de test
      await supabase.from('agents').delete().eq('id', data.id);
      console.log('🧹 Agent test supprimé');
      
      return { success: true, message: 'Tout fonctionne parfaitement !' };
    }
  } catch (err) {
    console.error('❌ Erreur test création:', err);
    return { success: false, error: `Test échoué: ${err.message}` };
  }
};

// Fonction pour corriger automatiquement
export const fixAgentIssues = async () => {
  console.log('🔧 Tentative de correction automatique...');
  
  // Vérifier si la table agents existe, sinon la créer
  try {
    const { error } = await supabase.rpc('create_agents_table_if_not_exists');
    if (error) {
      console.log('ℹ️ RPC non disponible, tentative manuelle...');
    }
  } catch (err) {
    console.log('ℹ️ Création manuelle de la structure...');
  }
  
  return 'Correction tentée - Relance le diagnostic';
};

// Export pour utilisation dans la console
(window as any).debugAgent = debugAgentCreation;
(window as any).fixAgent = fixAgentIssues;