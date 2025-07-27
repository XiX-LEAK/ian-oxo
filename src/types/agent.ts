export interface Agent {
  id: string;
  name: string;
  identifier: string; // Username/ID sur la plateforme
  phoneNumber?: string;
  platform: Platform;
  platforms?: Platform[]; // Support pour plateformes multiples
  status: AgentStatus;
  rating: number;
  totalSales?: number;
  lastActivity: Date;
  notes?: string; // Notes courtes
  about?: string; // Description détaillée/À propos (remplace les catégories)
  adminNotes?: string; // Notes privées de l'admin
  isVerified: boolean;
  avatar?: string;
  languages: string[];
  specialties: string[];
  contactInfo: ContactInfo;
  stats: AgentStats;
}

export type Platform = 
  | 'whatsapp'
  | 'wechat' 
  | 'telegram'
  | 'instagram'
  | 'tiktok'
  | 'discord'
  | 'signal';

export type AgentCategory = 
  | 'electronics'
  | 'fashion'
  | 'accessories'
  | 'home-garden'
  | 'beauty'
  | 'sports'
  | 'books-media'
  | 'automotive'
  | 'travel'
  | 'food'
  | 'services'
  | 'other';

export type AgentStatus = 
  | 'active'
  | 'inactive'
  | 'suspended'
  | 'pending';

export interface ContactInfo {
  platform: Platform;
  identifier: string;
  phoneNumber?: string;
  email?: string;
  websiteUrl?: string;
}

export interface AgentStats {
  totalContacts: number;
  responseRate: number; // Percentage
  avgResponseTime: number; // In minutes
  successfulDeals: number;
  customerRating: number;
}

export interface AgentFilters {
  platform?: Platform;
  status?: AgentStatus;
  minRating?: number;
  search?: string;
  isVerified?: boolean;
  languages?: string[];
}

export interface CreateAgentRequest {
  name: string;
  identifier: string;
  phoneNumber?: string;
  platform: Platform;
  platforms?: Platform[]; // Support plateformes multiples
  notes?: string;
  about?: string; // Remplace les catégories - tout va ici
  adminNotes?: string;
  languages: string[];
  specialties: string[];
  contactInfo: Omit<ContactInfo, 'platform' | 'identifier'>;
}

export interface UpdateAgentRequest extends Partial<CreateAgentRequest> {
  id: string;
  status?: AgentStatus;
  rating?: number;
  isVerified?: boolean;
}