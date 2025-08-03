// 🔧 CONFIGURATION GIST - REMPLACEZ L'ID ICI !
import { gistService } from '../services/gistService';

// 🎯 REMPLACEZ PAR VOTRE VRAI ID GIST
const GIST_ID = 'VOTRE_ID_GIST_ICI'; // Ex: 'a1b2c3d4e5f6g7h8i9j0'

// Auto-configuration au démarrage
if (GIST_ID && GIST_ID !== 'VOTRE_ID_GIST_ICI') {
  gistService.configureGist(GIST_ID);
  console.log('✅ Gist auto-configuré:', GIST_ID);
} else {
  console.log('⚠️ Configurez votre GIST_ID dans configGist.ts');
}

export { GIST_ID };