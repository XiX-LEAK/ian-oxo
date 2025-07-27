import { supabase } from '@/utils/supabase';

export interface CustomCategory {
  id: string;
  name: string;
  slug: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface CustomPlatform {
  id: string;
  name: string;
  slug: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

// ==============================================
// CATEGORIES SERVICE
// ==============================================

export const CustomCategoriesService = {
  // Récupérer toutes les catégories
  async getAll(): Promise<CustomCategory[]> {
    try {
      const { data, error } = await supabase
        .from('custom_categories')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('❌ Erreur récupération catégories:', error);
      return [];
    }
  },

  // Ajouter une nouvelle catégorie
  async add(name: string): Promise<CustomCategory | null> {
    try {
      const slug = name.toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .trim();

      const { data, error } = await supabase
        .from('custom_categories')
        .insert([{
          name: name.trim(),
          slug: slug,
          is_default: false
        }])
        .select()
        .single();

      if (error) throw error;
      console.log('✅ Catégorie ajoutée:', data);
      return data;
    } catch (error) {
      console.error('❌ Erreur ajout catégorie:', error);
      return null;
    }
  },

  // Supprimer une catégorie
  async delete(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('custom_categories')
        .delete()
        .eq('id', id);

      if (error) throw error;
      console.log('✅ Catégorie supprimée');
      return true;
    } catch (error) {
      console.error('❌ Erreur suppression catégorie:', error);
      return false;
    }
  },

  // Mettre à jour une catégorie
  async update(id: string, name: string): Promise<CustomCategory | null> {
    try {
      const slug = name.toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .trim();

      const { data, error } = await supabase
        .from('custom_categories')
        .update({
          name: name.trim(),
          slug: slug
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      console.log('✅ Catégorie mise à jour:', data);
      return data;
    } catch (error) {
      console.error('❌ Erreur mise à jour catégorie:', error);
      return null;
    }
  }
};

// ==============================================
// PLATFORMS SERVICE
// ==============================================

export const CustomPlatformsService = {
  // Récupérer toutes les plateformes
  async getAll(): Promise<CustomPlatform[]> {
    try {
      const { data, error } = await supabase
        .from('custom_platforms')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('❌ Erreur récupération plateformes:', error);
      return [];
    }
  },

  // Ajouter une nouvelle plateforme
  async add(name: string): Promise<CustomPlatform | null> {
    try {
      const slug = name.toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .trim();

      const { data, error } = await supabase
        .from('custom_platforms')
        .insert([{
          name: name.trim(),
          slug: slug,
          is_default: false
        }])
        .select()
        .single();

      if (error) throw error;
      console.log('✅ Plateforme ajoutée:', data);
      return data;
    } catch (error) {
      console.error('❌ Erreur ajout plateforme:', error);
      return null;
    }
  },

  // Supprimer une plateforme
  async delete(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('custom_platforms')
        .delete()
        .eq('id', id);

      if (error) throw error;
      console.log('✅ Plateforme supprimée');
      return true;
    } catch (error) {
      console.error('❌ Erreur suppression plateforme:', error);
      return false;
    }
  },

  // Mettre à jour une plateforme
  async update(id: string, name: string): Promise<CustomPlatform | null> {
    try {
      const slug = name.toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .trim();

      const { data, error } = await supabase
        .from('custom_platforms')
        .update({
          name: name.trim(),
          slug: slug
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      console.log('✅ Plateforme mise à jour:', data);
      return data;
    } catch (error) {
      console.error('❌ Erreur mise à jour plateforme:', error);
      return null;
    }
  }
};

export default {
  Categories: CustomCategoriesService,
  Platforms: CustomPlatformsService
};