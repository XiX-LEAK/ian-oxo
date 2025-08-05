import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, Shield, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode?: 'site-password' | 'admin';
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ 
  isOpen, 
  onClose, 
  mode = 'site-password',
  onSuccess
}) => {
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [sitePassword, setSitePassword] = useState('');
  const [showSitePassword, setShowSitePassword] = useState(false);

  const { 
    switchToAdmin, 
    checkSitePassword,
    isLoading, 
    error, 
    clearError 
  } = useAuthStore();


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    
    if (mode === 'admin') {
      const success = await switchToAdmin(adminPassword);
      if (success) {
        onClose();
        resetForm();
        onSuccess?.();
      }
      return;
    }

    if (mode === 'site-password') {
      const success = await checkSitePassword(sitePassword);
      if (success) {
        onClose();
        resetForm();
        onSuccess?.();
      }
    }
  };

  const resetForm = () => {
    setAdminPassword('');
    setSitePassword('');
    setShowAdminPassword(false);
    setShowSitePassword(false);
  };

  const modalVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0.8,
      y: 50
    },
    visible: { 
      opacity: 1, 
      scale: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 25,
        stiffness: 500
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.8,
      y: 50,
      transition: {
        duration: 0.2
      }
    }
  };

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 }
  };

  const getTitle = () => {
    if (mode === 'admin') return 'Mode Administrateur';
    return 'Accès au Site';
  };

  const getDescription = () => {
    if (mode === 'admin') return 'Entrez le mot de passe admin pour accéder aux fonctionnalités d\'édition';
    return 'Entrez le mot de passe du site pour accéder à l\'annuaire d\'agents';
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto"
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            className="relative w-full max-w-md my-8 min-h-0"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div className="bg-white rounded-2xl shadow-2xl relative border border-gray-100">
              {/* Header with modern gradient background */}
              <div className="bg-gradient-to-br from-orange-500 via-orange-600 to-red-500 rounded-t-2xl px-8 py-10 text-center relative overflow-hidden">
                {/* Background pattern */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.3)_0%,transparent_50%)]" />
                </div>
                {/* Close Button */}
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-2 rounded-lg hover:bg-white/20 transition-colors text-white"
                >
                  <X className="w-5 h-5" />
                </button>

                <motion.div 
                  className="mx-auto w-24 h-24 bg-white/15 backdrop-blur-sm rounded-3xl flex items-center justify-center mb-8 border border-white/20 shadow-2xl relative"
                  animate={{ 
                    rotate: [0, 2, -2, 0],
                    scale: [1, 1.02, 1],
                    boxShadow: [
                      "0 0 20px rgba(255,255,255,0.2)",
                      "0 0 40px rgba(255,255,255,0.4)",
                      "0 0 20px rgba(255,255,255,0.2)"
                    ]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  whileHover={{
                    scale: 1.15,
                    rotate: 5,
                    boxShadow: "0 0 60px rgba(255,255,255,0.6)",
                    transition: { duration: 0.4 }
                  }}
                >
                  {/* Halo effect */}
                  <motion.div
                    className="absolute inset-0 rounded-3xl bg-gradient-to-r from-white/20 to-orange-200/30"
                    animate={{
                      rotate: [0, 360]
                    }}
                    transition={{
                      duration: 8,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                  />
                  {mode === 'admin' ? (
                    <Shield className="w-12 h-12 text-white relative z-10 drop-shadow-lg" />
                  ) : (
                    <Lock className="w-12 h-12 text-white relative z-10 drop-shadow-lg" />
                  )}
                </motion.div>
                <motion.h2 
                  className="text-4xl font-bold text-white mb-4 tracking-tight relative z-10"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  style={{
                    textShadow: "0 4px 8px rgba(0,0,0,0.3)",
                    background: "linear-gradient(135deg, #ffffff 0%, #fef3c7 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text"
                  }}
                >
                  {getTitle()}
                </motion.h2>
                <motion.p 
                  className="text-orange-50 text-lg font-medium relative z-10"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  style={{
                    textShadow: "0 2px 4px rgba(0,0,0,0.2)"
                  }}
                >
                  {getDescription()}
                </motion.p>
              </div>

              {/* Content */}
              <div className="p-10 bg-gradient-to-b from-gray-50 to-white">
                {/* Error Message */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-3"
                  >
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                    <span className="text-red-700 text-sm">{error}</span>
                  </motion.div>
                )}

                {/* Form */}
                <motion.form 
                  onSubmit={handleSubmit} 
                  className="space-y-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <motion.div 
                    className="space-y-5"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3, staggerChildren: 0.1 }}
                  >
                    {/* Mot de passe du site */}
                    {mode === 'site-password' && (
                      <div>
                        <motion.label 
                          className="block text-base font-bold text-gray-800 mb-4 flex items-center space-x-2"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.4 }}
                        >
                          <Lock className="w-5 h-5 text-orange-500" />
                          <span>Mot de passe du site</span>
                        </motion.label>
                        <motion.div 
                          className="relative group"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.5 }}
                        >
                          <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-orange-500 transition-all duration-300" />
                          <input
                            type={showSitePassword ? "text" : "password"}
                            value={sitePassword}
                            onChange={(e) => setSitePassword(e.target.value)}
                            className="w-full h-14 pl-12 pr-14 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all duration-300 text-lg font-medium bg-white shadow-sm hover:shadow-md placeholder-gray-400 text-gray-900"
                            placeholder="Entrez le mot de passe du site"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowSitePassword(!showSitePassword)}
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500 hover:text-orange-500"
                          >
                            {showSitePassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                          </button>
                        </motion.div>
                      </div>
                    )}

                    {/* Mot de passe admin (mode admin uniquement) */}
                    {mode === 'admin' && (
                      <div>
                        <motion.label 
                          className="block text-base font-bold text-gray-800 mb-4 flex items-center space-x-2"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.4 }}
                        >
                          <Shield className="w-5 h-5 text-purple-500" />
                          <span>Mot de passe administrateur</span>
                        </motion.label>
                        <motion.div 
                          className="relative group"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.5 }}
                        >
                          <Shield className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-purple-500 transition-all duration-300" />
                          <input
                            type={showAdminPassword ? "text" : "password"}
                            value={adminPassword}
                            onChange={(e) => setAdminPassword(e.target.value)}
                            className="w-full h-14 pl-12 pr-14 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-300 text-lg font-medium bg-white shadow-sm hover:shadow-md placeholder-gray-400 text-gray-900"
                            placeholder="Mot de passe admin"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowAdminPassword(!showAdminPassword)}
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500 hover:text-purple-500"
                          >
                            {showAdminPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                          </button>
                        </motion.div>
                      </div>
                    )}
                  </motion.div>

                  {/* Submit Button */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    <motion.button
                      type="submit"
                      disabled={isLoading}
                      className="w-full h-16 text-lg font-bold relative overflow-hidden shadow-xl bg-gradient-to-r from-orange-500 via-orange-600 to-red-500 hover:from-orange-600 hover:via-orange-700 hover:to-red-600 rounded-xl text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      whileHover={{ 
                        scale: 1.03, 
                        y: -3,
                        boxShadow: "0 15px 35px rgba(249, 115, 22, 0.4)",
                        filter: "brightness(1.1)"
                      }}
                      whileTap={{ scale: 0.97 }}
                      transition={{ type: "spring", stiffness: 400, damping: 15 }}
                    >
                      {/* Effet de brillance animé */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12"
                        animate={{
                          x: ["-100%", "200%"]
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          repeatDelay: 1,
                          ease: "easeInOut"
                        }}
                      />
                      
                      {/* Contenu du bouton */}
                      <div className="relative z-10">
                        {isLoading ? (
                          <div className="flex items-center justify-center space-x-3">
                            <motion.div 
                              className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full"
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            />
                            <span className="text-lg">Connexion en cours...</span>
                          </div>
                        ) : (
                          <motion.div
                            className="flex items-center justify-center space-x-3"
                            whileHover={{ scale: 1.05 }}
                            transition={{ type: "spring", stiffness: 300 }}
                          >
                            <motion.span 
                              className="text-2xl"
                              animate={{ 
                                rotate: [0, 10, -10, 0],
                                scale: [1, 1.1, 1]
                              }}
                              transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: "easeInOut"
                              }}
                            >
                              {mode === 'admin' ? '🔑' : ''}
                            </motion.span>
                            <span className="text-lg font-bold">
                              {mode === 'admin' ? 'Accéder au mode admin' : 'Accéder au site'}
                            </span>
                          </motion.div>
                        )}
                      </div>
                    </motion.button>
                  </motion.div>
                </motion.form>


                {/* Info Notice et lien Whop */}
                <motion.div 
                  className="mt-10 pt-8 border-t border-gray-200 space-y-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                >

                  {/* Message d'accès Whop - uniquement pour le mode site-password - NOUVEAU DESIGN */}
                  {mode === 'site-password' && (
                    <motion.div 
                      className="text-center bg-gradient-to-r from-orange-50/90 to-red-50/90 rounded-2xl p-8 border-2 border-orange-200/60 relative overflow-hidden"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 1 }}
                    >
                      {/* Effet de brillance de fond */}
                      <div className="absolute inset-0 bg-gradient-to-r from-orange-400/5 via-transparent to-red-400/5" />
                      
                      <motion.div
                        className="flex items-center justify-center space-x-3 mb-6 relative z-10"
                        animate={{
                          y: [0, -2, 0]
                        }}
                        transition={{
                          duration: 2.5,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      >
                        <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
                          <span className="text-xl">🔐</span>
                        </div>
                        <div className="text-left">
                          <h3 className="text-xl font-bold text-gray-900">Pas le bon mot de passe ?</h3>
                          <p className="text-orange-600 font-medium text-sm">Solution simple ci-dessous !</p>
                        </div>
                      </motion.div>
                      
                      <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 mb-6 border border-orange-200/50 relative z-10">
                        <p className="text-sm text-gray-700 leading-relaxed">
                          <span className="text-orange-600 font-bold">Mot de passe introuvable ?</span><br/>
                          Rejoignez notre communauté pour <strong className="text-orange-700">un accès permanent</strong> !
                        </p>
                      </div>
                      
                      <motion.a
                        href="https://whop.com/oxo/presentation-oxo-XeNskuhecJ4ew0/app/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group inline-flex items-center space-x-3 bg-gradient-to-r from-orange-500 via-orange-600 to-red-500 hover:from-orange-600 hover:via-orange-700 hover:to-red-600 text-white font-bold px-8 py-4 rounded-xl transition-all duration-300 shadow-xl hover:shadow-orange-500/40 relative z-10"
                        whileHover={{ 
                          scale: 1.05,
                          y: -2,
                          boxShadow: "0 15px 30px rgba(249, 115, 22, 0.4)"
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
                        
                        <div className="flex items-center space-x-3 relative z-10">
                          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                            <span className="text-lg">🚀</span>
                          </div>
                          <div className="text-left">
                            <div className="font-bold">OBTENIR L'ACCÈS</div>
                            <div className="text-orange-100 text-xs">Communauté OXO</div>
                          </div>
                          <motion.div
                            animate={{ x: [0, 5, 0] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="text-lg"
                          >
                            →
                          </motion.div>
                        </div>
                      </motion.a>
                      
                      <div className="mt-6 grid grid-cols-3 gap-3 text-xs relative z-10">
                        {[
                          { icon: "⚡", text: "Accès immédiat" },
                          { icon: "🛡️", text: "Support 24/7" },
                          { icon: "🔥", text: "Toujours à jour" }
                        ].map((item, index) => (
                          <motion.div
                            key={index}
                            className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-orange-100"
                            whileHover={{ scale: 1.05 }}
                          >
                            <div className="text-lg mb-1">{item.icon}</div>
                            <div className="font-medium text-gray-700">{item.text}</div>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};