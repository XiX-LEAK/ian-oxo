import { gistDB } from './githubGistDB';

console.log('🚀 Mode GitHub Gist activé - MAGIE PURE !');

// Client Supabase qui utilise notre JSON Database
export const supabase = {
  from: (table: string) => ({
    select: async () => {
      try {
        if (table === 'agents') {
          const agents = gistDB.getAgents();
          return { data: agents, error: null };
        }
        if (table === 'site_settings') {
          const sitePassword = gistDB.getSitePassword();
          const adminPassword = gistDB.getAdminPassword();
          return { 
            data: [
              { setting_key: 'site_password', setting_value: sitePassword },
              { setting_key: 'admin_password', setting_value: adminPassword }
            ], 
            error: null 
          };
        }
        return { data: [], error: null };
      } catch (error) {
        return { data: [], error };
      }
    },
    insert: async (data: any) => {
      try {
        if (table === 'agents') {
          await gistDB.addAgent(data);
          return { data: [data], error: null };
        }
        return { data: null, error: null };
      } catch (error) {
        return { data: null, error };
      }
    },
    update: async () => Promise.resolve({ data: null, error: null }),
    upsert: async (data: any) => {
      try {
        if (table === 'site_settings') {
          if (data.setting_key === 'site_password') {
            await gistDB.setSitePassword(data.setting_value);
          }
          if (data.setting_key === 'admin_password') {
            await gistDB.setAdminPassword(data.setting_value);
          }
          return { data: null, error: null };
        }
        return { data: null, error: null };
      } catch (error) {
        return { data: null, error };
      }
    },
    delete: () => Promise.resolve({ data: null, error: null }),
    eq: function(column: string, value: any) {
      return {
        maybeSingle: async () => {
          try {
            if (table === 'site_settings') {
              if (value === 'site_password') {
                const password = gistDB.getSitePassword();
                return { data: { setting_value: password }, error: null };
              }
              if (value === 'admin_password') {
                const password = gistDB.getAdminPassword();
                return { data: { setting_value: password }, error: null };
              }
            }
            return { data: null, error: null };
          } catch (error) {
            return { data: null, error };
          }
        }
      };
    }
  }),
  auth: {
    getSession: () => Promise.resolve({ data: { session: null }, error: null })
  }
};

export const isSupabaseConfigured = true; // Force l'utilisation de notre système// Force rebuild dim. 27 juil. 2025 15:35:21
