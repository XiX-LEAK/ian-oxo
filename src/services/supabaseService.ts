import { supabase } from '@/utils/supabase';
import type { Review, CreateReviewRequest, UpdateReviewRequest, ReviewStats } from '@/types/review';

// ==============================================
// AGENTS SERVICE
// ==============================================

export interface Agent {
  id: string;
  name?: string; // Garde pour compatibilité
  full_name?: string; // Nouveau champ principal
  identifier?: string;
  email?: string;
  phone_number?: string;
  website_url?: string;
  platform?: string; // Garde pour compatibilité
  category?: string; // Garde pour compatibilité
  platforms?: Platform[]; // Nouveau système multi-plateformes
  categories?: Category[]; // Nouveau système multi-catégories
  languages?: Language[]; // Nouveau système multi-langues
  specialties?: string[];
  status: 'active' | 'inactive' | 'suspended' | 'pending';
  description?: string; // Garde pour compatibilité
  about_description?: string; // Nouveau champ principal
  admin_notes?: string; // Garde pour compatibilité
  internal_notes?: string; // Nouveau champ principal
  location?: string;
  rating: number;
  total_reviews: number;
  verification_date?: string;
  created_at: string;
  updated_at: string;
}

export interface Platform {
  id: string;
  name: string;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  created_at: string;
}

export interface Language {
  id: string;
  name: string;
  code: string;
  created_at: string;
}

export interface CreateAgentRequest {
  full_name?: string;
  phone_number?: string;
  email?: string;
  website_url?: string;
  about_description?: string;
  internal_notes?: string;
  platforms?: string[]; // IDs des plateformes
  categories?: string[]; // IDs des catégories
  languages?: string[]; // IDs des langues
  status?: 'active' | 'inactive' | 'suspended' | 'pending';
}

export const AgentsService = {
  // Récupérer tous les agents (pour admin - avec notes internes)
  async getAll(): Promise<Agent[]> {
    try {
      const { data, error } = await supabase
        .from('agents_complete_admin')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('❌ Erreur récupération agents admin:', error);
      return [];
    }
  },

  // Récupérer tous les agents publics (pour clients - sans notes internes)
  async getAllPublic(): Promise<Agent[]> {
    try {
      const { data, error } = await supabase
        .from('agents_public')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('❌ Erreur récupération agents publics:', error);
      return [];
    }
  },

  // Récupérer un agent par ID
  async getById(id: string): Promise<Agent | null> {
    try {
      const { data, error } = await supabase
        .from('agents')
        .select('*, admin_notes')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('❌ Erreur récupération agent:', error);
      return null;
    }
  },

  // Créer un nouvel agent
  async create(agentData: Omit<Agent, 'id' | 'rating' | 'total_reviews' | 'created_at' | 'updated_at'>): Promise<Agent | null> {
    try {
      const { data, error } = await supabase
        .from('agents')
        .insert([agentData])
        .select()
        .single();

      if (error) throw error;
      console.log('✅ Agent créé:', data);
      return data;
    } catch (error) {
      console.error('❌ Erreur création agent:', error);
      return null;
    }
  },

  // Mettre à jour un agent
  async update(id: string, agentData: Partial<Agent>): Promise<Agent | null> {
    try {
      const { data, error } = await supabase
        .from('agents')
        .update(agentData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      console.log('✅ Agent mis à jour:', data);
      return data;
    } catch (error) {
      console.error('❌ Erreur mise à jour agent:', error);
      return null;
    }
  },

  // Supprimer un agent
  async delete(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('agents')
        .delete()
        .eq('id', id);

      if (error) throw error;
      console.log('✅ Agent supprimé');
      return true;
    } catch (error) {
      console.error('❌ Erreur suppression agent:', error);
      return false;
    }
  },

  // Rechercher des agents (version améliorée)
  async search(query: string): Promise<Agent[]> {
    try {
      const { data, error } = await supabase
        .from('agents_complete_admin')
        .select('*')
        .or(`
          full_name.ilike.%${query}%, 
          name.ilike.%${query}%, 
          about_description.ilike.%${query}%, 
          email.ilike.%${query}%,
          website_url.ilike.%${query}%
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('❌ Erreur recherche agents:', error);
      return [];
    }
  },

  // Créer un agent avec relations (nouvelle méthode améliorée)
  async createWithRelations(agentData: CreateAgentRequest): Promise<Agent | null> {
    try {
      // 1. Créer l'agent de base
      const { data: agent, error: agentError } = await supabase
        .from('agents')
        .insert([{
          full_name: agentData.full_name,
          phone_number: agentData.phone_number,
          email: agentData.email,
          website_url: agentData.website_url,
          about_description: agentData.about_description,
          internal_notes: agentData.internal_notes,
          status: agentData.status || 'active'
        }])
        .select('id')
        .single();

      if (agentError) throw agentError;

      const agentId = agent.id;

      // 2. Ajouter les relations plateformes
      if (agentData.platforms && agentData.platforms.length > 0) {
        const platformRelations = agentData.platforms.map(platformId => ({
          agent_id: agentId,
          platform_id: platformId
        }));
        
        const { error: platformError } = await supabase
          .from('agent_platforms')
          .insert(platformRelations);
        
        if (platformError) console.error('Erreur plateformes:', platformError);
      }

      // 3. Ajouter les relations catégories
      if (agentData.categories && agentData.categories.length > 0) {
        const categoryRelations = agentData.categories.map(categoryId => ({
          agent_id: agentId,
          category_id: categoryId
        }));
        
        const { error: categoryError } = await supabase
          .from('agent_categories')
          .insert(categoryRelations);
        
        if (categoryError) console.error('Erreur catégories:', categoryError);
      }

      // 4. Ajouter les relations langues
      if (agentData.languages && agentData.languages.length > 0) {
        const languageRelations = agentData.languages.map(languageId => ({
          agent_id: agentId,
          language_id: languageId
        }));
        
        const { error: languageError } = await supabase
          .from('agent_languages')
          .insert(languageRelations);
        
        if (languageError) console.error('Erreur langues:', languageError);
      }

      // 5. Log de l'action
      await supabase.rpc('log_action', {
        p_action_type: 'CREATE',
        p_table_name: 'agents',
        p_record_id: agentId,
        p_new_values: agentData
      });

      // 6. Récupérer l'agent complet créé
      return await this.getById(agentId);

    } catch (error) {
      console.error('❌ Erreur création agent avec relations:', error);
      return null;
    }
  },

  // Mettre à jour un agent avec relations
  async updateWithRelations(id: string, agentData: Partial<CreateAgentRequest>): Promise<Agent | null> {
    try {
      // 1. Récupérer l'ancien agent pour les logs
      const oldAgent = await this.getById(id);

      // 2. Mettre à jour l'agent de base
      const updateData: any = {};
      if (agentData.full_name !== undefined) updateData.full_name = agentData.full_name;
      if (agentData.phone_number !== undefined) updateData.phone_number = agentData.phone_number;
      if (agentData.email !== undefined) updateData.email = agentData.email;
      if (agentData.website_url !== undefined) updateData.website_url = agentData.website_url;
      if (agentData.about_description !== undefined) updateData.about_description = agentData.about_description;
      if (agentData.internal_notes !== undefined) updateData.internal_notes = agentData.internal_notes;
      if (agentData.status !== undefined) updateData.status = agentData.status;

      if (Object.keys(updateData).length > 0) {
        const { error: agentError } = await supabase
          .from('agents')
          .update(updateData)
          .eq('id', id);

        if (agentError) throw agentError;
      }

      // 3. Mettre à jour les plateformes si spécifiées
      if (agentData.platforms !== undefined) {
        // Supprimer les anciennes relations
        await supabase
          .from('agent_platforms')
          .delete()
          .eq('agent_id', id);

        // Ajouter les nouvelles
        if (agentData.platforms.length > 0) {
          const platformRelations = agentData.platforms.map(platformId => ({
            agent_id: id,
            platform_id: platformId
          }));
          
          await supabase
            .from('agent_platforms')
            .insert(platformRelations);
        }
      }

      // 4. Mettre à jour les catégories si spécifiées
      if (agentData.categories !== undefined) {
        await supabase
          .from('agent_categories')
          .delete()
          .eq('agent_id', id);

        if (agentData.categories.length > 0) {
          const categoryRelations = agentData.categories.map(categoryId => ({
            agent_id: id,
            category_id: categoryId
          }));
          
          await supabase
            .from('agent_categories')
            .insert(categoryRelations);
        }
      }

      // 5. Mettre à jour les langues si spécifiées
      if (agentData.languages !== undefined) {
        await supabase
          .from('agent_languages')
          .delete()
          .eq('agent_id', id);

        if (agentData.languages.length > 0) {
          const languageRelations = agentData.languages.map(languageId => ({
            agent_id: id,
            language_id: languageId
          }));
          
          await supabase
            .from('agent_languages')
            .insert(languageRelations);
        }
      }

      // 6. Log de l'action
      await supabase.rpc('log_action', {
        p_action_type: 'UPDATE',
        p_table_name: 'agents',
        p_record_id: id,
        p_old_values: oldAgent,
        p_new_values: agentData
      });

      // 7. Récupérer l'agent mis à jour
      return await this.getById(id);

    } catch (error) {
      console.error('❌ Erreur mise à jour agent avec relations:', error);
      return null;
    }
  }
};

// ==============================================
// PLATFORMS SERVICE
// ==============================================

export const PlatformsService = {
  // Récupérer toutes les plateformes
  async getAll(): Promise<Platform[]> {
    try {
      const { data, error } = await supabase
        .from('platforms')
        .select('*')
        .order('name');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('❌ Erreur récupération plateformes:', error);
      return [];
    }
  },

  // Créer une nouvelle plateforme
  async create(name: string): Promise<Platform | null> {
    try {
      const { data, error } = await supabase
        .from('platforms')
        .insert([{ name: name.trim() }])
        .select()
        .single();

      if (error) throw error;

      // Log de l'action
      await supabase.rpc('log_action', {
        p_action_type: 'CREATE',
        p_table_name: 'platforms',
        p_record_id: data.id,
        p_new_values: { name }
      });

      console.log('✅ Plateforme créée:', data);
      return data;
    } catch (error) {
      console.error('❌ Erreur création plateforme:', error);
      return null;
    }
  },

  // Supprimer une plateforme
  async delete(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('platforms')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Log de l'action
      await supabase.rpc('log_action', {
        p_action_type: 'DELETE',
        p_table_name: 'platforms',
        p_record_id: id
      });

      console.log('✅ Plateforme supprimée');
      return true;
    } catch (error) {
      console.error('❌ Erreur suppression plateforme:', error);
      return false;
    }
  }
};

// ==============================================
// CATEGORIES SERVICE
// ==============================================

export const CategoriesService = {
  // Récupérer toutes les catégories
  async getAll(): Promise<Category[]> {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('❌ Erreur récupération catégories:', error);
      return [];
    }
  },

  // Créer une nouvelle catégorie
  async create(name: string): Promise<Category | null> {
    try {
      const { data, error } = await supabase
        .from('categories')
        .insert([{ name: name.trim() }])
        .select()
        .single();

      if (error) throw error;

      // Log de l'action
      await supabase.rpc('log_action', {
        p_action_type: 'CREATE',
        p_table_name: 'categories',
        p_record_id: data.id,
        p_new_values: { name }
      });

      console.log('✅ Catégorie créée:', data);
      return data;
    } catch (error) {
      console.error('❌ Erreur création catégorie:', error);
      return null;
    }
  },

  // Supprimer une catégorie
  async delete(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Log de l'action
      await supabase.rpc('log_action', {
        p_action_type: 'DELETE',
        p_table_name: 'categories',
        p_record_id: id
      });

      console.log('✅ Catégorie supprimée');
      return true;
    } catch (error) {
      console.error('❌ Erreur suppression catégorie:', error);
      return false;
    }
  }
};

// ==============================================
// LANGUAGES SERVICE
// ==============================================

export const LanguagesService = {
  // Récupérer toutes les langues
  async getAll(): Promise<Language[]> {
    try {
      const { data, error } = await supabase
        .from('languages')
        .select('*')
        .order('name');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('❌ Erreur récupération langues:', error);
      return [];
    }
  },

  // Créer une nouvelle langue
  async create(name: string, code?: string): Promise<Language | null> {
    try {
      const { data, error } = await supabase
        .from('languages')
        .insert([{ 
          name: name.trim(),
          code: code ? code.toLowerCase() : null
        }])
        .select()
        .single();

      if (error) throw error;

      // Log de l'action
      await supabase.rpc('log_action', {
        p_action_type: 'CREATE',
        p_table_name: 'languages',
        p_record_id: data.id,
        p_new_values: { name, code }
      });

      console.log('✅ Langue créée:', data);
      return data;
    } catch (error) {
      console.error('❌ Erreur création langue:', error);
      return null;
    }
  },

  // Supprimer une langue
  async delete(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('languages')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Log de l'action
      await supabase.rpc('log_action', {
        p_action_type: 'DELETE',
        p_table_name: 'languages',
        p_record_id: id
      });

      console.log('✅ Langue supprimée');
      return true;
    } catch (error) {
      console.error('❌ Erreur suppression langue:', error);
      return false;
    }
  }
};

// ==============================================
// REVIEWS SERVICE  
// ==============================================

export const ReviewsService = {
  // Récupérer tous les avis
  async getAll(): Promise<Review[]> {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('❌ Erreur récupération avis:', error);
      return [];
    }
  },

  // Récupérer les avis d'un agent
  async getByAgentId(agentId: string): Promise<Review[]> {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('agent_id', agentId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('❌ Erreur récupération avis agent:', error);
      return [];
    }
  },

  // Récupérer l'avis d'un utilisateur pour un agent
  async getUserReviewForAgent(agentId: string, userId: string): Promise<Review | null> {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('agent_id', agentId)
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
      return data || null;
    } catch (error) {
      console.error('❌ Erreur récupération avis utilisateur:', error);
      return null;
    }
  },

  // Vérifier si un utilisateur peut laisser un avis
  async canUserReview(agentId: string, userId: string): Promise<boolean> {
    try {
      // Vérifier s'il y a déjà un avis
      const existingReview = await this.getUserReviewForAgent(agentId, userId);
      if (existingReview) return false;

      // Vérifier l'anti-spam (pas plus d'un avis par minute)
      const { data, error } = await supabase
        .from('reviews')
        .select('created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) throw error;

      if (data && data.length > 0) {
        const lastReviewTime = new Date(data[0].created_at).getTime();
        const now = Date.now();
        const oneMinute = 60 * 1000;
        
        if (now - lastReviewTime < oneMinute) {
          return false; // Anti-spam
        }
      }

      return true;
    } catch (error) {
      console.error('❌ Erreur vérification permission avis:', error);
      return false;
    }
  },

  // Créer un nouvel avis
  async create(reviewData: CreateReviewRequest, userId: string, userEmail: string): Promise<Review | null> {
    try {
      // Vérifier les permissions
      const canReview = await this.canUserReview(reviewData.agentId, userId);
      if (!canReview) {
        throw new Error('Vous avez déjà laissé un avis pour cet agent ou vous devez attendre avant de laisser un nouvel avis.');
      }

      const newReview = {
        agent_id: reviewData.agentId,
        user_id: userId,
        user_email: userEmail,
        rating: reviewData.rating,
        comment: reviewData.comment.trim(),
        is_verified: false,
        helpful_votes: 0
      };

      const { data, error } = await supabase
        .from('reviews')
        .insert([newReview])
        .select()
        .single();

      if (error) throw error;
      
      console.log('✅ Avis créé:', data);
      return {
        ...data,
        agentId: data.agent_id,
        userId: data.user_id,
        userEmail: data.user_email,
        isVerified: data.is_verified,
        helpfulVotes: data.helpful_votes,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      };
    } catch (error) {
      console.error('❌ Erreur création avis:', error);
      return null;
    }
  },

  // Mettre à jour un avis
  async update(reviewData: UpdateReviewRequest): Promise<Review | null> {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .update({
          rating: reviewData.rating,
          comment: reviewData.comment
        })
        .eq('id', reviewData.id)
        .select()
        .single();

      if (error) throw error;
      
      console.log('✅ Avis mis à jour:', data);
      return {
        ...data,
        agentId: data.agent_id,
        userId: data.user_id,
        userEmail: data.user_email,
        isVerified: data.is_verified,
        helpfulVotes: data.helpful_votes,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      };
    } catch (error) {
      console.error('❌ Erreur mise à jour avis:', error);
      return null;
    }
  },

  // Supprimer un avis
  async delete(reviewId: string, userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', reviewId)
        .eq('user_id', userId); // Sécurité : seulement ses propres avis

      if (error) throw error;
      console.log('✅ Avis supprimé');
      return true;
    } catch (error) {
      console.error('❌ Erreur suppression avis:', error);
      return false;
    }
  },

  // Calculer les statistiques d'un agent
  async getReviewStats(agentId: string): Promise<ReviewStats> {
    try {
      const { data: agent, error: agentError } = await supabase
        .from('agents')
        .select('rating, total_reviews')
        .eq('id', agentId)
        .single();

      if (agentError) throw agentError;

      // Obtenir la distribution des notes
      const { data: reviews, error: reviewsError } = await supabase
        .from('reviews')
        .select('rating')
        .eq('agent_id', agentId);

      if (reviewsError) throw reviewsError;

      const ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
      reviews?.forEach(review => {
        if (review.rating >= 1 && review.rating <= 5) {
          ratingDistribution[review.rating as keyof typeof ratingDistribution]++;
        }
      });

      return {
        totalReviews: agent.total_reviews || 0,
        averageRating: agent.rating || 0,
        ratingDistribution
      };
    } catch (error) {
      console.error('❌ Erreur calcul statistiques avis:', error);
      return {
        totalReviews: 0,
        averageRating: 0,
        ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
      };
    }
  }
};

// ==============================================
// REVIEW LIKES SERVICE
// ==============================================

export const ReviewLikesService = {
  // Liker/unliker un avis
  async toggleLike(reviewId: string, userId: string): Promise<boolean> {
    try {
      // Vérifier si le like existe déjà
      const { data: existingLike, error: checkError } = await supabase
        .from('review_likes')
        .select('id')
        .eq('review_id', reviewId)
        .eq('user_id', userId)
        .single();

      if (checkError && checkError.code !== 'PGRST116') throw checkError;

      if (existingLike) {
        // Retirer le like
        const { error: deleteError } = await supabase
          .from('review_likes')
          .delete()
          .eq('id', existingLike.id);

        if (deleteError) throw deleteError;
        console.log('✅ Like retiré');
        return false; // Pas liké
      } else {
        // Ajouter le like
        const { error: insertError } = await supabase
          .from('review_likes')
          .insert([{ review_id: reviewId, user_id: userId }]);

        if (insertError) throw insertError;
        console.log('✅ Like ajouté');
        return true; // Liké
      }
    } catch (error) {
      console.error('❌ Erreur toggle like:', error);
      return false;
    }
  },

  // Vérifier si un utilisateur a liké un avis
  async isLiked(reviewId: string, userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('review_likes')
        .select('id')
        .eq('review_id', reviewId)
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return !!data;
    } catch (error) {
      console.error('❌ Erreur vérification like:', error);
      return false;
    }
  },

  // Obtenir les likes d'un utilisateur
  async getUserLikes(userId: string): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('review_likes')
        .select('review_id')
        .eq('user_id', userId);

      if (error) throw error;
      return data?.map(like => like.review_id) || [];
    } catch (error) {
      console.error('❌ Erreur récupération likes utilisateur:', error);
      return [];
    }
  }
};

// Export par défaut pour faciliter l'import
// ==============================================
// PASSWORD CHANGE LOGGING SERVICE
// ==============================================

export interface PasswordChangeLog {
  id: string;
  change_type: 'site_password' | 'admin_password';
  admin_user_id?: string;
  admin_email?: string;
  changed_at: string;
  ip_address?: string;
  user_agent?: string;
  previous_password_hash?: string; // Hash du mot de passe précédent (pour audit)
  success: boolean;
  notes?: string;
}

export const PasswordLoggingService = {
  // Enregistrer un changement de mot de passe
  async logPasswordChange(logData: {
    changeType: 'site_password' | 'admin_password';
    adminUserId?: string;
    adminEmail?: string;
    success: boolean;
    notes?: string;
    previousPasswordHash?: string;
  }): Promise<boolean> {
    try {
      const changeLog = {
        change_type: logData.changeType,
        admin_user_id: logData.adminUserId,
        admin_email: logData.adminEmail,
        changed_at: new Date().toISOString(),
        ip_address: await this.getClientIP(),
        user_agent: navigator.userAgent,
        previous_password_hash: logData.previousPasswordHash,
        success: logData.success,
        notes: logData.notes
      };

      const { data, error } = await supabase
        .from('password_change_logs')
        .insert([changeLog])
        .select()
        .single();

      if (error) {
        console.error('❌ Erreur enregistrement log mot de passe:', error);
        return false;
      }

      console.log('✅ Changement de mot de passe enregistré:', data);
      return true;
    } catch (error) {
      console.error('❌ Erreur création log changement mot de passe:', error);
      return false;
    }
  },

  // Récupérer l'historique des changements de mot de passe
  async getPasswordChangeHistory(limit: number = 50): Promise<PasswordChangeLog[]> {
    try {
      const { data, error } = await supabase
        .from('password_change_logs')
        .select('*')
        .order('changed_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('❌ Erreur récupération historique mots de passe:', error);
      return [];
    }
  },

  // Récupérer les changements pour un type spécifique
  async getPasswordChangesByType(changeType: 'site_password' | 'admin_password', limit: number = 20): Promise<PasswordChangeLog[]> {
    try {
      const { data, error } = await supabase
        .from('password_change_logs')
        .select('*')
        .eq('change_type', changeType)
        .order('changed_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('❌ Erreur récupération historique par type:', error);
      return [];
    }
  },

  // Récupérer les changements récents (dernières 24h)
  async getRecentPasswordChanges(): Promise<PasswordChangeLog[]> {
    try {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const { data, error } = await supabase
        .from('password_change_logs')
        .select('*')
        .gte('changed_at', yesterday.toISOString())
        .order('changed_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('❌ Erreur récupération changements récents:', error);
      return [];
    }
  },

  // Obtenir l'IP du client (approximation)
  async getClientIP(): Promise<string> {
    try {
      // Dans un environnement de production, vous pourriez utiliser une API pour obtenir l'IP
      return 'Unknown IP';
    } catch (error) {
      return 'Unknown IP';
    }
  },

  // Nettoyer les anciens logs (garder seulement les 100 derniers)
  async cleanupOldLogs(): Promise<boolean> {
    try {
      // Récupérer l'ID du 100ème log le plus récent
      const { data: recentLogs, error: selectError } = await supabase
        .from('password_change_logs')
        .select('id')
        .order('changed_at', { ascending: false })
        .limit(100);

      if (selectError) throw selectError;

      if (recentLogs && recentLogs.length === 100) {
        const cutoffId = recentLogs[99].id;
        
        // Supprimer les logs plus anciens
        const { error: deleteError } = await supabase
          .from('password_change_logs')
          .delete()
          .not('id', 'in', `(${recentLogs.map(log => `'${log.id}'`).join(',')})`)
          .lt('changed_at', recentLogs[99].id); // Utiliser une condition plus sûre

        if (deleteError) throw deleteError;
        console.log('✅ Anciens logs de mots de passe nettoyés');
      }

      return true;
    } catch (error) {
      console.error('❌ Erreur nettoyage anciens logs:', error);
      return false;
    }
  }
};

export default {
  Agents: AgentsService,
  Reviews: ReviewsService,
  ReviewLikes: ReviewLikesService,
  PasswordLogging: PasswordLoggingService
};