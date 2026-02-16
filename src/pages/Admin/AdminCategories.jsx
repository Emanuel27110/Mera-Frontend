import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from '../../utils/axios';
import './AdminCategories.css';

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    categoriaPadre: 'INDUMENTARIA',
    showInNavbar: false,
    orden: 0
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const CATEGORIAS_FIJAS = ['INDUMENTARIA', 'ACCESORIOS', 'SUBLIMACIÓN'];

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('/categories?admin=true');
      setCategories(data);
      setLoading(false);
    } catch (error) {
      console.error('Error al cargar categorías:', error);
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchCategories();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    try {
      let categoryId = editingId;

      // Crear o actualizar subcategoría
      if (editingId) {
        await axios.put(`/categories/${editingId}`, formData);
        setMessage('✅ Subcategoría actualizada');
      } else {
        const { data } = await axios.post('/categories', formData);
        categoryId = data._id;
        setMessage('✅ Subcategoría creada');
      }

      // Subir imagen si hay
      if (imageFile && categoryId) {
        const formDataImage = new FormData();
        formDataImage.append('imagen', imageFile);

        await axios.post(`/categories/${categoryId}/image`, formDataImage, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setMessage('✅ Subcategoría creada con imagen');
      }

      // Reset form
      setFormData({ 
        nombre: '', 
        descripcion: '', 
        categoriaPadre: 'INDUMENTARIA',
        showInNavbar: false, 
        orden: 0 
      });
      setImageFile(null);
      setImagePreview('');
      setShowForm(false);
      setEditingId(null);
      fetchCategories();
    } catch (error) {
      setError(error.response?.data?.message || 'Error al guardar subcategoría');
    }
  };

  const handleEdit = (category) => {
    setFormData({
      nombre: category.nombre,
      descripcion: category.descripcion || '',
      categoriaPadre: category.categoriaPadre || 'INDUMENTARIA',
      showInNavbar: category.showInNavbar || false,
      orden: category.orden
    });
    setImagePreview(category.imagen?.url || '');
    setEditingId(category._id);
    setShowForm(true);
  };

  const handleDeleteImage = async (id) => {
    if (!window.confirm('¿Eliminar la imagen?')) return;

    try {
      await axios.delete(`/categories/${id}/image`);
      setMessage('✅ Imagen eliminada');
      fetchCategories();
    } catch (error) {
      setError('Error al eliminar imagen');
    }
  };

  const handleDelete = async (id, nombre) => {
    if (!window.confirm(`¿Eliminar la subcategoría "${nombre}"?`)) return;

    try {
      await axios.delete(`/categories/${id}`);
      setMessage('✅ Subcategoría eliminada');
      fetchCategories();
    } catch (error) {
      setError('Error al eliminar subcategoría');
    }
  };

  const toggleActive = async (id, currentStatus) => {
    try {
      await axios.put(`/categories/${id}`, { activa: !currentStatus });
      fetchCategories();
    } catch (error) {
      setError('Error al actualizar subcategoría');
    }
  };

  const cancelForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({ 
      nombre: '', 
      descripcion: '', 
      categoriaPadre: 'INDUMENTARIA',
      showInNavbar: false,
      orden: 0 
    });
    setImageFile(null);
    setImagePreview('');
    setError('');
  };

  if (loading) {
    return <div className="loading">Cargando subcategorías...</div>;
  }

  // Agrupar por categoría padre
  const groupedCategories = CATEGORIAS_FIJAS.reduce((acc, padre) => {
    acc[padre] = categories.filter(cat => cat.categoriaPadre === padre);
    return acc;
  }, {});

  return (
    <div className="admin-categories-page">
      <div className="admin-categories-header">
        <h1>Gestión de Subcategorías</h1>
        <div className="header-actions">
          <Link to="/admin" className="btn-back">
            ← Volver
          </Link>
          {!showForm && (
            <button onClick={() => setShowForm(true)} className="btn-create">
              ➕ Nueva Subcategoría
            </button>
          )}
        </div>
      </div>

      {message && <div className="success-message">{message}</div>}
      {error && <div className="error-message">{error}</div>}

      {/* Formulario */}
      {showForm && (
        <div className="category-form-container">
          <h2>{editingId ? 'Editar Subcategoría' : 'Nueva Subcategoría'}</h2>
          <form onSubmit={handleSubmit} className="category-form">
            <div className="form-group">
              <label htmlFor="categoriaPadre">Categoría Padre *</label>
              <select
                id="categoriaPadre"
                name="categoriaPadre"
                value={formData.categoriaPadre}
                onChange={handleChange}
                required
              >
                {CATEGORIAS_FIJAS.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <small>Las subcategorías se mostrarán dentro de esta categoría</small>
            </div>

            <div className="form-group">
              <label htmlFor="nombre">Nombre de la Subcategoría *</label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                required
                placeholder="Ej: Buzos, Remeras, Gorras..."
              />
            </div>

            <div className="form-group">
              <label htmlFor="descripcion">Descripción</label>
              <textarea
                id="descripcion"
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
                rows="3"
                placeholder="Descripción opcional..."
              ></textarea>
            </div>

            <div className="form-group">
              <label htmlFor="imagen">Imagen de la Subcategoría</label>
              <input
                type="file"
                id="imagen"
                accept="image/*"
                onChange={handleImageChange}
              />
              <small>Recomendado: 600x400px</small>

              {imagePreview && (
                <div className="image-preview-container">
                  <img src={imagePreview} alt="Preview" className="image-preview" />
                  {editingId && (
                    <button
                      type="button"
                      onClick={() => handleDeleteImage(editingId)}
                      className="btn-delete-preview"
                    >
                      🗑️ Eliminar Imagen
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="showInNavbar"
                  checked={formData.showInNavbar}
                  onChange={(e) => setFormData({...formData, showInNavbar: e.target.checked})}
                />
                <span>✨ Mostrar en Navbar</span>
              </label>
              <small>Si está marcado, aparecerá en el menú de navegación superior</small>
            </div>

            <div className="form-group">
              <label htmlFor="orden">Orden de aparición</label>
              <input
                type="number"
                id="orden"
                name="orden"
                value={formData.orden}
                onChange={handleChange}
                min="0"
              />
              <small>Menor número aparece primero</small>
            </div>

            <div className="form-actions">
              <button type="button" onClick={cancelForm} className="btn-cancel">
                Cancelar
              </button>
              <button type="submit" className="btn-submit">
                {editingId ? 'Actualizar' : 'Crear'} Subcategoría
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de subcategorías AGRUPADAS */}
      <div className="categories-list-grouped">
        {CATEGORIAS_FIJAS.map(categoriaPadre => (
          <div key={categoriaPadre} className="categoria-padre-group">
            <h2 className="categoria-padre-title-list">
              {categoriaPadre}
              <span className="count-badge">
                {groupedCategories[categoriaPadre].length}
              </span>
            </h2>

            {groupedCategories[categoriaPadre].length === 0 ? (
              <p className="no-categories">No hay subcategorías en {categoriaPadre}</p>
            ) : (
              <div className="categories-grid">
                {groupedCategories[categoriaPadre].map((category) => (
                  <div key={category._id} className="category-card">
                    {category.imagen?.url && (
                      <div className="category-card-image">
                        <img src={category.imagen.url} alt={category.nombre} />
                      </div>
                    )}

                    <div className="category-info">
                      <h3>{category.nombre}</h3>
                      {category.descripcion && <p>{category.descripcion}</p>}
                      <div className="category-meta">
                        <span className="category-orden">Orden: {category.orden}</span>
                        {category.showInNavbar && (
                          <span className="badge-navbar">📍 En Navbar</span>
                        )}
                        {!category.activa && (
                          <span className="badge-inactive">Inactiva</span>
                        )}
                      </div>
                    </div>

                    <div className="category-actions">
                      <button
                        onClick={() => handleEdit(category)}
                        className="btn-edit-cat"
                      >
                        ✏️ Editar
                      </button>
                      <button
                        onClick={() => toggleActive(category._id, category.activa)}
                        className={`btn-toggle-cat ${category.activa ? 'active' : 'inactive'}`}
                      >
                        {category.activa ? '✅ Activa' : '❌ Inactiva'}
                      </button>
                      <button
                        onClick={() => handleDelete(category._id, category.nombre)}
                        className="btn-delete-cat"
                      >
                        🗑️ Eliminar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminCategories;