import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Header } from '@/components/Header';
import { AgentList } from '@/components/AgentList';
import { AdminDashboard } from '@/components/AdminDashboard';
import { AgentModal } from '@/components/AgentModal';
import { PasswordReset } from '@/components/PasswordReset';
import { ParticleBackground } from '@/components/animations/ParticleBackground';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import { StaggeredReveal } from '@/components/animations/ScrollReveal';
import { AnimatedButton } from '@/components/animations/AnimatedButton';
import { LoadingSpinner } from '@/components/animations/LoadingSpinner';
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
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Charger les agents au démarrage
  useEffect(() => {
    if (!isLoading) {
      loadAgents();
    }
  }, [isLoading, loadAgents]);

  // Rediriger vers agents si pas admin
  useEffect(() => {
    if (currentView === 'admin' && mode !== 'admin') {
      setCurrentView('agents');
    }
  }, [mode, currentView]);

  const handleViewChange = (view: 'agents' | 'admin') => {
    if (view === 'admin' && mode !== 'admin') {
      return; // Ne pas permettre l'accès admin sans permissions
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

  // Vérifier si on est sur la page de réinitialisation de mot de passe
  const isPasswordReset = window.location.hash === '#reset-password' || 
                          window.location.pathname === '/auth/reset-password';

  if (isPasswordReset) {
    return <PasswordReset />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-orange-50 flex items-center justify-center relative overflow-hidden">
        <ParticleBackground particleCount={30} animated={true} />
        
        <motion.div 
          className="text-center relative z-10"
          initial={{ opacity: 0, scale: 0.8, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ 
            type: "spring",
            stiffness: 100,
            damping: 20,
            duration: 0.8 
          }}
        >
          <motion.div 
            className="w-20 h-20 bg-gradient-primary rounded-2xl flex items-center justify-center mb-6 mx-auto relative hover-lift"
            animate={{ 
              rotate: [0, 5, -5, 0],
              scale: [1, 1.05, 1]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <LoadingSpinner variant="orbital" size="md" color="#ffffff" />
            
            {/* Effet de halo */}
            <motion.div
              className="absolute inset-0 rounded-2xl bg-orange-500/20"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.5, 0, 0.5]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeOut"
              }}
            />
          </motion.div>
          
          <motion.h2 
            className="text-4xl font-bold text-gradient mb-3 animate-shimmer"
            animate={{
              backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "linear"
            }}
          >
            OXO
          </motion.h2>
          
          <motion.p 
            className="text-gray-600 text-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Chargement de la plateforme...
          </motion.p>
          
          {/* Barres de progression animées */}
          <div className="mt-6 space-y-2">
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="h-1 bg-gray-200 rounded-full overflow-hidden"
                style={{ width: `${60 + i * 20}px` }}
              >
                <motion.div
                  className="h-full bg-gradient-primary"
                  initial={{ x: "-100%" }}
                  animate={{ x: "100%" }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.2,
                    ease: "easeInOut"
                  }}
                />
              </motion.div>
            ))}
          </div>
        </motion.div>
        
        {/* Cercles de fond animés */}
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full border-2 border-orange-200/30"
            style={{
              width: 100 + i * 50,
              height: 100 + i * 50,
              left: '50%',
              top: '50%',
              marginLeft: -(50 + i * 25),
              marginTop: -(50 + i * 25)
            }}
            animate={{
              rotate: 360,
              scale: [1, 1.1, 1]
            }}
            transition={{
              duration: 10 + i * 2,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-orange-50/30 relative overflow-hidden">
      {/* Arrière-plan de particules */}
      <ParticleBackground particleCount={40} animated={true} />
      
      <Header 
        currentView={currentView}
        onViewChange={handleViewChange}
      />
      
      <main className="pt-6 relative z-10">
        {!user ? (
          // Landing Page pour utilisateurs non connectés
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <ScrollReveal variant="fadeInUp" className="text-center py-16">
              <motion.div 
                className="w-24 h-24 bg-gradient-primary rounded-2xl flex items-center justify-center mb-8 mx-auto relative hover-lift animate-float"
                whileHover={{ 
                  scale: 1.1,
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                
                {/* Effet de brillance */}
                <motion.div
                  className="absolute inset-0 rounded-2xl bg-white/20"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0, 0.5, 0]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              </motion.div>
              
              <motion.h1 
                className="text-5xl md:text-6xl font-bold text-gray-900 mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                Bienvenue sur <span className="text-gradient animate-shimmer">OXO</span>
              </motion.h1>
              
              <motion.p 
                className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                Votre plateforme professionnelle pour gérer et contacter des agents vérifiés 
                sur WhatsApp, WeChat, Telegram et autres plateformes.
              </motion.p>

              <StaggeredReveal className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16" staggerDelay={0.15}>
                {[
                  {
                    icon: (
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    ),
                    title: "Agents Vérifiés",
                    description: "Tous nos agents sont vérifiés et garantis actifs pour assurer la qualité des échanges.",
                    color: "rgba(59, 130, 246, 0.3)"
                  },
                  {
                    icon: (
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    ),
                    title: "Multi-Plateformes",
                    description: "Contactez des agents sur WhatsApp, WeChat, Telegram et autres plateformes.",
                    color: "rgba(16, 185, 129, 0.3)"
                  },
                  {
                    icon: (
                      <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    ),
                    title: "Accès Instantané",
                    description: "Contactez directement les agents via leur plateforme préférée en un clic.",
                    color: "rgba(139, 92, 246, 0.3)"
                  }
                ].map((feature, index) => (
                  <motion.div
                    key={index}
                    className="glass-card p-8 text-center hover-lift group"
                    whileHover={{ 
                      y: -8,
                      scale: 1.02,
                      rotateY: 5
                    }}
                    transition={{ 
                      type: "spring",
                      stiffness: 300,
                      damping: 20
                    }}
                  >
                    {/* Icône avec effet lumineux */}
                    <motion.div 
                      className="w-14 h-14 rounded-xl flex items-center justify-center mb-6 mx-auto relative"
                      style={{ 
                        background: `linear-gradient(135deg, ${feature.color}, rgba(255,255,255,0.1))`
                      }}
                      whileHover={{ 
                        scale: 1.1,
                        rotate: [0, 5, -5, 0]
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      {feature.icon}
                      
                      {/* Effet de halo */}
                      <motion.div
                        className="absolute inset-0 rounded-xl"
                        style={{ 
                          background: feature.color,
                          filter: "blur(10px)",
                          opacity: 0
                        }}
                        whileHover={{ opacity: 0.6 }}
                      />
                    </motion.div>
                    
                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-orange-600 transition-colors">
                      {feature.title}
                    </h3>
                    
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {feature.description}
                    </p>
                    
                    {/* Effet de brillance sur hover */}
                    <motion.div
                      className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12"
                      initial={{ x: "-100%" }}
                      whileHover={{ x: "200%" }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                    />
                  </motion.div>
                ))}
              </StaggeredReveal>

              <ScrollReveal variant="fadeInUp" delay={0.6} className="mt-20">
                <div className="glass-card p-8 bg-gradient-to-r from-blue-50/50 to-orange-50/50 border-2 border-orange-200/30">
                  <div className="text-center">
                    <motion.div
                      className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4"
                      animate={{
                        rotate: [0, 10, -10, 0],
                        scale: [1, 1.05, 1]
                      }}
                      transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </motion.div>
                    
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">
                      🔐 Accès Sécurisé Requis
                    </h3>
                    <p className="text-gray-700 mb-6 text-lg">
                      Connectez-vous pour accéder à la base de données complète d'agents vérifiés.
                    </p>
                  </div>
                </div>
              </ScrollReveal>
            </ScrollReveal>
          </div>
        ) : (
          // Interface pour utilisateurs connectés
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {currentView === 'agents' ? (
              <motion.div
                key="agents"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.4, type: "spring", stiffness: 100 }}
              >
                <ScrollReveal variant="fadeInUp">
                  <div className="mb-8">
                    <motion.h1 
                      className="text-4xl font-bold text-gray-900 mb-3"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      Base d'agents
                    </motion.h1>
                    <motion.p 
                      className="text-gray-600 text-lg"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      Découvrez et contactez des agents vérifiés sur différentes plateformes.
                    </motion.p>
                  </div>
                </ScrollReveal>

                <ScrollReveal variant="slideRotate" delay={0.2}>
                  <AgentList 
                    onEditAgent={handleEditAgent}
                    onCreateAgent={handleCreateAgent}
                  />
                </ScrollReveal>
              </motion.div>
            ) : (
              <motion.div
                key="admin"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4, type: "spring", stiffness: 100 }}
              >
                <ScrollReveal variant="fadeInUp">
                  <div className="mb-8">
                    <motion.h1 
                      className="text-4xl font-bold text-gray-900 mb-3"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      Administration
                    </motion.h1>
                    <motion.p 
                      className="text-gray-600 text-lg"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      Gérez les paramètres de sécurité et les mots de passe de la plateforme.
                    </motion.p>
                  </div>
                </ScrollReveal>

                <ScrollReveal variant="parallax" delay={0.2}>
                  <AdminDashboard />
                </ScrollReveal>
              </motion.div>
            )}
          </div>
        )}
      </main>

      {/* Agent Modal */}
      <AgentModal
        isOpen={showCreateModal}
        onClose={handleCloseModal}
        agent={editingAgent}
      />

      {/* Footer moderne avec animations */}
      <ScrollReveal variant="fadeInUp" className="mt-20">
        <footer className="glass-effect border-t border-gray-200/50 relative overflow-hidden">
          <ParticleBackground particleCount={20} animated={true} />
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
            <div className="text-center">
              <motion.div 
                className="flex items-center justify-center space-x-3 mb-6"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <motion.div 
                  className="w-8 h-8 bg-gradient-primary rounded-xl flex items-center justify-center"
                  animate={{ 
                    rotate: [0, 5, -5, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.79 4 8.5 4s8.5-1.79 8.5-4V7M4 7c0 2.21 3.79 4 8.5 4s8.5-1.79 8.5-4M4 7c0-2.21 3.79-4 8.5-4s8.5 1.79 8.5 4" />
                  </svg>
                </motion.div>
                <span className="text-2xl font-bold text-gradient animate-shimmer">OXO</span>
              </motion.div>
              
              <motion.p 
                className="text-gray-500 text-sm mb-6"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                © 2025 OXO - Plateforme professionnelle d'agents vérifiés
              </motion.p>
              
              <StaggeredReveal 
                className="flex items-center justify-center space-x-6 text-xs text-gray-400"
                staggerDelay={0.1}
              >
                {[
                  { icon: "🔒", text: "Données sécurisées" },
                  { icon: "✅", text: "Agents vérifiés" },
                  { icon: "⚡", text: "Accès instantané" }
                ].map((item, index) => (
                  <motion.span
                    key={index}
                    className="flex items-center space-x-1 hover:text-orange-500 transition-colors cursor-pointer"
                    whileHover={{ scale: 1.1, y: -2 }}
                  >
                    <span>{item.icon}</span>
                    <span>{item.text}</span>
                  </motion.span>
                ))}
              </StaggeredReveal>
            </div>
          </div>
          
          {/* Effet de brillance de fond */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-orange-100/20 to-transparent"
            animate={{ x: ["-100%", "100%"] }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        </footer>
      </ScrollReveal>
    </div>
  );
};

export default App;