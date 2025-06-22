import React, { useState, useEffect } from 'react';
import { Search, Package, Truck, CheckCircle, Clock, ExternalLink, Mail, Building, AlertCircle, Calendar, MapPin, Phone } from 'lucide-react';
import { collection, query, where, getDocs, doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase/config';

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
  orderStatus: 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: any;
  shippedAt?: any;
  deliveredAt?: any;
  shippingDetails?: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  trackingNumber?: string;
}

const TrackOrderPage: React.FC = () => {
  const [orderNumber, setOrderNumber] = useState('');
  const [email, setEmail] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [shippingType, setShippingType] = useState<'own' | 'correo'>('own');
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'processing':
        return {
          title: 'En Procesamiento',
          description: 'Tu pedido está siendo preparado',
          icon: Package,
          color: 'text-blue-600',
          bgColor: 'bg-blue-100',
          iconColor: 'text-blue-600'
        };
      case 'shipped':
        return {
          title: 'Enviado',
          description: 'Tu pedido está en camino',
          icon: Truck,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-100',
          iconColor: 'text-yellow-600'
        };
      case 'delivered':
        return {
          title: 'Entregado',
          description: 'Tu pedido ha sido entregado',
          icon: CheckCircle,
          color: 'text-green-600',
          bgColor: 'bg-green-100',
          iconColor: 'text-green-600'
        };
      case 'cancelled':
        return {
          title: 'Cancelado',
          description: 'Tu pedido ha sido cancelado',
          icon: AlertCircle,
          color: 'text-red-600',
          bgColor: 'bg-red-100',
          iconColor: 'text-red-600'
        };
      default:
        return {
          title: 'Desconocido',
          description: 'Estado no disponible',
          icon: Clock,
          color: 'text-gray-600',
          bgColor: 'bg-gray-100',
          iconColor: 'text-gray-600'
        };
    }
  };

  const getStatusSteps = (currentStatus: string) => {
    const steps = [
      { status: 'processing', title: 'Procesando', description: 'Preparando tu pedido' },
      { status: 'shipped', title: 'Enviado', description: 'En camino a tu dirección' },
      { status: 'delivered', title: 'Entregado', description: 'Recibido en tu domicilio' }
    ];

    return steps.map((step, index) => {
      const isCompleted = steps.findIndex(s => s.status === currentStatus) >= index;
      const isCurrent = step.status === currentStatus;
      
      return {
        ...step,
        isCompleted,
        isCurrent
      };
    });
  };

  const handleTrackOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (shippingType === 'correo') {
      window.open('https://www.correoargentino.com.ar/formularios/e-commerce', '_blank');
      return;
    }
    
    if (!orderNumber || !email) {
      setError('Por favor completa todos los campos');
      return;
    }
    
    setIsSearching(true);
    setError(null);
    setOrder(null);

    try {
      // Buscar la orden por ID y email
      const ordersRef = collection(db, 'orders');
      const q = query(
        ordersRef,
        where('userEmail', '==', email.toLowerCase())
      );
      
      const querySnapshot = await getDocs(q);
      let foundOrder: Order | null = null;

      querySnapshot.forEach((doc) => {
        const orderData = doc.data() as Order;
        // Verificar si el ID de la orden coincide (puede ser el ID completo o parcial)
        if (doc.id === orderNumber || doc.id.includes(orderNumber) || orderNumber.includes(doc.id)) {
          foundOrder = { ...orderData, id: doc.id };
        }
      });

      if (foundOrder) {
        setOrder(foundOrder);
      } else {
        setError('No se encontró ninguna orden con esos datos. Verifica el número de pedido y el email.');
      }
    } catch (err) {
      console.error('Error buscando orden:', err);
      setError('Error al buscar la orden. Intenta nuevamente.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleCorreoRedirect = () => {
    window.open('https://www.correoargentino.com.ar/formularios/e-commerce', '_blank');
  };

  const formatDate = (date: any) => {
    if (!date) return 'No disponible';
    try {
      const d = date.toDate ? date.toDate() : new Date(date);
      if (isNaN(d.getTime())) return 'Fecha inválida';
      return d.toLocaleDateString('es-AR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Fecha inválida';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Seguimiento de Pedido</h1>
            <p className="text-gray-600">
              Elige el tipo de envío y rastrea el estado de tu pedido
            </p>
          </div>

          {/* Shipping Type Selector */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Tipo de Envío</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Own Shipping Option */}
              <button
                type="button"
                onClick={() => setShippingType('own')}
                className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                  shippingType === 'own'
                    ? 'border-yellow-400 bg-yellow-50 shadow-md'
                    : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${
                    shippingType === 'own' ? 'bg-yellow-400' : 'bg-gray-300'
                  }`}>
                    <Building className={`w-5 h-5 ${
                      shippingType === 'own' ? 'text-white' : 'text-gray-600'
                    }`} />
                  </div>
                  <div className="text-left">
                    <h3 className={`font-medium ${
                      shippingType === 'own' ? 'text-yellow-900' : 'text-gray-900'
                    }`}>
                      Envío Propio
                    </h3>
                    <p className={`text-sm ${
                      shippingType === 'own' ? 'text-yellow-700' : 'text-gray-600'
                    }`}>
                      Seguimiento con nuestro código
                    </p>
                  </div>
                </div>
              </button>

              {/* Correo Argentino Option */}
              <button
                type="button"
                onClick={() => setShippingType('correo')}
                className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                  shippingType === 'correo'
                    ? 'border-yellow-400 bg-yellow-50 shadow-md'
                    : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${
                    shippingType === 'correo' ? 'bg-yellow-400' : 'bg-gray-300'
                  }`}>
                    <Mail className={`w-5 h-5 ${
                      shippingType === 'correo' ? 'text-white' : 'text-gray-600'
                    }`} />
                  </div>
                  <div className="text-left">
                    <h3 className={`font-medium ${
                      shippingType === 'correo' ? 'text-yellow-900' : 'text-gray-900'
                    }`}>
                      Correo Argentino
                    </h3>
                    <p className={`text-sm ${
                      shippingType === 'correo' ? 'text-yellow-700' : 'text-gray-600'
                    }`}>
                      Seguimiento oficial
                    </p>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Search Form - Only show for own shipping */}
          {shippingType === 'own' && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Seguimiento de Envío Propio</h2>
              <form onSubmit={handleTrackOrder} className="space-y-4">
                <div>
                  <label htmlFor="orderNumber" className="block text-sm font-medium text-gray-700 mb-2">
                    Número de Pedido
                  </label>
                  <input
                    type="text"
                    id="orderNumber"
                    value={orderNumber}
                    onChange={(e) => setOrderNumber(e.target.value)}
                    placeholder="Ej: 4c1d3d73-4ca0-405a-a6a0-07fa5b692936"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Correo Electrónico
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@email.com"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                    required
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={isSearching}
                  className="w-full bg-yellow-400 text-white py-3 px-6 rounded-lg font-medium hover:bg-yellow-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSearching ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Buscando...
                    </>
                  ) : (
                    <>
                      <Search size={20} />
                      Rastrear Pedido
                    </>
                  )}
                </button>
              </form>

              {/* Error Message */}
              {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <p className="text-red-800">{error}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Order Results */}
          {order && order.items && order.items.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-2">Pedido #{order.id}</h2>
                <p className="text-gray-600">Creado el {formatDate(order.createdAt)}</p>
              </div>

              {/* Order Status */}
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-4">
                  {(() => {
                    const statusInfo = getStatusInfo(order.orderStatus || 'processing');
                    const IconComponent = statusInfo.icon;
                    return (
                      <>
                        <div className={`p-3 rounded-full ${statusInfo.bgColor}`}>
                          <IconComponent className={`w-6 h-6 ${statusInfo.iconColor}`} />
                        </div>
                        <div>
                          <h3 className={`text-lg font-semibold ${statusInfo.color}`}>
                            {statusInfo.title}
                          </h3>
                          <p className="text-gray-600">{statusInfo.description}</p>
                        </div>
                      </>
                    );
                  })()}
                </div>

                {/* Status Timeline */}
                <div className="space-y-4">
                  {getStatusSteps(order.orderStatus || 'processing').map((step, index) => (
                    <div key={step.status} className="flex items-center gap-4">
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                        step.isCompleted 
                          ? 'bg-green-500 text-white' 
                          : step.isCurrent 
                            ? 'bg-yellow-500 text-white'
                            : 'bg-gray-300 text-gray-600'
                      }`}>
                        {step.isCompleted ? (
                          <CheckCircle className="w-5 h-5" />
                        ) : (
                          <span className="text-sm font-medium">{index + 1}</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className={`font-medium ${
                          step.isCompleted ? 'text-green-600' : 
                          step.isCurrent ? 'text-yellow-600' : 'text-gray-500'
                        }`}>
                          {step.title}
                        </h4>
                        <p className="text-sm text-gray-600">{step.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Details */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Order Items */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Productos</h3>
                  <div className="space-y-3">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <img 
                          src={item.image || 'https://via.placeholder.com/100x100?text=Producto'} 
                          alt={item.name || 'Producto'}
                          className="w-12 h-12 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{item.name || 'Producto sin nombre'}</p>
                          {item.selectedFlavor && (
                            <p className="text-sm text-gray-600">Sabor: <span className="font-medium">{item.selectedFlavor}</span></p>
                          )}
                          <p className="text-sm text-gray-600">Cantidad: {item.quantity || 1}</p>
                        </div>
                        <p className="font-semibold text-yellow-600">${(item.price || 0).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                  <div className="border-t pt-4 mt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-gray-900">Total:</span>
                      <span className="text-2xl font-bold text-yellow-600">${(order.totalAmount || 0).toFixed(2)}</span>
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

                {/* Shipping Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Información de Envío</h3>
                  {order.shippingDetails ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        <div>
                          <p className="font-medium">{order.shippingDetails.fullName || 'Sin nombre'}</p>
                          <p className="text-sm text-gray-600">{order.shippingDetails.address || 'Sin dirección'}</p>
                          <p className="text-sm text-gray-600">{order.shippingDetails.city || 'Sin ciudad'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-500" />
                        <p className="text-gray-600">{order.shippingDetails.phone || 'Sin teléfono'}</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-600">Información de envío no disponible</p>
                  )}

                  {/* Tracking Number */}
                  {order.trackingNumber && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-1">Número de Seguimiento</h4>
                      <p className="text-blue-800 font-mono">{order.trackingNumber}</p>
                    </div>
                  )}

                  {/* Important Dates */}
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">
                        Creado: {formatDate(order.createdAt)}
                      </span>
                    </div>
                    {order.shippedAt && (
                      <div className="flex items-center gap-2">
                        <Truck className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">
                          Enviado: {formatDate(order.shippedAt)}
                        </span>
                      </div>
                    )}
                    {order.deliveredAt && (
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">
                          Entregado: {formatDate(order.deliveredAt)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Correo Argentino Redirect */}
          {shippingType === 'correo' && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Seguimiento de Correo Argentino</h2>
              <div className="text-center space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <Mail className="w-12 h-12 text-blue-500 mx-auto mb-3" />
                  <h3 className="text-lg font-medium text-blue-900 mb-2">
                    Redirigiendo a Correo Argentino
                  </h3>
                  <p className="text-blue-700 mb-4">
                    Serás redirigido al sitio oficial de Correo Argentino para realizar el seguimiento de tu envío.
                  </p>
                  <button
                    onClick={handleCorreoRedirect}
                    className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 mx-auto"
                  >
                    <ExternalLink size={20} />
                    Ir a Correo Argentino
                  </button>
                </div>
                
                <div className="text-sm text-gray-600">
                  <p>Alternativamente, puedes:</p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Llamar al 0810-333-4000</li>
                    <li>Enviar un WhatsApp al 11-2345-6789</li>
                    <li>Consultar en cualquier sucursal de Correo Argentino</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrackOrderPage; 