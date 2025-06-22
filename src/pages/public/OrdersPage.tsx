import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { Package, Calendar, DollarSign, Truck, CheckCircle, AlertCircle } from 'lucide-react';
import { db } from '../../firebase/config';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';

interface Order {
  id: string;
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
  }>;
  totalAmount: number;
  orderStatus: string;
  paymentStatus: string;
  createdAt: any;
  shippingDetails: {
    fullName: string;
    address: string;
    city: string;
    state: string;
  };
}

const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useAuth();
  const { addToast } = useToast();

  useEffect(() => {
    const fetchOrders = async () => {
      if (!currentUser) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        
        console.log('Fetching orders for user:', currentUser.uid);
        
        // Get all orders for this user
        const ordersQuery = query(
          collection(db, 'orders'),
          where('userId', '==', currentUser.uid)
        );

        const querySnapshot = await getDocs(ordersQuery);
        
        if (querySnapshot.empty) {
          console.log('No orders found for user:', currentUser.uid);
          setOrders([]);
        } else {
          const ordersList = querySnapshot.docs.map(doc => {
            const data = doc.data();
            console.log('Order data:', data);
            return {
              id: doc.id,
              ...data,
              // Ensure createdAt is properly handled
              createdAt: data.createdAt || { toDate: () => new Date() }
            };
          }) as Order[];

          // Sort by creation date (newest first)
          ordersList.sort((a, b) => {
            const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
            const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
            return dateB.getTime() - dateA.getTime();
          });

          console.log('Orders loaded:', ordersList);
          setOrders(ordersList);
        }
      } catch (error: any) {
        console.error('Error fetching orders:', error);
        setError(error.message || 'Error al cargar los pedidos');
        addToast('Error al cargar los pedidos', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [currentUser, addToast]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'processing':
        return <Package size={16} className="text-yellow-600" />;
      case 'shipped':
        return <Truck size={16} className="text-blue-600" />;
      case 'delivered':
        return <CheckCircle size={16} className="text-green-600" />;
      default:
        return <Package size={16} className="text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'shipped':
        return 'bg-blue-100 text-blue-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'processing':
        return 'Procesando';
      case 'shipped':
        return 'Enviado';
      case 'delivered':
        return 'Entregado';
      default:
        return 'Pendiente';
    }
  };

  const formatDate = (dateField: any) => {
    try {
      if (dateField?.toDate) {
        return dateField.toDate().toLocaleDateString('es-ES');
      } else if (dateField instanceof Date) {
        return dateField.toLocaleDateString('es-ES');
      } else if (typeof dateField === 'string') {
        return new Date(dateField).toLocaleDateString('es-ES');
      }
      return 'Fecha no disponible';
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Fecha no disponible';
    }
  };

  if (!currentUser) {
    return (
      <div className="container mx-auto px-4 py-24">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl font-bold mb-8">Mis Pedidos</h1>
          <div className="bg-white rounded-lg shadow-sm p-8">
            <AlertCircle size={48} className="mx-auto text-gray-400 mb-4" />
            <h2 className="text-xl font-medium mb-2">Inicia sesión para ver tus pedidos</h2>
            <p className="text-gray-600 mb-6">
              Necesitas estar autenticado para ver tu historial de pedidos.
            </p>
            <a
              href="/login"
              className="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
            >
              Iniciar Sesión
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-24">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Mis Pedidos</h1>
          <div className="space-y-4">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-24">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Mis Pedidos</h1>
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <AlertCircle size={48} className="mx-auto text-red-400 mb-4" />
            <h2 className="text-xl font-medium mb-2">Error al cargar los pedidos</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
            >
              Intentar de nuevo
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-24">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Mis Pedidos</h1>

        {orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <Package size={48} className="mx-auto text-gray-400 mb-4" />
            <h2 className="text-xl font-medium mb-2">No tienes pedidos aún</h2>
            <p className="text-gray-600 mb-6">
              Cuando realices tu primera compra, aparecerá aquí.
            </p>
            <a
              href="/products"
              className="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
            >
              Explorar Productos
            </a>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div>
                      <h3 className="text-lg font-medium mb-1">
                        Pedido #{order.id.slice(0, 8).toUpperCase()}
                      </h3>
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar size={14} className="mr-1" />
                        {formatDate(order.createdAt)}
                      </div>
                    </div>
                    <div className="mt-4 md:mt-0 flex items-center space-x-4">
                      <div className="flex items-center">
                        <DollarSign size={16} className="text-gray-400 mr-1" />
                        <span className="font-medium">${order.totalAmount?.toFixed(2) || '0.00'}</span>
                      </div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.orderStatus)}`}>
                        {getStatusIcon(order.orderStatus)}
                        <span className="ml-1">{getStatusText(order.orderStatus)}</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <h4 className="font-medium mb-4">Productos</h4>
                  <div className="space-y-3">
                    {order.items?.map((item, index) => (
                      <div key={index} className="flex items-center">
                        <div className="w-12 h-12 rounded overflow-hidden flex-shrink-0">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = 'https://via.placeholder.com/48x48?text=No+Image';
                            }}
                          />
                        </div>
                        <div className="ml-4 flex-grow">
                          <h5 className="text-sm font-medium">{item.name}</h5>
                          <p className="text-xs text-gray-500">
                            Cantidad: {item.quantity} × ${item.price?.toFixed(2) || '0.00'}
                          </p>
                        </div>
                        <div className="text-sm font-medium">
                          ${((item.price || 0) * (item.quantity || 0)).toFixed(2)}
                        </div>
                      </div>
                    )) || (
                      <p className="text-gray-500 text-sm">No hay productos en este pedido</p>
                    )}
                  </div>

                  {order.shippingDetails && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="text-sm text-gray-600">
                        <strong>Dirección de envío:</strong><br />
                        {order.shippingDetails.fullName}<br />
                        {order.shippingDetails.address}<br />
                        {order.shippingDetails.city}, {order.shippingDetails.state}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;