import React, { useState } from 'react';
import { useWishlist } from '../contexts/WishlistContext';
import { useAuth } from '../contexts/AuthContext';

interface WishlistButtonProps {
  productId: number;
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const WishlistButton: React.FC<WishlistButtonProps> = ({
  productId,
  className = '',
  showText = false,
  size = 'md'
}) => {
  const { addToWishlist, removeFromWishlist, isInWishlist, isLoading } = useWishlist();
  const { isAuthenticated } = useAuth();
  const [localLoading, setLocalLoading] = useState(false);
  const [message, setMessage] = useState('');

  const inWishlist = isInWishlist(productId);

  const sizeClasses = {
    sm: 'p-1 text-sm',
    md: 'p-2 text-base',
    lg: 'p-3 text-lg'
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      setMessage('Vous devez être connecté pour ajouter des favoris');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    setLocalLoading(true);
    setMessage('');

    try {
      if (inWishlist) {
        await removeFromWishlist(productId);
        setMessage('Retiré des favoris');
      } else {
        await addToWishlist(productId);
        setMessage('Ajouté aux favoris');
      }
      
      setTimeout(() => setMessage(''), 2000);
    } catch (error: any) {
      setMessage(error.message || 'Une erreur est survenue');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setLocalLoading(false);
    }
  };

  const buttonClasses = `
    relative inline-flex items-center justify-center
    ${sizeClasses[size]}
    ${inWishlist 
      ? 'text-red-600 hover:text-red-700' 
      : 'text-gray-400 hover:text-red-500'
    }
    transition-colors duration-200
    disabled:opacity-50 disabled:cursor-not-allowed
    ${className}
  `;

  return (
    <div className="relative">
      <button
        onClick={handleClick}
        disabled={localLoading || isLoading}
        className={buttonClasses}
        title={inWishlist ? 'Retirer des favoris' : 'Ajouter aux favoris'}
      >
        {localLoading ? (
          <div className={`animate-spin rounded-full border-2 border-current border-t-transparent ${iconSizes[size]}`} />
        ) : (
          <svg
            className={iconSizes[size]}
            fill={inWishlist ? 'currentColor' : 'none'}
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
        )}
        
        {showText && (
          <span className="ml-2">
            {inWishlist ? 'Favoris' : 'Ajouter aux favoris'}
          </span>
        )}
      </button>

      {/* Message de feedback */}
      {message && (
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-1 bg-gray-800 text-white text-sm rounded-md whitespace-nowrap z-50">
          {message}
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-b-gray-800"></div>
        </div>
      )}
    </div>
  );
};

export default WishlistButton;

