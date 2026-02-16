import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from '../utils/axios';
import './CategoriesPage.css';

const CategoriesPage = () => {
  const [searchParams] = useSearchParams();
  const categoriaPadre = searchParams.get('categoriaPadre');
  const [subcategorias, setSubcategorias] = useState([]);
  const [loading, setLoading] = useState(true);

  const iconosPorCategoria = {
    'INDUMENTARIA': '👕',
    'ACCESORIOS': '🎒',
    'SUBLIMACIÓN': '🎨'
  };

  const fetchSubcategorias = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`/categories?categoriaPadre=${categoriaPadre}`);
      setSubcategorias(data);
      setLoading(false);
    } catch (error) {
      console.error('Error al cargar subcategorías:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (categoriaPadre) {
      fetchSubcategorias();
    }
  }, [categoriaPadre]);

  if (loading) {
    return <div className="loading">Cargando subcategorías...</div>;
  }

  return (
    <div className="categories-page">
      <div className="categories-header">
        <span className="category-icon-large">
          {iconosPorCategoria[categoriaPadre] || '📦'}
        </span>
        <h1>{categoriaPadre}</h1>
        <p>Elegí la subcategoría que estás buscando</p>
      </div>

      {subcategorias.length === 0 ? (
        <div className="no-subcategories">
          <p>No hay subcategorías disponibles en {categoriaPadre}</p>
          <Link to="/" className="btn btn-primary">
            Volver al inicio
          </Link>
        </div>
      ) : (
        <div className="subcategories-grid">
          {subcategorias.map((subcat) => (
            <Link
              key={subcat._id}
              to={`/productos?categoria=${subcat._id}`}
              className="subcategory-card-page"
            >
              {subcat.imagen?.url ? (
                <div className="subcategory-image-page">
                  <img src={subcat.imagen.url} alt={subcat.nombre} />
                </div>
              ) : (
                <div className="subcategory-image-page no-image">
                  <span className="no-image-icon">📷</span>
                </div>
              )}

              <div className="subcategory-info-page">
                <h3>{subcat.nombre}</h3>
                {subcat.descripcion && <p>{subcat.descripcion}</p>}
                <span className="ver-productos-link">Ver productos →</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoriesPage;