/**
 * Convertit un prix en nombre et le formate avec 2 décimales
 * @param price - Le prix à formater
 * @returns Le prix formaté en string
 */
export const formatPrice = (price: number | string | undefined): string => {
  if (price === undefined || price === null) return '0.00';
  
  const numericPrice = typeof price === 'number' ? price : Number(price);
  
  if (isNaN(numericPrice)) return '0.00';
  
  return numericPrice.toFixed(2);
};

/**
 * Calcule le pourcentage de réduction entre deux prix
 * @param originalPrice - Le prix original
 * @param salePrice - Le prix en promotion
 * @returns Le pourcentage de réduction
 */
export const calculateDiscountPercentage = (originalPrice: number | string, salePrice: number | string): number => {
  const original = typeof originalPrice === 'number' ? originalPrice : Number(originalPrice);
  const sale = typeof salePrice === 'number' ? salePrice : Number(salePrice);
  
  if (isNaN(original) || isNaN(sale) || original <= 0) return 0;
  
  return Math.round(((original - sale) / original) * 100);
};

/**
 * Vérifie si un prix est valide
 * @param price - Le prix à vérifier
 * @returns true si le prix est valide
 */
export const isValidPrice = (price: number | string | undefined): boolean => {
  if (price === undefined || price === null) return false;
  
  const numericPrice = typeof price === 'number' ? price : Number(price);
  
  return !isNaN(numericPrice) && numericPrice >= 0;
}; 