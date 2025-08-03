// 🔥 SERVICE FIREBASE SYNCHRONE - POUR COMPATIBILITÉ
console.log('🚀 Firebase Service Sync - WRAPPER !');

import { firebaseService } from './firebaseService';

class FirebaseServiceSync {
  private settings: any = null;
  private initialized = false;

  constructor() {
    this.initSettings();
  }

  private async initSettings() {
    try {
      this.settings = await firebaseService.getSettings();
      this.initialized = true;
      console.log('✅ Settings Firebase chargés');
    } catch (error) {
      console.log('⚠️ Fallback settings par défaut');
      this.settings = {
        sitePassword: 'oxo2024',
        adminPassword: 'oxo2025admin'
      };
      this.initialized = true;
    }
  }

  // Méthodes synchrones avec fallback
  getSitePassword(): string {
    if (!this.initialized || !this.settings) {
      return 'oxo2024';
    }
    return this.settings.sitePassword || 'oxo2024';
  }

  getAdminPassword(): string {
    if (!this.initialized || !this.settings) {
      return 'oxo2025admin';
    }
    return this.settings.adminPassword || 'oxo2025admin';
  }

  // Méthodes asynchrones pour les modifications
  async setSitePassword(password: string): Promise<boolean> {
    const result = await firebaseService.setSitePassword(password);
    if (result && this.settings) {
      this.settings.sitePassword = password;
    }
    return result;
  }

  async setAdminPassword(password: string): Promise<boolean> {
    const result = await firebaseService.setAdminPassword(password);
    if (result && this.settings) {
      this.settings.adminPassword = password;
    }
    return result;
  }

  // Méthodes pour les agents (wrapper direct)
  async getAll() {
    return await firebaseService.getAll();
  }

  async create(agentData: any) {
    return await firebaseService.create(agentData);
  }

  async update(id: string, updates: any) {
    return await firebaseService.update(id, updates);
  }

  async delete(id: string) {
    return await firebaseService.delete(id);
  }

  async getOne(id: string) {
    return await firebaseService.getOne(id);
  }
}

export const firebaseServiceSync = new FirebaseServiceSync();