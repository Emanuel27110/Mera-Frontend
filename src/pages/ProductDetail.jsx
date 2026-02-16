import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../utils/axios';
import { useCart } from '../utils/useCart';
import { useAuth } from '../utils/useAuth';
import './ProductDetail.css';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTalle, setSelectedTalle] = useState('');
  const [cantidad, setCantidad] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [message, setMessage] = useState('');

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`/products/${id}`);
      setProduct(data);
      
      // Seleccionar primer talle disponible
      if (data.talles && data.talles.length > 0) {
        setSelectedTalle(data.talles[0].talle);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error al cargar producto:', error);
      setError('Producto no encontrado');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
  }, [id]);

  // Auto-play del carrousel
  useEffect(() => {
    if (!product || !product.imagenes || product.imagenes.length <= 1) return;

    const interval = setInterval(() => {
      setSelectedImage((prev) => 
        prev === product.imagenes.length - 1 ? 0 : prev + 1
      );
    }, 4000); // Cambia cada 4 segundos

    return () => clearInterval(interval);
  }, [product]);

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!selectedTalle) {
      setMessage('Por favor seleccioná un talle');
      return;
    }

    const talleInfo = product.talles.find((t) => t.talle === selectedTalle);
    
    if (!talleInfo || talleInfo.stock < cantidad) {
      setMessage('Stock insuficiente');
      return;
    }

    addToCart(product, selectedTalle, cantidad);
    setMessage('✅ Producto agregado al carrito');
    
    setTimeout(() => setMessage(''), 3000);
  };

  if (loading) {
    return <div className="loading">Cargando producto...</div>;
  }

  if (error || !product) {
    return (
      <div className="error-container">
        <h2>{error}</h2>
        <button onClick={() => navigate('/productos')} className="btn btn-primary">
          Volver a productos
        </button>
      </div>
    );
  }

  const stockDisponible =
    product.talles.find((t) => t.talle === selectedTalle)?.stock || 0;

  return (
    <div className="product-detail-page">
      <div className="product-detail-container">
        {/* Galería de imágenes */}
        <div className="product-gallery">
          <div className="main-image">
            {product.imagenes && product.imagenes.length > 0 ? (
              <>
                <img
                  src={product.imagenes[selectedImage].url}
                  alt={product.nombre}
                />
                
                {/* Flechas de navegación */}
                {product.imagenes.length > 1 && (
                  <>
                    <button
                      className="carousel-arrow carousel-arrow-left"
                      onClick={() => setSelectedImage(
                        selectedImage === 0 
                          ? product.imagenes.length - 1 
                          : selectedImage - 1
                      )}
                    >
                      ❮
                    </button>
                    <button
                      className="carousel-arrow carousel-arrow-right"
                      onClick={() => setSelectedImage(
                        selectedImage === product.imagenes.length - 1 
                          ? 0 
                          : selectedImage + 1
                      )}
                    >
                      ❯
                    </button>
                    
                    {/* Indicadores */}
                    <div className="carousel-indicators">
                      {product.imagenes.map((_, index) => (
                        <span
                          key={index}
                          className={`indicator ${selectedImage === index ? 'active' : ''}`}
                          onClick={() => setSelectedImage(index)}
                        />
                      ))}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="no-image-large">Sin imagen</div>
            )}
          </div>

          {product.imagenes && product.imagenes.length > 1 && (
            <div className="thumbnail-list">
              {product.imagenes.map((img, index) => (
                <div
                  key={index}
                  className={`thumbnail ${selectedImage === index ? 'active' : ''}`}
                  onClick={() => setSelectedImage(index)}
                >
                  <img src={img.url} alt={`${product.nombre} ${index + 1}`} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Información del producto */}
        <div className="product-info-detail">
          <span className="product-category-badge">
            {typeof product.categoria === 'object' && product.categoria?.nombre
              ? product.categoria.nombre
              : product.categoria || 'Sin categoría'}
          </span>
          
          <h1>{product.nombre}</h1>
          
          <p className="product-price-large">${product.precio}</p>
          
          <p className="product-description-full">{product.descripcion}</p>

          {/* Selector de talle */}
          {product.talles && product.talles.length > 0 && (
            <div className="size-selector">
              <label>Talle:</label>
              <div className="size-options">
                {product.talles.map((talle) => (
                  <button
                    key={talle.talle}
                    className={`size-btn ${
                      selectedTalle === talle.talle ? 'active' : ''
                    } ${talle.stock === 0 ? 'disabled' : ''}`}
                    onClick={() => setSelectedTalle(talle.talle)}
                    disabled={talle.stock === 0}
                  >
                    {talle.talle}
                    {talle.stock === 0 && <span className="sin-stock">Sin stock</span>}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Selector de cantidad */}
          <div className="quantity-selector">
            <label>Cantidad:</label>
            <div className="quantity-controls">
              <button
                onClick={() => setCantidad(Math.max(1, cantidad - 1))}
                className="qty-btn"
              >
                -
              </button>
              <span className="qty-display">{cantidad}</span>
              <button
                onClick={() =>
                  setCantidad(Math.min(stockDisponible, cantidad + 1))
                }
                className="qty-btn"
                disabled={cantidad >= stockDisponible}
              >
                +
              </button>
            </div>
            <span className="stock-info">Stock disponible: {stockDisponible}</span>
          </div>

          {/* Mensaje de éxito/error */}
          {message && (
            <div
              className={`message ${
                message.includes('✅') ? 'success' : 'error'
              }`}
            >
              {message}
            </div>
          )}

          {/* Botón agregar al carrito */}
          <button
            onClick={handleAddToCart}
            className="btn-add-to-cart"
            disabled={stockDisponible === 0}
          >
            {stockDisponible === 0 ? 'Sin Stock' : 'Agregar al Carrito'}
          </button>

          <button
            onClick={() => navigate('/productos')}
            className="btn-back"
          >
            ← Volver a productos
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;