// 🎯 NOUVEAU STORE AGENTS - ULTRA SIMPLE QUI MARCHE !
import { create } from 'zustand';
import { newAgentService, type SimpleAgentData } from '@/services/newAgentService';

interface NewAgentStore {
  // État
  agents: SimpleAgentData[];
  isLoading: boolean;
  error: string | null;

  // Actions
  loadAgents: () => void;
  addAgent: (agentData: Omit<SimpleAgentData, 'id' | 'created'>) => boolean;
  updateAgent: (id: string, updates: Partial<SimpleAgentData>) => boolean;
  deleteAgent: (id: string) => boolean;
  clearError: () => void;
  clearAll: () => boolean;
}

export const useNewAgentStore = create<NewAgentStore>((set, get) => ({
  // État initial
  agents: [],
  isLoading: false,
  error: null,

  // 📋 CHARGER TOUS LES AGENTS
  loadAgents: () => {
    console.log('📋 Chargement agents...');
    try {
      set({ isLoading: true, error: null });
      const agents = newAgentService.getAll();
      set({ agents, isLoading: false });
      console.log('✅ Agents chargés:', agents.length);
    } catch (error) {
      console.error('❌ Erreur chargement:', error);
      set({ error: 'Erreur de chargement', isLoading: false });
    }
  },

  // ➕ AJOUTER UN AGENT
  addAgent: (agentData) => {
    console.log('➕ Ajout agent:', agentData.name);
    try {
      set({ isLoading: true, error: null });
      const newAgent = newAgentService.create(agentData);
      
      if (newAgent) {
        const agents = newAgentService.getAll();
        set({ agents, isLoading: false });
        console.log('✅ Agent ajouté avec succès');
        return true;
      } else {
        set({ error: 'Erreur lors de l\'ajout', isLoading: false });
        return false;
      }
    } catch (error) {
      console.error('❌ Erreur ajout:', error);
      set({ error: 'Erreur lors de l\'ajout', isLoading: false });
      return false;
    }
  },

  // ✏️ MODIFIER UN AGENT
  updateAgent: (id, updates) => {
    console.log('✏️ Modification agent:', id);
    try {
      set({ isLoading: true, error: null });
      const updatedAgent = newAgentService.update(id, updates);
      
      if (updatedAgent) {
        const agents = newAgentService.getAll();
        set({ agents, isLoading: false });
        console.log('✅ Agent modifié avec succès');
        return true;
      } else {
        set({ error: 'Erreur lors de la modification', isLoading: false });
        return false;
      }
    } catch (error) {
      console.error('❌ Erreur modification:', error);
      set({ error: 'Erreur lors de la modification', isLoading: false });
      return false;
    }
  },

  // 🗑️ SUPPRIMER UN AGENT
  deleteAgent: (id) => {
    console.log('🗑️ Suppression agent:', id);
    try {
      set({ isLoading: true, error: null });
      const success = newAgentService.delete(id);
      
      if (success) {
        const agents = newAgentService.getAll();
        set({ agents, isLoading: false });
        console.log('✅ Agent supprimé avec succès');
        return true;
      } else {
        set({ error: 'Erreur lors de la suppression', isLoading: false });
        return false;
      }
    } catch (error) {
      console.error('❌ Erreur suppression:', error);
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