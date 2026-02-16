import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from '../../utils/axios';
import './AdminProducts.css';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const CATEGORIAS_FIJAS = ['INDUMENTARIA', 'ACCESORIOS', 'SUBLIMACIÓN'];

  const fetchProducts = async () => {
    try {
      setLoading(true);
      let url = '/products?admin=true';
      
      // Filtrar por categoría padre
      if (filter !== 'all') {
        url += `&categoriaPadre=${filter}`;
      }
      
      // Agregar búsqueda
      if (searchQuery.trim()) {
        url += `&search=${encodeURIComponent(searchQuery.trim())}`;
      }
      
      const { data } = await axios.get(url);
      setProducts(data);
      setLoading(false);
    } catch (error) {
      console.error('Error al cargar productos:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [filter, searchQuery]);

  const handleDelete = async (id, nombre) => {
    if (!window.confirm(`¿Estás segura de que querés eliminar "${nombre}"?`)) {
      return;
    }

    try {
      await axios.delete(`/products/${id}`);
      fetchProducts();
    } catch (error) {
      console.error('Error al eliminar producto:', error);
      alert('Error al eliminar el producto');
    }
  };

  const toggleActive = async (id, currentStatus) => {
    try {
      await axios.put(`/products/${id}`, { activo: !currentStatus });
      fetchProducts();
    } catch (error) {
      console.error('Error al actualizar producto:', error);
      alert('Error al actualizar el producto');
    }
  };

  const toggleDestacado = async (id, currentStatus) => {
    try {
      await axios.put(`/products/${id}`, { destacado: !currentStatus });
      fetchProducts();
    } catch (error) {
      console.error('Error al actualizar producto:', error);
      alert('Error al actualizar el producto');
    }
  };

  if (loading) {
    return <div className="loading">Cargando productos...</div>;
  }

  return (
    <div className="admin-products-page">
      <div className="admin-products-header">
        <h1>Gestión de Productos</h1>
        <div className="header-actions">
          <Link to="/admin" className="btn-back">
            ← Volver
          </Link>
          <Link to="/admin/productos/nuevo" className="btn-create">
            ➕ Crear Producto
          </Link>
        </div>
      </div>

      {/* Búsqueda */}
      <div className="admin-search-bar">
        <input
          type="text"
          placeholder="Buscar productos por nombre o descripción..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input-admin"
        />
        {searchQuery && (
          <button 
            onClick={() => setSearchQuery('')}
            className="clear-search-btn"
          >
            ✕
          </button>
        )}
      </div>

      {/* Filtros por categoría padre */}
      <div className="products-filters">
        <button
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          Todos ({products.length})
        </button>
        {CATEGORIAS_FIJAS.map(cat => (
          <button
            key={cat}
            className={`filter-btn ${filter === cat ? 'active' : ''}`}
            onClick={() => setFilter(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Lista de productos */}
      {products.length === 0 ? (
        <div className="no-products-admin">
          <p>No hay productos en esta categoría</p>
          <Link to="/admin/productos/nuevo" className="btn btn-primary">
            Crear Primer Producto
          </Link>
        </div>
      ) : (
        <div className="admin-products-grid">
          {products.map((product) => (
            <div key={product._id} className="admin-product-card">
              <div className="admin-product-image">
                {product.imagenes && product.imagenes.length > 0 ? (
                  <img src={product.imagenes[0].url} alt={product.nombre} />
                ) : (
                  <div className="no-image-admin">Sin imagen</div>
                )}
                
                <div className="product-badges">
                  {product.destacado && (
                    <span className="badge-destacado-admin">⭐ Destacado</span>
                  )}
                  {!product.activo && (
                    <span className="badge-inactivo">Inactivo</span>
                  )}
                </div>
              </div>

              <div className="admin-product-info">
                <h3>{product.nombre}</h3>
                <p className="product-category-admin">
                  {typeof product.categoria === 'object' && product.categoria?.nombre
                    ? product.categoria.nombre
                    : product.categoria || 'Sin categoría'}
                </p>
                <p className="product-price-admin">${product.precio}</p>

                {/* Talles y stock */}
                <div className="product-stock-info">
                  <strong>Stock:</strong>
                  <div className="stock-list">
                    {product.talles && product.talles.length > 0 ? (
                      product.talles.map((t, index) => (
                        <span
                          key={index}
                          className={`stock-item ${t.stock === 0 ? 'out-of-stock' : ''}`}
                        >
                          {t.talle}: {t.stock}
                        </span>
                      ))
                    ) : (
                      <span>Sin talles</span>
                    )}
                  </div>
                </div>

                {/* Acciones */}
                <div className="admin-product-actions">
                  <button
                    onClick={() => navigate(`/admin/productos/editar/${product._id}`)}
                    className="btn-edit"
                  >
                    ✏️ Editar
                  </button>

                  <button
                    onClick={() => toggleActive(product._id, product.activo)}
                    className={`btn-toggle ${product.activo ? 'active' : 'inactive'}`}
                  >
                    {product.activo ? '✅ Activo' : '❌ Inactivo'}
                  </button>

                  <button
                    onClick={() => toggleDestacado(product._id, product.destacado)}
                    className={`btn-toggle ${product.destacado ? 'featured' : ''}`}
                  >
                    {product.destacado ? '⭐ Destacado' : '☆ Destacar'}
                  </button>

                  <button
                    onClick={() => handleDelete(product._id, product.nombre)}
                    className="btn-delete"
                  >
                    🗑️ Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminProducts;