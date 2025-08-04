// 🔥 FIREBASE SERVICE - REMPLACE TOUT !
console.log('🚀 Firebase Service - SYSTÈME GLOBAL !');

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, addDoc, updateDoc, deleteDoc, doc, setDoc, getDoc } from 'firebase/firestore';

// 🔥 VOTRE VRAIE CONFIG FIREBASE COMPLETE !
const firebaseConfig = {
  apiKey: "AIzaSyBLVDsQkjsazFY12l74O8CJ06a_C0z-Los",
  authDomain: "oxo-ultimate.firebaseapp.com",
  projectId: "oxo-ultimate",
  storageBucket: "oxo-ultimate.firebasestorage.app",
  messagingSenderId: "929628007088",
  appId: "1:929628007088:web:d2b9c790e1d89145352975",
  measurementId: "G-QZLM6D58DP"
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
      console.log('🔄 Firebase create - Data reçue:', agentData);
      console.log('🔍 Type de agentData:', typeof agentData);
      console.log('🔍 Clés de agentData:', Object.keys(agentData));
      
      // LOGS DÉTAILLÉS DE CHAQUE CHAMP
      console.log('📝 name:', agentData.name);
      console.log('📝 identifier:', agentData.identifier);
      console.log('📝 phoneNumber:', agentData.phoneNumber);
      console.log('📝 contactInfo:', agentData.contactInfo);
      console.log('📝 about:', agentData.about);
      console.log('📝 notes:', agentData.notes);
      console.log('📝 languages:', agentData.languages);
      console.log('📝 platform:', agentData.platform);
      
      // NETTOYER LES UNDEFINED POUR FIREBASE
      const cleanData = {};
      
      // Champs obligatoires
      cleanData.name = agentData.name || 'Agent sans nom';
      cleanData.identifier = agentData.identifier || agentData.name || 'agent-' + Date.now();
      cleanData.created_at = new Date().toISOString();
      cleanData.platforms = agentData.platforms || [agentData.platform || 'whatsapp'];
      cleanData.categories = agentData.categories || [agentData.category || 'other'];
      cleanData.languages = agentData.languages || [];
      cleanData.specialties = agentData.specialties || [];
      
      // Champs optionnels - SEULEMENT si ils existent
      if (agentData.phoneNumber || agentData.phone_number) {
        cleanData.phone_number = agentData.phoneNumber || agentData.phone_number;
      }
      if (agentData.contactInfo?.email || agentData.email) {
        cleanData.email = agentData.contactInfo?.email || agentData.email;
      }
      if (agentData.contactInfo?.websiteUrl || agentData.website_url || agentData.websiteUrl) {
        cleanData.website_url = agentData.contactInfo?.websiteUrl || agentData.website_url || agentData.websiteUrl;
      }
      if (agentData.about || agentData.description || agentData.about_description) {
        cleanData.about = agentData.about || agentData.description || agentData.about_description;
      }
      if (agentData.notes || agentData.internal_notes) {
        cleanData.internal_notes = agentData.notes || agentData.internal_notes;
      }

      const newAgent = cleanData;

      console.log('📤 Firebase create - Data transformée:', newAgent);
      console.log('🔥 Tentative ajout dans collection "agents"...');

      const docRef = await addDoc(collection(db, this.agentsCollection), newAgent);
      console.log('✅ Document créé avec ID:', docRef.id);
      
      const createdAgent = { id: docRef.id, ...newAgent };
      
      console.log('✅ Agent créé dans Firebase:', createdAgent.name);
      return { data: [createdAgent], error: null };
    } catch (error) {
      console.error('❌ ERREUR FIREBASE DÉTAILLÉE:');
      console.error('- Message:', error.message);
      console.error('- Code:', error.code);
      console.error('- Stack:', error.stack);
      console.error('- Objet complet:', error);
      
      return { data: [], error: {
        message: error.message,
        code: error.code,
        full: error
      }};
    }
  }

  async update(id: string, updates: any): Promise<{ data: Agent[], error: any }> {
    try {
      console.log('🔄 Firebase update - ID:', id, 'Updates:', updates);
      
      // NETTOYER LES UNDEFINED POUR FIREBASE
      const cleanUpdates: any = {};
      
      // Champs simples
      if (updates.name) cleanUpdates.name = updates.name;
      if (updates.identifier) cleanUpdates.identifier = updates.identifier;
      
      // Champs optionnels - SEULEMENT si ils existent et ne sont pas undefined
      if (updates.phoneNumber || updates.phone_number) {
        const phoneValue = updates.phoneNumber || updates.phone_number;
        if (phoneValue !== undefined && phoneValue !== '') {
          cleanUpdates.phone_number = phoneValue;
        }
      }
      if (updates.contactInfo?.email || updates.email) {
        const emailValue = updates.contactInfo?.email || updates.email;
        if (emailValue !== undefined && emailValue !== '') {
          cleanUpdates.email = emailValue;
        }
      }
      if (updates.contactInfo?.websiteUrl || updates.website_url || updates.websiteUrl) {
        const urlValue = updates.contactInfo?.websiteUrl || updates.website_url || updates.websiteUrl;
        if (urlValue !== undefined && urlValue !== '') {
          cleanUpdates.website_url = urlValue;
        }
      }
      if (updates.about || updates.description || updates.about_description) {
        const aboutValue = updates.about || updates.description || updates.about_description;
        if (aboutValue !== undefined && aboutValue !== '') {
          cleanUpdates.about = aboutValue;
        }
      }
      if (updates.notes || updates.internal_notes) {
        const notesValue = updates.notes || updates.internal_notes;
        if (notesValue !== undefined && notesValue !== '') {
          cleanUpdates.internal_notes = notesValue;
        }
      }
      
      // Arrays - toujours inclure même si vides
      if (updates.platforms) {
        cleanUpdates.platforms = updates.platforms;
      } else if (updates.platform) {
        cleanUpdates.platforms = [updates.platform];
      }
      if (updates.categories) {
        cleanUpdates.categories = updates.categories;
      } else if (updates.category) {
        cleanUpdates.categories = [updates.category];
      }
      if (updates.languages !== undefined) {
        cleanUpdates.languages = updates.languages || [];
      }
      if (updates.specialties !== undefined) {
        cleanUpdates.specialties = updates.specialties || [];
      }

      console.log('📤 Firebase update - Data nettoyée:', cleanUpdates);

      const docRef = doc(db, this.agentsCollection, id);
      await updateDoc(docRef, cleanUpdates);
      
      // Récupérer l'agent mis à jour
      const updatedDoc = await getDoc(docRef);
      if (updatedDoc.exists()) {
        const updatedAgent = { id: updatedDoc.id, ...updatedDoc.data() } as Agent;
        console.log('✅ Agent modifié dans Firebase:', id);
        return { data: [updatedAgent], error: null };
      }
      
      throw new Error('Agent non trouvé après modification');
    } catch (error) {
      console.error('❌ Erreur modification agent Firebase:', error);
      return { data: [], error: error };
    }
  }

  async delete(id: string): Promise<{ data: any, error: any }> {
    try {
      console.log('🗑️ Firebase delete - ID reçu:', id);
      console.log('🗑️ Type de ID:', typeof id);
      console.log('🗑️ Collection:', this.agentsCollection);
      
      // Vérifier que l'agent existe avant suppression
      const docRef = doc(db, this.agentsCollection, id);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        console.error('❌ Agent non trouvé avec ID:', id);
        return { data: null, error: { message: 'Agent non trouvé avec ID: ' + id, code: 'not-found' } };
      }
      
      console.log('✅ Agent trouvé, suppression...');
      await deleteDoc(docRef);
      console.log('✅ Agent supprimé avec succès:', id);
      return { data: { id }, error: null };
    } catch (error) {
      console.error('❌ ERREUR SUPPRESSION FIREBASE DÉTAILLÉE:');
      console.error('- Message:', error.message);
      console.error('- Code:', error.code);
      console.error('- Stack:', error.stack);
      console.error('- ID problématique:', id);
      return { data: null, error: {
        message: error.message,
        code: error.code,
        id: id
      }};
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