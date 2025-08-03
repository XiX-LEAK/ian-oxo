// 🎯 NOUVEAU STORE AGENTS - ULTRA SIMPLE QUI MARCHE !
import { create } from 'zustand';
import { firebaseService } from '@/services/firebaseService';
import { type SimpleAgentData } from '@/services/newAgentService';

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
    console.log('📋 Chargement agents depuis Firebase...');
    try {
      set({ isLoading: true, error: null });
      const result = await firebaseService.getAll();
      if (result.error) {
        throw new Error('Erreur Firebase');
      }
      console.log('✅ Agents chargés depuis Firebase:', result.data.length);
      set({ agents: result.data, isLoading: false });
    } catch (error) {
      console.error('❌ Erreur chargement Firebase:', error);
      set({ error: 'Erreur lors du chargement des agents', isLoading: false });
    }
  },

  // ➕ AJOUTER UN AGENT
  addAgent: async (agentData) => {
    console.log('➕ Ajout agent via Firebase:', agentData.name);
    try {
      set({ isLoading: true, error: null });
      const result = await firebaseService.create(agentData);
      
      if (result.error) {
        throw new Error('Erreur Firebase');
      }
      
      // Recharger tous les agents pour la sync
      const allAgents = await firebaseService.getAll();
      if (!allAgents.error) {
        set({ agents: allAgents.data, isLoading: false });
      }
      
      console.log('✅ Agent ajouté avec succès via Firebase');
      return true;
    } catch (error) {
      console.error('❌ Erreur ajout Firebase:', error);
      set({ error: 'Erreur lors de l\'ajout', isLoading: false });
      return false;
    }
  },

  // ✏️ MODIFIER UN AGENT
  updateAgent: async (id, updates) => {
    console.log('✏️ Modification agent via Firebase:', id);
    try {
      set({ isLoading: true, error: null });
      const result = await firebaseService.update(id, updates);
      
      if (result.error) {
        throw new Error('Erreur Firebase');
      }
      
      // Recharger tous les agents pour la sync
      const allAgents = await firebaseService.getAll();
      if (!allAgents.error) {
        set({ agents: allAgents.data, isLoading: false });
      }
      
      console.log('✅ Agent modifié avec succès via Firebase');
      return true;
    } catch (error) {
      console.error('❌ Erreur modification Firebase:', error);
      set({ error: 'Erreur lors de la modification', isLoading: false });
      return false;
    }
  },

  // 🗑️ SUPPRIMER UN AGENT
  deleteAgent: async (id) => {
    console.log('🗑️ Suppression agent via Firebase:', id);
    try {
      set({ isLoading: true, error: null });
      const result = await firebaseService.delete(id);
      
      if (result.error) {
        throw new Error('Erreur Firebase');
      }
      
      // Recharger tous les agents pour la sync
      const allAgents = await firebaseService.getAll();
      if (!allAgents.error) {
        set({ agents: allAgents.data, isLoading: false });
      }
      
      console.log('✅ Agent supprimé avec succès via Firebase');
      return true;
    } catch (error) {
      console.error('❌ Erreur suppression Firebase:', error);
      set({ error: 'Erreur lors de la suppression', isLoading: false });
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
      const success = newAgentService.clear();
      if (success) {
        set({ agents: [], error: null });
        console.log('✅ Nettoyage terminé');
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ Erreur nettoyage:', error);
      return false;
    }
  }
}));