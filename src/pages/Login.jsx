import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/useAuth';
import axios from '../utils/axios';
import './Auth.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setNeedsVerification(false);
    setResendSuccess(false);
    setLoading(true);

    const result = await login(email, password);

    if (result.success) {
      navigate('/');
    } else {
      setError(result.message);
      // Si el error es por falta de verificación
      if (result.needsVerification) {
        setNeedsVerification(true);
      }
    }

    setLoading(false);
  };

  const handleResendVerification = async () => {
    setResendLoading(true);
    setError('');
    setResendSuccess(false);

    try {
      const { data } = await axios.post('/auth/resend-verification', { email });
      setResendSuccess(true);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Error al reenviar el email');
    }

    setResendLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Iniciar Sesión</h2>

        {error && <div className="error-message">{error}</div>}
        
        {resendSuccess && (
          <div className="success-message">
            ✅ Email de verificación reenviado. Revisá tu bandeja de entrada.
          </div>
        )}

        {needsVerification && (
          <div className="warning-message">
            <p>⚠️ Tu cuenta no está verificada.</p>
            <p>Revisá tu email o hacé click abajo para reenviar el email de verificación.</p>
            <button 
              onClick={handleResendVerification}
              className="btn-resend"
              disabled={resendLoading}
            >
              {resendLoading ? 'Enviando...' : '📧 Reenviar Email de Verificación'}
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? 'Cargando...' : 'Iniciar Sesión'}
          </button>
        </form>

        <p className="auth-link">
          ¿No tenés cuenta? <Link to="/register">Registrate acá</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;