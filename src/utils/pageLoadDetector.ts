// Détecteur de rechargement de page ultra-strict
export class PageLoadDetector {
  private static readonly LOAD_ID_KEY = 'oxo-page-load-id';
  private static currentLoadId: string = '';

  static generateLoadId(): string {
    return Date.now().toString() + '_' + Math.random().toString(36).substring(2, 15);
  }

  static initializePageLoad(): boolean {
    const storedLoadId = sessionStorage.getItem(this.LOAD_ID_KEY);
    this.currentLoadId = this.generateLoadId();
    
    console.log('🔍 Page Load Detection:', {
      stored: storedLoadId,
      current: this.currentLoadId,
      isNewLoad: !storedLoadId
    });

    // Stocker le nouvel ID de chargement
    sessionStorage.setItem(this.LOAD_ID_KEY, this.currentLoadId);

    // Si il y avait déjà un ID stocké, c'est un rechargement
    return storedLoadId !== null;
  }

  static isPageReload(): boolean {
    const storedLoadId = sessionStorage.getItem(this.LOAD_ID_KEY);
    return storedLoadId !== null && storedLoadId !== this.currentLoadId;
  }

  static clearLoadId(): void {
    sessionStorage.removeItem(this.LOAD_ID_KEY);
    this.currentLoadId = '';
    console.log('🧹 Page Load ID cleared');
  }

  static getCurrentLoadId(): string {
    return this.currentLoadId;
  }
}

// Détection automatique au chargement du module
export const isPageReloaded = PageLoadDetector.initializePageLoad();