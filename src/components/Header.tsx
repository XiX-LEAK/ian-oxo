import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Shield, LogOut, Menu, X, Database, Lock } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { AuthModal } from './AuthModal';
import { ChangePasswordModal } from './ChangePasswordModal';

interface HeaderProps {
  currentView: 'agents' | 'admin';
  onViewChange: (view: 'agents' | 'admin') => void;
}

export const Header: React.FC<HeaderProps> = ({ currentView, onViewChange }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [authMode, setAuthMode] = useState<'site-password' | 'admin'>('site-password');
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  const { hasAccessToSite, mode, logout, switchToVisitor } = useAuthStore();

  const handleAdminClick = () => {
    if (mode === 'admin') {
      if (currentView === 'admin') {
        switchToVisitor();
        onViewChange('agents');
      } else {
        onViewChange('admin');
      }
    } else {
      setAuthMode('admin');
      setShowAuthModal(true);
    }
  };

  const handleLoginClick = () => {
    // Scroll vers le haut avant d'ouvrir le modal
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setAuthMode('site-password');
    setShowAuthModal(true);
  };

  const handleLogoClick = () => {
    // Rediriger vers l'écran d'accueil (déconnecte l'utilisateur virtuellement)
    if (hasAccessToSite) {
      logout();
    }
    onViewChange('agents');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <header className="header-modern">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <motion.div
              className="flex items-center cursor-pointer group"
              onClick={handleLogoClick}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.h1 
                className="text-2xl font-bold text-gradient animate-shimmer relative"
                whileHover={{ 
                  scale: 1.1,
                  textShadow: "0 0 20px rgba(255, 107, 53, 0.5)"
                }}
                transition={{ duration: 0.3 }}
              >
                OXO
                {/* Glow effect under text */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-orange-500/20 via-orange-400/30 to-orange-500/20 blur-lg -z-10"
                  animate={{
                    opacity: [0.5, 0.8, 0.5],
                    scale: [0.8, 1.2, 0.8]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              </motion.h1>
            </motion.div>

            {/* Navigation - Desktop */}
            <nav className="hidden md:flex items-center space-x-1">
              {hasAccessToSite && (
                <motion.button
                  onClick={() => onViewChange('agents')}
                  className={`nav-link-modern relative overflow-hidden ${currentView === 'agents' ? 'active' : ''}`}
                  whileHover={{ 
                    scale: 1.02,
                    y: -2,
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)"
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Database className="w-4 h-4 mr-2" />
                  Base d'agents
                  {/* Hover effect background */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-orange-500/10 opacity-0"
                    whileHover={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                </motion.button>
              )}
              
              {hasAccessToSite && (
                <motion.button
                  onClick={handleAdminClick}
                  className={`nav-link-modern relative overflow-hidden ${currentView === 'admin' ? 'active' : ''}`}
                  whileHover={{ 
                    scale: 1.02,
                    y: -2,
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)"
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Shield className="w-4 h-4 mr-2" />
                  {mode === 'admin' ? 'Administration' : 'Mode Admin'}
                  {/* Hover effect background */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-orange-500/10 opacity-0"
                    whileHover={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                </motion.button>
              )}
            </nav>

            {/* User Actions */}
            <div className="flex items-center space-x-3">
              {hasAccessToSite ? (
                <div className="hidden md:flex items-center space-x-3">
                  {/* User Info */}
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">Utilisateur connecté</p>
                    <p className="text-xs text-gray-500 capitalize">
                      {mode === 'admin' ? 'Administrateur' : 'Utilisateur'}
                    </p>
                  </div>
                  
                  {/* User Avatar */}
                  <div className="relative group">
                    <motion.div
                      className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center cursor-pointer relative overflow-hidden ring-2 ring-transparent transition-all duration-300"
                      whileHover={{ 
                        scale: 1.1,
                        boxShadow: "0 8px 25px rgba(249, 115, 22, 0.3)",
                        ring: "2px solid #f97316"
                      }}
                    >
                      <User className="w-4 h-4 text-white relative z-10" />
                      {/* Pulse effect */}
                      <motion.div
                        className="absolute inset-0 bg-white/20 rounded-full"
                        animate={{
                          scale: [1, 1.2, 1],
                          opacity: [0.3, 0, 0.3]
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      />
                    </motion.div>
                    
                    {/* Dropdown */}
                    <motion.div
                      className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50"
                      initial={{ y: -10, opacity: 0 }}
                      whileInView={{ y: 0, opacity: 1 }}
                      style={{ 
                        boxShadow: "0 20px 40px rgba(0, 0, 0, 0.15)"
                      }}
                    >
                      <div className="p-3 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">Utilisateur connecté</p>
                        <p className="text-xs text-gray-500 capitalize">{mode}</p>
                      </div>
                      {mode === 'admin' && (
                        <motion.button
                          onClick={() => setShowChangePasswordModal(true)}
                          className="w-full flex items-center space-x-2 px-3 py-2 text-left text-sm hover:bg-orange-50 transition-all duration-300 text-orange-600 rounded-lg mx-1"
                          whileHover={{ 
                            x: 4,
                            backgroundColor: "#fed7aa"
                          }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Lock className="w-4 h-4" />
                          <span>Changer de mot de passe</span>
                        </motion.button>
                      )}
                      <motion.button
                        onClick={logout}
                        className="w-full flex items-center space-x-2 px-3 py-2 text-left text-sm hover:bg-red-50 transition-all duration-300 text-red-600 rounded-lg mx-1"
                        whileHover={{ 
                          x: 4,
                          backgroundColor: "#fee2e2"
                        }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Déconnexion</span>
                      </motion.button>
                    </motion.div>
                  </div>
                </div>
              ) : (
                <motion.button
                  onClick={handleLoginClick}
                  disabled={isTransitioning}
                  className="btn-primary relative overflow-hidden group"
                  whileHover={!isTransitioning ? { 
                    scale: 1.05,
                    boxShadow: "0 10px 30px rgba(249, 115, 22, 0.4)"
                  } : {}}
                  whileTap={!isTransitioning ? { 
                    scale: 0.95,
                    boxShadow: "0 5px 15px rgba(249, 115, 22, 0.6)"
                  } : {}}
                  animate={isTransitioning ? {
                    scale: [1, 1.1, 1.05],
                    boxShadow: [
                      "0 5px 15px rgba(249, 115, 22, 0.3)",
                      "0 15px 40px rgba(249, 115, 22, 0.8)",
                      "0 20px 60px rgba(249, 115, 22, 0.6)"
                    ]
                  } : {}}
                  transition={{ 
                    type: "spring", 
                    stiffness: 300, 
                    damping: 15 
                  }}
                >
                  {/* Explosion de particules lors du clic */}
                  {isTransitioning && (
                    <motion.div className="absolute inset-0">
                      {[...Array(20)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="absolute w-2 h-2 bg-white rounded-full"
                          style={{
                            left: "50%",
                            top: "50%"
                          }}
                          animate={{
                            x: Math.cos(i * 18 * Math.PI / 180) * (60 + Math.random() * 40),
                            y: Math.sin(i * 18 * Math.PI / 180) * (60 + Math.random() * 40),
                            opacity: [1, 0],
                            scale: [0, 1.5, 0]
                          }}
                          transition={{
                            duration: 1.2,
                            ease: "easeOut",
                            delay: i * 0.05
                          }}
                        />
                      ))}
                    </motion.div>
                  )}

                  {/* Effet de brillance animée */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12"
                    initial={{ x: "-100%" }}
                    animate={isTransitioning ? { x: ["−100%", "200%", "−100%"] } : {}}
                    whileHover={!isTransitioning ? { x: "200%" } : {}}
                    transition={isTransitioning ? { 
                      duration: 1.5, 
                      repeat: 1,
                      ease: "easeInOut" 
                    } : { 
                      duration: 0.8, 
                      ease: "easeInOut" 
                    }}
                  />
                  
                  {/* Effet de pulsation en arrière-plan */}
                  <motion.div
                    className="absolute inset-0 bg-orange-400/20 rounded-lg"
                    animate={isTransitioning ? {
                      scale: [1, 1.2, 1.1],
                      opacity: [0.5, 1, 0.8],
                      backgroundColor: [
                        "rgba(251, 146, 60, 0.2)",
                        "rgba(249, 115, 22, 0.8)",
                        "rgba(234, 88, 12, 0.6)"
                      ]
                    } : {
                      scale: [1, 1.05, 1],
                      opacity: [0.5, 0.8, 0.5]
                    }}
                    transition={isTransitioning ? {
                      duration: 1.5,
                      ease: "easeInOut"
                    } : {
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                  
                  {/* Particules flottantes */}
                  <motion.div className="absolute inset-0">
                    {[...Array(6)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute w-1 h-1 bg-white/60 rounded-full"
                        style={{
                          left: `${20 + i * 10}%`,
                          top: `${30 + (i % 2) * 40}%`
                        }}
                        animate={isTransitioning ? {
                          y: [-5, -25, -5],
                          opacity: [0, 1, 0],
                          scale: [0.5, 2, 0.5],
                          rotate: [0, 360, 720]
                        } : {
                          y: [-5, -15, -5],
                          opacity: [0, 1, 0],
                          scale: [0.5, 1, 0.5]
                        }}
                        transition={isTransitioning ? {
                          duration: 1.5,
                          ease: "easeInOut",
                          delay: i * 0.1
                        } : {
                          duration: 2 + i * 0.2,
                          repeat: Infinity,
                          delay: i * 0.3,
                          ease: "easeInOut"
                        }}
                      />
                    ))}
                  </motion.div>
                  
                  {/* Contenu du bouton */}
                  <div className="relative z-10 flex items-center">
                    <motion.div
                      whileHover={!isTransitioning ? { rotate: 360 } : {}}
                      animate={isTransitioning ? { opacity: 0, scale: 0 } : { opacity: 1, scale: 1 }}
                      transition={{ 
                        duration: isTransitioning ? 0.3 : 0.6, 
                        ease: "easeInOut" 
                      }}
                    >
                      <User className="w-4 h-4 mr-2" />
                    </motion.div>
                    <motion.span
                      whileHover={!isTransitioning ? { x: 2 } : {}}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      {isTransitioning ? "Décollage..." : "Accéder au site"}
                    </motion.span>
                  </div>
                </motion.button>
              )}

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-gray-200 py-4"
            >
              <div className="space-y-2">
                {hasAccessToSite && (
                  <button
                    onClick={() => {
                      onViewChange('agents');
                      setIsMenuOpen(false);
                    }}
                    className={`w-full nav-link-modern justify-start ${currentView === 'agents' ? 'active' : ''}`}
                  >
                    <Database className="w-4 h-4 mr-2" />
                    Base d'agents
                  </button>
                )}
                
                {hasAccessToSite && (
                  <>
                    <button
                      onClick={() => {
                        handleAdminClick();
                        setIsMenuOpen(false);
                      }}
                      className={`w-full nav-link-modern justify-start ${currentView === 'admin' ? 'active' : ''}`}
                    >
                      <Shield className="w-4 h-4 mr-2" />
                      {mode === 'admin' ? 'Administration' : 'Mode Admin'}
                    </button>
                    
                    <div className="pt-2 mt-2 border-t border-gray-200">
                      <div className="px-3 py-2">
                        <p className="text-sm font-medium text-gray-900">Utilisateur connecté</p>
                        <p className="text-xs text-gray-500 capitalize">{mode}</p>
                      </div>
                      {mode === 'admin' && (
                        <button
                          onClick={() => {
                            setShowChangePasswordModal(true);
                            setIsMenuOpen(false);
                          }}
                          className="w-full nav-link-modern justify-start text-orange-600"
                        >
                          <Lock className="w-4 h-4 mr-2" />
                          Changer de mot de passe
                        </button>
                      )}
                      <button
                        onClick={() => {
                          logout();
                          setIsMenuOpen(false);
                        }}
                        className="w-full nav-link-modern justify-start text-red-600"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Déconnexion
                      </button>
                    </div>
                  </>
                )}
                
                {!hasAccessToSite && (
                  <motion.button
                    onClick={() => {
                      handleLoginClick();
                      setIsMenuOpen(false);
                    }}
                    className="w-full btn-primary justify-center relative overflow-hidden"
                    whileTap={{ 
                      scale: 0.95,
                      boxShadow: "0 5px 15px rgba(249, 115, 22, 0.6)"
                    }}
                    transition={{ 
                      type: "spring", 
                      stiffness: 300, 
                      damping: 15 
                    }}
                  >
                    {/* Effet de brillance pour mobile */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
                      animate={{ x: ["-100%", "200%"] }}
                      transition={{ 
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                    
                    <div className="relative z-10 flex items-center justify-center">
                      <User className="w-4 h-4 mr-2" />
                      Accéder au site
                    </div>
                  </motion.button>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </header>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => {
          setShowAuthModal(false);
          setIsTransitioning(false);
        }}
        mode={authMode}
        onSuccess={() => {
          setShowAuthModal(false);
          setIsTransitioning(false);
          if (authMode === 'admin') {
            onViewChange('admin');
          }
        }}
      />

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={showChangePasswordModal}
        onClose={() => setShowChangePasswordModal(false)}
      />


    </>
  );
};