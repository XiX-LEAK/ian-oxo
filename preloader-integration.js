/**
 * Preloader Pulsor Style - Module d'intégration
 * À intégrer dans n'importe quel site web
 * 
 * Usage:
 * 1. Inclure ce fichier dans votre HTML
 * 2. Appeler PulsorPreloader.init() ou laisser l'auto-initialisation
 * 3. Personnaliser les options si nécessaire
 */

const PulsorPreloader = {
    // Configuration par défaut
    config: {
        minDisplayTime: 1500,
        logoText: 'OXO',
        progressMessages: [
            'INITIALIZING SYSTEMS',
            'LOADING PROTOCOLS', 
            'ESTABLISHING CONNECTION',
            'VERIFYING SECURITY',
            'SYSTEM READY'
        ],
        colors: {
            primary: '#000000',
            secondary: '#1a1a1a',
            text: '#ffffff',
            accent: '#ffffff'
        }
    },

    // État interne
    state: {
        isInitialized: false,
        isPageLoaded: false,
        startTime: null,
        preloaderElement: null,
        intervals: []
    },

    /**
     * Initialisation du preloader
     */
    init(customConfig = {}) {
        if (this.state.isInitialized) return;
        
        // Fusionner la configuration
        this.config = { ...this.config, ...customConfig };
        this.state.startTime = Date.now();
        this.state.isInitialized = true;

        // Créer et injecter le preloader
        this.createPreloader();
        this.setupEventListeners();
        this.startAnimations();
        
        console.log('🎬 Preloader Pulsor initialisé');
    },

    /**
     * Crée la structure HTML du preloader
     */
    createPreloader() {
        const preloaderHTML = `
            <div id="pulsor-preloader" class="pulsor-preloader-overlay">
                <!-- Background -->
                <div class="pulsor-bg-fade"></div>
                <div class="pulsor-grid-pattern"></div>
                
                <!-- Frame -->
                <div class="pulsor-frame">
                    <div class="pulsor-border pulsor-border-top"></div>
                    <div class="pulsor-border pulsor-border-bottom"></div>
                    <div class="pulsor-border pulsor-border-left"></div>
                    <div class="pulsor-border pulsor-border-right"></div>
                </div>
                
                <!-- Data columns -->
                <div class="pulsor-data-columns">
                    <div class="pulsor-column pulsor-column-1" id="pulsor-col-1"></div>
                    <div class="pulsor-column pulsor-column-2" id="pulsor-col-2"></div>
                    <div class="pulsor-column pulsor-column-3" id="pulsor-col-3"></div>
                </div>
                
                <!-- Main content -->
                <div class="pulsor-content">
                    <div class="pulsor-logo-container">
                        <div class="pulsor-logo-wrapper">
                            <div class="pulsor-logo-mask"></div>
                            <h1 class="pulsor-logo-text">${this.config.logoText}</h1>
                        </div>
                    </div>
                </div>
                
                <!-- Progress -->
                <div class="pulsor-progress">
                    <div class="pulsor-progress-bar">
                        <div class="pulsor-progress-fill"></div>
                    </div>
                    <div class="pulsor-progress-text" id="pulsor-progress-text">
                        ${this.config.progressMessages[0]}
                    </div>
                </div>
                
                <!-- Decorative dots -->
                <div class="pulsor-decorative">
                    <div class="pulsor-dot"></div>
                    <div class="pulsor-dot"></div>
                    <div class="pulsor-dot"></div>
                </div>
            </div>
        `;

        // Injecter le CSS
        this.injectCSS();
        
        // Injecter le HTML
        document.body.insertAdjacentHTML('afterbegin', preloaderHTML);
        this.state.preloaderElement = document.getElementById('pulsor-preloader');
    },

    /**
     * Injecte les styles CSS nécessaires
     */
    injectCSS() {
        const css = `
            .pulsor-preloader-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                background: ${this.config.colors.primary};
                z-index: 999999;
                overflow: hidden;
                opacity: 1;
                visibility: visible;
                transition: transform 1s cubic-bezier(0.87, 0, 0.13, 1),
                           opacity 0.6s cubic-bezier(0.87, 0, 0.13, 1);
            }
            
            .pulsor-preloader-overlay.pulsor-fade-out {
                opacity: 0;
                transform: translateY(-100vh);
            }
            
            .pulsor-preloader-overlay.pulsor-hidden {
                visibility: hidden;
                pointer-events: none;
            }
            
            .pulsor-bg-fade {
                position: absolute;
                inset: 0;
                background: ${this.config.colors.secondary};
                opacity: 1;
                animation: pulsorBgFade 0.8s cubic-bezier(0.87, 0, 0.13, 1) forwards;
            }
            
            @keyframes pulsorBgFade {
                to { opacity: 0; }
            }
            
            .pulsor-grid-pattern {
                position: absolute;
                inset: 0;
                background-image: url("data:image/svg+xml,%3csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3e%3cdefs%3e%3cpattern id='grid' width='1' height='1' patternUnits='userSpaceOnUse' patternTransform='scale(40)'%3e%3cpath d='M 1 0 L 1 1 M 0 1 L 1 1' stroke='%23ffffff' stroke-width='0.5' stroke-dasharray='2,2' opacity='0.08'/%3e%3c/pattern%3e%3c/defs%3e%3crect width='100%25' height='100%25' fill='url(%23grid)' /%3e%3c/svg%3e");
                opacity: 0;
                transform: scale(1.5);
                animation: pulsorGridScale 1.2s cubic-bezier(0.87, 0, 0.13, 1) 0.2s forwards;
            }
            
            @keyframes pulsorGridScale {
                to {
                    opacity: 0.08;
                    transform: scale(1);
                }
            }
            
            .pulsor-frame {
                position: absolute;
                inset: 0;
                transform: scale(2);
                animation: pulsorFrameScale 1.2s cubic-bezier(0.87, 0, 0.13, 1) 0.4s forwards;
            }
            
            @keyframes pulsorFrameScale {
                to { transform: scale(1); }
            }
            
            .pulsor-border {
                position: absolute;
                background: rgba(255, 255, 255, 0.12);
            }
            
            .pulsor-border-top { top: 0; left: 0; right: 0; height: 1px; }
            .pulsor-border-bottom { bottom: 0; left: 0; right: 0; height: 1px; }
            .pulsor-border-left { top: 0; bottom: 0; left: 0; width: 1px; }
            .pulsor-border-right { top: 0; bottom: 0; right: 0; width: 1px; }
            
            .pulsor-data-columns {
                position: absolute;
                inset: 0;
                pointer-events: none;
                user-select: none;
            }
            
            .pulsor-column {
                position: absolute;
                top: 0;
                height: 100%;
                color: rgba(255, 255, 255, 0.12);
                font-family: 'Courier New', monospace;
                font-size: 11px;
                font-weight: 400;
                line-height: 1.6;
                white-space: pre;
                overflow: hidden;
                transform: translateY(0);
            }
            
            .pulsor-column-1 {
                left: 12%;
                animation: pulsorCol1Move 1.8s cubic-bezier(0.87, 0, 0.13, 1) 1.4s forwards;
            }
            
            .pulsor-column-2 {
                left: 28%;
                animation: pulsorCol2Move 1.8s cubic-bezier(0.87, 0, 0.13, 1) 1.6s forwards;
            }
            
            .pulsor-column-3 {
                left: 72%;
                animation: pulsorCol3Move 1.8s cubic-bezier(0.87, 0, 0.13, 1) 1.8s forwards;
            }
            
            @keyframes pulsorCol1Move { to { transform: translateY(-15%); } }
            @keyframes pulsorCol2Move { to { transform: translateY(-45%); } }
            @keyframes pulsorCol3Move { to { transform: translateY(-35%); } }
            
            .pulsor-content {
                position: absolute;
                inset: 0;
                display: flex;
                align-items: center;
                justify-content: center;
                transform: translateY(0);
                transition: transform 0.8s cubic-bezier(0.87, 0, 0.13, 1);
            }
            
            .pulsor-preloader-overlay.pulsor-fade-out .pulsor-content {
                transform: translateY(60vh);
            }
            
            .pulsor-logo-container {
                position: relative;
                text-align: center;
                opacity: 0;
                transform: translateY(25vw);
                animation: pulsorLogoReveal 1.2s cubic-bezier(0.87, 0, 0.13, 1) 0.8s forwards;
            }
            
            @keyframes pulsorLogoReveal {
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            .pulsor-logo-wrapper {
                position: relative;
                display: inline-block;
                overflow: hidden;
            }
            
            .pulsor-logo-mask {
                position: absolute;
                inset: 0;
                background: ${this.config.colors.primary};
                z-index: 10;
                transform: translateX(0);
                animation: pulsorLogoMask 1.2s cubic-bezier(0.87, 0, 0.13, 1) 2.2s forwards;
            }
            
            @keyframes pulsorLogoMask {
                to { transform: translateX(100%); }
            }
            
            .pulsor-logo-text {
                font-size: clamp(4rem, 12vw, 8rem);
                font-weight: 900;
                color: ${this.config.colors.text};
                line-height: 0.85;
                letter-spacing: 0.02em;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                margin: 0;
                position: relative;
                z-index: 1;
            }
            
            .pulsor-progress {
                position: absolute;
                bottom: 8vh;
                left: 50%;
                transform: translateX(-50%);
                text-align: center;
            }
            
            .pulsor-progress-bar {
                width: 200px;
                height: 1px;
                background: rgba(255, 255, 255, 0.1);
                margin: 16px auto 8px;
                overflow: hidden;
                border-radius: 1px;
            }
            
            .pulsor-progress-fill {
                height: 100%;
                width: 0;
                background: linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.6) 50%, transparent 100%);
                animation: pulsorProgressFill 2.8s ease-out forwards;
            }
            
            @keyframes pulsorProgressFill {
                to { width: 100%; }
            }
            
            .pulsor-progress-text {
                color: rgba(255, 255, 255, 0.4);
                font-family: 'Courier New', monospace;
                font-size: 9px;
                font-weight: 500;
                letter-spacing: 0.2em;
                text-transform: uppercase;
                opacity: 0;
                animation: pulsorTextFade 0.6s ease-out 1.2s forwards,
                          pulsorTextPulse 2.5s ease-in-out 2s infinite;
            }
            
            @keyframes pulsorTextFade { to { opacity: 1; } }
            @keyframes pulsorTextPulse {
                0%, 100% { opacity: 0.4; }
                50% { opacity: 0.8; }
            }
            
            .pulsor-decorative {
                position: absolute;
                inset: 0;
                pointer-events: none;
            }
            
            .pulsor-dot {
                position: absolute;
                width: 2px;
                height: 2px;
                background: rgba(255, 255, 255, 0.3);
                border-radius: 50%;
                opacity: 0;
                animation: pulsorDotFloat 4s ease-in-out infinite;
            }
            
            .pulsor-dot:nth-child(1) {
                top: 20%;
                left: 15%;
                animation-delay: 0s;
            }
            
            .pulsor-dot:nth-child(2) {
                top: 70%;
                right: 20%;
                animation-delay: 1.5s;
            }
            
            .pulsor-dot:nth-child(3) {
                bottom: 30%;
                left: 80%;
                animation-delay: 3s;
            }
            
            @keyframes pulsorDotFloat {
                0%, 100% {
                    opacity: 0;
                    transform: translateY(0) scale(1);
                }
                50% {
                    opacity: 1;
                    transform: translateY(-20px) scale(1.2);
                }
            }
            
            /* Responsive */
            @media (max-width: 768px) {
                .pulsor-grid-pattern {
                    background-image: url("data:image/svg+xml,%3csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3e%3cdefs%3e%3cpattern id='grid-mobile' width='1' height='1' patternUnits='userSpaceOnUse' patternTransform='scale(20)'%3e%3cpath d='M 1 0 L 1 1 M 0 1 L 1 1' stroke='%23ffffff' stroke-width='0.5' stroke-dasharray='1,1' opacity='0.06'/%3e%3c/pattern%3e%3c/defs%3e%3crect width='100%25' height='100%25' fill='url(%23grid-mobile)' /%3e%3c/svg%3e");
                }
                
                .pulsor-column { font-size: 9px; }
                .pulsor-progress-text { font-size: 8px; }
                .pulsor-progress-bar { width: 160px; }
            }
            
            /* Performance */
            .pulsor-preloader-overlay * {
                will-change: transform, opacity;
                backface-visibility: hidden;
            }
        `;

        const style = document.createElement('style');
        style.textContent = css;
        document.head.appendChild(style);
    },

    /**
     * Configure les écouteurs d'événements
     */
    setupEventListeners() {
        // Chargement de la page
        const handleLoad = () => {
            this.state.isPageLoaded = true;
            this.checkReadyToHide();
        };

        if (document.readyState === 'complete') {
            handleLoad();
        } else {
            window.addEventListener('load', handleLoad);
            
            // Fallback
            document.addEventListener('DOMContentLoaded', () => {
                setTimeout(() => {
                    if (!this.state.isPageLoaded) {
                        handleLoad();
                    }
                }, 500);
            });
        }

        // Timeout de sécurité
        setTimeout(() => {
            if (!this.state.isPageLoaded) {
                console.warn('Preloader: Timeout de sécurité atteint');
                handleLoad();
            }
        }, 5000);
    },

    /**
     * Démarre les animations
     */
    startAnimations() {
        // Générer les colonnes de données
        this.generateDataColumns();
        
        // Animer le texte de progression
        this.animateProgressText();
    },

    /**
     * Génère les colonnes de données
     */
    generateDataColumns() {
        const columns = ['pulsor-col-1', 'pulsor-col-2', 'pulsor-col-3'];
        const patterns = [
            () => Math.random() < 0.3 ? Math.floor(Math.random() * 10) : ' ',
            () => Math.random() < 0.4 ? String.fromCharCode(65 + Math.floor(Math.random() * 26)) : ' ',
            () => Math.random() < 0.25 ? Math.floor(Math.random() * 16).toString(16).toUpperCase() : ' '
        ];

        columns.forEach((columnId, index) => {
            const column = document.getElementById(columnId);
            if (column) {
                const pattern = patterns[index];
                const data = Array.from({ length: 60 }, pattern).join('\n');
                column.textContent = data;
            }
        });
    },

    /**
     * Anime le texte de progression
     */
    animateProgressText() {
        const progressText = document.getElementById('pulsor-progress-text');
        if (!progressText) return;

        let messageIndex = 0;
        const interval = setInterval(() => {
            if (messageIndex < this.config.progressMessages.length) {
                progressText.textContent = this.config.progressMessages[messageIndex];
                messageIndex++;
            } else {
                clearInterval(interval);
            }
        }, 600);

        this.state.intervals.push(interval);
    },

    /**
     * Vérifie si on peut masquer le preloader
     */
    checkReadyToHide() {
        const elapsedTime = Date.now() - this.state.startTime;
        const remainingTime = Math.max(0, this.config.minDisplayTime - elapsedTime);

        if (this.state.isPageLoaded && elapsedTime >= this.config.minDisplayTime) {
            this.hide();
        } else if (this.state.isPageLoaded) {
            setTimeout(() => this.hide(), remainingTime);
        }
    },

    /**
     * Masque le preloader
     */
    hide() {
        // Nettoyer les intervals
        this.state.intervals.forEach(interval => clearInterval(interval));
        this.state.intervals = [];

        // Message final
        const progressText = document.getElementById('pulsor-progress-text');
        if (progressText) {
            progressText.textContent = 'COMPLETE';
        }

        // Animation de sortie
        setTimeout(() => {
            if (this.state.preloaderElement) {
                this.state.preloaderElement.classList.add('pulsor-fade-out');
                
                setTimeout(() => {
                    this.state.preloaderElement.classList.add('pulsor-hidden');
                    
                    // Retirer du DOM
                    setTimeout(() => {
                        if (this.state.preloaderElement && this.state.preloaderElement.parentNode) {
                            this.state.preloaderElement.parentNode.removeChild(this.state.preloaderElement);
                        }
                        console.log('✅ Preloader Pulsor terminé');
                    }, 500);
                }, 1000);
            }
        }, 200);
    }
};

// Auto-initialisation si le DOM est prêt
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        PulsorPreloader.init();
    });
} else {
    PulsorPreloader.init();
}

// Export pour usage externe
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PulsorPreloader;
} else if (typeof window !== 'undefined') {
    window.PulsorPreloader = PulsorPreloader;
}