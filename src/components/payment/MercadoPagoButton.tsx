import React, { useEffect, useState } from 'react';
import { initMercadoPago } from '@mercadopago/sdk-react';
import { mercadopagoService } from '../../services/mercadopago';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';

interface MercadoPagoButtonProps {
  onSuccess?: (paymentId: string) => void;
  onError?: (error: string) => void;
  onLoading?: (loading: boolean) => void;
}

const MercadoPagoButton: React.FC<MercadoPagoButtonProps> = ({
  onSuccess,
  onError,
  onLoading
}) => {
  const { cart, totalPrice, clearCart } = useCart();
  const { currentUser } = useAuth();
  const { addToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Inicializar MercadoPago
    initMercadoPago(mercadopagoService.getPublicKey());
  }, []);

  const createPreference = async () => {
    if (!currentUser) {
      addToast('Debes iniciar sesión para continuar', 'error');
      return;
    }

    if (cart.length === 0) {
      addToast('El carrito está vacío', 'error');
      return;
    }

    setIsLoading(true);
    onLoading?.(true);

    try {
      // Crear orden en Firestore primero
      const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const orderData = {
        id: orderId,
        userId: currentUser.uid,
        userEmail: currentUser.email,
        userName: currentUser.displayName || currentUser.email,
        items: cart.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          flavor: item.selectedFlavor,
          image: item.image
        })),
        total: totalPrice,
        status: 'pending',
        paymentMethod: 'mercadopago',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Guardar orden en Firestore
      await setDoc(doc(db, 'orders', orderId), orderData);

      // Crear preferencia de MercadoPago
      const preference = {
        items: cart.map(item => ({
          id: item.id,
          title: `${item.name}${item.selectedFlavor ? ` - ${item.selectedFlavor}` : ''}`,
          quantity: item.quantity,
          unit_price: item.price,
          currency_id: 'ARS',
          description: item.name,
          picture_url: item.image
        })),
        payer: {
          name: currentUser.displayName || currentUser.email || '',
          email: currentUser.email || '',
        },
        back_urls: {
          success: `${window.location.origin}/order-confirmation/${orderId}`,
          failure: `${window.location.origin}/order-confirmation/${orderId}?status=failed`,
          pending: `${window.location.origin}/order-confirmation/${orderId}?status=pending`,
        },
        auto_return: 'approved' as const,
        external_reference: orderId,
        expires: true,
        expiration_date_to: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutos
      };

      const response = await mercadopagoService.createPreference(preference);
      
      // Redirigir al usuario a MercadoPago
      const initPoint = mercadopagoService.isTestMode() ? response.sandbox_init_point : response.init_point;
      window.location.href = initPoint;
      
      addToast('Redirigiendo a MercadoPago...', 'success');
    } catch (error) {
      console.error('Error creating preference:', error);
      addToast('Error al crear la preferencia de pago', 'error');
      onError?.('Error al crear la preferencia de pago');
    } finally {
      setIsLoading(false);
      onLoading?.(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Creando preferencia de pago...</span>
      </div>
    );
  }

  return (
    <button
      onClick={createPreference}
      disabled={isLoading || cart.length === 0}
      className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center"
    >
      <svg className="w-6 h-6 mr-2" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
      </svg>
      Pagar con MercadoPago
    </button>
  );
};

export default MercadoPagoButton; 