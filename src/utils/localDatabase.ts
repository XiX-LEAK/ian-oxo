// 🎯 BASE DE DONNÉES 100% LOCALE - MARCHE GARANTI !
console.log('🚀 Local Database activé - ZERO DÉPENDANCE !');

interface LocalData {
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

const DEFAULT_DATA: LocalData = {
  sitePassword: 'oxo2024',
  adminPassword: 'oxo2025admin',
  agents: [
    {
      id: '1',
      name: 'Agent Demo',
      identifier: 'demo@oxo.com',
      phone_number: '+33 1 23 45 67 89',
      email: 'demo@oxo.com',
      website_url: 'https://example.com',
      about: 'Agent de démonstration',
      categories: ['Tech', 'Business'],
      platforms: ['LinkedIn', 'Email'],
      internal_notes: 'Notes internes demo',
      created_at: new Date().toISOString()
    }
  ],
  lastUpdate: new Date().toISOString()
};

class LocalDatabase {
  private data: LocalData = DEFAULT_DATA;
  private storageKey = 'oxo-local-db';

  constructor() {
    this.loadFromStorage();
    this.setupSync();
    console.log('✅ Local Database initialisé avec', this.data.agents.length, 'agents');
  }

  // 💾 GESTION STOCKAGE LOCAL
  private saveToStorage() {
    try {
      const dataString = JSON.stringify(this.data);
      localStorage.setItem(this.storageKey, dataString);
      
      // Broadcast aux autres onglets
      window.dispatchEvent(new CustomEvent('oxo-data-updated', { detail: this.data }));
      
      console.log('💾 Données sauvegardées localement');
    } catch (error) {
      console.error('❌ Erreur sauvegarde:', error);
    }
  }

  private loadFromStorage() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const parsedData = JSON.parse(stored);
        this.data = { ...DEFAULT_DATA, ...parsedData };
        console.log('📖 Données chargées depuis localStorage');
      } else {
        this.data = DEFAULT_DATA;
        this.saveToStorage();
        console.log('🆕 Données par défaut initialisées');
      }
    } catch (error) {
      console.error('❌ Erreur chargement, utilisation données par défaut');
      this.data = DEFAULT_DATA;
      this.saveToStorage();
    }
  }

  private setupSync() {
    // Sync entre onglets
    window.addEventListener('oxo-data-updated', (event: any) => {
      this.data = event.detail;
      console.log('🔄 Données synchronisées depuis autre onglet');
    });

    // Sync au focus de la fenêtre
    window.addEventListener('focus', () => {
      this.loadFromStorage();
    });
  }

  // 🔑 API MOTS DE PASSE
  getSitePassword(): string {
    return this.data.sitePassword;
  }

  setSitePassword(newPassword: string): boolean {
    try {
      this.data.sitePassword = newPassword;
      this.data.lastUpdate = new Date().toISOString();
      this.saveToStorage();
      console.log('✅ Mot de passe site modifié:', newPassword);
      return true;
    } catch (error) {
      console.error('❌ Erreur modification mot de passe site:', error);
      return false;
    }
  }

  getAdminPassword(): string {
    return this.data.adminPassword;
  }

  setAdminPassword(newPassword: string): boolean {
    try {
      this.data.adminPassword = newPassword;
      this.data.lastUpdate = new Date().toISOString();
      this.saveToStorage();
      console.log('✅ Mot de passe admin modifié:', newPassword);
      return true;
    } catch (error) {
      console.error('❌ Erreur modification mot de passe admin:', error);
      return false;
    }
  }

  // 👥 API AGENTS
  getAgents(): Array<any> {
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

  // 📊 STATS
  getStats() {
    return {
      totalAgents: this.data.agents.length,
      lastUpdate: this.data.lastUpdate,
      storageSize: new Blob([JSON.stringify(this.data)]).size
    };
  }

  // 🔄 EXPORT/IMPORT
  exportData(): string {
    return JSON.stringify(this.data, null, 2);
  }

  importData(jsonData: string): boolean {
    try {
      const imported = JSON.parse(jsonData);
      this.data = { ...DEFAULT_DATA, ...imported };
      this.saveToStorage();
      console.log('✅ Données importées');
      return true;
    } catch (error) {
      console.error('❌ Erreur import:', error);
      return false;
    }
  }
}

// Instance unique
export const localDB = new LocalDatabase();