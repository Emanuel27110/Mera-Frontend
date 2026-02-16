import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from '../utils/axios';
import './Home.css';

const Home = () => {
  const [categoriesGrouped, setCategoriesGrouped] = useState({});
  const [loading, setLoading] = useState(true);

  const CATEGORIAS_FIJAS = ['INDUMENTARIA', 'ACCESORIOS', 'SUBLIMACIÓN'];

  // Iconos por categoría padre
  const iconosPorCategoria = {
    'INDUMENTARIA': '👕',
    'ACCESORIOS': '🎒',
    'SUBLIMACIÓN': '🎨'
  };

  const fetchCategories = async () => {
    try {
      const { data } = await axios.get('/categories/grouped');
      setCategoriesGrouped(data);
      setLoading(false);
    } catch (error) {
      console.error('Error al cargar categorías:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <div className="home">
      <section className="hero-meras">
        <div className="hero-content-meras">
          {/* Logo - AGRANDADO */}
          <div className="logo-container">
            <img src="/logo.jpg" alt="MERA'S Logo" className="logo-image" />
            {/* ESLOGAN ELIMINADO */}
          </div>

          {/* Copy principal */}
          <h2 className="hero-title">Hacemos realidad lo que imaginás 🌈</h2>

          {/* Botones principales */}
          <div className="hero-buttons-meras">
            <Link to="/disenar" className="btn-hero btn-crear">
              CREAR MI PRENDA
            </Link>
            <button 
              onClick={() => {
                const categoriesSection = document.querySelector('.categories-home');
                if (categoriesSection) {
                  categoriesSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              }}
              className="btn-hero btn-catalogo"
            >
              VER CATÁLOGO
            </button>
          </div>
        </div>
      </section>

      {/* Sección de Categorías AGRUPADAS */}
      {!loading && Object.keys(categoriesGrouped).length > 0 && (
        <div className="categories-home">
          {CATEGORIAS_FIJAS.map((categoriaPadre) => {
            const subcategorias = categoriesGrouped[categoriaPadre] || [];
            
            // Si no hay subcategorías, no mostrar esta sección
            if (subcategorias.length === 0) return null;

            return (
              <div key={categoriaPadre} className="categoria-padre-section">
                <div className="categoria-padre-header">
                  <span className="categoria-padre-icon">
                    {iconosPorCategoria[categoriaPadre]}
                  </span>
                  <h2 className="categoria-padre-title">{categoriaPadre}</h2>
                  <Link 
                    to={`/categorias?categoriaPadre=${categoriaPadre}`}
                    className="ver-todos-link"
                  >
                    Ver Todo →
                  </Link>
                </div>

                <div className="subcategorias-grid">
                  {subcategorias.map((subcat) => (
                    <Link
                      key={subcat._id}
                      to={`/productos?categoria=${subcat._id}`}
                      className="subcategoria-card"
                    >
                      {/* Imagen de la subcategoría */}
                      {subcat.imagen?.url ? (
                        <div className="subcategoria-image">
                          <img src={subcat.imagen.url} alt={subcat.nombre} />
                        </div>
                      ) : (
                        <div className="subcategoria-image no-image">
                          <span className="no-image-icon">📷</span>
                        </div>
                      )}

                      <div className="subcategoria-info">
                        <h3>{subcat.nombre}</h3>
                        {subcat.descripcion && <p>{subcat.descripcion}</p>}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Secciones de features */}
      <section className="features-meras">
        <div className="feature-meras">
          <span className="feature-icon">👕</span>
          <h3>Ropa de Calidad</h3>
          <p>Prendas de primera calidad con diseños exclusivos</p>
        </div>
        <div className="feature-meras">
          <span className="feature-icon">🎨</span>
          <h3>Estampados Personalizados</h3>
          <p>Diseños únicos adaptados a tu estilo</p>
        </div>
        <div className="feature-meras">
          <span className="feature-icon">🚚</span>
          <h3>Envíos a Todo el País</h3>
          <p>Recibí tus productos donde estés</p>
        </div>
      </section>
    </div>
  );
};

export default Home;