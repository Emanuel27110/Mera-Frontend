import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from '../utils/axios';
import './Products.css';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchParams] = useSearchParams();

  const categoria = searchParams.get('categoria'); // ID de subcategoría
  const categoriaPadre = searchParams.get('categoriaPadre'); // INDUMENTARIA, ACCESORIOS, etc.
  const searchQuery = searchParams.get('search');

  const fetchProducts = async () => {
    try {
      setLoading(true);
      
      let url = '/products?';
      const params = [];
      
      if (categoria) params.push(`categoria=${categoria}`);
      if (categoriaPadre) params.push(`categoriaPadre=${categoriaPadre}`);
      if (searchQuery) params.push(`search=${encodeURIComponent(searchQuery)}`);
      
      url += params.join('&');
      
      const { data } = await axios.get(url);
      setProducts(data);
      setLoading(false);
    } catch (error) {
      console.error('Error al cargar productos:', error);
      setError('Error al cargar los productos');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [categoria, categoriaPadre, searchQuery]);

  if (loading) {
    return <div className="loading">Cargando productos...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  // Determinar el título basado en los filtros
  let titulo = 'Todos los Productos';
  
  if (searchQuery) {
    titulo = `Resultados para: "${searchQuery}"`;
  } else if (categoriaPadre) {
    titulo = categoriaPadre;
  } else if (products.length > 0 && products[0].categoria?.nombre) {
    titulo = products[0].categoria.nombre;
  }

  return (
    <div className="products-page">
      <div className="products-header">
        <h1>{titulo}</h1>
        <p>
          {products.length} {products.length === 1 ? 'producto' : 'productos'}{' '}
          disponibles
        </p>
      </div>

      {products.length === 0 ? (
        <div className="no-products">
          <p>No hay productos disponibles</p>
          <Link to="/" className="btn btn-primary">
            Volver al inicio
          </Link>
        </div>
      ) : (
        <div className="products-grid">
          {products.map((product) => (
            <Link
              to={`/producto/${product._id}`}
              key={product._id}
              className="product-card"
            >
              <div className="product-image">
                {product.imagenes && product.imagenes.length > 0 ? (
                  <img src={product.imagenes[0].url} alt={product.nombre} />
                ) : (
                  <div className="no-image">Sin imagen</div>
                )}
                {product.destacado && (
                  <span className="badge-destacado">Destacado</span>
                )}
              </div>

              <div className="product-info">
                <h3>{product.nombre}</h3>
                <p className="product-description">{product.descripcion}</p>

                <div className="product-footer">
                  <span className="product-price">${product.precio}</span>
                  {product.categoria && (
                    <span className="product-category">
                      {typeof product.categoria === 'object' 
                        ? product.categoria.nombre 
                        : product.categoria}
                    </span>
                  )}
                </div>

                {product.talles && product.talles.length > 0 && (
                  <div className="product-sizes">
                    Talles: {product.talles.map((t) => t.talle).join(', ')}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Products;