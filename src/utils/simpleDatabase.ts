// 🎯 SYSTÈME SIMPLE - ZÉRO SQL - MARCHE À 100%
console.log('🚀 Système Simple Database activé');

interface SimpleData {
  sitePassword: string;
  adminPassword: string;
  agents: Array<{
    id: string;
    name: string;
    identifier: string;
    phone_number?: string;
    email?: string;
    website_url?: string;
    about?: string;
    categories?: string[];
    platforms?: string[];
    internal_notes?: string;
    created_at: string;
  }>;
  lastUpdate: string;
}

const DEFAULT_DATA: SimpleData = {
  sitePassword: 'oxo2024',
  adminPassword: 'oxo2025admin',
  agents: [],
  lastUpdate: new Date().toISOString()
};

class SimpleDatabase {
  private data: SimpleData = DEFAULT_DATA;
  private storageKey = 'oxo-simple-db';

  constructor() {
    this.loadFromStorage();
    console.log('✅ Simple Database initialisé');
  }

  // 💾 Sauvegarde locale
  private saveToStorage() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.data));
      console.log('💾 Données sauvegardées localement');
    } catch (error) {
      console.error('❌ Erreur sauvegarde:', error);
    }
  }

  private loadFromStorage() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        this.data = { ...DEFAULT_DATA, ...JSON.parse(stored) };
        console.log('📖 Données chargées depuis localStorage');
      }
    } catch (error) {
      console.error('❌ Erreur chargement:', error);
      this.data = DEFAULT_DATA;
    }
  }

  // 🔑 GESTION DES MOTS DE PASSE
  getSitePassword(): string {
    console.log('🔍 Récupération mot de passe site:', this.data.sitePassword);
    return this.data.sitePassword;
  }

  setSitePassword(newPassword: string): boolean {
    try {
      const oldPassword = this.data.sitePassword;
      this.data.sitePassword = newPassword;
      this.data.lastUpdate = new Date().toISOString();
      this.saveToStorage();
      
      console.log('✅ Mot de passe site modifié:', oldPassword, '→', newPassword);
      return true;
    } catch (error) {
      console.error('❌ Erreur modification mot de passe site:', error);
      return false;
    }
  }

  getAdminPassword(): string {
    console.log('🔍 Récupération mot de passe admin:', this.data.adminPassword);
    return this.data.adminPassword;
  }

  setAdminPassword(newPassword: string): boolean {
    try {
      const oldPassword = this.data.adminPassword;
      this.data.adminPassword = newPassword;
      this.data.lastUpdate = new Date().toISOString();
      this.saveToStorage();
      
      console.log('✅ Mot de passe admin modifié:', oldPassword, '→', newPassword);
      return true;
    } catch (error) {
      console.error('❌ Erreur modification mot de passe admin:', error);
      return false;
    }
  }

  // 👥 GESTION DES AGENTS
  getAgents(): Array<any> {
    console.log('📋 Récupération agents:', this.data.agents.length, 'agents');
    return [...this.data.agents];
  }

  addAgent(agentData: any): boolean {
    try {
      const newAgent = {
        id: Date.now().toString(),
        ...agentData,
        created_at: new Date().toISOString()
      };
      
      this.data.agents.push(newAgent);
      this.data.lastUpdate = new Date().toISOString();
      this.saveToStorage();
      
      console.log('✅ Agent ajouté:', newAgent.name);
      return true;
    } catch (error) {
      console.error('❌ Erreur ajout agent:', error);
      return false;
    }
  }

  updateAgent(id: string, updates: any): boolean {
    try {
      const index = this.data.agents.findIndex(a => a.id === id);
      if (index === -1) return false;
      
      this.data.agents[index] = { ...this.data.agents[index], ...updates };
      this.data.lastUpdate = new Date().toISOString();
      this.saveToStorage();
      
      console.log('✅ Agent modifié:', id);
      return true;
    } catch (error) {
      console.error('❌ Erreur modification agent:', error);
      return false;
    }
  }

  deleteAgent(id: string): boolean {
    try {
      this.data.agents = this.data.agents.filter(a => a.id !== id);
      this.data.lastUpdate = new Date().toISOString();
      this.saveToStorage();
      
      console.log('✅ Agent supprimé:', id);
      return true;
    } catch (error) {
      console.error('❌ Erreur suppression agent:', error);
      return false;
    }
  }

  // 📊 STATISTIQUES
  getStats() {
    return {
      totalAgents: this.data.agents.length,
      lastUpdate: this.data.lastUpdate,
      hasData: this.data.agents.length > 0
    };
  }
}

// Instance unique partagée
export const simpleDB = new SimpleDatabase();