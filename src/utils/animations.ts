import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Enregistrer les plugins GSAP
gsap.registerPlugin(ScrollTrigger);

// Configuration par défaut des animations
export const animationConfig = {
  duration: 0.8,
  ease: "power2.out",
  stagger: 0.1
};

// Animations d'entrée pour les éléments
export const fadeInUp = (element: string | Element, delay = 0) => {
  return gsap.fromTo(element, 
    { 
      opacity: 0, 
      y: 50,
      scale: 0.95
    },
    { 
      opacity: 1, 
      y: 0,
      scale: 1,
      duration: animationConfig.duration,
      ease: animationConfig.ease,
      delay
    }
  );
};

export const fadeInLeft = (element: string | Element, delay = 0) => {
  return gsap.fromTo(element,
    {
      opacity: 0,
      x: -50
    },
    {
      opacity: 1,
      x: 0,
      duration: animationConfig.duration,
      ease: animationConfig.ease,
      delay
    }
  );
};

export const fadeInRight = (element: string | Element, delay = 0) => {
  return gsap.fromTo(element,
    {
      opacity: 0,
      x: 50
    },
    {
      opacity: 1,
      x: 0,
      duration: animationConfig.duration,
      ease: animationConfig.ease,
      delay
    }
  );
};

// Animation de scale avec bounce
export const scaleIn = (element: string | Element, delay = 0) => {
  return gsap.fromTo(element,
    {
      opacity: 0,
      scale: 0.8
    },
    {
      opacity: 1,
      scale: 1,
      duration: animationConfig.duration,
      ease: "back.out(1.7)",
      delay
    }
  );
};

// Animation de rotation
export const rotateIn = (element: string | Element, delay = 0) => {
  return gsap.fromTo(element,
    {
      opacity: 0,
      rotation: -10,
      scale: 0.9
    },
    {
      opacity: 1,
      rotation: 0,
      scale: 1,
      duration: animationConfig.duration,
      ease: animationConfig.ease,
      delay
    }
  );
};

// Animation stagger pour les listes
export const staggerIn = (elements: string | Element[], baseDelay = 0) => {
  return gsap.fromTo(elements,
    {
      opacity: 0,
      y: 30,
      scale: 0.9
    },
    {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: animationConfig.duration,
      ease: animationConfig.ease,
      stagger: animationConfig.stagger,
      delay: baseDelay
    }
  );
};

// Animation de texte typewriter
export const typewriterAnimation = (element: string | Element, text: string) => {
  const tl = gsap.timeline();
  
  // Préparer l'élément
  gsap.set(element, { text: "" });
  
  // Animation du texte
  tl.to(element, {
    duration: text.length * 0.05,
    text: text,
    ease: "none"
  });
  
  return tl;
};

// Animation parallax pour les éléments de fond
export const parallaxScroll = (element: string | Element, speed = 0.5) => {
  return gsap.to(element, {
    yPercent: -50 * speed,
    ease: "none",
    scrollTrigger: {
      trigger: element,
      start: "top bottom",
      end: "bottom top",
      scrub: true
    }
  });
};

// Animation révélation au scroll
export const revealOnScroll = (element: string | Element, direction = "up") => {
  const directions = {
    up: { y: 50 },
    down: { y: -50 },
    left: { x: -50 },
    right: { x: 50 }
  };
  
  return gsap.fromTo(element,
    {
      opacity: 0,
      ...directions[direction as keyof typeof directions]
    },
    {
      opacity: 1,
      x: 0,
      y: 0,
      duration: animationConfig.duration,
      ease: animationConfig.ease,
      scrollTrigger: {
        trigger: element,
        start: "top 85%",
        end: "bottom 15%",
        toggleActions: "play none none reverse"
      }
    }
  );
};

// Animation de morphing de couleur
export const colorMorph = (element: string | Element, fromColor: string, toColor: string) => {
  return gsap.fromTo(element,
    {
      backgroundColor: fromColor
    },
    {
      backgroundColor: toColor,
      duration: 1,
      ease: "power2.inOut",
      yoyo: true,
      repeat: -1
    }
  );
};

// Animation de particules flottantes
export const floatingParticles = (container: string | Element, particleCount = 20) => {
  const particles: HTMLElement[] = [];
  const containerEl = typeof container === 'string' ? document.querySelector(container) : container;
  
  if (!containerEl) return;
  
  // Créer les particules
  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement('div');
    particle.className = 'absolute w-1 h-1 bg-primary-500 rounded-full opacity-60 pointer-events-none';
    particle.style.left = Math.random() * 100 + '%';
    particle.style.top = Math.random() * 100 + '%';
    containerEl.appendChild(particle);
    particles.push(particle);
  }
  
  // Animer les particules
  particles.forEach((particle, index) => {
    gsap.to(particle, {
      x: "random(-100, 100)",
      y: "random(-100, 100)",
      duration: "random(3, 8)",
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
      delay: index * 0.1
    });
  });
  
  return particles;
};

// Animation de glow pulsant
export const pulseGlow = (element: string | Element) => {
  return gsap.to(element, {
    boxShadow: "0 0 20px rgba(249, 115, 22, 0.8), 0 0 40px rgba(249, 115, 22, 0.6), 0 0 60px rgba(249, 115, 22, 0.4)",
    duration: 2,
    ease: "sine.inOut",
    yoyo: true,
    repeat: -1
  });
};

// Animation de hover magnétique
export const magneticHover = (element: string | Element) => {
  const el = typeof element === 'string' ? document.querySelector(element) : element;
  if (!el) return;
  
  const handleMouseMove = (e: MouseEvent) => {
    const rect = (el as Element).getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const deltaX = (e.clientX - centerX) * 0.1;
    const deltaY = (e.clientY - centerY) * 0.1;
    
    gsap.to(el, {
      x: deltaX,
      y: deltaY,
      duration: 0.3,
      ease: "power2.out"
    });
  };
  
  const handleMouseLeave = () => {
    gsap.to(el, {
      x: 0,
      y: 0,
      duration: 0.5,
      ease: "elastic.out(1, 0.3)"
    });
  };
  
  el.addEventListener('mousemove', handleMouseMove);
  el.addEventListener('mouseleave', handleMouseLeave);
  
  return () => {
    el.removeEventListener('mousemove', handleMouseMove);
    el.removeEventListener('mouseleave', handleMouseLeave);
  };
};

// Timeline complexe pour la page d'accueil
export const heroTimeline = () => {
  const tl = gsap.timeline();
  
  tl.from(".hero-badge", {
    opacity: 0,
    scale: 0.8,
    duration: 0.6,
    ease: "back.out(1.7)"
  })
  .from(".hero-title", {
    opacity: 0,
    y: 50,
    duration: 0.8,
    ease: "power2.out"
  }, "-=0.3")
  .from(".hero-subtitle", {
    opacity: 0,
    y: 30,
    duration: 0.6,
    ease: "power2.out"
  }, "-=0.4")
  .from(".hero-description", {
    opacity: 0,
    y: 20,
    duration: 0.6,
    ease: "power2.out"
  }, "-=0.3")
  .from(".hero-buttons", {
    opacity: 0,
    y: 30,
    duration: 0.6,
    ease: "power2.out"
  }, "-=0.2")
  .from(".hero-features .feature-card", {
    opacity: 0,
    y: 40,
    scale: 0.9,
    duration: 0.6,
    ease: "back.out(1.2)",
    stagger: 0.1
  }, "-=0.3");
  
  return tl;
};

// Utilitaires pour le cleanup
export const killAllAnimations = () => {
  gsap.killTweensOf("*");
  ScrollTrigger.killAll();
};

export const refreshScrollTrigger = () => {
  ScrollTrigger.refresh();
};