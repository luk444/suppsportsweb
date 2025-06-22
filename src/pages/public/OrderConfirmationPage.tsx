import React, { useState, useEffect } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { CheckCircle, Home, Package, Truck, Calendar, User, AlertCircle } from 'lucide-react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../contexts/AuthContext';
import { mercadopagoService } from '../../services/mercadopago';
import { useToast } from '../../contexts/ToastContext';

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  selectedFlavor?: string;
}

interface Order {
  id: string;
  userId: string;
  userEmail: string;
  items: OrderItem[];
  totalAmount: number;
  subtotal?: number;
  shippingCost?: number;
  shippingMethod?: string;
  shippingDetails: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  createdAt: any;
}

const OrderConfirmationPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const [searchParams] = useSearchParams();
  const { currentUser } = useAuth();
  const { addToast } = useToast();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<string>('pending');

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) return;

      try {
        setIsLoading(true);
        const orderDoc = await getDoc(doc(db, 'orders', orderId));
        
        if (orderDoc.exists()) {
          const orderData = orderDoc.data() as Order;
          
          // Verificar que el usuario actual es el propietario de la orden
          if (currentUser && orderData.userId !== currentUser.uid) {
            setError('No tienes permisos para ver esta orden');
            return;
          }
          
          setOrder(orderData);
          
          // Verificar parámetros de MercadoPago
          const paymentId = searchParams.get('payment_id');
          const status = searchParams.get('status');
          const preferenceId = searchParams.get('preference_id');
          
          if (paymentId && orderData.paymentMethod === 'mercadopago') {
            try {
              // Obtener el estado del pago de MercadoPago
              const paymentData = await mercadopagoService.getPaymentStatus(paymentId);
              const mpStatus = paymentData.status;
              
              // Actualizar el estado del pago en Firestore
              await updateDoc(doc(db, 'orders', orderId), {
                paymentStatus: mpStatus,
                orderStatus: mpStatus === 'approved' ? 'confirmed' : 'pending',
                mercadopagoPaymentId: paymentId,
                updatedAt: new Date()
              });
              
              // Actualizar el estado local
              setPaymentStatus(mpStatus);
              
              if (mpStatus === 'approved') {
                addToast('¡Pago aprobado exitosamente!', 'success');
              } else if (mpStatus === 'rejected') {
                addToast('El pago fue rechazado', 'error');
              } else if (mpStatus === 'pending') {
                addToast('El pago está pendiente de confirmación', 'warning');
              }
            } catch (error) {
              console.error('Error getting payment status:', error);
              addToast('Error al verificar el estado del pago', 'error');
            }
          } else if (status) {
            // Manejar estados de URL de MercadoPago
            setPaymentStatus(status);
            if (status === 'approved') {
              addToast('¡Pago aprobado exitosamente!', 'success');
            } else if (status === 'rejected') {
              addToast('El pago fue rechazado', 'error');
            } else if (status === 'pending') {
              addToast('El pago está pendiente de confirmación', 'warning');
            }
          }
        } else {
          // Si la orden no existe, intentar nuevamente después de un delay
          setTimeout(async () => {
            try {
              const retryDoc = await getDoc(doc(db, 'orders', orderId));
              if (retryDoc.exists()) {
                const orderData = retryDoc.data() as Order;
                if (currentUser && orderData.userId !== currentUser.uid) {
                  setError('No tienes permisos para ver esta orden');
                  return;
                }
                setOrder(orderData);
              } else {
                setError('Orden no encontrada. Es posible que aún se esté procesando.');
              }
            } catch (retryError) {
              console.error('Error en reintento:', retryError);
              setError('Error al cargar la orden. Intenta recargar la página.');
            }
          }, 2000); // Esperar 2 segundos antes de reintentar
        }
      } catch (error) {
        console.error('Error fetching order:', error);
        setError('Error al cargar la orden');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, currentUser, searchParams, addToast]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Procesando tu orden</h2>
          <p className="text-gray-600">Estamos cargando los detalles de tu compra...</p>
          <p className="text-sm text-gray-500 mt-2">Orden #{orderId}</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Error</h1>
          <p className="text-gray-600 mb-6">{error || 'Orden no encontrada'}</p>
          <Link
            to="/"
            className="inline-flex items-center px-6 py-3 bg-yellow-500 text-black font-semibold rounded-xl hover:bg-yellow-600 transition-colors"
          >
            <Home className="mr-2 h-5 w-5" />
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'text-green-600 bg-green-100';
      case 'rejected':
        return 'text-red-600 bg-red-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getPaymentStatusText = (status: string) => {
    switch (status) {
      case 'approved':
        return 'Aprobado';
      case 'rejected':
        return 'Rechazado';
      case 'pending':
        return 'Pendiente';
      default:
        return 'Pendiente';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6 text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
            {paymentStatus === 'approved' ? (
              <CheckCircle className="h-8 w-8 text-green-600" />
            ) : paymentStatus === 'rejected' ? (
              <AlertCircle className="h-8 w-8 text-red-600" />
            ) : (
              <CheckCircle className="h-8 w-8 text-yellow-600" />
            )}
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {paymentStatus === 'approved' ? '¡Orden Confirmada!' : 
             paymentStatus === 'rejected' ? 'Pago Rechazado' : 
             '¡Orden Creada!'}
          </h1>
          <p className="text-gray-600 mb-4">
            {paymentStatus === 'approved' ? 'Gracias por tu compra. Tu número de orden es:' :
             paymentStatus === 'rejected' ? 'Tu orden fue creada pero el pago fue rechazado. Número de orden:' :
             'Tu orden ha sido creada. Número de orden:'}
          </p>
          <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-4 mb-6">
            <p className="text-yellow-800 font-semibold text-lg">{order.id}</p>
          </div>
          
          {/* Estado del pago */}
          {order.paymentMethod === 'mercadopago' && (
            <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium mb-4 ${getPaymentStatusColor(paymentStatus)}`}>
              Estado del pago: {getPaymentStatusText(paymentStatus)}
            </div>
          )}
          
          <p className="text-gray-600">
            {paymentStatus === 'approved' ? 
              'Te hemos enviado un correo electrónico con los detalles de tu compra. Un asesor se pondrá en contacto contigo a través de WhatsApp para coordinar el envío.' :
             paymentStatus === 'rejected' ? 
              'Por favor, intenta realizar el pago nuevamente o contacta con nuestro equipo de soporte.' :
              'Te hemos enviado un correo electrónico con los detalles de tu compra. Un asesor se pondrá en contacto contigo a través de WhatsApp para coordinar el envío.'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Detalles de la Orden */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <Package className="mr-2 h-5 w-5" />
              Productos Pedidos
            </h2>
            <div className="space-y-4">
              {order.items.map((item, index) => (
                <div key={index} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                  <div className="h-16 w-16 flex-shrink-0">
                    <img 
                      src={item.image} 
                      alt={item.name}
                      className="h-full w-full object-cover rounded"
                    />
                  </div>
                  <div className="flex-grow">
                    <h3 className="font-medium text-gray-900">{item.name}</h3>
                    {item.selectedFlavor && (
                      <p className="text-sm text-gray-600">Sabor: <span className="font-medium">{item.selectedFlavor}</span></p>
                    )}
                    <p className="text-sm text-gray-600">Cantidad: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t pt-4 mt-4">
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>${order.totalAmount.toFixed(2)}</span>
              </div>
              {order.shippingMethod && (
                <div className="mt-2 text-sm text-gray-600">
                  <p>Método de envío: <span className="font-medium">{order.shippingMethod === 'pickup' ? 'Retiro en Local' : 'Envío a Domicilio'}</span></p>
                  {order.shippingCost !== undefined && (
                    <p>Costo de envío: <span className="font-medium">${order.shippingCost.toFixed(2)}</span></p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Información de Envío */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <Truck className="mr-2 h-5 w-5" />
                Información de Envío
              </h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Nombre</p>
                  <p className="font-medium">{order.shippingDetails.fullName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium">{order.shippingDetails.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Teléfono</p>
                  <p className="font-medium">{order.shippingDetails.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Dirección</p>
                  <p className="font-medium">{order.shippingDetails.address}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Ciudad</p>
                  <p className="font-medium">{order.shippingDetails.city}, {order.shippingDetails.state}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Código Postal</p>
                  <p className="font-medium">{order.shippingDetails.postalCode}</p>
                </div>
              </div>
            </div>

            {/* Estado de la Orden */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <Calendar className="mr-2 h-5 w-5" />
                Estado de la Orden
              </h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Estado</p>
                  <p className="font-medium capitalize">{order.orderStatus}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Fecha de Creación</p>
                  <p className="font-medium">{formatDate(order.createdAt)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Método de Pago</p>
                  <p className="font-medium capitalize">{order.paymentMethod.replace('-', ' ')}</p>
                </div>
                {order.paymentMethod === 'mercadopago' && (
                  <div>
                    <p className="text-sm text-gray-600">Estado del Pago</p>
                    <p className={`font-medium ${getPaymentStatusColor(paymentStatus)}`}>
                      {getPaymentStatusText(paymentStatus)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Botones de Acción */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mt-6 text-center">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/"
              className="inline-flex items-center px-6 py-3 bg-yellow-500 text-black font-semibold rounded-xl hover:bg-yellow-600 transition-colors"
            >
              <Home className="mr-2 h-5 w-5" />
              Volver al inicio
            </Link>
            <Link
              to="/track-order"
              className="inline-flex items-center px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
            >
              <Truck className="mr-2 h-5 w-5" />
              Seguir mi pedido
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;