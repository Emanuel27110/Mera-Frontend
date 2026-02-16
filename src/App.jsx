import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthProvider';
import { CartProvider } from './context/CartProvider';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Footer from './components/Footer';  // ← Agregar

// Páginas públicas
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import CustomDesigner from './pages/CustomDesigner';
import VerifyEmail from './pages/VerifyEmail';

// Páginas de usuario
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import MyOrders from './pages/MyOrders';
import OrderDetail from './pages/OrderDetail';
import Profile from './pages/Profile';
import CategoriesPage from './pages/CategoriesPage';

// Páginas de admin
import AdminDashboard from './pages/Admin/AdminDashboard';
import AdminOrders from './pages/Admin/AdminOrders';
import AdminProducts from './pages/Admin/AdminProducts';
import ProductForm from './pages/Admin/ProductForm';
import AdminCategories from './pages/Admin/AdminCategories';

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <Navbar />
          <Routes>
            {/* Rutas públicas */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/productos" element={<Products />} />
            <Route path="/producto/:id" element={<ProductDetail />} />
            <Route path="/categorias" element={<CategoriesPage />} />
            <Route path="/disenar" element={<CustomDesigner />} />
            <Route path="/verify-email/:token" element={<VerifyEmail />} />

            {/* Rutas protegidas de usuario */}
            <Route
              path="/carrito"
              element={
                <ProtectedRoute>
                  <Cart />
                </ProtectedRoute>
              }
            />
            <Route
              path="/checkout"
              element={
                <ProtectedRoute>
                  <Checkout />
                </ProtectedRoute>
              }
            />
            <Route
              path="/pedido-exitoso/:id"
              element={
                <ProtectedRoute>
                  <OrderSuccess />
                </ProtectedRoute>
              }
            />
            <Route
              path="/mis-pedidos"
              element={
                <ProtectedRoute>
                  <MyOrders />
                </ProtectedRoute>
              }
            />
            <Route
              path="/pedido/:id"
              element={
                <ProtectedRoute>
                  <OrderDetail />
                </ProtectedRoute>
              }
            />
            <Route
  path="/perfil"
  element={
    <ProtectedRoute>
      <Profile />
    </ProtectedRoute>
  }
/>

            {/* Rutas de admin */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute adminOnly={true}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/pedidos"
              element={
                <ProtectedRoute adminOnly={true}>
                  <AdminOrders />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/pedidos/:id"
              element={
                <ProtectedRoute adminOnly={true}>
                  <OrderDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/productos"
              element={
                <ProtectedRoute adminOnly={true}>
                  <AdminProducts />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/productos/nuevo"
              element={
                <ProtectedRoute adminOnly={true}>
                  <ProductForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/productos/editar/:id"
              element={
                <ProtectedRoute adminOnly={true}>
                  <ProductForm />
                </ProtectedRoute>
              }
            />
            <Route
  path="/admin/categorias"
  element={
    <ProtectedRoute adminOnly={true}>
      <AdminCategories />
    </ProtectedRoute>
  }
/>
          </Routes>
          <Footer />  {/* ← Agregar acá */}
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;