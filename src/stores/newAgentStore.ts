// 🎯 NOUVEAU STORE AGENTS - FIREBASE DIRECT !
import { create } from 'zustand';
import { firebaseService } from '@/services/firebaseService';
// Définir SimpleAgentData directement ici
interface SimpleAgentData {
  id: string;
  name: string;
  identifier: string;
  phone_number?: string;
  email?: string;
  website_url?: string;
  about?: string;
  internal_notes?: string;
  platforms?: string[];
  categories?: string[];
  languages?: string[];
  specialties?: string[];
  created_at: string;
}

interface NewAgentStore {
  // État
  agents: SimpleAgentData[];
  isLoading: boolean;
  error: string | null;

  // Actions
  loadAgents: () => Promise<void>;
  addAgent: (agentData: Omit<SimpleAgentData, 'id' | 'created'>) => Promise<boolean>;
  updateAgent: (id: string, updates: Partial<SimpleAgentData>) => Promise<boolean>;
  deleteAgent: (id: string) => Promise<boolean>;
  clearError: () => void;
  clearAll: () => boolean;
}

export const useNewAgentStore = create<NewAgentStore>((set, get) => ({
  // État initial
  agents: [],
  isLoading: false,
  error: null,

  // 📋 CHARGER TOUS LES AGENTS
  loadAgents: async () => {
    console.log('📋 Chargement agents Firebase DIRECT...');
    try {
      set({ isLoading: true, error: null });
      const result = await firebaseService.getAll();
      if (result.error) {
        console.error('🔥 Erreur détaillée getAll:', result.error);
        throw new Error('Erreur Firebase: ' + JSON.stringify(result.error));
      }
      console.log('✅ Agents chargés Firebase:', result.data.length);
      set({ agents: result.data, isLoading: false });
    } catch (error) {
      console.error('❌ Erreur chargement Firebase:', error);
      set({ error: 'Erreur lors du chargement des agents', isLoading: false });
    }
  },

  // ➕ AJOUTER UN AGENT
  addAgent: async (agentData) => {
    console.log('➕ Ajout agent Firebase DIRECT:', agentData.name || agentData);
    console.log('📦 Data complète envoyée à Firebase:', agentData);
    try {
      set({ isLoading: true, error: null });
      
      console.log('🔥 APPEL firebaseService.create...');
      const result = await firebaseService.create(agentData);
      console.log('📥 Résultat firebaseService.create:', result);
      
      if (result.error) {
        console.error('🔥 ERREUR FIREBASE CREATE:', result.error);
        set({ error: 'Erreur Firebase: ' + JSON.stringify(result.error), isLoading: false });
        return false;
      }
      
      // Recharger tous les agents pour la sync
      console.log('🔄 Rechargement agents...');
      const allAgents = await firebaseService.getAll();
      if (!allAgents.error) {
        set({ agents: allAgents.data, isLoading: false });
        console.log('✅ Agents rechargés:', allAgents.data.length);
      }
      
      console.log('✅ Agent ajouté avec succès Firebase');
      return true;
    } catch (error) {
      console.error('❌ ERREUR COMPLETE AJOUT:', error);
      set({ error: 'ERREUR: ' + error.message + ' | ' + JSON.stringify(error), isLoading: false });
      return false;
    }
  },

  // ✏️ MODIFIER UN AGENT
  updateAgent: async (id, updates) => {
    console.log('✏️ Modification agent Firebase DIRECT:', id);
    console.log('🔍 Type de ID reçu dans store:', typeof id);
    console.log('📝 Updates reçus:', updates);
    try {
      set({ isLoading: true, error: null });
      
      console.log('🔥 APPEL firebaseService.update...');
      const result = await firebaseService.update(id, updates);
      console.log('📥 Résultat firebaseService.update:', result);
      
      if (result.error) {
        console.error('🔥 ERREUR FIREBASE UPDATE:', result.error);
        set({ error: 'Erreur Firebase: ' + JSON.stringify(result.error), isLoading: false });
        return false;
      }
      
      // Recharger tous les agents pour la sync
      console.log('🔄 Rechargement agents après modification...');
      const allAgents = await firebaseService.getAll();
      if (!allAgents.error) {
        set({ agents: allAgents.data, isLoading: false });
        console.log('✅ Agents rechargés:', allAgents.data.length);
      }
      
      console.log('✅ Agent modifié avec succès Firebase');
      return true;
    } catch (error) {
      console.error('❌ ERREUR COMPLETE MODIFICATION:', error);
      set({ error: 'ERREUR: ' + error.message + ' | ' + JSON.stringify(error), isLoading: false });
      return false;
    }
  },

  // 🗑️ SUPPRIMER UN AGENT
  deleteAgent: async (id) => {
    console.log('🗑️ Suppression agent Firebase DIRECT:', id);
    console.log('🔍 Type de ID reçu dans store:', typeof id);
    try {
      set({ isLoading: true, error: null });
      
      console.log('🔥 APPEL firebaseService.delete...');
      const result = await firebaseService.delete(id);
      console.log('📥 Résultat firebaseService.delete:', result);
      
      if (result.error) {
        console.error('🔥 ERREUR FIREBASE DELETE:', result.error);
        set({ error: 'Erreur Firebase: ' + JSON.stringify(result.error), isLoading: false });
        return false;
      }
      
      // Recharger tous les agents pour la sync
      console.log('🔄 Rechargement agents après suppression...');
      const allAgents = await firebaseService.getAll();
      if (!allAgents.error) {
        set({ agents: allAgents.data, isLoading: false });
        console.log('✅ Agents rechargés:', allAgents.data.length);
      }
      
      console.log('✅ Agent supprimé avec succès Firebase');
      return true;
    } catch (error) {
      console.error('❌ ERREUR COMPLETE SUPPRESSION:', error);
      set({ error: 'ERREUR: ' + error.message + ' | ' + JSON.stringify(error), isLoading: false });
      return false;
    }
  },

  // 🧹 NETTOYER ERREUR
  clearError: () => {
    set({ error: null });
  },

  // 🧹 NETTOYER TOUT
  clearAll: () => {
    console.log('🧹 Nettoyage complet...');
    try {
      set({ agents: [], error: null });
      console.log('✅ Nettoyage terminé');
      return true;
    } catch (error) {
      console.error('❌ Erreur nettoyage:', error);
      return false;
    }
  }
}));