import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ChevronLeft, ArrowRight } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';

const CartPage: React.FC = () => {
  const { cart, removeFromCart, updateQuantity, totalItems, totalPrice } = useCart();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const handleCheckout = () => {
    if (!currentUser) {
      navigate('/login', { state: { from: '/checkout' } });
    } else {
      navigate('/checkout');
    }
  };

  if (cart.length === 0) {
    return (
      <div className="container mx-auto px-4 py-24">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Your Cart</h1>
          
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
              <ShoppingBag size={24} className="text-gray-400" />
            </div>
            <h2 className="text-xl font-medium mb-4">Your cart is empty</h2>
            <p className="text-gray-600 mb-6">
              Looks like you haven't added anything to your cart yet.
            </p>
            <Link 
              to="/products" 
              className="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-24">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Your Cart</h1>
          <Link 
            to="/products" 
            className="inline-flex items-center text-sm text-gray-600 hover:text-primary-600"
          >
            <ChevronLeft size={16} className="mr-1" />
            Continue Shopping
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
          {/* Cart Items */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="border-b border-gray-200 py-4 px-6 hidden md:grid md:grid-cols-[2fr,1fr,1fr,auto] text-sm font-medium text-gray-600">
              <div>Product</div>
              <div>Price</div>
              <div>Quantity</div>
              <div></div>
            </div>
            
            <div>
              {cart.map(item => (
                <div 
                  key={item.id} 
                  className="py-4 px-6 border-b border-gray-200 last:border-0 grid grid-cols-1 md:grid-cols-[2fr,1fr,1fr,auto] gap-4 items-center"
                >
                  {/* Product */}
                  <div className="flex items-center">
                    <div className="w-16 h-16 rounded overflow-hidden flex-shrink-0">
                      <img 
                        src={item.image} 
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="ml-4">
                      <Link 
                        to={`/products/${item.id}`}
                        className="font-medium text-gray-800 hover:text-primary-600"
                      >
                        {item.name}
                      </Link>
                      {item.selectedFlavor && (
                        <p className="text-sm text-gray-500 mt-1">
                          Sabor: <span className="font-medium">{item.selectedFlavor}</span>
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {/* Price */}
                  <div className="md:text-center">
                    <span className="md:hidden inline-block w-24 font-medium text-gray-600">Price:</span>
                    <span className="font-medium">${item.price.toFixed(2)}</span>
                  </div>
                  
                  {/* Quantity */}
                  <div>
                    <span className="md:hidden inline-block w-24 font-medium text-gray-600">Quantity:</span>
                    <div className="flex items-center">
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity - 1, item.selectedFlavor)}
                        className="w-8 h-8 rounded-l-md bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200"
                      >
                        <Minus size={14} />
                      </button>
                      <input
                        type="number" 
                        value={item.quantity}
                        readOnly
                        className="w-12 h-8 border-y border-gray-200 text-center text-gray-700 text-sm"
                      />
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity + 1, item.selectedFlavor)}
                        className="w-8 h-8 rounded-r-md bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                  
                  {/* Remove */}
                  <div className="flex justify-end">
                    <button 
                      onClick={() => removeFromCart(item.id, item.selectedFlavor)}
                      className="p-2 text-gray-400 hover:text-red-500"
                      aria-label="Remove from cart"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow-sm p-6 h-fit">
            <h2 className="text-lg font-bold mb-4">Order Summary</h2>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Items ({totalItems})</span>
                <span className="font-medium">${totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Shipping</span>
                <span className="font-medium">Calculated at checkout</span>
              </div>
              <div className="border-t border-gray-200 pt-3 mt-3">
                <div className="flex justify-between">
                  <span className="font-medium">Subtotal</span>
                  <span className="font-bold">${totalPrice.toFixed(2)}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Taxes calculated at checkout
                </p>
              </div>
            </div>
            
            <button
              onClick={handleCheckout}
              className="w-full inline-flex items-center justify-center px-6 py-3 bg-yellow-400 text-white rounded-md hover:bg-yellow-700 transition-colors"
            >
              Continuar con la compra
              <ArrowRight size={16} className="ml-2" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;