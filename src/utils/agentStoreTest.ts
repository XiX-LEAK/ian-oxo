/**
 * Test simple pour vérifier l'intégration du AgentStore avec Supabase
 */

import { useAgentStore } from '@/stores/agentStore';
import type { CreateAgentRequest } from '@/types/agent';

export const testAgentStoreIntegration = async () => {
  console.log('🧪 Test de l\'intégration AgentStore avec Supabase');
  
  const store = useAgentStore.getState();
  
  // Test 1: Vérifier le status Supabase
  console.log('📊 Status Supabase:', store.getSupabaseStatus());
  
  // Test 2: Charger les agents
  console.log('\n🔄 Test loadAgents...');
  try {
    await store.loadAgents();
    console.log(`✅ ${store.agents.length} agents chargés`);
  } catch (error) {
    console.error('❌ Erreur loadAgents:', error);
  }
  
  // Test 3: Ajouter un agent de test
  console.log('\n➕ Test addAgent...');
  const testAgent: CreateAgentRequest = {
    name: 'Agent Test Integration',
    identifier: 'test-agent-' + Date.now(),
    phoneNumber: '+33123456789',
    platform: 'whatsapp',
    category: 'electronics',
    about: 'Agent de test pour l\'intégration Supabase',
    adminNotes: 'Créé par le test d\'intégration',
    languages: ['fr', 'en'],
    specialties: ['test'],
    contactInfo: {
      email: 'test@example.com',
      websiteUrl: 'https://test.com'
    }
  };
  
  try {
    const success = await store.addAgent(testAgent);
    if (success) {
      console.log('✅ Agent ajouté avec succès');
      console.log(`📈 Total agents: ${store.agents.length}`);
    } else {
      console.log('❌ Échec ajout agent');
    }
  } catch (error) {
    console.error('❌ Erreur addAgent:', error);
  }
  
  // Test 4: Synchronisation
  console.log('\n🔄 Test syncWithSupabase...');
  try {
    const success = await store.syncWithSupabase();
    if (success) {
      console.log('✅ Synchronisation réussie');
      console.log(`📈 Total agents après sync: ${store.agents.length}`);
    } else {
      console.log('❌ Échec synchronisation');
    }
  } catch (error) {
    console.error('❌ Erreur sync:', error);
  }
  
  // Test 5: État final
  console.log('\n📋 État final du store:');
  console.log('- Agents:', store.agents.length);
  console.log('- Erreur:', store.error);
  console.log('- Loading:', store.isLoading);
  
  console.log('\n🏁 Test terminé');
};

// Export pour pouvoir être appelé depuis la console
if (typeof window !== 'undefined') {
  (window as any).testAgentStoreIntegration = testAgentStoreIntegration;
}