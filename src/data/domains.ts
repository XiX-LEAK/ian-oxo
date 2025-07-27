import type { Domain, Enterprise } from '@/types';

// Données fictives pour démonstration éducative
export const sampleEnterprises: Enterprise[] = [
  {
    id: 'tech-1',
    nom: 'InnovaTech Solutions',
    description: 'Agence digitale spécialisée dans la transformation numérique des entreprises B2B.',
    contacts: [
      { type: 'email', value: 'contact@innovatech-pro.com', verified: true },
      { type: 'whatsapp', value: '+33 6 12 34 56 78', verified: true },
      { type: 'linkedin', value: 'innovatech-solutions', verified: true },
      { type: 'telegram', value: '@innovatech_support', verified: true }
    ],
    specialites: ['Développement Web', 'Applications Mobile', 'Consulting Digital', 'E-commerce'],
    evaluation: 4.8,
    secteurs: ['B2B', 'SaaS', 'Consulting', 'Digital'],
    verifie: true,
    dateAjout: new Date('2024-01-15'),
    commentaireAdmin: 'Partenaire certifié. Expertise React/Node.js. Portfolio client impressionnant. Délais respectés.',
    image: '/images/tech-corp.jpg'
  },
  {
    id: 'tech-2',
    nom: 'DataMind Analytics',
    description: 'Cabinet de conseil en intelligence artificielle et science des données pour entreprises.',
    contacts: [
      { type: 'email', value: 'hello@datamind-analytics.com', verified: true },
      { type: 'whatsapp', value: '+33 7 23 45 67 89', verified: true },
      { type: 'linkedin', value: 'datamind-analytics', verified: true },
      { type: 'discord', value: 'DataMind#1234', verified: false }
    ],
    specialites: ['Intelligence Artificielle', 'Data Science', 'Machine Learning', 'Business Intelligence'],
    evaluation: 4.6,
    secteurs: ['Consulting', 'IA', 'Analytics', 'B2B'],
    verifie: true,
    dateAjout: new Date('2024-02-20'),
    commentaireAdmin: 'Expertise reconnue en IA. Projets Fortune 500. Équipe PhD niveau international.',
    image: '/images/innovate-ai.jpg'
  }
];

export const mockDomains: Domain[] = [
  {
    id: 'technologie',
    titre: 'Technologie & Innovation',
    description: 'Entreprises fictives spécialisées dans la technologie, l\'innovation et le développement logiciel pour démonstration éducative.',
    image: '/images/tech-domain.jpg',
    entreprises: sampleEnterprises.filter(e => e.secteurs.includes('Tech') || e.secteurs.includes('SaaS')),
    dateCreation: new Date('2024-01-01'),
    actif: true,
    popularite: 95,
    tags: ['tech', 'innovation', 'software', 'ai', 'web-dev']
  },
  {
    id: 'sport',
    titre: 'Sport & Fitness',
    description: 'Collection d\'entreprises fictives du secteur sportif pour démonstration de base de données.',
    image: '/images/sport-domain.jpg',
    entreprises: [
      {
        id: 'sport-1',
        nom: 'ActivePro Équipements',
        description: 'Distributeur professionnel d\'équipements sportifs pour clubs et entreprises.',
        contacts: [
          { type: 'whatsapp', value: '+33 6 34 56 78 90', verified: true },
          { type: 'email', value: 'commercial@activepro-equipements.fr', verified: true },
          { type: 'linkedin', value: 'activepro-equipements', verified: true },
          { type: 'telegram', value: '@activepro_support', verified: false }
        ],
        specialites: ['Équipements Professionnels', 'Vêtements Techniques', 'Matériel Club'],
        evaluation: 4.7,
        secteurs: ['B2B', 'Sport', 'Distribution'],
        verifie: true,
        dateAjout: new Date('2024-01-20'),
        commentaireAdmin: 'Partenaire officiel grandes marques. Livraison rapide. Service client exemplaire.',
        image: '/images/sport-gear.jpg'
      }
    ],
    dateCreation: new Date('2024-01-05'),
    actif: true,
    popularite: 87,
    tags: ['sport', 'fitness', 'equipment', 'retail']
  },
  {
    id: 'mode',
    titre: 'Mode & Lifestyle',
    description: 'Brands de mode fictives et entreprises lifestyle pour présentation de portfolio créatif.',
    image: '/images/fashion-domain.jpg',
    entreprises: [
      {
        id: 'fashion-1',
        nom: 'ElegancePro Corporate',
        description: 'Créateur de vêtements professionnels sur-mesure pour entreprises et événements.',
        contacts: [
          { type: 'email', value: 'contact@elegancepro-corporate.com', verified: true },
          { type: 'whatsapp', value: '+33 7 45 67 89 01', verified: true },
          { type: 'linkedin', value: 'elegancepro-corporate', verified: true }
        ],
        specialites: ['Uniformes Entreprise', 'Vêtements Sur-mesure', 'Events Corporate'],
        evaluation: 4.5,
        secteurs: ['B2B', 'Fashion', 'Corporate'],
        verifie: true,
        dateAjout: new Date('2024-02-10'),
        commentaireAdmin: 'Expertise haute couture corporate. Clients grands groupes. Délais courts.',
        image: '/images/style-corp.jpg'
      }
    ],
    dateCreation: new Date('2024-01-10'),
    actif: true,
    popularite: 82,
    tags: ['fashion', 'style', 'lifestyle', 'retail']
  },
  {
    id: 'education',
    titre: 'Éducation & Formation',
    description: 'Organismes de formation fictifs et plateformes éducatives pour démonstration EdTech.',
    image: '/images/education-domain.jpg',
    entreprises: [
      {
        id: 'edu-1',
        nom: 'LearnTech Academy',
        description: 'Plateforme de formation en ligne fictive spécialisée dans les technologies web.',
        contacts: [
          { type: 'email', value: 'info@learntech-demo.edu', verified: true },
          { type: 'whatsapp', value: '+33 6 56 78 90 12', verified: true },
          { type: 'discord', value: 'LearnTech#5678', verified: true }
        ],
        specialites: ['Formation Web', 'Coding Bootcamp', 'Certifications'],
        evaluation: 4.9,
        secteurs: ['Education', 'Tech', 'Online Learning'],
        verifie: true,
        dateAjout: new Date('2024-01-25'),
        commentaireAdmin: 'Excellente plateforme éducative. Cursus complets en développement web moderne.',
        image: '/images/learn-tech.jpg'
      }
    ],
    dateCreation: new Date('2024-01-08'),
    actif: true,
    popularite: 91,
    tags: ['education', 'formation', 'elearning', 'tech-education']
  },
  {
    id: 'marketing',
    titre: 'Marketing & Communication',
    description: 'Agences marketing, communication digitale et experts en stratégie de marque.',
    image: '/images/marketing-domain.jpg',
    entreprises: [
      {
        id: 'marketing-1',
        nom: 'DigitalBoost Agency',
        description: 'Agence marketing digital spécialisée dans la croissance B2B et lead generation.',
        contacts: [
          { type: 'email', value: 'contact@digitalboost-agency.com', verified: true },
          { type: 'whatsapp', value: '+33 6 78 90 12 34', verified: true },
          { type: 'linkedin', value: 'digitalboost-agency', verified: true },
          { type: 'telegram', value: '@digitalboost_team', verified: true }
        ],
        specialites: ['SEO/SEA', 'Social Media', 'Content Marketing', 'Lead Generation'],
        evaluation: 4.9,
        secteurs: ['Marketing', 'Digital', 'B2B'],
        verifie: true,
        dateAjout: new Date('2024-01-30'),
        commentaireAdmin: 'ROI exceptionnel. Campagnes créatives. Reporting détaillé. Équipe réactive.',
        image: '/images/digital-boost.jpg'
      }
    ],
    dateCreation: new Date('2024-01-12'),
    actif: true,
    popularite: 88,
    tags: ['marketing', 'digital', 'seo', 'social-media']
  },
  {
    id: 'consulting',
    titre: 'Conseil & Stratégie',
    description: 'Cabinets de conseil en management, stratégie d\'entreprise et transformation.',
    image: '/images/consulting-domain.jpg',
    entreprises: [
      {
        id: 'consulting-1',
        nom: 'StrategyMasters Consulting',
        description: 'Cabinet de conseil en stratégie et transformation digitale pour grandes entreprises.',
        contacts: [
          { type: 'email', value: 'partners@strategymasters.com', verified: true },
          { type: 'whatsapp', value: '+33 6 89 01 23 45', verified: true },
          { type: 'linkedin', value: 'strategymasters-consulting', verified: true }
        ],
        specialites: ['Stratégie d\'entreprise', 'Transformation Digitale', 'Change Management'],
        evaluation: 4.8,
        secteurs: ['Consulting', 'Strategy', 'Management'],
        verifie: true,
        dateAjout: new Date('2024-02-05'),
        commentaireAdmin: 'Consultants senior expérimentés. Méthodologie éprouvée. Résultats mesurables.',
        image: '/images/strategy-masters.jpg'
      }
    ],
    dateCreation: new Date('2024-01-15'),
    actif: true,
    popularite: 85,
    tags: ['consulting', 'strategy', 'management', 'transformation']
  },
  {
    id: 'finance',
    titre: 'Finance & Comptabilité',
    description: 'Experts-comptables, conseillers financiers et solutions de gestion financière.',
    image: '/images/finance-domain.jpg',
    entreprises: [
      {
        id: 'finance-1',
        nom: 'FinanceExpert Partners',
        description: 'Cabinet d\'expertise comptable et conseil financier pour PME et startups.',
        contacts: [
          { type: 'email', value: 'contact@financeexpert-partners.fr', verified: true },
          { type: 'whatsapp', value: '+33 6 90 12 34 56', verified: true },
          { type: 'linkedin', value: 'financeexpert-partners', verified: true }
        ],
        specialites: ['Expertise Comptable', 'Conseil Fiscal', 'Gestion Financière', 'Audit'],
        evaluation: 4.7,
        secteurs: ['Finance', 'Comptabilité', 'Conseil'],
        verifie: true,
        dateAjout: new Date('2024-02-15'),
        commentaireAdmin: 'Expertise reconnue. Accompagnement personnalisé. Digitalisation avancée.',
        image: '/images/finance-expert.jpg'
      }
    ],
    dateCreation: new Date('2024-01-18'),
    actif: true,
    popularite: 83,
    tags: ['finance', 'comptabilite', 'audit', 'conseil-fiscal']
  }
];

export const getAllEnterprises = (): Enterprise[] => {
  return mockDomains.flatMap(domain => domain.entreprises);
};

export const getEnterprisesByDomain = (domainId: string): Enterprise[] => {
  const domain = mockDomains.find(d => d.id === domainId);
  return domain ? domain.entreprises : [];
};

export const searchEnterprises = (query: string): Enterprise[] => {
  const allEnterprises = getAllEnterprises();
  const searchTerm = query.toLowerCase();
  
  return allEnterprises.filter(enterprise => 
    enterprise.nom.toLowerCase().includes(searchTerm) ||
    enterprise.description.toLowerCase().includes(searchTerm) ||
    enterprise.specialites.some(spec => spec.toLowerCase().includes(searchTerm)) ||
    enterprise.secteurs.some(secteur => secteur.toLowerCase().includes(searchTerm))
  );
};