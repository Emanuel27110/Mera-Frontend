import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../utils/useAuth';
import './Auth.css';

const Register = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    confirmPassword: '',
    telefono: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');

  const { register } = useAuth();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    // Validaciones
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);

    const result = await register({
      nombre: formData.nombre,
      apellido: formData.apellido,
      email: formData.email,
      password: formData.password,
      telefono: formData.telefono
    });

    if (result.success) {
      setSuccess(true);
      setRegisteredEmail(formData.email);
      // Limpiar formulario
      setFormData({
        nombre: '',
        apellido: '',
        email: '',
        password: '',
        confirmPassword: '',
        telefono: ''
      });
    } else {
      setError(result.message);
    }

    setLoading(false);
  };

  // Pantalla de éxito después de registrarse
  if (success) {
    return (
      <div className="auth-container">
        <div className="auth-card success-card">
          <div className="success-icon">✅</div>
          <h2>¡Registro Exitoso!</h2>
          
          <div className="success-message">
            <p>
              Te hemos enviado un email de verificación a:
            </p>
            <p className="email-highlight">{registeredEmail}</p>
            
            <div className="instructions">
              <h3>Próximos pasos:</h3>
              <ol>
                <li>Abrí tu bandeja de entrada</li>
                <li>Buscá el email de MERA'S</li>
                <li>Hacé click en el botón de verificación</li>
                <li>¡Listo! Ya podés iniciar sesión</li>
              </ol>
            </div>

            <p className="note">
              💡 Si no ves el email, revisá la carpeta de spam
            </p>
          </div>

          <Link to="/login" className="btn-submit">
            Ir a Iniciar Sesión
          </Link>
        </div>
      </div>
    );
  }

  // Formulario de registro
  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Crear Cuenta</h2>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="nombre">Nombre</label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="apellido">Apellido</label>
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

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
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

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirmar Contraseña</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? 'Cargando...' : 'Registrarse'}
          </button>
        </form>

        <p className="auth-link">
          ¿Ya tenés cuenta? <Link to="/login">Iniciá sesión acá</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;