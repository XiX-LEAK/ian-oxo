import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { ArrowRight, Database, Shield, Zap, Users } from 'lucide-react';
import { ParticleBackground, InteractiveParticles } from './ParticleBackground';

export const HeroSection: React.FC = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Animation des particules flottantes
    if (particlesRef.current) {
      const particles = particlesRef.current.children;
      Array.from(particles).forEach((particle, index) => {
        gsap.to(particle, {
          y: "random(-50, 50)",
          x: "random(-30, 30)",
          rotation: "random(-180, 180)",
          duration: "random(3, 6)",
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          delay: index * 0.2
        });
      });
    }

    // Animation du gradient de fond
    gsap.to(heroRef.current, {
      backgroundPosition: "200% 200%",
      duration: 20,
      repeat: -1,
      ease: "none"
    });
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        damping: 20,
        stiffness: 100
      }
    }
  };

  const features = [
    {
      icon: Database,
      title: "Agents WhatsApp & WeChat",
      description: "Base de données d'agents professionnels vérifiés par secteurs"
    },
    {
      icon: Shield,
      title: "Contacts Vérifiés",
      description: "Tous les agents sont vérifiés et garantis actifs"
    },
    {
      icon: Zap,
      title: "Accès Instantané",
      description: "Contactez directement les agents via WhatsApp ou WeChat"
    },
    {
      icon: Users,
      title: "Plateforme Gratuite",
      description: "Accès complet à la base de données sans frais"
    }
  ];

  return (
    <motion.section
      ref={heroRef}
      id="home"
      className="hero-section relative pt-16"
      style={{
        background: "radial-gradient(ellipse at center, rgba(249, 115, 22, 0.1) 0%, transparent 70%), linear-gradient(45deg, #020617 0%, #1e293b 50%, #020617 100%)",
        backgroundSize: "400% 400%"
      }}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Système de particules avancé */}
      <ParticleBackground 
        particleCount={40}
        color="#f97316"
        size={2}
        speed={3}
        opacity={0.6}
      />
      <InteractiveParticles particleCount={15} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center">
          {/* Badge éducatif */}
          <motion.div
            variants={itemVariants}
            className="inline-flex items-center px-4 py-2 rounded-full bg-primary-500/20 border border-primary-500/30 mb-8"
          >
            <span className="text-primary-400 text-sm font-medium">
              📱 Annuaire d'Agents WhatsApp & WeChat Vérifiés
            </span>
          </motion.div>

          {/* Titre principal */}
          <motion.h1
            variants={itemVariants}
            className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6"
          >
            <span className="text-white">Bienvenue sur </span>
            <span className="text-gradient">OXO</span>
          </motion.h1>

          {/* Sous-titre avec effet typewriter */}
          <motion.div
            variants={itemVariants}
            className="text-xl md:text-2xl text-dark-300 mb-8 max-w-3xl mx-auto"
          >
            <p className="typewriter">
              Votre annuaire professionnel d'agents WhatsApp et WeChat vérifiés
            </p>
          </motion.div>

          {/* Description */}
          <motion.p
            variants={itemVariants}
            className="text-lg text-dark-400 mb-12 max-w-2xl mx-auto leading-relaxed"
          >
            Accédez à une base de données d'agents WhatsApp et WeChat professionnels vérifiés, organisés par secteurs d'activité. 
            Plateforme sécurisée avec accès gratuit aux contacts de qualité.
          </motion.p>

          {/* Boutons d'action */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
          >
            <motion.button
              className="btn-primary group"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span>Explorer les Agents</span>
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </motion.button>
            
            <motion.button
              className="btn-secondary"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Voir la Démonstration
            </motion.button>
          </motion.div>

          {/* Message d'accès Whop */}
          <motion.div
            variants={itemVariants}
            className="max-w-md mx-auto mb-16"
          >
            <motion.div 
              className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/20 text-center"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                className="flex items-center justify-center space-x-2 mb-3"
                animate={{
                  y: [0, -3, 0]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <span className="text-2xl">🔐</span>
                <h3 className="font-bold text-white text-lg">Accès Protégé</h3>
              </motion.div>
              <p className="text-gray-300 text-sm mb-4 leading-relaxed">
                Le <strong className="text-purple-300">mot de passe change régulièrement</strong> pour garantir la sécurité.<br/>
                Rejoignez notre <strong className="text-blue-300">communauté exclusive</strong> !
              </p>
              <motion.a
                href="https://whop.com/oxo/presentation-oxo-XeNskuhecJ4ew0/app/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold px-6 py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: "0 10px 30px rgba(147, 51, 234, 0.4)"
                }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="text-xl">🚀</span>
                <span>Communauté OXO</span>
                <motion.span
                  animate={{ x: [0, 4, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="text-lg"
                >
                  →
                </motion.span>
              </motion.a>
              <p className="text-xs text-gray-400 mt-3">
                Accès instantané • Support 24/7 • Mises à jour exclusives
              </p>
            </motion.div>
          </motion.div>
        </div>

        {/* Grille de fonctionnalités */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              className="glass-card text-center group"
              whileHover={{ 
                y: -8,
                transition: { type: "spring", stiffness: 400, damping: 25 }
              }}
              initial={{ opacity: 0, y: 30 }}
              animate={{ 
                opacity: 1, 
                y: 0,
                transition: { delay: 0.1 * index }
              }}
            >
              <div className="mx-auto w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-dark-300 text-sm">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* Statistiques */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 pt-16 border-t border-dark-700"
        >
          {[
            { number: "500+", label: "Agents Vérifiés" },
            { number: "7", label: "Secteurs d'Activité" },
            { number: "24/7", label: "Support Available" },
            { number: "100%", label: "Accès Gratuit" }
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              className="text-center"
              whileHover={{ scale: 1.05 }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ 
                opacity: 1, 
                scale: 1,
                transition: { delay: 0.1 * index }
              }}
            >
              <div className="text-3xl md:text-4xl font-bold text-gradient mb-2">
                {stat.number}
              </div>
              <div className="text-dark-400 text-sm">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Indicateur de scroll */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="w-6 h-10 border-2 border-primary-500 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-primary-500 rounded-full mt-2"></div>
        </div>
      </motion.div>
    </motion.section>
  );
};