import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { FavoritesProvider } from './contexts/FavoritesContext';
import { ToastProvider } from './contexts/ToastContext';
import { SiteConfigProvider } from './contexts/SiteConfigContext';
import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminRoute from './components/auth/AdminRoute';

// Public Pages
import HomePage from './pages/public/HomePage';
import ProductsPage from './pages/public/ProductsPage';
import ProductDetailPage from './pages/public/ProductDetailPage';
import CartPage from './pages/public/CartPage';
import CheckoutPage from './pages/public/CheckoutPage';
import LoginPage from './pages/public/LoginPage';
import RegisterPage from './pages/public/RegisterPage';
import OrdersPage from './pages/public/OrdersPage';
import OrderConfirmationPage from './pages/public/OrderConfirmationPage';
import FavoritesPage from './pages/public/FavoritesPage';
import TrackOrderPage from './pages/public/TrackOrderPage';
import HowToBuyPage from './pages/public/HowToBuyPage';
import TechnicalSupportPage from './pages/public/TechnicalSupportPage';
import VehicleFinderPage from './pages/public/VehicleFinderPage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import NewProduct from './pages/admin/AdminProducts/NewProduct';
import EditProduct from './pages/admin/AdminProducts/EditProduct';
import AdminOrders from './pages/admin/AdminOrders';
import AdminCustomers from './pages/admin/AdminCustomers';
import AdminSections from './pages/admin/AdminSections';
import AdminShipping from './pages/admin/AdminShipping';

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <ToastProvider>
            <FavoritesProvider>
              <SiteConfigProvider>
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<MainLayout />}>
                    <Route index element={<HomePage />} />
                    <Route path="products" element={<ProductsPage />} />
                    <Route path="products/:id" element={<ProductDetailPage />} />
                    <Route path="cart" element={<CartPage />} />
                    <Route path="favorites" element={<FavoritesPage />} />
                    <Route path="track-order" element={<TrackOrderPage />} />
                    <Route path="how-to-buy" element={<HowToBuyPage />} />
                    <Route path="support" element={<TechnicalSupportPage />} />
                    <Route path="nutrition-calculator" element={<VehicleFinderPage />} />
                    
                    {/* Protected Routes */}
                    <Route path="checkout" element={
                      <ProtectedRoute>
                        <CheckoutPage />
                      </ProtectedRoute>
                    } />
                    <Route path="orders" element={
                      <ProtectedRoute>
                        <OrdersPage />
                      </ProtectedRoute>
                    } />
                    <Route path="order-confirmation/:orderId" element={<OrderConfirmationPage />} />
                  </Route>

                  {/* Auth Routes */}
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />

                  {/* Admin Routes */}
                  <Route path="/admin" element={
                    <AdminRoute>
                      <AdminLayout />
                    </AdminRoute>
                  }>
                    <Route index element={<AdminDashboard />} />
                    <Route path="products" element={<AdminProducts />} />
                    <Route path="products/new" element={<NewProduct />} />
                    <Route path="products/edit/:id" element={<EditProduct />} />
                    <Route path="orders" element={<AdminOrders />} />
                    <Route path="customers" element={<AdminCustomers />} />
                    <Route path="sections" element={<AdminSections />} />
                    <Route path="shipping" element={<AdminShipping />} />
                  </Route>
                </Routes>
              </SiteConfigProvider>
            </FavoritesProvider>
          </ToastProvider>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;