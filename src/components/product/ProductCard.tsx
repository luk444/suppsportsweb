import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Star, Tag, Heart, Eye } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { useToast } from '../../contexts/ToastContext';
import { useFavorites } from '../../contexts/FavoritesContext';
import { Product } from '../../types';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const { addToast } = useToast();
  const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (product.stock === 0) {
      addToast('Producto sin stock', 'error');
      return;
    }
    
    addToCart({
      id: product.id,
      name: product.name,
      price: product.isOnSale && product.salePrice ? product.salePrice : product.price,
      quantity: 1,
      image: product.image
    });
    
    addToast(`${product.name} agregado al carrito`, 'success');
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isFavorite(product.id)) {
      removeFromFavorites(product.id);
    } else {
      addToFavorites(product);
    }
  };

  const displayPrice = product.isOnSale && product.salePrice ? product.salePrice : product.price;
  const isOutOfStock = product.stock === 0;
  const isFavorited = isFavorite(product.id);

  return (
    <div className="group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 product-card">
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        <img 
          src={product.image} 
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-700 ease-out"
        />
        
        {/* Gradient Overlay on Hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Badges */}
        {product.isOnSale && (
          <div className="absolute top-3 left-3 bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg transform -rotate-2">
            <span className="flex items-center">
              <Tag size={10} className="mr-1" />
              OFERTA
            </span>
          </div>
        )}
        
        {product.isFeatured && !product.isOnSale && (
          <div className="absolute top-3 left-3 bg-gradient-to-r from-yellow-400 to-yellow-500 text-black px-3 py-1 rounded-full text-xs font-bold shadow-lg transform -rotate-2">
            <span className="flex items-center">
              <Star size={10} className="mr-1" />
              DESTACADO
            </span>
          </div>
        )}
        
        {product.isCombo && !product.isOnSale && !product.isFeatured && (
          <div className="absolute top-3 left-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg transform -rotate-2">
            <span className="flex items-center">
              <Tag size={10} className="mr-1" />
              COMBO
            </span>
          </div>
        )}
        
        {/* Stock Badge - Solo mostrar en imagen si es stock limitado y no hay otros badges */}
        {product.stock !== undefined && product.stock <= 5 && product.stock > 0 && 
         !product.isOnSale && !product.isFeatured && !product.isCombo && (
          <div className="absolute top-3 right-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg">
            Solo {product.stock}
          </div>
        )}
        
        {/* Out of stock overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
            <div className="text-center">
              <div className="text-white font-bold text-lg mb-2">SIN STOCK</div>
              <div className="text-gray-300 text-sm">Próximamente disponible</div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0 md:opacity-100 md:translate-x-0">
          {/* Favorite button */}
          <button
            onClick={handleToggleFavorite}
            className={`p-2 rounded-full shadow-lg transition-all duration-300 ${
              isFavorited 
                ? 'bg-red-500 text-white hover:bg-red-600' 
                : 'bg-white text-gray-600 hover:bg-red-50 hover:text-red-500'
            }`}
            aria-label={isFavorited ? 'Remover de favoritos' : 'Agregar a favoritos'}
          >
            <Heart size={16} className={isFavorited ? 'fill-current' : ''} />
          </button>
          
          {/* Quick view button */}
          <Link
            to={`/products/${product.id}`}
            className="p-2 bg-white text-gray-600 rounded-full shadow-lg transition-all duration-300 hover:bg-yellow-50 hover:text-yellow-600"
            aria-label="Ver producto"
          >
            <Eye size={16} />
          </Link>
        </div>

        {/* Add to cart button */}
        {!isOutOfStock && (
          <button
            onClick={handleAddToCart}
            className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-yellow-400 to-yellow-500 text-black px-4 py-2 md:px-6 md:py-3 rounded-full font-bold shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hover:from-yellow-500 hover:to-yellow-600 hover:shadow-xl hover:scale-105 md:opacity-100"
            aria-label="Agregar al carrito"
          >
            <span className="flex items-center text-sm md:text-base">
              <ShoppingCart size={16} className="mr-1 md:mr-2 md:w-[18px] md:h-[18px]" />
              <span className="hidden sm:inline">Agregar</span>
              <span className="sm:hidden">+</span>
            </span>
          </button>
        )}
      </div>
      
      {/* Content */}
      <div className="p-4 md:p-5">
        {/* Brand */}
        {product.brand && (
          <div className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wide">
            {product.brand}
          </div>
        )}
        
        {/* Product name */}
        <Link to={`/products/${product.id}`} className="block">
          <h3 className="text-base md:text-lg font-bold text-gray-900 mb-2 md:mb-3 line-clamp-2 hover:text-yellow-600 transition-colors duration-300">
            {product.name}
          </h3>
        </Link>
        
        {/* Product details */}
        <div className="text-xs md:text-sm text-gray-600 mb-3 md:mb-4 space-y-1">
          {product.category && (
            <div className="flex items-center">
              <span className="w-1.5 h-1.5 md:w-2 md:h-2 bg-yellow-400 rounded-full mr-1.5 md:mr-2 flex-shrink-0"></span>
              <span className="truncate">{product.category}</span>
            </div>
          )}
          {product.subcategory && (
            <div className="flex items-center">
              <span className="w-1.5 h-1.5 md:w-2 md:h-2 bg-yellow-400 rounded-full mr-1.5 md:mr-2 flex-shrink-0"></span>
              <span className="truncate">{product.subcategory}</span>
            </div>
          )}
          {product.weight && (
            <div className="flex items-center">
              <span className="w-1.5 h-1.5 md:w-2 md:h-2 bg-yellow-400 rounded-full mr-1.5 md:mr-2 flex-shrink-0"></span>
              <span className="truncate">{product.weight}</span>
            </div>
          )}
          {product.flavor && (
            <div className="flex items-center">
              <span className="w-1.5 h-1.5 md:w-2 md:h-2 bg-yellow-400 rounded-full mr-1.5 md:mr-2 flex-shrink-0"></span>
              <span className="truncate">Sabor: {product.flavor}</span>
            </div>
          )}
        </div>
        
        {/* Price and Stock */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
          <div className="flex flex-col items-start gap-0.5">
            <span className={`text-xl md:text-2xl font-bold ${product.isOnSale ? 'text-red-600' : 'text-yellow-600'}`}>
              ${displayPrice.toFixed(2)}
            </span>
            {product.isOnSale && product.salePrice && (
              <span className="text-xs md:text-sm text-gray-500 line-through">
                ${product.price.toFixed(2)}
              </span>
            )}
          </div>
          
          {/* Stock indicator */}
          {product.stock !== undefined && (
            <div className="text-xs">
              {product.stock > 10 ? (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <span className="w-1.5 h-1.5 md:w-2 md:h-2 bg-green-400 rounded-full mr-1 flex-shrink-0"></span>
                  <span className="hidden sm:inline">En stock</span>
                  <span className="sm:hidden">Stock</span>
                </span>
              ) : product.stock > 0 ? (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                  <span className="w-1.5 h-1.5 md:w-2 md:h-2 bg-orange-400 rounded-full mr-1 flex-shrink-0"></span>
                  <span className="hidden sm:inline">Solo {product.stock}</span>
                  <span className="sm:hidden">{product.stock}</span>
                </span>
              ) : (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  <span className="w-1.5 h-1.5 md:w-2 md:h-2 bg-red-400 rounded-full mr-1 flex-shrink-0"></span>
                  <span className="hidden sm:inline">Sin stock</span>
                  <span className="sm:hidden">Sin stock</span>
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;