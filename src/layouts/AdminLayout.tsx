import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Package, 
  Users, 
  LogOut, 
  Menu, 
  X,
  Layers,
  Truck
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const AdminLayout: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button 
          onClick={toggleMenu}
          className="p-2 rounded-md bg-white shadow-md"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside 
        className={`fixed lg:static inset-y-0 left-0 z-40 w-64 transform bg-white shadow-lg transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="px-4 py-6 border-b">
            <h1 className="text-2xl font-semibold text-primary-700">Admin Panel</h1>
          </div>
          
          <nav className="flex-1 py-4">
            <ul className="space-y-1">
              <li>
                <NavLink
                  to="/admin"
                  end
                  className={({ isActive }) =>
                    `flex items-center px-4 py-3 text-sm ${
                      isActive
                        ? 'text-primary-700 bg-primary-50 font-medium'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`
                  }
                  onClick={() => setIsMenuOpen(false)}
                >
                  <LayoutDashboard size={20} className="mr-3" />
                  Dashboard
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/admin/products"
                  className={({ isActive }) =>
                    `flex items-center px-4 py-3 text-sm ${
                      isActive
                        ? 'text-primary-700 bg-primary-50 font-medium'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`
                  }
                  onClick={() => setIsMenuOpen(false)}
                >
                  <ShoppingBag size={20} className="mr-3" />
                  Productos
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/admin/sections"
                  className={({ isActive }) =>
                    `flex items-center px-4 py-3 text-sm ${
                      isActive
                        ? 'text-primary-700 bg-primary-50 font-medium'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`
                  }
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Layers size={20} className="mr-3" />
                  Secciones
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/admin/shipping"
                  className={({ isActive }) =>
                    `flex items-center px-4 py-3 text-sm ${
                      isActive
                        ? 'text-primary-700 bg-primary-50 font-medium'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`
                  }
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Truck size={20} className="mr-3" />
                  Envíos
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/admin/orders"
                  className={({ isActive }) =>
                    `flex items-center px-4 py-3 text-sm ${
                      isActive
                        ? 'text-primary-700 bg-primary-50 font-medium'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`
                  }
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Package size={20} className="mr-3" />
                  Orders
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/admin/customers"
                  className={({ isActive }) =>
                    `flex items-center px-4 py-3 text-sm ${
                      isActive
                        ? 'text-primary-700 bg-primary-50 font-medium'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`
                  }
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Users size={20} className="mr-3" />
                  Customers
                </NavLink>
              </li>
            </ul>
          </nav>
          
          <div className="px-4 py-4 border-t mt-auto space-y-2">
            <button
              onClick={() => navigate('/')}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
            >
              <LayoutDashboard size={20} className="mr-3" />
              Ir a Home
            </button>
          
            <button
              onClick={handleSignOut}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
            >
              <LogOut size={20} className="mr-3" />
              Sign Out
            </button>
          </div>

        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <Outlet />
        </main>
      </div>

      {/* Overlay for mobile */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden" 
          onClick={toggleMenu}
        />
      )}
    </div>
  );
};

export default AdminLayout;