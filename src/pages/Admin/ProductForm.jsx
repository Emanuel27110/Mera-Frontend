import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../../utils/axios';
import './ProductForm.css';

const ProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    categoria: '', // Ahora es ID de subcategoría
    destacado: false,
    talles: [{ talle: 'M', stock: 0 }]
  });

  const [categories, setCategories] = useState([]);
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploadingImages, setUploadingImages] = useState(false);

  const tallesDisponibles = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Único'];

  // Cargar subcategorías
  const fetchCategories = async () => {
    try {
      const { data } = await axios.get('/categories?admin=true');
      setCategories(data);
    } catch (error) {
      console.error('Error al cargar categorías:', error);
    }
  };

  const fetchProduct = async () => {
    try {
      const { data } = await axios.get(`/products/${id}`);
      setFormData({
        nombre: data.nombre,
        descripcion: data.descripcion,
        precio: data.precio,
        categoria: data.categoria?._id || data.categoria || '',
        destacado: data.destacado,
        talles: data.talles.length > 0 ? data.talles : [{ talle: 'M', stock: 0 }]
      });
      setExistingImages(data.imagenes || []);
    } catch (error) {
      console.error('Error al cargar producto:', error);
      setError('Error al cargar el producto');
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (isEditing) {
      fetchProduct();
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleTalleChange = (index, field, value) => {
    const newTalles = [...formData.talles];
    newTalles[index][field] = field === 'stock' ? parseInt(value) || 0 : value;
    setFormData({ ...formData, talles: newTalles });
  };

  const addTalle = () => {
    setFormData({
      ...formData,
      talles: [...formData.talles, { talle: 'M', stock: 0 }]
    });
  };

  const removeTalle = (index) => {
    const newTalles = formData.talles.filter((_, i) => i !== index);
    setFormData({ ...formData, talles: newTalles });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
    
    // Crear previews
    const previews = files.map(file => URL.createObjectURL(file));
    setImagePreviews(previews);
  };

  const handleDeleteExistingImage = async (imageId) => {
    if (!window.confirm('¿Eliminar esta imagen?')) return;

    try {
      await axios.delete(`/products/${id}/images/${imageId}`);
      setExistingImages(existingImages.filter((img) => img._id !== imageId));
    } catch (error) {
      console.error('Error al eliminar imagen:', error);
      alert('Error al eliminar la imagen');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let productId = id;

      // Crear o actualizar producto
      if (isEditing) {
        await axios.put(`/products/${id}`, formData);
      } else {
        const { data } = await axios.post('/products', formData);
        productId = data._id;
      }

      // Subir imágenes si hay
      if (images.length > 0) {
        setUploadingImages(true);
        const formDataImages = new FormData();
        images.forEach((image) => {
          formDataImages.append('images', image);
        });

        await axios.post(`/products/${productId}/images`, formDataImages, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      }

      navigate('/admin/productos');
    } catch (error) {
      console.error('Error al guardar producto:', error);
      setError(error.response?.data?.message || 'Error al guardar el producto');
      setLoading(false);
      setUploadingImages(false);
    }
  };

  // Agrupar categorías por categoría padre
  const CATEGORIAS_FIJAS = ['INDUMENTARIA', 'ACCESORIOS', 'SUBLIMACIÓN'];
  const groupedCategories = CATEGORIAS_FIJAS.reduce((acc, padre) => {
    acc[padre] = categories.filter(cat => cat.categoriaPadre === padre && cat.activa);
    return acc;
  }, {});

  return (
    <div className="product-form-page">
      <div className="product-form-container">
        <div className="form-header">
          <h1>{isEditing ? 'Editar Producto' : 'Crear Producto'}</h1>
          <button onClick={() => navigate('/admin/productos')} className="btn-back-form">
            ← Volver
          </button>
        </div>

        {error && <div className="error-message-form">{error}</div>}

        <form onSubmit={handleSubmit} className="product-form">
          {/* Información básica */}
          <div className="form-section-product">
            <h2>Información Básica</h2>

            <div className="form-group-product">
              <label htmlFor="nombre">Nombre del Producto *</label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                required
                placeholder="Ej: Remera Estampada Floral"
              />
            </div>

            <div className="form-group-product">
              <label htmlFor="descripcion">Descripción *</label>
              <textarea
                id="descripcion"
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
                required
                rows="4"
                placeholder="Describe el producto..."
              ></textarea>
            </div>

            <div className="form-row-product">
              <div className="form-group-product">
                <label htmlFor="precio">Precio *</label>
                <input
                  type="number"
                  id="precio"
                  name="precio"
                  value={formData.precio}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                />
              </div>

              <div className="form-group-product">
                <label htmlFor="categoria">Subcategoría *</label>
                <select
                  id="categoria"
                  name="categoria"
                  value={formData.categoria}
                  onChange={handleChange}
                  required
                >
                  <option value="">Seleccionar subcategoría...</option>
                  {CATEGORIAS_FIJAS.map(padre => (
                    <optgroup key={padre} label={padre}>
                      {groupedCategories[padre].map(cat => (
                        <option key={cat._id} value={cat._id}>
                          {cat.nombre}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
                <small>Seleccioná la subcategoría (ej: Buzos, Remeras, Gorras)</small>
              </div>
            </div>

            <div className="form-group-product">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="destacado"
                  checked={formData.destacado}
                  onChange={handleChange}
                />
                <span>⭐ Marcar como destacado</span>
              </label>
            </div>
          </div>

          {/* Talles y Stock */}
          <div className="form-section-product">
            <h2>Talles y Stock</h2>

            {formData.talles.map((talle, index) => (
              <div key={index} className="talle-row">
                <div className="form-group-product">
                  <label>Talle</label>
                  <select
                    value={talle.talle}
                    onChange={(e) => handleTalleChange(index, 'talle', e.target.value)}
                  >
                    {tallesDisponibles.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group-product">
                  <label>Stock</label>
                  <input
                    type="number"
                    value={talle.stock}
                    onChange={(e) => handleTalleChange(index, 'stock', e.target.value)}
                    min="0"
                  />
                </div>

                {formData.talles.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeTalle(index)}
                    className="btn-remove-talle"
                  >
                    🗑️
                  </button>
                )}
              </div>
            ))}

            <button type="button" onClick={addTalle} className="btn-add-talle">
              ➕ Agregar Talle
            </button>
          </div>

          {/* Imágenes */}
          <div className="form-section-product">
            <h2>Imágenes</h2>

            {/* Imágenes existentes (solo al editar) */}
            {isEditing && existingImages.length > 0 && (
              <div className="existing-images">
                <h3>Imágenes Actuales</h3>
                <div className="images-grid">
                  {existingImages.map((img) => (
                    <div key={img._id} className="image-item">
                      <img src={img.url} alt="Producto" />
                      <button
                        type="button"
                        onClick={() => handleDeleteExistingImage(img._id)}
                        className="btn-delete-image"
                      >
                        🗑️
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Subir nuevas imágenes */}
            <div className="form-group-product">
              <label htmlFor="images">
                {isEditing ? 'Agregar Más Imágenes' : 'Subir Imágenes'}
              </label>
              <input
                type="file"
                id="images"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                key={imagePreviews.length}
              />
              <p className="form-help">
                Podés seleccionar múltiples imágenes a la vez (máx 5MB c/u).
                {images.length > 0 && ` Actualmente: ${images.length} imagen(es) seleccionada(s).`}
              </p>
            </div>

            {/* Vista previa de nuevas imágenes */}
            {imagePreviews.length > 0 && (
              <div className="image-previews">
                <h3>Vista Previa de Nuevas Imágenes</h3>
                <div className="images-grid">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="preview-item">
                      <img src={preview} alt={`Preview ${index + 1}`} />
                      <button
                        type="button"
                        onClick={() => {
                          const newImages = images.filter((_, i) => i !== index);
                          const newPreviews = imagePreviews.filter((_, i) => i !== index);
                          setImages(newImages);
                          setImagePreviews(newPreviews);
                        }}
                        className="btn-delete-preview"
                      >
                        🗑️
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Botones */}
          <div className="form-actions">
            <button
              type="button"
              onClick={() => navigate('/admin/productos')}
              className="btn-cancel-form"
            >
              Cancelar
            </button>
            <button type="submit" className="btn-submit-form" disabled={loading || uploadingImages}>
              {loading
                ? uploadingImages
                  ? 'Subiendo imágenes...'
                  : 'Guardando...'
                : isEditing
                ? 'Actualizar Producto'
                : 'Crear Producto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;