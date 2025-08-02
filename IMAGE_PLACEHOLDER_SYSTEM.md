# Système de Placeholder d'Images

## Vue d'ensemble

Le système de placeholder d'images a été mis en place pour gérer les cas où les images des produits sont manquantes, vides ou invalides. Cela améliore l'expérience utilisateur en évitant les images cassées.

## Fichiers modifiés

### 1. Placeholder SVG
- **Fichier** : `frontend/public/images/no-image.svg`
- **Description** : Placeholder SVG moderne avec un design épuré
- **Caractéristiques** :
  - Format SVG (vectoriel, léger)
  - Design moderne avec des couleurs neutres
  - Texte "Aucune image" en français
  - Dimensions : 400x300px

### 2. Utilitaires d'images
- **Fichier** : `frontend/src/utils/imageUtils.ts`
- **Fonctions modifiées** :
  - `getImageUrlWithFallback()` : Utilise maintenant le SVG par défaut
  - `getPrimaryImageUrl()` : Améliorée pour mieux gérer les images vides
  - `handleImageError()` : Utilise maintenant le SVG par défaut

### 3. Composants mis à jour

#### ProductCard.tsx
- Utilise `getImageUrlWithFallback()` et `handleImageError()`
- Gestion automatique des images manquantes

#### ProductDetail.tsx
- Remplacement de `/placeholder-product.jpg` par `/images/no-image.svg`
- Ajout de gestionnaire d'erreur `onError`

#### Cart.tsx
- Remplacement de `/placeholder-product.jpg` par `/images/no-image.svg`
- Ajout de gestionnaire d'erreur `onError`

#### Wishlist.tsx
- Remplacement de `/placeholder-product.jpg` par `/images/no-image.svg`
- Ajout de gestionnaire d'erreur `onError`

#### AdminProducts.tsx
- Remplacement de `/placeholder-product.jpg` par `/images/no-image.svg`
- Ajout de gestionnaire d'erreur `onError`

#### Home.tsx
- Images de la bannière héro avec fallback vers le placeholder
- Ajout de gestionnaires d'erreur `onError`

## Fonctionnalités

### 1. Fallback automatique
```typescript
const imageUrl = getImageUrlWithFallback(product.images);
```

### 2. Gestion d'erreur
```typescript
<img 
  src={imageUrl}
  onError={(e) => {
    (e.target as HTMLImageElement).src = '/images/no-image.svg';
  }}
/>
```

### 3. Validation d'URL
```typescript
if (!primaryUrl || !isValidImageUrl(primaryUrl)) {
  return fallbackUrl;
}
```

## Avantages

1. **Expérience utilisateur améliorée** : Plus d'images cassées
2. **Performance** : SVG léger et vectoriel
3. **Cohérence** : Même placeholder partout
4. **Maintenabilité** : Centralisé dans `imageUtils.ts`
5. **Responsive** : SVG s'adapte à toutes les tailles

## Utilisation

### Pour les développeurs
```typescript
import { getImageUrlWithFallback, handleImageError } from '../utils/imageUtils';

// Dans un composant
const imageUrl = getImageUrlWithFallback(product.images);

<img 
  src={imageUrl}
  onError={handleImageError}
  alt={product.name}
/>
```

### Personnalisation
Pour changer le placeholder par défaut, modifiez la valeur par défaut dans `imageUtils.ts` :

```typescript
export const getImageUrlWithFallback = (
  images?: any[], 
  fallbackUrl: string = '/images/no-image.svg' // Changez ici
): string => {
  // ...
};
```

## Structure des fichiers

```
frontend/
├── public/
│   └── images/
│       └── no-image.svg          # Placeholder SVG
└── src/
    └── utils/
        └── imageUtils.ts         # Utilitaires d'images
```

## Tests

Pour tester le système :

1. Créez un produit sans image
2. Modifiez une URL d'image pour qu'elle soit invalide
3. Vérifiez que le placeholder s'affiche correctement

## Maintenance

- Le placeholder SVG peut être modifié dans `frontend/public/images/no-image.svg`
- Les utilitaires peuvent être étendus dans `frontend/src/utils/imageUtils.ts`
- Tous les composants utilisent maintenant le même système 