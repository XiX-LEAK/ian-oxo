// Types pour le système d'authentification
export interface User {
  id: string;
  email: string;
  username: string; // Identifiant utilisateur unique
  role: 'visitor' | 'admin';
  isAuthenticated: boolean;
  lastLogin?: Date;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  mode: 'visitor' | 'admin';
  hasAccessToSite: boolean;
}

// Types pour les domaines et entreprises
export interface Contact {
  type: 'whatsapp' | 'wechat' | 'telegram' | 'email' | 'phone' | 'linkedin' | 'discord';
  value: string;
  verified: boolean;
}

export interface Enterprise {
  id: string;
  nom: string;
  description: string;
  contacts: Contact[];
  specialites: string[];
  evaluation: number;
  secteurs: string[];
  verifie: boolean;
  dateAjout: Date;
  commentaireAdmin?: string;
  image?: string;
}

export interface Domain {
  id: string;
  titre: string;
  description: string;
  image: string;
  entreprises: Enterprise[];
  dateCreation: Date;
  actif: boolean;
  popularite: number;
  tags: string[];
}

// Types pour l'interface utilisateur
export interface SearchFilters {
  domain?: string;
  platform?: string;
  rating?: number;
  verified?: boolean;
  tags?: string[];
}

export interface TableColumn {
  key: string;
  label: string;
  sortable: boolean;
  filterable: boolean;
}

// Types pour les animations
export interface AnimationConfig {
  duration: number;
  delay?: number;
  easing?: string;
  repeat?: boolean;
}

export interface ScrollTrigger {
  trigger: string;
  start: string;
  end?: string;
  scrub?: boolean;
  pin?: boolean;
}