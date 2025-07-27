import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

interface ParticleBackgroundProps {
  particleCount?: number;
  color?: string;
  size?: number;
  speed?: number;
  opacity?: number;
}

export const ParticleBackground: React.FC<ParticleBackgroundProps> = ({
  particleCount = 50,
  color = '#f97316',
  size = 2,
  speed = 2,
  opacity = 0.6
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const particles: HTMLDivElement[] = [];

    // Créer les particules
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.className = 'absolute rounded-full pointer-events-none';
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      particle.style.backgroundColor = color;
      particle.style.opacity = opacity.toString();
      
      // Position initiale aléatoire
      particle.style.left = Math.random() * 100 + '%';
      particle.style.top = Math.random() * 100 + '%';
      
      container.appendChild(particle);
      particles.push(particle);
    }

    particlesRef.current = particles;

    // Animer les particules
    particles.forEach((particle, index) => {
      const animateParticle = () => {
        gsap.to(particle, {
          x: `random(-200, 200)`,
          y: `random(-200, 200)`,
          rotation: `random(0, 360)`,
          duration: `random(${speed}, ${speed * 2})`,
          ease: "sine.inOut",
          onComplete: animateParticle
        });
      };

      // Délai initial pour créer un effet organique
      gsap.delayedCall(index * 0.1, animateParticle);

      // Animation de pulsation
      gsap.to(particle, {
        scale: "random(0.5, 1.5)",
        duration: "random(2, 4)",
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: index * 0.05
      });

      // Animation d'opacité
      gsap.to(particle, {
        opacity: `random(${opacity * 0.3}, ${opacity})`,
        duration: "random(1, 3)",
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: index * 0.1
      });
    });

    // Cleanup
    return () => {
      particles.forEach(particle => {
        gsap.killTweensOf(particle);
        if (particle.parentNode) {
          particle.parentNode.removeChild(particle);
        }
      });
    };
  }, [particleCount, color, size, speed, opacity]);

  return (
    <div 
      ref={containerRef}
      className="absolute inset-0 overflow-hidden pointer-events-none"
      style={{ zIndex: 1 }}
    />
  );
};

// Composant spécialisé pour les particules interactives
export const InteractiveParticles: React.FC<{
  particleCount?: number;
}> = ({ particleCount = 30 }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const particles: HTMLDivElement[] = [];

    // Créer les particules interactives
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.className = 'absolute w-1 h-1 bg-primary-500 rounded-full cursor-pointer transition-all duration-300 hover:scale-150 hover:bg-primary-400';
      
      particle.style.left = Math.random() * 100 + '%';
      particle.style.top = Math.random() * 100 + '%';
      particle.style.opacity = '0.7';
      
      // Événements de survol
      particle.addEventListener('mouseenter', () => {
        gsap.to(particle, {
          scale: 3,
          boxShadow: "0 0 20px rgba(249, 115, 22, 0.8)",
          duration: 0.3,
          ease: "back.out(1.7)"
        });
      });

      particle.addEventListener('mouseleave', () => {
        gsap.to(particle, {
          scale: 1,
          boxShadow: "none",
          duration: 0.3,
          ease: "power2.out"
        });
      });

      container.appendChild(particle);
      particles.push(particle);
    }

    // Animation continue
    particles.forEach((particle, index) => {
      gsap.to(particle, {
        x: "random(-100, 100)",
        y: "random(-100, 100)",
        duration: "random(4, 8)",
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: index * 0.2
      });
    });

    return () => {
      particles.forEach(particle => {
        gsap.killTweensOf(particle);
        if (particle.parentNode) {
          particle.parentNode.removeChild(particle);
        }
      });
    };
  }, [particleCount]);

  return (
    <div 
      ref={containerRef}
      className="absolute inset-0 overflow-hidden"
      style={{ zIndex: 2 }}
    />
  );
};

// Particules spéciales pour le mode admin
export const AdminParticles: React.FC = () => {
  return (
    <ParticleBackground
      particleCount={20}
      color="#3b82f6"
      size={3}
      speed={1.5}
      opacity={0.4}
    />
  );
};

// Particules de célébration pour les succès
export const CelebrationParticles: React.FC<{
  trigger: boolean;
  onComplete?: () => void;
}> = ({ trigger, onComplete }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!trigger || !containerRef.current) return;

    const container = containerRef.current;
    const colors = ['#f97316', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];
    const particles: HTMLDivElement[] = [];

    // Créer des particules de célébration
    for (let i = 0; i < 30; i++) {
      const particle = document.createElement('div');
      particle.className = 'absolute rounded-full pointer-events-none';
      particle.style.width = '6px';
      particle.style.height = '6px';
      particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      particle.style.left = '50%';
      particle.style.top = '50%';
      
      container.appendChild(particle);
      particles.push(particle);
    }

    // Animation d'explosion
    particles.forEach((particle, index) => {
      const angle = (index / particles.length) * Math.PI * 2;
      const distance = Math.random() * 200 + 100;
      const x = Math.cos(angle) * distance;
      const y = Math.sin(angle) * distance;

      gsap.to(particle, {
        x: x,
        y: y,
        scale: "random(0.5, 2)",
        rotation: "random(0, 360)",
        opacity: 0,
        duration: 1.5,
        ease: "power2.out",
        delay: index * 0.01,
        onComplete: index === particles.length - 1 ? onComplete : undefined
      });
    });

    // Cleanup après l'animation
    const cleanup = setTimeout(() => {
      particles.forEach(particle => {
        if (particle.parentNode) {
          particle.parentNode.removeChild(particle);
        }
      });
    }, 2000);

    return () => {
      clearTimeout(cleanup);
      particles.forEach(particle => {
        gsap.killTweensOf(particle);
        if (particle.parentNode) {
          particle.parentNode.removeChild(particle);
        }
      });
    };
  }, [trigger, onComplete]);

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 9999 }}
    />
  );
};