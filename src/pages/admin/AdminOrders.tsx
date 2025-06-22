import React, { useState, useEffect } from 'react';
import { 
  collection, 
  getDocs, 
  getDoc,
  doc, 
  updateDoc, 
  query, 
  orderBy, 
  where, 
  Timestamp, 
  startAfter,
  QueryDocumentSnapshot,
  DocumentData,
  limit
} from 'firebase/firestore';
import { 
  Eye, 
  Package, 
  Truck, 
  CheckCircle, 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  Filter,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { db } from '../../firebase/config';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';

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
  createdAt: any; // Timestamp or Date
}

const ORDERS_PER_PAGE = 10;

const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [firstVisible, setFirstVisible] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [updatingOrder, setUpdatingOrder] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addToast } = useToast();
  const { currentUser, isAdmin } = useAuth();

  const loadOrders = async (isNextPage = false, isPrevPage = false, forceRefresh = false) => {
    try {
      if (forceRefresh) {
        setRefreshing(true);
      } else {
        setIsLoading(true);
      }
      
      setError(null);
      
      // Get all orders without complex queries to avoid index issues
      const ordersSnapshot = await getDocs(collection(db, 'orders'));
      
      if (!ordersSnapshot.empty) {
        let ordersList = ordersSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            userId: data.userId || '',
            userEmail: data.userEmail || data.shippingDetails?.email || '',
            items: data.items || [],
            totalAmount: data.totalAmount || 0,
            shippingDetails: {
              fullName: data.shippingDetails?.fullName || '',
              email: data.shippingDetails?.email || '',
              phone: data.shippingDetails?.phone || '',
              address: data.shippingDetails?.address || '',
              city: data.shippingDetails?.city || '',
              state: data.shippingDetails?.state || '',
              postalCode: data.shippingDetails?.postalCode || '',
              country: data.shippingDetails?.country || ''
            },
            paymentMethod: data.paymentMethod || '',
            paymentStatus: data.paymentStatus || 'pending',
            orderStatus: data.orderStatus || 'processing',
            createdAt: data.createdAt || new Date()
          };
        }) as Order[];
        
        // Apply filters in memory
        if (filterStatus) {
          ordersList = ordersList.filter(order => order.orderStatus === filterStatus);
        }
        
        // Sort by creation date (newest first)
        ordersList.sort((a, b) => {
          const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
          const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
          return dateB.getTime() - dateA.getTime();
        });
        
        setOrders(ordersList);
        setTotalPages(Math.ceil(ordersList.length / ORDERS_PER_PAGE));
      } else {
        setOrders([]);
        setCurrentPage(1);
        setTotalPages(1);
      }
    } catch (error) {
      console.error('Error loading orders:', error);
      setError('Error al cargar las órdenes');
      addToast('Error al cargar las órdenes', 'error');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (currentUser && isAdmin) {
      loadOrders();
      setCurrentPage(1);
    }
  }, [filterStatus, currentUser, isAdmin]);

  const openOrderDetail = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailOpen(true);
  };

  const closeOrderDetail = () => {
    setIsDetailOpen(false);
    setSelectedOrder(null);
  };

  const refreshOrders = () => {
    loadOrders(false, false, true);
    setCurrentPage(1);
  };

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (searchTerm) {
      const filteredOrders = orders.filter(order => 
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order.shippingDetails.fullName && 
          order.shippingDetails.fullName.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setOrders(filteredOrders);
    } else {
      loadOrders();
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      setUpdatingOrder(orderId);
      
      console.log(`Updating order ${orderId} to status: ${newStatus}`);

      // First, check if the order exists
      const orderRef = doc(db, 'orders', orderId);
      const orderSnap = await getDoc(orderRef);

      if (!orderSnap.exists()) {
        console.error('Order does not exist:', orderId);
        addToast('La orden no existe o fue eliminada.', 'error');
        return;
      }

      console.log('Order exists, updating status...');

      // Update the order status
      await updateDoc(orderRef, {
        orderStatus: newStatus,
        updatedAt: Timestamp.now()
      });

      // Update local state
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId 
            ? { ...order, orderStatus: newStatus }
            : order
        )
      );

      // Update selected order if it's the one being updated
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(prev => prev ? { ...prev, orderStatus: newStatus } : null);
      }

      addToast(`Estado de la orden actualizado a: ${getStatusText(newStatus)}`, 'success');
      
    } catch (error) {
      console.error('Error updating order status:', error);
      addToast('Error al actualizar el estado de la orden', 'error');
    } finally {
      setUpdatingOrder(null);
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
      case 'cancelled':
        return 'Cancelado';
      default:
        return status;
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
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'processing':
        return <Package size={16} />;
      case 'shipped':
        return <Truck size={16} />;
      case 'delivered':
        return <CheckCircle size={16} />;
      case 'cancelled':
        return <AlertCircle size={16} />;
      default:
        return <Package size={16} />;
    }
  };

  const formatDate = (date: any) => {
    if (!date) return 'N/A';
    
    try {
      const dateObj = date.toDate ? date.toDate() : new Date(date);
      return dateObj.toLocaleDateString('es-ES', {
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

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(price);
  };

  const OrderDetailModal = () => {
    if (!selectedOrder) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Orden #{selectedOrder.id}</h2>
                <p className="text-gray-600">Fecha: {formatDate(selectedOrder.createdAt)}</p>
              </div>
              <button
                onClick={closeOrderDetail}
                className="text-gray-400 hover:text-gray-600"
              >
                <ChevronDown size={24} />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Información de la Orden */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-3">Información de la Orden</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Fecha:</span> {formatDate(selectedOrder.createdAt)}</p>
                  <p><span className="font-medium">Método de Pago:</span> {selectedOrder.paymentMethod}</p>
                  <p><span className="font-medium">Estado de Pago:</span> {selectedOrder.paymentStatus}</p>
                  <p><span className="font-medium">Monto Total:</span> {formatPrice(selectedOrder.totalAmount)}</p>
                </div>
              </div>

              {/* Información del Cliente */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-3">Información del Cliente</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Nombre:</span> {selectedOrder.shippingDetails.fullName}</p>
                  <p><span className="font-medium">Email:</span> {selectedOrder.userEmail}</p>
                  <p><span className="font-medium">Dirección:</span> {selectedOrder.shippingDetails.address}</p>
                  <p><span className="font-medium">Ciudad/Estado:</span> {selectedOrder.shippingDetails.city}, {selectedOrder.shippingDetails.state} {selectedOrder.shippingDetails.postalCode}</p>
                  <p><span className="font-medium">País:</span> {selectedOrder.shippingDetails.country}</p>
                </div>
              </div>
            </div>

            {/* Estado de la Orden */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Estado de la Orden</h3>
              <div className="flex flex-wrap gap-2">
                {['processing', 'shipped', 'delivered'].map((status) => (
                  <button
                    key={status}
                    onClick={() => updateOrderStatus(selectedOrder.id, status)}
                    disabled={updatingOrder === selectedOrder.id}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      selectedOrder.orderStatus === status
                        ? 'bg-yellow-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    } ${updatingOrder === selectedOrder.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {updatingOrder === selectedOrder.id && selectedOrder.orderStatus === status ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mx-auto"></div>
                    ) : (
                      getStatusText(status)
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Productos de la Orden */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Productos de la Orden</h3>
              <div className="space-y-3">
                {selectedOrder.items.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <img 
                        src={item.image} 
                        alt={item.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                      <div>
                        <p className="font-medium">{item.name}</p>
                        {item.selectedFlavor && (
                          <p className="text-sm text-gray-600">Sabor: {item.selectedFlavor}</p>
                        )}
                        <p className="text-sm text-gray-600">Cantidad: {item.quantity} × {formatPrice(item.price)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Total</span>
                  <span className="text-lg font-bold text-yellow-600">{formatPrice(selectedOrder.totalAmount)}</span>
                </div>
                {selectedOrder.shippingMethod && (
                  <div className="mt-2 text-sm text-gray-600">
                    <p>Método de envío: <span className="font-medium">{selectedOrder.shippingMethod === 'pickup' ? 'Retiro en Local' : 'Envío a Domicilio'}</span></p>
                    {selectedOrder.shippingCost !== undefined && (
                      <p>Costo de envío: <span className="font-medium">{formatPrice(selectedOrder.shippingCost)}</span></p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Paginate orders
  const paginatedOrders = orders.slice(
    (currentPage - 1) * ORDERS_PER_PAGE,
    currentPage * ORDERS_PER_PAGE
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl font-bold">Órdenes</h1>
        <button
          onClick={refreshOrders}
          disabled={refreshing}
          className="inline-flex items-center px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors disabled:opacity-50"
        >
          <RefreshCw size={16} className={`mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Actualizando...' : 'Actualizar'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle size={20} className="text-red-500 mr-2" />
            <span className="text-red-700">{error}</span>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {/* Búsqueda y Filtros */}
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex flex-col md:flex-row gap-4">
            <form onSubmit={handleSearch} className="flex-grow">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar por ID de orden, email o nombre..."
                  className="w-full rounded-md border border-gray-300 pl-10 pr-4 py-2 focus:outline-none focus:ring-1 focus:ring-yellow-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <Search size={18} />
                </div>
              </div>
            </form>
            
            <div className="w-full md:w-48">
              <div className="relative">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="appearance-none w-full rounded-md border border-gray-300 pl-10 pr-4 py-2 focus:outline-none focus:ring-1 focus:ring-yellow-500"
                >
                  <option value="">Todos los Estados</option>
                  <option value="processing">Procesando</option>
                  <option value="shipped">Enviado</option>
                  <option value="delivered">Entregado</option>
                  <option value="cancelled">Cancelado</option>
                </select>
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <Filter size={18} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabla de Órdenes */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Orden
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                Array.from({ length: 3 }).map((_, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="w-24 h-4 bg-gray-200 rounded animate-pulse"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="w-32 h-4 bg-gray-200 rounded animate-pulse"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="w-20 h-4 bg-gray-200 rounded animate-pulse"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="w-24 h-4 bg-gray-200 rounded animate-pulse"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="w-28 h-4 bg-gray-200 rounded animate-pulse"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="w-20 h-8 bg-gray-200 rounded animate-pulse ml-auto"></div>
                    </td>
                  </tr>
                ))
              ) : paginatedOrders.length > 0 ? (
                paginatedOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">#{order.id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{order.shippingDetails.fullName}</div>
                        <div className="text-sm text-gray-500">{order.userEmail}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{formatPrice(order.totalAmount)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.orderStatus)}`}>
                        {getStatusIcon(order.orderStatus)}
                        <span className="ml-1">{getStatusText(order.orderStatus)}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => openOrderDetail(order)}
                        className="text-yellow-600 hover:text-yellow-900"
                      >
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                    No se encontraron órdenes
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="px-6 py-3 flex items-center justify-between border-t border-gray-200">
            <div className="text-sm text-gray-500">
              Página {currentPage} de {totalPages}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={prevPage}
                disabled={currentPage === 1 || isLoading}
                className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                <ChevronLeft size={16} className="mr-1" />
                Anterior
              </button>
              <button
                onClick={nextPage}
                disabled={currentPage === totalPages || isLoading}
                className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Siguiente
                <ChevronRight size={16} className="ml-1" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Detalle */}
      {isDetailOpen && <OrderDetailModal />}
    </div>
  );
};

export default AdminOrders;