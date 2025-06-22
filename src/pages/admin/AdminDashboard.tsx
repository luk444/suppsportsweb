import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShoppingBag, 
  Package, 
  Users, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  ArrowRight,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import { 
  collection, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit, 
  Timestamp 
} from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../contexts/AuthContext';

interface DashboardStats {
  totalOrders: number;
  totalProducts: number;
  totalCustomers: number;
  totalRevenue: number;
  pendingOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
}

interface Order {
  id: string;
  userEmail: string;
  totalAmount: number;
  orderStatus: string;
  paymentStatus: string;
  createdAt: Timestamp;
}

const defaultStats: DashboardStats = {
  totalOrders: 0,
  totalProducts: 0,
  totalCustomers: 0,
  totalRevenue: 0,
  pendingOrders: 0,
  shippedOrders: 0,
  deliveredOrders: 0
};

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>(defaultStats);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentUser, isAdmin } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Fetch products count
      const productsSnapshot = await getDocs(collection(db, 'products'));
      const productsCount = productsSnapshot.size;
      
      // Fetch customers count (users with role 'customer')
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const users = usersSnapshot.docs.map(doc => doc.data());
      const customersCount = users.filter(user => user.role === 'customer').length;
      
      // Fetch orders
      const ordersSnapshot = await getDocs(collection(db, 'orders'));
      const orders = ordersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Order[];
      
      // Calculate statistics
      const totalOrders = orders.length;
      const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
      const pendingOrders = orders.filter(order => order.orderStatus === 'processing').length;
      const shippedOrders = orders.filter(order => order.orderStatus === 'shipped').length;
      const deliveredOrders = orders.filter(order => order.orderStatus === 'delivered').length;
      
      // Get recent orders (sort in memory since we already have all orders)
      const sortedOrders = orders
        .sort((a, b) => {
          const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
          const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
          return dateB.getTime() - dateA.getTime();
        })
        .slice(0, 5);
      
      setStats({
        totalOrders,
        totalProducts: productsCount,
        totalCustomers: customersCount,
        totalRevenue,
        pendingOrders,
        shippedOrders,
        deliveredOrders
      });
      
      setRecentOrders(sortedOrders);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Error al cargar los datos del dashboard');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (currentUser && isAdmin) {
      fetchDashboardData();
    }
  }, [currentUser, isAdmin]);

  const refreshData = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  if (!currentUser || !isAdmin) {
    return (
      <div className="space-y-4 text-center">
        <h2 className="text-xl font-semibold">Acceso Denegado</h2>
        <p>Necesitas permisos de administrador para acceder a esta página.</p>
        <button
          onClick={() => window.location.href = '/login'}
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
        >
          Ir al Login
        </button>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4 text-center">
        <h2 className="text-xl font-semibold">Error</h2>
        <p className="text-red-600">{error}</p>
        <button
          onClick={refreshData}
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <button 
          onClick={refreshData}
          className="flex items-center text-sm font-medium text-primary-600 hover:text-primary-700"
          disabled={refreshing}
        >
          <RefreshCw size={16} className={`mr-1 ${refreshing ? 'animate-spin' : ''}`} />
          Actualizar
        </button>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Total Órdenes</p>
              <h3 className="text-2xl font-bold">{stats.totalOrders}</h3>
            </div>
            <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-600">
              <Package size={24} />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <TrendingUp size={16} className="text-green-500 mr-1" />
            <span className="text-sm text-green-500">+12% del mes pasado</span>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Ingresos Totales</p>
              <h3 className="text-2xl font-bold">${stats.totalRevenue.toFixed(2)}</h3>
            </div>
            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center text-green-600">
              <DollarSign size={24} />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <TrendingUp size={16} className="text-green-500 mr-1" />
            <span className="text-sm text-green-500">+8% del mes pasado</span>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Total Productos</p>
              <h3 className="text-2xl font-bold">{stats.totalProducts}</h3>
            </div>
            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
              <ShoppingBag size={24} />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <TrendingUp size={16} className="text-green-500 mr-1" />
            <span className="text-sm text-green-500">+5% del mes pasado</span>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Total Clientes</p>
              <h3 className="text-2xl font-bold">{stats.totalCustomers}</h3>
            </div>
            <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
              <Users size={24} />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <TrendingUp size={16} className="text-green-500 mr-1" />
            <span className="text-sm text-green-500">+15% del mes pasado</span>
          </div>
        </div>
      </div>
      
      {/* Order Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium">Órdenes Pendientes</h3>
            <div className="h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600">
              <span className="text-sm font-semibold">{stats.pendingOrders}</span>
            </div>
          </div>
          <div className="flex items-center">
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-yellow-400 h-2.5 rounded-full" 
                style={{ 
                  width: `${stats.totalOrders > 0 ? Math.round((stats.pendingOrders / stats.totalOrders) * 100) : 0}%` 
                }}
              ></div>
            </div>
            <span className="ml-2 text-xs text-gray-500">
              {stats.totalOrders > 0 ? Math.round((stats.pendingOrders / stats.totalOrders) * 100) : 0}%
            </span>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium">Órdenes Enviadas</h3>
            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
              <span className="text-sm font-semibold">{stats.shippedOrders}</span>
            </div>
          </div>
          <div className="flex items-center">
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-blue-500 h-2.5 rounded-full" 
                style={{ 
                  width: `${stats.totalOrders > 0 ? Math.round((stats.shippedOrders / stats.totalOrders) * 100) : 0}%` 
                }}
              ></div>
            </div>
            <span className="ml-2 text-xs text-gray-500">
              {stats.totalOrders > 0 ? Math.round((stats.shippedOrders / stats.totalOrders) * 100) : 0}%
            </span>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium">Órdenes Entregadas</h3>
            <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center text-green-600">
              <span className="text-sm font-semibold">{stats.deliveredOrders}</span>
            </div>
          </div>
          <div className="flex items-center">
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-green-500 h-2.5 rounded-full" 
                style={{ 
                  width: `${stats.totalOrders > 0 ? Math.round((stats.deliveredOrders / stats.totalOrders) * 100) : 0}%` 
                }}
              ></div>
            </div>
            <span className="ml-2 text-xs text-gray-500">
              {stats.totalOrders > 0 ? Math.round((stats.deliveredOrders / stats.totalOrders) * 100) : 0}%
            </span>
          </div>
        </div>
      </div>
      
      {/* Recent Orders */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium">Órdenes Recientes</h2>
            <Link 
              to="/admin/orders" 
              className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center"
            >
              Ver Todas
              <ArrowRight size={16} className="ml-1" />
            </Link>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID Orden
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Monto
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentOrders.length > 0 ? (
                recentOrders.map((order) => (
                  <tr key={order.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {order.id.slice(0, 8).toUpperCase()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.userEmail}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${order.totalAmount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        order.orderStatus === 'processing' 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : order.orderStatus === 'shipped'
                          ? 'bg-blue-100 text-blue-800'
                          : order.orderStatus === 'delivered'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {order.orderStatus === 'processing' && <Package size={12} className="mr-1" />}
                        {order.orderStatus === 'shipped' && <TrendingUp size={12} className="mr-1" />}
                        {order.orderStatus === 'delivered' && <CheckCircle2 size={12} className="mr-1" />}
                        {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-sm text-gray-500 text-center">
                    No hay órdenes recientes
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;