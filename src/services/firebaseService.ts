// 🔥 FIREBASE SERVICE - REMPLACE TOUT !
console.log('🚀 Firebase Service - SYSTÈME GLOBAL !');

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, addDoc, updateDoc, deleteDoc, doc, setDoc, getDoc } from 'firebase/firestore';

// 🔥 VOTRE VRAIE CONFIG FIREBASE !
const firebaseConfig = {
  apiKey: "AIzaSyBLVDsQkjsazFY12l74O8CJ06a_C0z-Los",
  authDomain: "oxo-ultimate.firebaseapp.com",
  projectId: "oxo-ultimate",
  storageBucket: "oxo-ultimate.firebasestorage.app",
  messagingSenderId: "929628007088",
  appId: "1:929628007088:web:d2b9c790e1d89145352975"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

interface Agent {
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
}

interface Settings {
  sitePassword: string;
  adminPassword: string;
}

class FirebaseService {
  private agentsCollection = 'agents';
  private settingsDoc = 'settings/main';

  constructor() {
    console.log('✅ Firebase Service initialisé');
  }

  // 🔑 GESTION MOTS DE PASSE
  async getSettings(): Promise<Settings> {
    try {
      const docRef = doc(db, 'settings', 'main');
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return docSnap.data() as Settings;
      } else {
        // Créer les paramètres par défaut
        const defaultSettings: Settings = {
          sitePassword: 'oxo2024',
          adminPassword: 'oxo2025admin'
        };
        await setDoc(docRef, defaultSettings);
        return defaultSettings;
      }
    } catch (error) {
      console.error('❌ Erreur récupération paramètres:', error);
      return { sitePassword: 'oxo2024', adminPassword: 'oxo2025admin' };
    }
  }

  async setSitePassword(password: string): Promise<boolean> {
    try {
      const docRef = doc(db, 'settings', 'main');
      await updateDoc(docRef, { sitePassword: password });
      console.log('✅ Mot de passe site modifié');
      return true;
    } catch (error) {
      console.error('❌ Erreur modification mot de passe site:', error);
      return false;
    }
  }

  async setAdminPassword(password: string): Promise<boolean> {
    try {
      const docRef = doc(db, 'settings', 'main');
      await updateDoc(docRef, { adminPassword: password });
      console.log('✅ Mot de passe admin modifié');
      return true;
    } catch (error) {
      console.error('❌ Erreur modification mot de passe admin:', error);
      return false;
    }
  }

  // 👥 GESTION AGENTS
  async getAll(): Promise<{ data: Agent[], error: any }> {
    try {
      const querySnapshot = await getDocs(collection(db, this.agentsCollection));
      const agents: Agent[] = [];
      
      querySnapshot.forEach((doc) => {
        agents.push({ id: doc.id, ...doc.data() } as Agent);
      });
      
      console.log('📋 Agents récupérés:', agents.length);
      return { data: agents, error: null };
    } catch (error) {
      console.error('❌ Erreur récupération agents:', error);
      return { data: [], error };
    }
  }

  async create(agentData: any): Promise<{ data: Agent[], error: any }> {
    try {
      const newAgent = {
        name: agentData.name,
        identifier: agentData.identifier,
        phone_number: agentData.phone_number || agentData.phoneNumber,
        email: agentData.email,
        website_url: agentData.website_url || agentData.websiteUrl,
        about: agentData.description || agentData.about_description || agentData.about,
        internal_notes: agentData.internal_notes || agentData.notes,
        platforms: agentData.platforms || [agentData.platform],
        categories: agentData.categories || [agentData.category],
        created_at: new Date().toISOString()
      };

      const docRef = await addDoc(collection(db, this.agentsCollection), newAgent);
      const createdAgent = { id: docRef.id, ...newAgent };
      
      console.log('✅ Agent créé:', createdAgent.name);
      return { data: [createdAgent], error: null };
    } catch (error) {
      console.error('❌ Erreur création agent:', error);
      return { data: [], error };
    }
  }

  async update(id: string, updates: any): Promise<{ data: Agent[], error: any }> {
    try {
      const transformedUpdates: any = {};
      
      if (updates.name) transformedUpdates.name = updates.name;
      if (updates.identifier) transformedUpdates.identifier = updates.identifier;
      if (updates.phone_number || updates.phoneNumber) {
        transformedUpdates.phone_number = updates.phone_number || updates.phoneNumber;
      }
      if (updates.email) transformedUpdates.email = updates.email;
      if (updates.website_url || updates.websiteUrl) {
        transformedUpdates.website_url = updates.website_url || updates.websiteUrl;
      }
      if (updates.description || updates.about_description || updates.about) {
        transformedUpdates.about = updates.description || updates.about_description || updates.about;
      }
      if (updates.internal_notes || updates.notes) {
        transformedUpdates.internal_notes = updates.internal_notes || updates.notes;
      }
      if (updates.platforms) {
        transformedUpdates.platforms = updates.platforms;
      } else if (updates.platform) {
        transformedUpdates.platforms = [updates.platform];
      }
      if (updates.categories) {
        transformedUpdates.categories = updates.categories;
      } else if (updates.category) {
        transformedUpdates.categories = [updates.category];
      }

      const docRef = doc(db, this.agentsCollection, id);
      await updateDoc(docRef, transformedUpdates);
      
      // Récupérer l'agent mis à jour
      const updatedDoc = await getDoc(docRef);
      if (updatedDoc.exists()) {
        const updatedAgent = { id: updatedDoc.id, ...updatedDoc.data() } as Agent;
        console.log('✅ Agent modifié:', id);
        return { data: [updatedAgent], error: null };
      }
      
      throw new Error('Agent non trouvé après modification');
    } catch (error) {
      console.error('❌ Erreur modification agent:', error);
      return { data: [], error };
    }
  }

  async delete(id: string): Promise<{ data: any, error: any }> {
    try {
      await deleteDoc(doc(db, this.agentsCollection, id));
      console.log('✅ Agent supprimé:', id);
      return { data: { id }, error: null };
    } catch (error) {
      console.error('❌ Erreur suppression agent:', error);
      return { data: null, error };
    }
  }

  async getOne(id: string): Promise<{ data: Agent | null, error: any }> {
    try {
      const docRef = doc(db, this.agentsCollection, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { data: { id: docSnap.id, ...docSnap.data() } as Agent, error: null };
      } else {
        return { data: null, error: null };
      }
    } catch (error) {
      return { data: null, error };
    }
  }
}

export const firebaseService = new FirebaseService();