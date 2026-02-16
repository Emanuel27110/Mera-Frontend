import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/useAuth';
import { useCart } from '../utils/useCart';
import axios from '../utils/axios';
import './Navbar.css';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const { getItemCount } = useCart();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoriesGrouped, setCategoriesGrouped] = useState({});
  const [openDropdown, setOpenDropdown] = useState(null);

  const CATEGORIAS_FIJAS = ['INDUMENTARIA', 'ACCESORIOS', 'SUBLIMACIÓN'];

  const fetchCategories = async () => {
    try {
      const { data } = await axios.get('/categories/grouped');
      setCategoriesGrouped(data);
    } catch (error) {
      console.error('Error al cargar categorías:', error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/productos?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const toggleDropdown = (categoria) => {
    setOpenDropdown(openDropdown === categoria ? null : categoria);
  };

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = () => setOpenDropdown(null);
    if (openDropdown) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [openDropdown]);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          Mera's
        </Link>

        {/* Barra de búsqueda */}
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder="Buscar productos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <button type="submit" className="search-btn">
            🔍
          </button>
        </form>

        <div className="navbar-menu">
          {/* Categorías Fijas con Dropdowns */}
          {CATEGORIAS_FIJAS.map((categoriaPadre) => {
            const subcategorias = categoriesGrouped[categoriaPadre] || [];
            
            // Si no hay subcategorías, no mostrar nada
            if (subcategorias.length === 0) return null;

            return (
              <div 
                key={categoriaPadre} 
                className="navbar-dropdown"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  className="navbar-link dropdown-trigger"
                  onClick={() => toggleDropdown(categoriaPadre)}
                >
                  {categoriaPadre}
                  <span className="dropdown-arrow">▼</span>
                </button>

                {openDropdown === categoriaPadre && (
                  <div className="dropdown-menu">
                    {/* Link para ver todas las subcategorías de esta categoría */}
                    <Link
                      to={`/categorias?categoriaPadre=${categoriaPadre}`}
                      className="dropdown-item dropdown-all"
                      onClick={() => setOpenDropdown(null)}
                    >
                      Ver Todo {categoriaPadre}
                    </Link>
                    
                    <div className="dropdown-divider"></div>

                    {/* Links de subcategorías */}
                    {subcategorias.map((subcat) => (
                      <Link
                        key={subcat._id}
                        to={`/productos?categoria=${subcat._id}`}
                        className="dropdown-item"
                        onClick={() => setOpenDropdown(null)}
                      >
                        {subcat.nombre}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {user ? (
            <>
              <Link to="/carrito" className="navbar-link navbar-cart">
                🛒 Carrito
                {getItemCount() > 0 && (
                  <span className="cart-badge">{getItemCount()}</span>
                )}
              </Link>

              <Link to="/mis-pedidos" className="navbar-link">
                Mis Pedidos
              </Link>

              {isAdmin && (
                <Link to="/admin" className="navbar-link navbar-admin">
                  Admin
                </Link>
              )}

              <Link to="/perfil" className="navbar-link">
                {user.nombre}
              </Link>

              <button onClick={handleLogout} className="navbar-btn">
                Salir
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="navbar-link">
                Iniciar Sesión
              </Link>
              <Link to="/register" className="navbar-btn-link">
                Registrarse
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;