
/**
 * Utilitaires pour la gestion des images
 */

let API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

API_BASE_URL = API_BASE_URL.replace(/\/api\/?$/, ''); // Supprime /api ou /api/ à la fin


export const getImageUrl = (imageUrl?: string): string => {
  if (!imageUrl) {
    return '/images/no-image.svg';
  }
  
  // Si c'est déjà une URL complète (http/https)
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }
  
  // Supprimer /api/ de l'URL si présent (pour les images)
  let cleanUrl = imageUrl;
  if (cleanUrl.startsWith('/api/')) {
    cleanUrl = cleanUrl.substring(4); // Supprime '/api' du début
  }
  
  // Si c'est un chemin relatif qui commence par /uploads/
  if (cleanUrl.startsWith('/uploads/')) {
    return `${API_BASE_URL}${cleanUrl}`;
  }
  
  // Si c'est un chemin relatif qui commence par /
  if (cleanUrl.startsWith('/')) {
    return `${API_BASE_URL}${cleanUrl}`;
  }
  
  // Si c'est un chemin relatif sans /
  return `${API_BASE_URL}/${cleanUrl}`;
};

/**
 * Gère l'erreur de chargement d'une image
 * @param event - Événement d'erreur de l'image
 * @param fallbackUrl - URL de fallback (optionnel)
 */
export const handleImageError = (event: Event, fallbackUrl: string = '/images/no-image.svg') => {
  const img = event.target as HTMLImageElement;
  if (img.src !== fallbackUrl) {
    img.src = fallbackUrl;
  }
  img.onerror = null; // Éviter les boucles infinies
};

/**
 * Vérifie si une URL d'image est valide
 * @param url - URL à vérifier
 * @returns true si l'URL est valide
 */
export const isValidImageUrl = (url?: string): boolean => {
  if (!url) return false;
  
  // Vérifier si c'est une URL valide
  try {
    new URL(url);
    return true;
  } catch {
    // Si ce n'est pas une URL complète, vérifier si c'est un chemin valide
    return url.startsWith('/') || url.startsWith('./') || url.startsWith('../');
  }
};

/**
 * Obtient les dimensions d'une image
 * @param url - URL de l'image
 * @returns Promise avec les dimensions {width, height}
 */
export const getImageDimensions = (url: string): Promise<{width: number, height: number}> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
    };
    img.onerror = () => {
      reject(new Error('Impossible de charger l\'image'));
    };
    img.src = url;
  });
};

/**
 * Optimise une URL d'image pour différentes tailles
 * @param url - URL de l'image originale
 * @param width - Largeur souhaitée
 * @param height - Hauteur souhaitée (optionnel)
 * @returns URL optimisée
 */
export const getOptimizedImageUrl = (
  url: string, 
  width: number, 
  height?: number
): string => {
  if (!isValidImageUrl(url)) {
    return url;
  }
  
  // Si l'URL contient déjà des paramètres de taille, on la retourne telle quelle
  if (url.includes('w=') || url.includes('width=')) {
    return url;
  }
  
  // Pour les images externes (Unsplash, etc.), on peut ajouter des paramètres d'optimisation
  if (url.includes('unsplash.com')) {
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}w=${width}${height ? `&h=${height}` : ''}&fit=crop&auto=format`;
  }
  
  // Pour les autres images, on retourne l'URL originale
  return url;
}; 