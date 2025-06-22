import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { collection, setDoc, doc, Timestamp } from 'firebase/firestore';
import { Truck, Store, CheckCircle, CreditCard, Building2 } from 'lucide-react';
import { db } from '../../firebase/config';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { useToast } from '../../contexts/ToastContext';
import { useSiteConfig } from '../../contexts/SiteConfigContext';
import { v4 as uuidv4 } from 'uuid';
import BankDetailsModal from './BankDetailsModal';
import MercadoPagoButton from '../../components/payment/MercadoPagoButton';

interface CheckoutFormData {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

const CheckoutPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { cart, totalPrice, clearCart } = useCart();
  const { addToast } = useToast();
  const { siteConfig, loading: configLoading } = useSiteConfig();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showBankDetails, setShowBankDetails] = useState(false);
  const [currentOrderId, setCurrentOrderId] = useState('');
  const [currentTotalAmount, setCurrentTotalAmount] = useState(0);
  const [selectedShippingOption, setSelectedShippingOption] = useState<string>('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');
  const [customerDetails, setCustomerDetails] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [showMercadoPagoButton, setShowMercadoPagoButton] = useState(false);
  
  const { register, handleSubmit, formState: { errors }, watch } = useForm<CheckoutFormData>({
    defaultValues: {
      fullName: currentUser?.displayName || '',
      email: currentUser?.email || '',
      phone: '',
      address: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'Argentina'
    }
  });

  const watchShippingType = watch('address');

  // Calcular el total incluyendo el envío
  const selectedOption = siteConfig?.shippingOptions.find(option => option.id === selectedShippingOption);
  const shippingCost = selectedOption?.price || 0;
  const finalTotal = totalPrice + shippingCost;

  const onSubmit = async (data: CheckoutFormData) => {
    if (cart.length === 0) {
      addToast('Tu carrito está vacío', 'error');
      return;
    }

    if (!selectedShippingOption) {
      addToast('Debes seleccionar un método de envío', 'error');
      return;
    }

    if (!selectedPaymentMethod) {
      addToast('Debes seleccionar un método de pago', 'error');
      return;
    }

    try {
      setIsLoading(true);
      
      const orderId = uuidv4();
      const orderData = {
        id: orderId,
        userId: currentUser?.uid,
        userEmail: currentUser?.email,
        items: cart,
        totalAmount: finalTotal,
        subtotal: totalPrice,
        shippingCost: shippingCost,
        shippingMethod: selectedShippingOption,
        paymentMethod: selectedPaymentMethod,
        paymentStatus: 'pending',
        orderStatus: 'processing',
        shippingDetails: {
          fullName: data.fullName,
          email: data.email,
          phone: data.phone,
          address: data.address,
          city: data.city,
          state: data.state,
          postalCode: data.postalCode,
          country: data.country
        },
        createdAt: Timestamp.now()
      };

      await setDoc(doc(collection(db, 'orders'), orderId), orderData);
      
      setCurrentOrderId(orderId);
      setCurrentTotalAmount(finalTotal);
      setCustomerDetails({
        name: data.fullName,
        email: data.email,
        phone: data.phone
      });

      // Manejar diferentes métodos de pago
      if (selectedPaymentMethod === 'bank-transfer') {
        setShowBankDetails(true);
      } else if (selectedPaymentMethod === 'mercadopago') {
        setShowMercadoPagoButton(true);
      }
      
      clearCart();
      addToast('Orden creada exitosamente', 'success');
    } catch (error) {
      console.error('Error creating order:', error);
      addToast('Error al crear la orden', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMercadoPagoSuccess = (paymentId: string) => {
    addToast('Pago procesado exitosamente', 'success');
    setTimeout(() => {
      navigate(`/order-confirmation/${currentOrderId}`);
    }, 1000);
  };

  const handleMercadoPagoError = (error: string) => {
    addToast(`Error en el pago: ${error}`, 'error');
    setShowMercadoPagoButton(false);
  };

  if (cart.length === 0 && !showBankDetails && !showMercadoPagoButton) {
    navigate('/cart');
    return null;
  }

  if (configLoading) {
    return (
      <div className="container mx-auto px-4 py-24">
        <div className="max-w-3xl mx-auto text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando opciones de envío...</p>
        </div>
      </div>
    );
  }

  const enabledShippingOptions = siteConfig?.shippingOptions?.filter(option => option.enabled) || [];
  const enabledPaymentMethods = siteConfig?.paymentMethods?.filter(method => method.enabled) || [];

  // Si se está mostrando el botón de MercadoPago, mostrar solo eso
  if (showMercadoPagoButton) {
    return (
      <div className="container mx-auto px-4 py-24">
        <div className="max-w-md mx-auto text-center">
          <h1 className="text-2xl font-bold mb-6">Procesar Pago con MercadoPago</h1>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <MercadoPagoButton
              onSuccess={handleMercadoPagoSuccess}
              onError={handleMercadoPagoError}
              onLoading={setIsLoading}
            />
            <button
              onClick={() => setShowMercadoPagoButton(false)}
              className="w-full mt-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancelar y volver
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-24">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Finalizar Compra</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-[1fr,300px] gap-8">
          <div className="space-y-8">
            {/* Método de Envío */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-6">Método de Envío</h2>
              <div className="space-y-4">
                {enabledShippingOptions.map((option) => (
                  <div
                    key={option.id}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      selectedShippingOption === option.id
                        ? 'border-yellow-500 bg-yellow-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedShippingOption(option.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-full ${
                          selectedShippingOption === option.id ? 'bg-yellow-500' : 'bg-gray-300'
                        }`}>
                          {option.id === 'pickup' ? (
                            <Store className={`w-5 h-5 ${
                              selectedShippingOption === option.id ? 'text-white' : 'text-gray-600'
                            }`} />
                          ) : (
                            <Truck className={`w-5 h-5 ${
                              selectedShippingOption === option.id ? 'text-white' : 'text-gray-600'
                            }`} />
                          )}
                        </div>
                        <div>
                          <h3 className={`font-medium ${
                            selectedShippingOption === option.id ? 'text-yellow-900' : 'text-gray-900'
                          }`}>
                            {option.name}
                          </h3>
                          <p className={`text-sm ${
                            selectedShippingOption === option.id ? 'text-yellow-700' : 'text-gray-600'
                          }`}>
                            {option.description}
                          </p>
                          {option.estimatedDays && (
                            <p className={`text-xs ${
                              selectedShippingOption === option.id ? 'text-yellow-600' : 'text-gray-500'
                            }`}>
                              Tiempo estimado: {option.estimatedDays}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`font-bold text-lg ${
                          selectedShippingOption === option.id ? 'text-yellow-600' : 'text-gray-900'
                        }`}>
                          {option.price === 0 ? 'Gratis' : `$${option.price.toFixed(2)}`}
                        </span>
                        {selectedShippingOption === option.id && (
                          <CheckCircle className="w-5 h-5 text-yellow-500 ml-2" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Método de Pago */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-6">Método de Pago</h2>
              <div className="space-y-4">
                {enabledPaymentMethods.map((method) => (
                  <div
                    key={method.id}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      selectedPaymentMethod === method.id
                        ? 'border-yellow-500 bg-yellow-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedPaymentMethod(method.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-full ${
                          selectedPaymentMethod === method.id ? 'bg-yellow-500' : 'bg-gray-300'
                        }`}>
                          {method.id === 'bank-transfer' ? (
                            <Building2 className={`w-5 h-5 ${
                              selectedPaymentMethod === method.id ? 'text-white' : 'text-gray-600'
                            }`} />
                          ) : (
                            <CreditCard className={`w-5 h-5 ${
                              selectedPaymentMethod === method.id ? 'text-white' : 'text-gray-600'
                            }`} />
                          )}
                        </div>
                        <div>
                          <h3 className={`font-medium ${
                            selectedPaymentMethod === method.id ? 'text-yellow-900' : 'text-gray-900'
                          }`}>
                            {method.name}
                          </h3>
                          <p className={`text-sm ${
                            selectedPaymentMethod === method.id ? 'text-yellow-700' : 'text-gray-600'
                          }`}>
                            {method.description}
                          </p>
                        </div>
                      </div>
                      {selectedPaymentMethod === method.id && (
                        <CheckCircle className="w-5 h-5 text-yellow-500" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Detalles de Envío - Solo mostrar si no es retiro en local */}
            {selectedShippingOption !== 'pickup' && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-6">Detalles de Envío</h2>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nombre Completo
                      </label>
                      <input
                        type="text"
                        {...register('fullName', { required: 'El nombre completo es requerido' })}
                        className="w-full rounded-md border border-gray-300 p-2"
                      />
                      {errors.fullName && (
                        <p className="text-red-500 text-sm mt-1">{errors.fullName.message}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        {...register('email', { 
                          required: 'El email es requerido',
                          pattern: {
                            value: /\S+@\S+\.\S+/,
                            message: 'Email inválido'
                          }
                        })}
                        className="w-full rounded-md border border-gray-300 p-2"
                      />
                      {errors.email && (
                        <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Teléfono
                    </label>
                    <input
                      type="tel"
                      {...register('phone', { required: 'El teléfono es requerido' })}
                      className="w-full rounded-md border border-gray-300 p-2"
                    />
                    {errors.phone && (
                      <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Dirección
                    </label>
                    <input
                      type="text"
                      {...register('address', { required: 'La dirección es requerida' })}
                      className="w-full rounded-md border border-gray-300 p-2"
                    />
                    {errors.address && (
                      <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ciudad
                      </label>
                      <input
                        type="text"
                        {...register('city', { required: 'La ciudad es requerida' })}
                        className="w-full rounded-md border border-gray-300 p-2"
                      />
                      {errors.city && (
                        <p className="text-red-500 text-sm mt-1">{errors.city.message}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Provincia
                      </label>
                      <input
                        type="text"
                        {...register('state', { required: 'La provincia es requerida' })}
                        className="w-full rounded-md border border-gray-300 p-2"
                      />
                      {errors.state && (
                        <p className="text-red-500 text-sm mt-1">{errors.state.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Código Postal
                      </label>
                      <input
                        type="text"
                        {...register('postalCode', { required: 'El código postal es requerido' })}
                        className="w-full rounded-md border border-gray-300 p-2"
                      />
                      {errors.postalCode && (
                        <p className="text-red-500 text-sm mt-1">{errors.postalCode.message}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        País
                      </label>
                      <select
                        {...register('country', { required: 'El país es requerido' })}
                        className="w-full rounded-md border border-gray-300 p-2"
                      >
                        <option value="Argentina">Argentina</option>
                      </select>
                      {errors.country && (
                        <p className="text-red-500 text-sm mt-1">{errors.country.message}</p>
                      )}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || !selectedShippingOption || !selectedPaymentMethod}
                    className="w-full py-3 bg-yellow-400 text-white rounded-md hover:bg-yellow-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Procesando...' : 
                     !selectedShippingOption ? 'Selecciona método de envío' :
                     !selectedPaymentMethod ? 'Selecciona método de pago' :
                     'Completar Compra'}
                  </button>
                </form>
              </div>
            )}

            {/* Formulario para retiro en local */}
            {selectedShippingOption === 'pickup' && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-6">Información de Contacto</h2>
                <div className="mb-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <h3 className="font-medium text-yellow-900 mb-2">Información del Local</h3>
                  <p className="text-yellow-800 text-sm mb-2">
                    <strong>Dirección:</strong> {siteConfig?.storeAddress}
                  </p>
                  <p className="text-yellow-800 text-sm mb-2">
                    <strong>Teléfono:</strong> {siteConfig?.storePhone}
                  </p>
                  <p className="text-yellow-800 text-sm mb-2">
                    <strong>Horarios:</strong> {siteConfig?.storeHours}
                  </p>
                  <p className="text-yellow-800 text-sm font-medium">
                    ⚠️ IMPORTANTE: Para retirar tu compra avísanos por WhatsApp
                  </p>
                </div>
                
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nombre Completo
                      </label>
                      <input
                        type="text"
                        {...register('fullName', { required: 'El nombre completo es requerido' })}
                        className="w-full rounded-md border border-gray-300 p-2"
                      />
                      {errors.fullName && (
                        <p className="text-red-500 text-sm mt-1">{errors.fullName.message}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        {...register('email', { 
                          required: 'El email es requerido',
                          pattern: {
                            value: /\S+@\S+\.\S+/,
                            message: 'Email inválido'
                          }
                        })}
                        className="w-full rounded-md border border-gray-300 p-2"
                      />
                      {errors.email && (
                        <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Teléfono
                    </label>
                    <input
                      type="tel"
                      {...register('phone', { required: 'El teléfono es requerido' })}
                      className="w-full rounded-md border border-gray-300 p-2"
                    />
                    {errors.phone && (
                      <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || !selectedPaymentMethod}
                    className="w-full py-3 bg-yellow-400 text-white rounded-md hover:bg-yellow-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Procesando...' : 
                     !selectedPaymentMethod ? 'Selecciona método de pago' :
                     'Completar Compra'}
                  </button>
                </form>
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 h-fit">
            <h2 className="text-xl font-semibold mb-6">Resumen del Pedido</h2>
            
            <div className="space-y-4">
              {cart.map(item => (
                <div key={item.id} className="flex items-center space-x-4">
                  <div className="h-16 w-16 flex-shrink-0">
                    <img 
                      src={item.image} 
                      alt={item.name}
                      className="h-full w-full object-cover rounded"
                    />
                  </div>
                  <div className="flex-grow">
                    <h3 className="text-sm font-medium">{item.name}</h3>
                    {item.selectedFlavor && (
                      <p className="text-sm text-gray-500">Sabor: {item.selectedFlavor}</p>
                    )}
                    <p className="text-sm text-gray-500">Cantidad: {item.quantity}</p>
                  </div>
                  <div className="text-sm font-medium">
                    ${(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
              
              <div className="border-t pt-4 mt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">${totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm mt-2">
                  <span className="text-gray-600">Envío</span>
                  <span className="font-medium">
                    {selectedOption ? (selectedOption.price === 0 ? 'Gratis' : `$${selectedOption.price.toFixed(2)}`) : 'Por seleccionar'}
                  </span>
                </div>
                <div className="flex justify-between text-sm mt-2">
                  <span className="text-gray-600">Método de Pago</span>
                  <span className="font-medium">
                    {selectedPaymentMethod ? 
                      enabledPaymentMethods.find(m => m.id === selectedPaymentMethod)?.name : 
                      'Por seleccionar'}
                  </span>
                </div>
                <div className="flex justify-between text-lg font-bold mt-4">
                  <span>Total</span>
                  <span>${finalTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <BankDetailsModal
        isOpen={showBankDetails}
        onClose={() => {
          setShowBankDetails(false);
          setTimeout(() => {
            navigate(`/order-confirmation/${currentOrderId}`);
          }, 100);
        }}
        orderId={currentOrderId}
        totalAmount={currentTotalAmount}
        customerDetails={customerDetails}
      />
    </div>
  );
};

export default CheckoutPage;