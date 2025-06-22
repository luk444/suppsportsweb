import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, HelpCircle, User, ShoppingCart, Menu, X, Heart, ChevronDown } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { useFavorites } from '../../contexts/FavoritesContext';
import logo from '../../assets/suplechad2.png';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const { currentUser, isAdmin, signOut } = useAuth();
  const { totalItems } = useCart();
  const { favorites } = useFavorites();
  const navigate = useNavigate();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.navbar-dropdown') && !target.closest('.navbar-menu')) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    setIsProfileOpen(false);
    navigate('/');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const query = searchQuery.trim();
      
      const marcasConocidas = [
        'ena', 'gentech', 'incaico', 'optimum nutrition', 'dymatize', 
        'bsn', 'muscletech', 'universal nutrition', 'gnc', 'myprotein'
      ];
      
      const esMarca = marcasConocidas.some(marca => 
        query.toLowerCase().includes(marca.toLowerCase())
      );
      
      if (esMarca) {
        navigate(`/products?brand=${encodeURIComponent(query)}`);
      } else {
        navigate(`/products?search=${encodeURIComponent(query)}`);
      }
      
      setSearchQuery('');
      setIsMenuOpen(false);
    }
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
    setIsProfileOpen(false);
  };

  return (
    <>
      {/* Top Banner */}
      <div className="bg-black text-white text-center py-2 text-sm">
        Envío GRATIS para compras mayores a $50.000
      </div>

      {/* Header */}
      <header className={`bg-white border-b sticky top-0 z-50 transition-all duration-300 ${isScrolled ? 'shadow-lg' : ''}`}>
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Search Bar - Desktop */}
            <div className="hidden lg:flex flex-1 max-w-md relative">
              <form onSubmit={handleSearch} className="w-full relative">
                <input
                  type="search"
                  placeholder="Buscar productos, marcas..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-4 pr-10 py-2 rounded-full border-2 border-gray-300 focus:border-yellow-400 focus:outline-none transition-colors"
                />
                <button
                  type="submit"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 hover:text-yellow-600 transition-colors"
                >
                  <Search className="w-5 h-5 text-gray-400" />
                </button>
              </form>
            </div>

            {/* Logo */}
            <div className="flex-1 text-center lg:flex-none">
              <Link to="/" className="inline-flex items-center gap-2 hover:opacity-80 transition-opacity">
                <img src={logo} alt="SupleChad" className="w-10 h-10" />
                <div className="hidden sm:block">
                  <div className="font-bold text-lg text-gray-800">SUPLEMENTOS</div>
                  <div className="text-sm text-gray-600">DEPORTIVOS</div>
                </div>
              </Link>
            </div>

            {/* User Actions - Desktop */}
            <div className="hidden lg:flex items-center gap-6">
              {/* Help */}
              <Link 
                to="/support" 
                className="flex items-center gap-1 text-sm text-gray-600 hover:text-yellow-600 transition-colors"
              >
                <HelpCircle className="w-4 h-4" />
                Ayuda
              </Link>

              {/* Favorites */}
              <Link
                to="/favorites"
                className="flex items-center gap-1 text-sm text-gray-600 hover:text-yellow-600 transition-colors relative"
              >
                <Heart className="w-4 h-4" />
                Favoritos
                {favorites.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {favorites.length}
                  </span>
                )}
              </Link>

              {/* User Menu */}
              <div className="relative navbar-dropdown">
                <button
                  className="flex items-center gap-1 text-sm text-gray-600 hover:text-yellow-600 transition-colors"
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                >
                  <User className="w-4 h-4" />
                  Mi cuenta
                  <ChevronDown className={`w-3 h-3 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {isProfileOpen && (
                  <div className="absolute right-0 top-full mt-1 w-56 bg-white rounded-lg shadow-xl py-2 z-[60] border border-gray-200">
                    {currentUser ? (
                      <>
                        <div className="px-4 py-3 text-sm text-gray-500 border-b border-gray-100">
                          Iniciado sesión como<br />
                          <span className="font-medium text-gray-700">
                            {currentUser.displayName || currentUser.email}
                          </span>
                        </div>
                        {isAdmin && (
                          <Link
                            to="/admin"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            onClick={closeMenu}
                          >
                            Panel de administración
                          </Link>
                        )}
                        {!isAdmin && (
                          <Link
                            to="/orders"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            onClick={closeMenu}
                          >
                            Mis Órdenes
                          </Link>
                        )}
                        <button
                          onClick={handleSignOut}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          Cerrar Sesión
                        </button>
                      </>
                    ) : (
                      <>
                        <Link
                          to="/login"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          onClick={closeMenu}
                        >
                          Iniciar sesión
                        </Link>
                        <Link
                          to="/register"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          onClick={closeMenu}
                        >
                          Registro
                        </Link>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Cart */}
              <Link
                to="/cart"
                className="flex items-center gap-1 text-sm text-gray-600 hover:text-yellow-600 transition-colors relative"
              >
                <ShoppingCart className="w-4 h-4" />
                Mi carrito
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-black text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </Link>
            </div>

            {/* Mobile Actions */}
            <div className="flex lg:hidden items-center gap-3">
              {/* Mobile Search Toggle */}
              <button
                className="p-2 rounded-full transition-colors text-gray-700 hover:bg-gray-100"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Mobile Favorites */}
              <Link
                to="/favorites"
                className="p-2 rounded-full transition-colors text-gray-700 hover:bg-gray-100 relative"
              >
                <Heart className="w-5 h-5" />
                {favorites.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                    {favorites.length}
                  </span>
                )}
              </Link>

              {/* Mobile Cart */}
              <Link
                to="/cart"
                className="p-2 rounded-full transition-colors text-gray-700 hover:bg-gray-100 relative"
              >
                <ShoppingCart className="w-5 h-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-black text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </Link>

              {/* Mobile menu button */}
              <button
                className="p-2 rounded-full transition-colors text-gray-700 hover:bg-gray-100"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>

          {/* Mobile Search */}
          {isMenuOpen && (
            <div className="lg:hidden mt-4 pb-4 border-b border-gray-200">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="search"
                  placeholder="Buscar productos, marcas..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-4 pr-10 py-3 rounded-full border-2 border-gray-300 focus:border-yellow-400 focus:outline-none transition-colors"
                />
                <button
                  type="submit"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 hover:text-yellow-600 transition-colors"
                >
                  <Search className="w-5 h-5 text-gray-400" />
                </button>
              </form>
            </div>
          )}
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b relative z-40">
        <div className="container mx-auto px-4">
          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center justify-center gap-8 py-3">
            <Link to="/" className="text-gray-700 hover:text-yellow-600 font-medium transition-colors">
              Inicio
            </Link>
            <Link to="/products" className="text-gray-700 hover:text-yellow-600 font-medium transition-colors">
              Productos
            </Link>
            <Link to="/products?offers=true" className="text-gray-700 hover:text-yellow-600 font-medium transition-colors">
              Ofertas
            </Link>
            <Link to="/products?combos=true" className="text-gray-700 hover:text-yellow-600 font-medium transition-colors">
              Combos
            </Link>
            <Link to="/track-order" className="text-gray-700 hover:text-yellow-600 font-medium transition-colors">
              Seguir Pedido
            </Link>
            <Link to="/how-to-buy" className="text-gray-700 hover:text-yellow-600 font-medium transition-colors">
              Cómo Comprar
            </Link>
            <Link to="/nutrition-calculator" className="text-gray-700 hover:text-yellow-600 font-medium transition-colors">
              Calculadora
            </Link>
            <Link to="/support" className="text-gray-700 hover:text-yellow-600 font-medium transition-colors">
              Soporte
            </Link>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="lg:hidden py-4 relative z-50 bg-white">
              {/* User Account Section */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3 mb-3">
                  <User className="w-5 h-5 text-gray-600" />
                  <span className="font-medium text-gray-700">Mi Cuenta</span>
                </div>
                {currentUser ? (
                  <div className="space-y-2">
                    <div className="text-sm text-gray-500">
                      Iniciado sesión como<br />
                      <span className="font-medium text-gray-700">
                        {currentUser.displayName || currentUser.email}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      {isAdmin ? (
                        <Link
                          to="/admin"
                          className="flex-1 text-center px-3 py-2 bg-yellow-400 hover:bg-yellow-500 text-black text-sm font-medium rounded transition-colors"
                          onClick={closeMenu}
                        >
                          Panel Admin
                        </Link>
                      ) : (
                        <Link
                          to="/orders"
                          className="flex-1 text-center px-3 py-2 bg-yellow-400 hover:bg-yellow-500 text-black text-sm font-medium rounded transition-colors"
                          onClick={closeMenu}
                        >
                          Mis Órdenes
                        </Link>
                      )}
                      <button
                        onClick={handleSignOut}
                        className="flex-1 px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-medium rounded transition-colors"
                      >
                        Cerrar Sesión
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Link
                      to="/login"
                      className="flex-1 text-center px-3 py-2 bg-yellow-400 hover:bg-yellow-500 text-black text-sm font-medium rounded transition-colors"
                      onClick={closeMenu}
                    >
                      Iniciar Sesión
                    </Link>
                    <Link
                      to="/register"
                      className="flex-1 text-center px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-medium rounded transition-colors"
                      onClick={closeMenu}
                    >
                      Registro
                    </Link>
                  </div>
                )}
              </div>

              {/* Navigation Links */}
              <div className="space-y-1">
                <Link
                  to="/"
                  className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-yellow-600 transition-colors rounded-lg"
                  onClick={closeMenu}
                >
                  Inicio
                </Link>
                <Link
                  to="/products"
                  className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-yellow-600 transition-colors rounded-lg"
                  onClick={closeMenu}
                >
                  Productos
                </Link>
                <Link
                  to="/products?offers=true"
                  className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-yellow-600 transition-colors rounded-lg"
                  onClick={closeMenu}
                >
                  Ofertas
                </Link>
                <Link
                  to="/products?combos=true"
                  className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-yellow-600 transition-colors rounded-lg"
                  onClick={closeMenu}
                >
                  Combos
                </Link>
                <Link
                  to="/favorites"
                  className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-yellow-600 transition-colors rounded-lg"
                  onClick={closeMenu}
                >
                  Favoritos
                </Link>
                <Link
                  to="/track-order"
                  className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-yellow-600 transition-colors rounded-lg"
                  onClick={closeMenu}
                >
                  Seguir Pedido
                </Link>
                <Link
                  to="/how-to-buy"
                  className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-yellow-600 transition-colors rounded-lg"
                  onClick={closeMenu}
                >
                  Cómo Comprar
                </Link>
                <Link
                  to="/nutrition-calculator"
                  className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-yellow-600 transition-colors rounded-lg"
                  onClick={closeMenu}
                >
                  Calculadora
                </Link>
                <Link
                  to="/support"
                  className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-yellow-600 transition-colors rounded-lg"
                  onClick={closeMenu}
                >
                  Soporte
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Background overlay for mobile dropdown - Only for profile dropdown */}
      {isProfileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/20 lg:hidden"
          onClick={() => {
            setIsProfileOpen(false);
          }}
        />
      )}
    </>
  );
};

export default Navbar;
