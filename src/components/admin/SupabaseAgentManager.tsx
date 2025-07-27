import React, { useEffect, useState } from 'react';
import { useAgentStore } from '@/stores/agentStore';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { AlertTriangle, Database, RefreshCw, Plus, Trash2, Edit } from 'lucide-react';

/**
 * Composant de gestion des agents avec intégration Supabase
 * Permet de tester et démontrer l'intégration
 */
export const SupabaseAgentManager: React.FC = () => {
  const {
    agents,
    isLoading,
    error,
    loadAgents,
    deleteAgent,
    syncWithSupabase,
    getSupabaseStatus,
    clearError
  } = useAgentStore();

  const [supabaseStatus, setSupabaseStatus] = useState(getSupabaseStatus());

  useEffect(() => {
    // Charger les agents au montage du composant
    loadAgents();
    
    // Mettre à jour le status
    setSupabaseStatus(getSupabaseStatus());
  }, [loadAgents]);

  const handleSync = async () => {
    const success = await syncWithSupabase();
    if (success) {
      setSupabaseStatus(getSupabaseStatus());
    }
  };

  const handleDeleteAgent = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet agent ?')) {
      await deleteAgent(id);
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header avec status */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestionnaire d'Agents</h1>
          <p className="text-muted-foreground">
            Intégration Supabase avec fallback localStorage
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant={supabaseStatus.configured ? "default" : "secondary"}>
            <Database className="w-4 h-4 mr-1" />
            {supabaseStatus.configured ? 'Supabase Actif' : 'Local seulement'}
          </Badge>
          
          <Button 
            onClick={handleSync} 
            disabled={isLoading || !supabaseStatus.configured}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Synchroniser
          </Button>
          
          <Button onClick={() => loadAgents()} disabled={isLoading} size="sm">
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Recharger
          </Button>
        </div>
      </div>

      {/* Messages d'erreur */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-red-700">
                <AlertTriangle className="w-4 h-4" />
                <span>{error}</span>
              </div>
              <Button onClick={clearError} variant="ghost" size="sm">
                ✕
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Informations de configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Configuration
          </CardTitle>
          <CardDescription>
            État de la configuration Supabase et statistiques
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{agents.length}</div>
              <div className="text-sm text-muted-foreground">Agents totaux</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {supabaseStatus.configured ? '✅' : '❌'}
              </div>
              <div className="text-sm text-muted-foreground">Supabase</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {isLoading ? '⏳' : '✅'}
              </div>
              <div className="text-sm text-muted-foreground">État</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Liste des agents */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Agents ({agents.length})</span>
            <Button size="sm" variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Ajouter un agent
            </Button>
          </CardTitle>
          <CardDescription>
            Liste des agents avec actions de gestion
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="w-6 h-6 animate-spin mr-2" />
              Chargement des agents...
            </div>
          ) : agents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Database className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Aucun agent trouvé</p>
              <p className="text-sm">
                {supabaseStatus.configured 
                  ? 'Ajoutez votre premier agent ou synchronisez avec Supabase'
                  : 'Configurez Supabase ou ajoutez des agents localement'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {agents.map((agent, index) => (
                <div
                  key={agent.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-semibold text-blue-600">
                          {agent.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-semibold">{agent.name}</h4>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>@{agent.identifier}</span>
                          <Badge variant="outline" className="text-xs">
                            {agent.platform}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {agent.category}
                          </Badge>
                          <Badge 
                            variant={agent.status === 'active' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {agent.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      ⭐ {agent.rating}/5
                    </span>
                    <Button size="sm" variant="ghost">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => handleDeleteAgent(agent.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Debug info (en développement) */}
      {process.env.NODE_ENV === 'development' && (
        <Card>
          <CardHeader>
            <CardTitle>Debug Info</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs bg-gray-100 p-4 rounded overflow-x-auto">
              {JSON.stringify({
                supabaseStatus,
                agentsCount: agents.length,
                error,
                isLoading,
                sampleAgent: agents[0] ? {
                  id: agents[0].id,
                  name: agents[0].name,
                  platform: agents[0].platform
                } : null
              }, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SupabaseAgentManager;