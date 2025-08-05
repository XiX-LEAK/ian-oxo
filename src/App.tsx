import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Header } from '@/components/Header';
import { AgentList } from '@/components/AgentList';
import { NewAgentList } from '@/components/NewAgentList';
import { AdminDashboard } from '@/components/AdminDashboard';
import { AgentModal } from '@/components/AgentModal';
import { PasswordReset } from '@/components/PasswordReset';
import { ParticleBackground } from '@/components/animations/ParticleBackground';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import { StaggeredReveal } from '@/components/animations/ScrollReveal';
import { AnimatedButton } from '@/components/animations/AnimatedButton';
import { LoadingSpinner } from '@/components/animations/LoadingSpinner';
import { SessionTimer } from '@/components/SessionTimer';
import { useAuthStore } from '@/stores/authStore';
import { useAgentStore } from '@/stores/agentStore';
import { useAutoLogout, useSessionCleanup } from '@/hooks/useAutoLogout';
import type { Agent } from '@/types/agent';

function App() {
  const [currentView, setCurrentView] = useState<'agents' | 'admin'>('agents');
  const [isLoading, setIsLoading] = useState(true);
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const { hasAccessToSite, mode, initializeAuth } = useAuthStore();
  const { loadAgents } = useAgentStore();

  // SYSTÈME DE DÉCONNEXION AUTOMATIQUE INTELLIGENT (1h)
  useAutoLogout();
  useSessionCleanup();

  // Initialiser le système d'authentification au démarrage
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
        
        {/* Cercles de fond animés - Réduits */}
        {[...Array(3)].map((_, i) => (
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-orange-50/30 relative">
      {/* Timer de session */}
      <SessionTimer />
      
      {/* Arrière-plan de particules avec flou continu */}
      <div className="fixed inset-0 z-0">
        <ParticleBackground particleCount={15} animated={true} />
      </div>
      
      <Header 
        currentView={currentView}
        onViewChange={handleViewChange}
      />
      
      <main className="pt-6 relative z-10">
        {!hasAccessToSite ? (
          // Landing Page pour utilisateurs sans accès au site
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative min-h-screen pb-20">
            {/* Éléments flottants décoratifs - Optimisés */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {[...Array(4)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 bg-gradient-to-r from-orange-400 to-purple-500 rounded-full opacity-60"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                  }}
                  animate={{
                    x: [0, Math.random() * 100 - 50],
                    y: [0, Math.random() * 100 - 50],
                    scale: [1, 1.5, 1],
                    opacity: [0.3, 0.8, 0.3]
                  }}
                  transition={{
                    duration: 3 + Math.random() * 2,
                    repeat: Infinity,
                    delay: i * 0.3,
                    ease: "easeInOut"
                  }}
                />
              ))}
            </div>

            <ScrollReveal variant="fadeInUp" className="text-center py-10 md:py-20 relative z-10">
              {/* Logo supprimé pour optimisation */}
              
              {/* Titre avec effet de texte liquide */}
              <motion.h1 
                className="text-4xl md:text-6xl lg:text-8xl font-bold mb-6 md:mb-8 relative"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.8 }}
              >
                <span className="text-gray-900">Bienvenue sur </span>
                <motion.span 
                  className="text-gradient bg-gradient-to-r from-orange-500 via-red-500 to-purple-600 bg-clip-text text-transparent relative inline-block"
                  animate={{
                    backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                    scale: [1, 1.05, 1]
                  }}
                  transition={{
                    backgroundPosition: { duration: 3, repeat: Infinity },
                    scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                  }}
                  style={{ backgroundSize: "200% 200%" }}
                >
                  OXO
                  
                  {/* Effet de particules autour du texte - Réduit */}
                  {[...Array(3)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-1 h-1 bg-orange-500 rounded-full"
                      style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                      }}
                      animate={{
                        scale: [0, 1, 0],
                        opacity: [0, 1, 0],
                        x: [0, (Math.random() - 0.5) * 50],
                        y: [0, (Math.random() - 0.5) * 50]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: i * 0.3,
                        ease: "easeOut"
                      }}
                    />
                  ))}
                </motion.span>
              </motion.h1>
              
              {/* Description avec effet typewriter responsive */}
              <motion.div
                className="text-lg md:text-2xl text-gray-600 mb-8 md:mb-16 max-w-3xl mx-auto leading-relaxed px-4"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.8 }}
              >
                {/* Version mobile - sans typewriter */}
                <div className="block md:hidden text-center">
                  <motion.p
                    className="text-base leading-relaxed"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1, duration: 1 }}
                  >
                    Votre plateforme professionnelle<br />
                    d'agents vérifiés
                  </motion.p>
                  <motion.p
                    className="mt-4 text-lg"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 2, duration: 1 }}
                  >
                    WhatsApp • WeChat et plus encore
                  </motion.p>
                </div>

                {/* Version desktop - avec typewriter */}
                <div className="hidden md:block">
                  <motion.p
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ delay: 1, duration: 2, ease: "easeInOut" }}
                    className="overflow-hidden whitespace-nowrap border-r-2 border-orange-500 mx-auto"
                    style={{ borderRight: "2px solid #f97316" }}
                  >
                    Votre plateforme professionnelle d'agents vérifiés
                  </motion.p>
                  <motion.p
                    className="mt-4 text-lg"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 3, duration: 1 }}
                  >
                    WhatsApp • WeChat et plus encore
                  </motion.p>
                </div>
              </motion.div>

              {/* Blocs de fonctionnalités avec animations conservées mais design original */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mt-12 md:mt-20 px-4">
                {[
                  {
                    icon: (
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    ),
                    title: "Agents Vérifiés",
                    description: "Tous nos agents sont vérifiés et garantis actifs pour assurer la qualité des échanges.",
                    color: "rgba(59, 130, 246, 0.3)",
                    delay: 0.2
                  },
                  {
                    icon: (
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    ),
                    title: "Multi-Plateformes",
                    description: "Contactez des agents sur WhatsApp, WeChat et autres plateformes.",
                    color: "rgba(16, 185, 129, 0.3)",
                    delay: 0.4
                  },
                  {
                    icon: (
                      <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    ),
                    title: "Accès Instantané",
                    description: "Contactez directement les agents via leur plateforme préférée en un clic.",
                    color: "rgba(139, 92, 246, 0.3)",
                    delay: 0.6
                  }
                ].map((feature, index) => (
                  <motion.div
                    key={index}
                    className="glass-card p-8 text-center hover-lift group relative overflow-hidden"
                    initial={{ opacity: 0, y: 60, rotateX: -15 }}
                    animate={{ opacity: 1, y: 0, rotateX: 0 }}
                    transition={{ 
                      delay: feature.delay, 
                      duration: 0.8,
                      type: "spring",
                      stiffness: 100
                    }}
                    whileHover={{ 
                      y: -12,
                      rotateY: 5,
                      scale: 1.03,
                      transition: { duration: 0.3 }
                    }}
                  >
                    {/* Particules flottantes dans la carte - Optimisées */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                      {[...Array(2)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="absolute w-1 h-1 bg-orange-400 rounded-full opacity-40"
                          style={{
                            left: `${20 + i * 30}%`,
                            top: `${20 + i * 20}%`,
                          }}
                          animate={{
                            y: [0, -15, 0],
                            opacity: [0.2, 0.6, 0.2],
                            scale: [1, 1.5, 1]
                          }}
                          transition={{
                            duration: 2 + i * 0.5,
                            repeat: Infinity,
                            delay: i * 0.4,
                            ease: "easeInOut"
                          }}
                        />
                      ))}
                    </div>

                    {/* Icône avec effet lumineux */}
                    <motion.div 
                      className="w-14 h-14 rounded-xl flex items-center justify-center mb-6 mx-auto relative"
                      style={{ 
                        background: `linear-gradient(135deg, ${feature.color}, rgba(255,255,255,0.1))`
                      }}
                      animate={{
                        rotate: [0, 5, -5, 0],
                        scale: [1, 1.05, 1]
                      }}
                      transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                      whileHover={{ 
                        scale: 1.2,
                        rotate: [0, 10, -10, 0],
                        transition: { duration: 0.3 }
                      }}
                    >
                      {feature.icon}
                      
                      {/* Anneaux orbitaux subtils */}
                      <motion.div
                        className="absolute inset-0 rounded-xl border border-white/20"
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 8,
                          repeat: Infinity,
                          ease: "linear"
                        }}
                      />
                    </motion.div>
                    
                    <motion.h3 
                      className="text-xl font-bold text-gray-900 mb-3 group-hover:text-orange-600 transition-colors relative"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: feature.delay + 0.3 }}
                    >
                      {feature.title}
                      {/* Effet de brillance au hover */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-orange-400/10 to-transparent opacity-0 group-hover:opacity-100"
                        animate={{ x: ["-100%", "100%"] }}
                        transition={{ duration: 1.5, ease: "easeInOut" }}
                      />
                    </motion.h3>
                    
                    <motion.p 
                      className="text-gray-600 text-sm leading-relaxed"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: feature.delay + 0.5 }}
                    >
                      {feature.description}
                    </motion.p>

                    {/* Indicateur de progression en bas */}
                    <motion.div
                      className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-orange-500 to-purple-500 rounded-full"
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ 
                        delay: feature.delay + 0.8, 
                        duration: 1.2,
                        ease: "easeOut"
                      }}
                    />
                  </motion.div>
                ))}
              </div>

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

              {/* Message d'accès Whop pour les non-connectés - NOUVEAU DESIGN */}
              <ScrollReveal variant="fadeInUp" delay={0.8} className="mt-12">
                <div className="max-w-2xl mx-auto">
                  <motion.div 
                    className="glass-card p-10 bg-gradient-to-br from-orange-50/80 to-red-50/80 border-2 border-orange-200/60 text-center relative overflow-hidden"
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* Effet de fond lumineux */}
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-400/5 via-transparent to-red-400/5" />
                    
                    <motion.div
                      className="flex items-center justify-center space-x-3 mb-6 relative z-10"
                      animate={{
                        y: [0, -4, 0]
                      }}
                      transition={{
                        duration: 2.5,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-xl">
                        <span className="text-2xl">🔐</span>
                      </div>
                      <div className="text-left">
                        <h3 className="text-3xl font-bold text-gray-900 mb-1">Besoin d'un accès ?</h3>
                        <p className="text-orange-600 font-semibold">Obtenez votre mot de passe maintenant</p>
                      </div>
                    </motion.div>
                    
                    <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-orange-200/50 relative z-10">
                      <p className="text-gray-800 text-lg leading-relaxed mb-4">
                        <span className="text-orange-600 font-bold">Accès sécurisé requis</span> pour consulter notre base de données d'agents vérifiés.
                      </p>
                      <p className="text-gray-600">
                        Le mot de passe change régulièrement pour garantir la sécurité.
                        <br/><strong className="text-orange-700">Solution simple :</strong> Rejoignez notre communauté pour un accès permanent !
                      </p>
                    </div>
                    
                    {/* Bouton Call-to-Action plus explicite */}
                    <motion.a
                      href="https://whop.com/oxo/presentation-oxo-XeNskuhecJ4ew0/app/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group inline-flex items-center space-x-4 bg-gradient-to-r from-orange-500 via-orange-600 to-red-500 hover:from-orange-600 hover:via-orange-700 hover:to-red-600 text-white font-bold px-10 py-5 rounded-2xl transition-all duration-300 shadow-2xl hover:shadow-orange-500/40 relative z-10 text-lg"
                      whileHover={{ 
                        scale: 1.05,
                        y: -3,
                        boxShadow: "0 25px 50px rgba(249, 115, 22, 0.4)"
                      }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {/* Effet de brillance */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12"
                        animate={{ x: ["-100%", "200%"] }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          repeatDelay: 2,
                          ease: "easeInOut"
                        }}
                      />
                      
                      <div className="flex items-center space-x-4 relative z-10">
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                          <span className="text-2xl">🚀</span>
                        </div>
                        <div className="text-left">
                          <div className="text-xl font-bold">OBTENIR L'ACCÈS MAINTENANT</div>
                          <div className="text-orange-100 text-sm font-medium">Rejoindre la communauté OXO</div>
                        </div>
                        <motion.div
                          animate={{ x: [0, 8, 0] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="text-2xl"
                        >
                          →
                        </motion.div>
                      </div>
                    </motion.a>
                    
                    {/* Avantages en grille plus visible */}
                    <div className="mt-8 grid grid-cols-3 gap-6 relative z-10">
                      {[
                        { icon: "⚡", title: "Accès instantané", desc: "En 2 minutes" },
                        { icon: "🛡️", title: "Support 24/7", desc: "Aide permanente" },
                        { icon: "🔥", title: "Mises à jour", desc: "Toujours à jour" }
                      ].map((item, index) => (
                        <motion.div
                          key={index}
                          className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-orange-100"
                          whileHover={{ scale: 1.05, y: -2 }}
                          transition={{ type: "spring", stiffness: 300 }}
                        >
                          <div className="text-2xl mb-2">{item.icon}</div>
                          <div className="font-bold text-gray-800 text-sm">{item.title}</div>
                          <div className="text-gray-600 text-xs">{item.desc}</div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                </div>
              </ScrollReveal>
            </ScrollReveal>
          </div>
        ) : (
          // Interface pour utilisateurs ayant accès au site
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {currentView === 'agents' ? (
              <motion.div
                key="agents"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.4, type: "spring", stiffness: 100 }}
              >
                <ScrollReveal variant="slideRotate" delay={0.2}>
                  <NewAgentList />
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
          <div className="absolute inset-0 z-0">
            <ParticleBackground particleCount={10} animated={true} />
          </div>
          
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