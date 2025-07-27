// 🎯 NOUVEAU SYSTÈME D'AGENTS - ULTRA SIMPLE QUI MARCHE !
console.log('🚀 Nouveau Agent Service - SYSTÈME PROPRE !');

export interface SimpleAgentData {
  id: string;
  name: string;
  identifier: string;
  phoneNumber?: string;
  email?: string;
  websiteUrl?: string;
  platform: string;
  category: string;
  about?: string;
  notes?: string;
  created: string;
}

class NewAgentService {
  private storageKey = 'oxo-agents-new';

  // 📋 RÉCUPÉRER TOUS LES AGENTS
  getAll(): SimpleAgentData[] {
    try {
      const stored = localStorage.getItem(this.storageKey);
      const agents = stored ? JSON.parse(stored) : [];
      console.log('📋 Agents récupérés:', agents.length);
      return agents;
    } catch (error) {
      console.error('❌ Erreur récupération:', error);
      return [];
    }
  }

  // 💾 SAUVEGARDER TOUS LES AGENTS
  private saveAll(agents: SimpleAgentData[]): boolean {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(agents));
      console.log('💾 Agents sauvegardés:', agents.length);
      return true;
    } catch (error) {
      console.error('❌ Erreur sauvegarde:', error);
      return false;
    }
  }

  // ➕ CRÉER UN AGENT
  create(agentData: Omit<SimpleAgentData, 'id' | 'created'>): SimpleAgentData | null {
    try {
      const newAgent: SimpleAgentData = {
        ...agentData,
        id: Date.now().toString(),
        created: new Date().toISOString()
      };

      const agents = this.getAll();
      agents.push(newAgent);
      
      if (this.saveAll(agents)) {
        console.log('✅ Agent créé:', newAgent.name);
        return newAgent;
      }
      return null;
    } catch (error) {
      console.error('❌ Erreur création:', error);
      return null;
    }
  }

  // ✏️ MODIFIER UN AGENT
  update(id: string, updates: Partial<SimpleAgentData>): SimpleAgentData | null {
    try {
      const agents = this.getAll();
      const index = agents.findIndex(a => a.id === id);
      
      if (index === -1) {
        console.error('❌ Agent non trouvé:', id);
        return null;
      }

      agents[index] = { ...agents[index], ...updates };
      
      if (this.saveAll(agents)) {
        console.log('✅ Agent modifié:', agents[index].name);
        return agents[index];
      }
      return null;
    } catch (error) {
      console.error('❌ Erreur modification:', error);
      return null;
    }
  }

  // 🗑️ SUPPRIMER UN AGENT
  delete(id: string): boolean {
    try {
      const agents = this.getAll();
      const initialLength = agents.length;
      const filteredAgents = agents.filter(a => a.id !== id);
      
      if (filteredAgents.length < initialLength) {
        if (this.saveAll(filteredAgents)) {
          console.log('✅ Agent supprimé:', id);
          return true;
        }
      } else {
        console.error('❌ Agent non trouvé:', id);
      }
      return false;
    } catch (error) {
      console.error('❌ Erreur suppression:', error);
      return false;
    }
  }

  // 👁️ RÉCUPÉRER UN AGENT
  getById(id: string): SimpleAgentData | null {
    try {
      const agents = this.getAll();
      return agents.find(a => a.id === id) || null;
    } catch (error) {
      console.error('❌ Erreur récupération agent:', error);
      return null;
    }
  }

  // 🧹 NETTOYER TOUT
  clear(): boolean {
    try {
      localStorage.removeItem(this.storageKey);
      console.log('🧹 Tous les agents supprimés');
      return true;
    } catch (error) {
      console.error('❌ Erreur nettoyage:', error);
      return false;
    }
  }
}

export const newAgentService = new NewAgentService();