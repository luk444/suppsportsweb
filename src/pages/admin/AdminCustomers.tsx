import React, { useState, useEffect } from 'react';
import { 
  collection, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit, 
  startAfter,
  QueryDocumentSnapshot,
  DocumentData,
  Timestamp
} from 'firebase/firestore';
import { 
  Search, 
  Users, 
  ShoppingBag, 
  Mail, 
  Calendar, 
  ChevronLeft, 
  ChevronRight 
} from 'lucide-react';
import { db } from '../../firebase/config';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';

interface Customer {
  id: string;
  email: string;
  displayName: string;
  role: string;
  createdAt: Timestamp;
  orderCount?: number;
  totalSpent?: number;
}

const CUSTOMERS_PER_PAGE = 10;

const AdminCustomers: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const { addToast } = useToast();
  const { currentUser, isAdmin } = useAuth();

  const loadCustomers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Get all users
      const usersSnapshot = await getDocs(collection(db, 'users'));
      
      if (!usersSnapshot.empty) {
        // Filter customers (users with role 'customer' or no role specified)
        const allUsers = usersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Customer[];
        
        const customersList = allUsers.filter(user => 
          user.role === 'customer' || !user.role
        );
        
        // Get order data for each customer
        const ordersSnapshot = await getDocs(collection(db, 'orders'));
        const allOrders = ordersSnapshot.docs.map(doc => doc.data());
        
        const customersWithOrderData = customersList.map(customer => {
          const customerOrders = allOrders.filter(order => order.userId === customer.id);
          const orderCount = customerOrders.length;
          const totalSpent = customerOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
          
          return {
            ...customer,
            orderCount,
            totalSpent
          };
        });
        
        // Sort by creation date (newest first)
        customersWithOrderData.sort((a, b) => {
          const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
          const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
          return dateB.getTime() - dateA.getTime();
        });
        
        setCustomers(customersWithOrderData);
        setTotalPages(Math.ceil(customersWithOrderData.length / CUSTOMERS_PER_PAGE));
      } else {
        setCustomers([]);
        setTotalPages(1);
      }
    } catch (error) {
      console.error('Error loading customers:', error);
      setError('Error al cargar los clientes');
      addToast('Error al cargar los clientes', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser && isAdmin) {
      loadCustomers();
    }
  }, [currentUser, isAdmin]);

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
    // Search is handled by filteredCustomers below
  };

  const filteredCustomers = customers.filter(customer => {
    return searchTerm 
      ? (customer.displayName && customer.displayName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        customer.email.toLowerCase().includes(searchTerm.toLowerCase())
      : true;
  });

  // Paginate the filtered customers
  const startIndex = (currentPage - 1) * CUSTOMERS_PER_PAGE;
  const paginatedCustomers = filteredCustomers.slice(startIndex, startIndex + CUSTOMERS_PER_PAGE);

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
          onClick={loadCustomers}
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Clientes</h1>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {/* Search */}
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <form onSubmit={handleSearch}>
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar clientes por nombre o email..."
                className="w-full rounded-md border border-gray-300 pl-10 pr-4 py-2 focus:outline-none focus:ring-1 focus:ring-primary-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <Search size={18} />
              </div>
            </div>
          </form>
        </div>
        
        {/* Customers Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha de Registro
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Órdenes
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Gastado
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                Array.from({ length: 3 }).map((_, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-gray-200 animate-pulse"></div>
                        <div className="ml-4 w-24 h-4 bg-gray-200 rounded animate-pulse"></div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="w-32 h-4 bg-gray-200 rounded animate-pulse"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="w-24 h-4 bg-gray-200 rounded animate-pulse"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="w-8 h-4 bg-gray-200 rounded animate-pulse"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="w-16 h-4 bg-gray-200 rounded animate-pulse"></div>
                    </td>
                  </tr>
                ))
              ) : paginatedCustomers.length > 0 ? (
                paginatedCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center flex-shrink-0">
                          <Users size={18} />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {customer.displayName || 'Sin Nombre'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-500">
                        <Mail size={14} className="mr-1 text-gray-400" />
                        {customer.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar size={14} className="mr-1 text-gray-400" />
                        {customer.createdAt?.toDate ? customer.createdAt.toDate().toLocaleDateString() : 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <ShoppingBag size={14} className="mr-1 text-gray-400" />
                        {customer.orderCount || 0}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      ${(customer.totalSpent || 0).toFixed(2)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                    No se encontraron clientes
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
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
    </div>
  );
};

export default AdminCustomers;