import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';

interface SitePasswordModalProps {
  isOpen: boolean;
}

export const SitePasswordModal: React.FC<SitePasswordModalProps> = ({ isOpen }) => {
  const [sitePassword, setSitePassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { checkSitePassword, error, clearError } = useAuthStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    
    if (!sitePassword.trim()) {
      return;
    }
    
    checkSitePassword(sitePassword);
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
    }
  };

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto"
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          
          {/* Modal */}
          <motion.div
            className="relative w-full max-w-md my-8 min-h-0"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            <div className="bg-white rounded-2xl shadow-2xl relative border border-gray-100">
              {/* Header with gradient background */}
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-t-2xl px-8 py-8 text-center relative">
                <div className="mx-auto w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-6 border border-white/30">
                  <Lock className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-2">
                  Accès Sécurisé
                </h2>
                <p className="text-orange-100 text-lg">
                  Entrez le mot de passe du site pour accéder à la plateforme OXO
                </p>
              </div>

              {/* Content */}
              <div className="p-8">
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
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Mot de passe du site
                    </label>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-orange-500 transition-colors z-10" />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={sitePassword}
                        onChange={(e) => setSitePassword(e.target.value)}
                        className="w-full h-12 pl-12 pr-12 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-orange-300 focus:border-orange-500 bg-white text-gray-900 placeholder-gray-500 transition-all duration-300"
                        placeholder=" Entrez le mot de passe fourni par l'admin"
                        required
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-orange-500 z-10"
                      >
                        {showPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <motion.button
                    type="submit"
                    className="btn-primary w-full h-12 text-base font-semibold relative overflow-hidden shadow-lg"
                    whileHover={{ scale: 1.02, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span>🔓 Accéder à OXO</span>
                  </motion.button>
                </form>

                {/* Info Notice */}
                <div className="mt-8 pt-6 border-t border-gray-100">
                  <div className="text-center">
                    <p className="text-xs text-gray-500 font-medium mb-2">
                      🔒 Plateforme sécurisée
                    </p>
                    <p className="text-xs text-gray-400">
                      Contactez l'administrateur si vous n'avez pas le mot de passe d'accès
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};