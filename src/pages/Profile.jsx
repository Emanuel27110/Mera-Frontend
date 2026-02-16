import { useState, useEffect } from 'react';
import { useAuth } from '../utils/useAuth';
import { useNavigate } from 'react-router-dom';
import './Profile.css';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    telefono: '',
    direccion: {
      calle: '',
      ciudad: '',
      provincia: '',
      codigoPostal: ''
    }
  });

  const [passwordData, setPasswordData] = useState({
    password: '',
    confirmPassword: ''
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        nombre: user.nombre || '',
        apellido: user.apellido || '',
        telefono: user.telefono || '',
        direccion: {
          calle: user.direccion?.calle || '',
          ciudad: user.direccion?.ciudad || '',
          provincia: user.direccion?.provincia || '',
          codigoPostal: user.direccion?.codigoPostal || ''
        }
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({
      ...passwordData,
      [name]: value
    });
  };

  const handleSubmitProfile = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    const result = await updateProfile(formData);

    if (result.success) {
      setMessage('✅ Perfil actualizado correctamente');
    } else {
      setError(result.message);
    }

    setLoading(false);
  };

  const handleSubmitPassword = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (passwordData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (passwordData.password !== passwordData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);

    const result = await updateProfile({ password: passwordData.password });

    if (result.success) {
      setMessage('✅ Contraseña actualizada correctamente');
      setPasswordData({ password: '', confirmPassword: '' });
      setShowPasswordForm(false);
    } else {
      setError(result.message);
    }

    setLoading(false);
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        <h1>Mi Perfil</h1>

        {/* Información de la cuenta */}
        <div className="profile-section">
          <div className="profile-header-section">
            <h2>Información de la Cuenta</h2>
            <div className="user-avatar">
              {user.nombre.charAt(0).toUpperCase()}
            </div>
          </div>
          
          <div className="profile-info-display">
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Rol:</strong> {user.isAdmin ? 'Administrador' : 'Cliente'}</p>
            <p><strong>Cuenta verificada:</strong> {user.isVerified ? '✅ Sí' : '❌ No'}</p>
          </div>
        </div>

        {/* Mensajes */}
        {message && <div className="success-message-profile">{message}</div>}
        {error && <div className="error-message-profile">{error}</div>}

        {/* Formulario de datos personales */}
        <div className="profile-section">
          <h2>Datos Personales</h2>
          <form onSubmit={handleSubmitProfile} className="profile-form">
            <div className="form-row-profile">
              <div className="form-group-profile">
                <label htmlFor="nombre">Nombre *</label>
                <input
                  type="text"
                  id="nombre"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group-profile">
                <label htmlFor="apellido">Apellido *</label>
                <input
                  type="text"
                  id="apellido"
                  name="apellido"
                  value={formData.apellido}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group-profile">
              <label htmlFor="telefono">Teléfono</label>
              <input
                type="tel"
                id="telefono"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                placeholder="3814567890"
              />
            </div>

            <h3>Dirección</h3>

            <div className="form-group-profile">
              <label htmlFor="direccion.calle">Calle y Número</label>
              <input
                type="text"
                id="direccion.calle"
                name="direccion.calle"
                value={formData.direccion.calle}
                onChange={handleChange}
                placeholder="Ej: San Martín 123"
              />
            </div>

            <div className="form-row-profile">
              <div className="form-group-profile">
                <label htmlFor="direccion.ciudad">Ciudad</label>
                <input
                  type="text"
                  id="direccion.ciudad"
                  name="direccion.ciudad"
                  value={formData.direccion.ciudad}
                  onChange={handleChange}
                  placeholder="Ej: San Miguel de Tucumán"
                />
              </div>

              <div className="form-group-profile">
                <label htmlFor="direccion.provincia">Provincia</label>
                <input
                  type="text"
                  id="direccion.provincia"
                  name="direccion.provincia"
                  value={formData.direccion.provincia}
                  onChange={handleChange}
                  placeholder="Ej: Tucumán"
                />
              </div>
            </div>

            <div className="form-group-profile">
              <label htmlFor="direccion.codigoPostal">Código Postal</label>
              <input
                type="text"
                id="direccion.codigoPostal"
                name="direccion.codigoPostal"
                value={formData.direccion.codigoPostal}
                onChange={handleChange}
                placeholder="Ej: 4000"
              />
            </div>

            <button type="submit" className="btn-save-profile" disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </form>
        </div>

        {/* Cambiar contraseña */}
        <div className="profile-section">
          <h2>Seguridad</h2>
          
          {!showPasswordForm ? (
            <button
              onClick={() => setShowPasswordForm(true)}
              className="btn-change-password"
            >
              🔒 Cambiar Contraseña
            </button>
          ) : (
            <form onSubmit={handleSubmitPassword} className="profile-form">
              <div className="form-group-profile">
                <label htmlFor="password">Nueva Contraseña</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={passwordData.password}
                  onChange={handlePasswordChange}
                  required
                  minLength="6"
                  placeholder="Mínimo 6 caracteres"
                />
              </div>

              <div className="form-group-profile">
                <label htmlFor="confirmPassword">Confirmar Contraseña</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  required
                  placeholder="Repetí la contraseña"
                />
              </div>

              <div className="password-form-actions">
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordForm(false);
                    setPasswordData({ password: '', confirmPassword: '' });
                    setError('');
                  }}
                  className="btn-cancel-password"
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-save-password" disabled={loading}>
                  {loading ? 'Actualizando...' : 'Actualizar Contraseña'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;