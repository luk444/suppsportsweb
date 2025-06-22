import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc, collection, query, limit, getDocs, where } from 'firebase/firestore';
import { 
  Minus, 
  Plus, 
  ShoppingCart, 
  ChevronLeft, 
  Star, 
  Tag, 
  Truck, 
  Store,
  CreditCard,
  Share2,
  Heart,
  Eye
} from 'lucide-react';
import { db } from '../../firebase/config';
import { useCart } from '../../contexts/CartContext';
import { useToast } from '../../contexts/ToastContext';
import ProductCard from '../../components/product/ProductCard';

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  category: string;
  subcategory?: string;
  brand?: string;
  weight?: string;
  flavors?: string[];
  flavor?: string;
  image: string;
  images?: string[];
  stock: number;
  isOnSale?: boolean;
  salePrice?: number;
  isCombo?: boolean;
  isFeatured?: boolean;
  tags?: string[];
  createdAt?: any;
}

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedFlavor, setSelectedFlavor] = useState('');
  const { addToCart } = useCart();
  const { addToast } = useToast();

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        const productDoc = await getDoc(doc(db, 'products', id));
        
        if (productDoc.exists()) {
          const productData = {
            id: productDoc.id,
            ...productDoc.data() as Omit<Product, 'id'>
          };
          setProduct(productData);
          
          // Set default flavor if product has flavors
          if (productData.flavors && productData.flavors.length > 0) {
            setSelectedFlavor(productData.flavors[0]);
          }
          
          // Fetch related products
          await fetchRelatedProducts(productData);
        } else {
          addToast('Producto no encontrado', 'error');
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        addToast('Error al cargar detalles del producto', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [id, addToast]);

  const fetchRelatedProducts = async (currentProduct: Product) => {
    try {
      // Get products from same category or with similar tags
      const productsRef = collection(db, 'products');
      let q = query(productsRef, limit(8));
      
      if (currentProduct.category) {
        q = query(productsRef, where('category', '==', currentProduct.category), limit(8));
      }
      
      const querySnapshot = await getDocs(q);
      const products: Product[] = [];
      
      querySnapshot.forEach((doc) => {
        if (doc.id !== currentProduct.id) {
          products.push({
            id: doc.id,
            ...doc.data() as Omit<Product, 'id'>
          });
        }
      });
      
      setRelatedProducts(products);
    } catch (error) {
      console.error('Error fetching related products:', error);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    
    if (product.stock === 0) {
      addToast('Producto sin stock', 'error');
      return;
    }
    
    addToCart({
      id: product.id,
      name: product.name,
      price: product.isOnSale && product.salePrice ? product.salePrice : product.price,
      quantity,
      image: product.image,
      selectedFlavor: product.flavors && product.flavors.length > 0 ? selectedFlavor : undefined
    });
    
    addToast(`${product.name} agregado al carrito`, 'success');
  };

  const decreaseQuantity = () => {
    setQuantity(prev => (prev > 1 ? prev - 1 : 1));
  };

  const increaseQuantity = () => {
    if (product?.stock && quantity < product.stock) {
      setQuantity(prev => prev + 1);
    }
  };

  const displayPrice = product?.isOnSale && product?.salePrice ? product.salePrice : product?.price || 0;
  const isOutOfStock = product?.stock === 0;
  const hasMultipleFlavors = product?.flavors && product.flavors.length > 1;

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-24">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-pulse">
            <div className="aspect-square bg-gray-200 rounded-lg"></div>
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              <div className="h-6 bg-gray-200 rounded w-1/4"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-12 bg-gray-200 rounded w-1/2 mt-8"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-24">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Producto no encontrado</h1>
          <p className="mb-6 text-gray-600">El producto que buscas no existe o ha sido removido.</p>
          <Link 
            to="/products" 
            className="inline-flex items-center px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors"
          >
            <ChevronLeft size={16} className="mr-1" />
            Volver a Productos
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb */}
          <section className="page-header mb-8">
            <div className="breadcrumbs text-sm text-gray-600">
              <Link to="/" className="crumb hover:text-yellow-600">Inicio</Link>
              <span className="divider mx-2">&gt;</span>
              <Link to="/products" className="crumb hover:text-yellow-600">Productos</Link>
              {product.category && (
                <>
                  <span className="divider mx-2">&gt;</span>
                  <Link to={`/products?category=${product.category}`} className="crumb hover:text-yellow-600">
                    {product.category}
                  </Link>
                </>
              )}
              {product.brand && (
                <>
                  <span className="divider mx-2">&gt;</span>
                  <Link to={`/products?brand=${product.brand}`} className="crumb hover:text-yellow-600">
                    {product.brand}
                  </Link>
                </>
              )}
              <span className="divider mx-2">&gt;</span>
              <span className="crumb active text-gray-900 font-medium">{product.name}</span>
            </div>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Product Image */}
            <div className="product-image-container">
              <div className="bg-white rounded-xl overflow-hidden shadow-lg relative group">
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="w-full h-full object-contain aspect-square transition-transform duration-300 group-hover:scale-105"
                />
                
                {/* Badges */}
                {product.isOnSale && (
                  <div className="sale-badge">
                    OFERTA
                  </div>
                )}
                
                {product.isFeatured && !product.isOnSale && (
                  <div className="featured-badge">
                    <Star size={12} className="inline mr-1" />
                    DESTACADO
                  </div>
                )}
                
                {product.isCombo && !product.isOnSale && !product.isFeatured && (
                  <div className="combo-badge">
                    <Tag size={12} className="inline mr-1" />
                    COMBO
                  </div>
                )}
                
                {/* Out of stock overlay */}
                {isOutOfStock && (
                  <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
                    <span className="text-white font-bold text-xl">SIN STOCK</span>
                  </div>
                )}

                {/* Quick actions */}
                <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-yellow-50 transition-colors">
                    <Heart size={18} className="text-gray-600" />
                  </button>
                  <button className="w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-yellow-50 transition-colors">
                    <Share2 size={18} className="text-gray-600" />
                  </button>
                </div>
              </div>
            </div>

            {/* Product Details */}
            <div className="product-info space-y-8">
              {/* Product Name */}
              <div>
                <h1 className="js-product-name text-4xl font-bold text-gray-900 mb-4 leading-tight">
                  {product.name}
                </h1>
                
                {/* Product meta info */}
                <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-6">
                  {product.brand && (
                    <span className="bg-gray-100 px-3 py-1 rounded-full">
                      {product.brand}
                    </span>
                  )}
                  {product.category && (
                    <span className="bg-gray-100 px-3 py-1 rounded-full">
                      {product.category}
                    </span>
                  )}
                  {product.weight && (
                    <span className="bg-gray-100 px-3 py-1 rounded-full">
                      {product.weight}
                    </span>
                  )}
                </div>
              </div>

              {/* Price Container */}
              <div className="price-container">
                {product.isOnSale && product.salePrice && (
                  <div className="mb-2">
                    <span className="text-2xl line-through text-gray-400">
                      ${product.price.toFixed(2)}
                    </span>
                    <span className="ml-3 text-sm text-green-600 font-medium">
                      {Math.round(((product.price - product.salePrice) / product.price) * 100)}% OFF
                    </span>
                  </div>
                )}
                <div className="text-4xl font-bold text-yellow-600 mb-2">
                  ${displayPrice.toFixed(2)}
                </div>
                
                <div className="text-sm text-gray-500">
                  Precio sin impuestos: ${(displayPrice * 0.79).toFixed(2)}
                </div>
              </div>

              {/* Product Form */}
              <form id="product_form" className="js-product-form space-y-6">
                {/* Flavor Selection - Only show if multiple flavors */}
                {hasMultipleFlavors && (
                  <div className="js-product-variants-group">
                    <div className="form-group">
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Seleccionar Sabor
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {product.flavors!.map(flavor => (
                          <button
                            key={flavor}
                            type="button"
                            onClick={() => setSelectedFlavor(flavor)}
                            className={`p-3 text-sm rounded-lg border-2 transition-all ${
                              selectedFlavor === flavor
                                ? 'border-yellow-500 bg-yellow-50 text-yellow-700'
                                : 'border-gray-200 bg-white text-gray-700 hover:border-yellow-300 hover:bg-yellow-50'
                            }`}
                          >
                            {flavor}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Quantity and Add to Cart */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Cantidad
                    </label>
                    <div className="flex items-center max-w-xs">
                      <button 
                        type="button"
                        onClick={decreaseQuantity}
                        disabled={quantity <= 1}
                        className="w-12 h-12 rounded-l-lg bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <Minus size={20} />
                      </button>
                      <input
                        type="number" 
                        value={quantity}
                        readOnly
                        className="w-20 h-12 border-y border-gray-200 text-center text-gray-700 bg-white font-medium"
                        min="1"
                      />
                      <button 
                        type="button"
                        onClick={increaseQuantity}
                        disabled={product.stock <= quantity}
                        className="w-12 h-12 rounded-r-lg bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <Plus size={20} />
                      </button>
                    </div>
                  </div>
                  
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    disabled={isOutOfStock || (hasMultipleFlavors && !selectedFlavor)}
                    className="w-full py-4 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed font-semibold text-lg flex items-center justify-center gap-2"
                  >
                    <ShoppingCart size={24} />
                    {isOutOfStock ? 'Sin Stock' : 
                     hasMultipleFlavors && !selectedFlavor ? 'Selecciona un sabor' : 
                     'Agregar al Carrito'}
                  </button>
                </div>

                {/* Stock Status */}
                <div className="text-sm">
                  {product.stock > 10 ? (
                    <span className="text-green-600 flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      En stock ({product.stock} disponibles)
                    </span>
                  ) : product.stock > 0 ? (
                    <span className="text-orange-600 flex items-center gap-1">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      Solo {product.stock} disponibles
                    </span>
                  ) : (
                    <span className="text-red-600 flex items-center gap-1">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      Sin stock
                    </span>
                  )}
                </div>
              </form>

              {/* Shipping Calculator */}
              <div id="product-shipping-container" className="product-shipping-calculator border-t border-gray-200 pt-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Truck size={20} className="text-yellow-600" />
                    <span className="font-medium text-gray-900">Medios de envío</span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input
                      type="tel"
                      placeholder="Tu código postal"
                      className="w-full rounded-lg border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    />
                    <button className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium">
                      Calcular
                    </button>
                  </div>
                  
                  <a href="https://www.correoargentino.com.ar/formularios/cpa" target="_blank" rel="noopener noreferrer" className="text-sm text-yellow-600 hover:underline inline-block">
                    No sé mi código postal
                  </a>
                </div>

                {/* Store Pickup */}
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <Store size={20} className="text-yellow-600" />
                    <span className="font-medium text-gray-900">Nuestro local</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-600">
                      <div>Tienda Pick-up de Retiro - Nazarre 3584, C1417 CABA</div>
                      <div className="text-orange-600 text-xs mt-1">⚠️IMPORTANTE⚠️ Para retirar tu compra avísanos por WhatsApp</div>
                    </div>
                    <div className="text-right">
                      <span className="text-yellow-600 font-bold text-lg">Gratis</span>
                    </div>
                  </div>
                </div>

                {/* Same Day Delivery */}
                <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="flex items-center gap-3">
                    <Truck size={20} className="text-yellow-600" />
                    <div>
                      <div className="font-medium text-gray-900">Envíos en el Día</div>
                      <div className="text-sm text-gray-600">Hace tu compra y recibí tu producto dentro de las 24hs</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="border-t border-gray-200 pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <CreditCard size={20} className="text-yellow-600" />
                  <span className="font-medium text-gray-900">Medios de pago</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="bg-white p-3 rounded-lg border border-gray-200 text-center">
                    <div className="font-medium text-sm">1 cuota</div>
                    <div className="text-yellow-600 font-bold">${displayPrice.toFixed(2)}</div>
                    <div className="text-green-600 text-xs">Sin interés</div>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-gray-200 text-center">
                    <div className="font-medium text-sm">3 cuotas</div>
                    <div className="text-yellow-600 font-bold">${(displayPrice / 3).toFixed(2)}</div>
                    <div className="text-gray-500 text-xs">c/u</div>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-gray-200 text-center">
                    <div className="font-medium text-sm">6 cuotas</div>
                    <div className="text-yellow-600 font-bold">${(displayPrice / 6).toFixed(2)}</div>
                    <div className="text-gray-500 text-xs">c/u</div>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-gray-200 text-center">
                    <div className="font-medium text-sm">12 cuotas</div>
                    <div className="text-yellow-600 font-bold">${(displayPrice / 12).toFixed(2)}</div>
                    <div className="text-gray-500 text-xs">c/u</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Product Description */}
          <div className="mt-16">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              <div className="lg:col-span-2">
                <div id="product-description" className="product-description">
                  <h2 className="text-2xl font-bold mb-6 text-gray-900">Descripción del Producto</h2>
                  <div className="prose max-w-none text-gray-700 leading-relaxed">
                    <div dangerouslySetInnerHTML={{ __html: product.description }} />
                  </div>
                </div>
              </div>
              
              {/* Product Details Sidebar */}
              <div className="lg:col-span-1">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                  <h3 className="text-lg font-bold mb-4 text-gray-900">Detalles del Producto</h3>
                  <div className="space-y-4">
                    {product.brand && (
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-sm font-medium text-gray-600">Marca:</span>
                        <span className="text-sm text-gray-900">{product.brand}</span>
                      </div>
                    )}
                    {product.category && (
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-sm font-medium text-gray-600">Categoría:</span>
                        <span className="text-sm text-gray-900">{product.category}</span>
                      </div>
                    )}
                    {product.subcategory && (
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-sm font-medium text-gray-600">Subcategoría:</span>
                        <span className="text-sm text-gray-900">{product.subcategory}</span>
                      </div>
                    )}
                    {product.weight && (
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-sm font-medium text-gray-600">Peso:</span>
                        <span className="text-sm text-gray-900">{product.weight}</span>
                      </div>
                    )}
                    {product.flavors && product.flavors.length > 0 && (
                      <div className="flex justify-between items-start py-2 border-b border-gray-100">
                        <span className="text-sm font-medium text-gray-600">Sabores:</span>
                        <div className="text-sm text-gray-900 text-right">
                          {product.flavors.map((flavor, index) => (
                            <div key={flavor}>{flavor}</div>
                          ))}
                        </div>
                      </div>
                    )}
                    {product.tags && product.tags.length > 0 && (
                      <div className="pt-2">
                        <span className="text-sm font-medium text-gray-600 block mb-2">Etiquetas:</span>
                        <div className="flex flex-wrap gap-1">
                          {product.tags.map((tag, index) => (
                            <span key={index} className="inline-block bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Related Products - "Usuarios también Buscaron" */}
          {relatedProducts.length > 0 && (
            <div className="mt-16">
              <div className="flex items-center gap-3 mb-8">
                <Eye size={24} className="text-yellow-600" />
                <h2 className="text-2xl font-bold text-gray-900">Usuarios también Buscaron</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedProducts.slice(0, 4).map((relatedProduct) => (
                  <ProductCard key={relatedProduct.id} product={relatedProduct} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;