import { Variants } from 'framer-motion';

// 🎬 ANIMATIONS DE BOUTONS ÉPOUSTOUFLANTES
export const buttonAnimations = {
  // Effet de pulsation magnétique
  magneticPulse: {
    rest: { 
      scale: 1, 
      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
      background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)"
    },
    hover: { 
      scale: 1.05,
      boxShadow: "0 20px 40px rgba(249,115,22,0.4)",
      background: "linear-gradient(135deg, #ea580c 0%, #dc2626 100%)",
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10
      }
    },
    tap: { 
      scale: 0.95,
      boxShadow: "0 8px 16px rgba(0,0,0,0.2)"
    }
  },

  // Effet de shimmer/brillance
  shimmer: {
    rest: { 
      scale: 1,
      background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
      backgroundSize: "200% 200%",
      backgroundPosition: "0% 50%"
    },
    hover: { 
      scale: 1.03,
      backgroundPosition: "100% 50%",
      boxShadow: "0 0 30px rgba(59,130,246,0.6)",
      transition: {
        backgroundPosition: { duration: 0.6 },
        scale: { type: "spring", stiffness: 300 }
      }
    }
  },

  // Effet de morphing 3D
  morph3D: {
    rest: { 
      scale: 1,
      rotateX: 0,
      rotateY: 0,
      z: 0
    },
    hover: { 
      scale: 1.1,
      rotateX: -5,
      rotateY: 5,
      z: 50,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 12
      }
    },
    tap: {
      scale: 0.9,
      rotateX: 5,
      rotateY: -5,
      z: -20
    }
  }
};

// 🌊 ANIMATIONS DE SCROLL FLUIDES
export const scrollAnimations = {
  // Apparition en fondu avec mouvement
  fadeInUp: {
    hidden: { 
      opacity: 0, 
      y: 60,
      scale: 0.8
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12,
        duration: 0.6
      }
    }
  },

  // Apparition en cascade
  staggerChildren: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  },

  // Effet de parallaxe
  parallax: {
    hidden: { 
      opacity: 0, 
      y: 100,
      rotateX: -15
    },
    visible: { 
      opacity: 1, 
      y: 0,
      rotateX: 0,
      transition: {
        type: "spring",
        stiffness: 80,
        damping: 20
      }
    }
  },

  // Glissement latéral avec rotation
  slideRotate: {
    hidden: { 
      opacity: 0, 
      x: -100,
      rotate: -10,
      scale: 0.8
    },
    visible: { 
      opacity: 1, 
      x: 0,
      rotate: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 120,
        damping: 15
      }
    }
  }
};

// 🎭 ANIMATIONS DE HOVER CARDS
export const cardAnimations = {
  // Effet de lévitation avec ombre
  levitate: {
    rest: { 
      y: 0, 
      scale: 1,
      boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
      rotateX: 0,
      rotateY: 0
    },
    hover: { 
      y: -15,
      scale: 1.03,
      boxShadow: "0 25px 50px rgba(0,0,0,0.25)",
      rotateX: 5,
      rotateY: 5,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20
      }
    }
  },

  // Effet de brillance qui traverse
  glowSweep: {
    rest: { 
      scale: 1,
      background: "rgba(255,255,255,0.05)"
    },
    hover: { 
      scale: 1.02,
      background: [
        "rgba(255,255,255,0.05)",
        "rgba(255,255,255,0.15)",
        "rgba(255,255,255,0.05)"
      ],
      transition: {
        background: {
          duration: 1.5,
          repeat: Infinity,
          repeatType: "reverse"
        }
      }
    }
  },

  // Effet de flip 3D
  flip3D: {
    rest: { 
      rotateY: 0,
      scale: 1
    },
    hover: { 
      rotateY: 10,
      scale: 1.05,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 15
      }
    }
  }
};

// ⚡ ANIMATIONS DE LOADING AVANCÉES
export const loadingAnimations = {
  // Pulsation de points
  dots: {
    animate: {
      scale: [1, 1.2, 1],
      opacity: [0.5, 1, 0.5],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  },

  // Rotation avec morphing
  morphSpin: {
    animate: {
      rotate: 360,
      borderRadius: ["20%", "50%", "20%"],
      scale: [1, 1.1, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  },

  // Onde de propagation
  ripple: {
    animate: {
      scale: [1, 2.5],
      opacity: [1, 0],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: "easeOut"
      }
    }
  }
};

// 🎪 ANIMATIONS DE MODALS SPECTACULAIRES
export const modalAnimations = {
  // Apparition en spirale
  spiral: {
    hidden: { 
      opacity: 0, 
      scale: 0.3,
      rotate: -180,
      y: 100
    },
    visible: { 
      opacity: 1, 
      scale: 1,
      rotate: 0,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 20
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.3,
      rotate: 180,
      y: -100,
      transition: {
        duration: 0.3
      }
    }
  },

  // Effet de déploiement
  unfold: {
    hidden: { 
      opacity: 0, 
      scaleY: 0,
      scaleX: 0.8
    },
    visible: { 
      opacity: 1, 
      scaleY: 1,
      scaleX: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 25
      }
    }
  },

  // Glissement élastique
  elasticSlide: {
    hidden: { 
      x: "100%",
      opacity: 0
    },
    visible: { 
      x: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  }
};

// 🌟 ANIMATIONS DE TEXTE DYNAMIQUES
export const textAnimations = {
  // Apparition lettre par lettre
  typewriter: {
    hidden: { 
      opacity: 0,
      y: 20
    },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.05,
        type: "spring",
        stiffness: 100
      }
    })
  },

  // Effet de brillance
  shimmerText: {
    animate: {
      backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "linear"
      }
    }
  },

  // Rebond élastique
  bounce: {
    animate: {
      y: [0, -10, 0],
      transition: {
        duration: 0.6,
        repeat: Infinity,
        repeatType: "reverse",
        ease: "easeInOut"
      }
    }
  }
};

// 🎨 VARIANTES POUR LISTES ET GRILLES
export const listAnimations = {
  container: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1
      }
    }
  },
  
  item: {
    hidden: { 
      opacity: 0, 
      y: 30,
      scale: 0.9
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12
      }
    }
  }
};

// 🌈 ANIMATIONS DE BACKGROUND
export const backgroundAnimations = {
  // Gradient animé
  gradientShift: {
    animate: {
      background: [
        "linear-gradient(45deg, #667eea 0%, #764ba2 100%)",
        "linear-gradient(45deg, #f093fb 0%, #f5576c 100%)",
        "linear-gradient(45deg, #4facfe 0%, #00f2fe 100%)",
        "linear-gradient(45deg, #667eea 0%, #764ba2 100%)"
      ],
      transition: {
        duration: 8,
        repeat: Infinity,
        ease: "linear"
      }
    }
  },

  // Particules flottantes
  floatingParticles: {
    animate: {
      y: [0, -20, 0],
      x: [0, 10, 0],
      rotate: [0, 180, 360],
      transition: {
        duration: 6,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  }
};