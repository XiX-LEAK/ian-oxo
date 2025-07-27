import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { AgentList } from '@/components/AgentList';
import { AdminDashboard } from '@/components/AdminDashboard';
import { AgentModal } from '@/components/AgentModal';
import { useAuthStore } from '@/stores/authStore';
import { useAgentStore } from '@/stores/agentStore';
import type { Agent } from '@/types/agent';

function App() {
  const [currentView, setCurrentView] = useState<'agents' | 'admin'>('agents');
  const [isLoading, setIsLoading] = useState(true);
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const { user, mode, initializeAuth } = useAuthStore();
  const { loadAgents } = useAgentStore();

  // Initialiser l'auth Supabase au démarrage
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Simulation du chargement initial
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  // Charger les agents au démarrage
  useEffect(() => {
    if (!isLoading) {
      loadAgents();
    }
  }, [isLoading, loadAgents]);

  const handleViewChange = (view: 'agents' | 'admin') => {
    if (view === 'admin' && mode !== 'admin') {
      return;
    }
    setCurrentView(view);
  };

  const handleEditAgent = (agent: Agent) => {
    setEditingAgent(agent);
    setShowCreateModal(true);
  };

  const handleCreateAgent = () => {
    setEditingAgent(null);
    setShowCreateModal(true);
  };

  const handleCloseModal = () => {
    setEditingAgent(null);
    setShowCreateModal(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-orange-500 rounded-2xl flex items-center justify-center mb-6 mx-auto">
            <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
          <h1 className="text-4xl font-bold text-orange-500 mb-3">OXO</h1>
          <p className="text-gray-600">Chargement de la plateforme...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        currentView={currentView}
        onViewChange={handleViewChange}
      />
      
      <main className="pt-6">
        {!user ? (
          <div className="max-w-4xl mx-auto px-4 text-center py-16">
            <div className="w-24 h-24 bg-orange-500 rounded-2xl flex items-center justify-center mb-8 mx-auto">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Bienvenue sur <span className="text-orange-500">OXO</span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
              Votre plateforme professionnelle pour gérer et contacter des agents vérifiés 
              sur WhatsApp, WeChat, Telegram et autres plateformes.
            </p>

            <div className="bg-white p-8 rounded-2xl shadow-lg border border-orange-200">
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                🔐 Accès Sécurisé Requis
              </h3>
              <p className="text-gray-700 text-lg">
                Connectez-vous pour accéder à la base de données complète d'agents vérifiés.
              </p>
            </div>
          </div>
        ) : (
          <div className="max-w-7xl mx-auto px-4">
            {currentView === 'agents' ? (
              <div>
                <div className="mb-8">
                  <h1 className="text-4xl font-bold text-gray-900 mb-3">Base d'agents</h1>
                  <p className="text-gray-600 text-lg">
                    Découvrez et contactez des agents vérifiés sur différentes plateformes.
                  </p>
                </div>
                <AgentList 
                  onEditAgent={handleEditAgent}
                  onCreateAgent={handleCreateAgent}
                />
              </div>
            ) : (
              <div>
                <div className="mb-8">
                  <h1 className="text-4xl font-bold text-gray-900 mb-3">Administration</h1>
                  <p className="text-gray-600 text-lg">
                    Gérez les paramètres de sécurité et les mots de passe de la plateforme.
                  </p>
                </div>
                <AdminDashboard />
              </div>
            )}
          </div>
        )}
      </main>

      <AgentModal
        isOpen={showCreateModal}
        onClose={handleCloseModal}
        agent={editingAgent}
      />
    </div>
  );
}

export default App;