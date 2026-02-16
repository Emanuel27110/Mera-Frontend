import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from '../utils/axios';
import '../pages/Auth.css';

const VerifyEmail = () => {
  const { token } = useParams();
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');
  const [userName, setUserName] = useState('');
  
  // Prevenir doble ejecución
  const hasVerified = useRef(false);

  useEffect(() => {
    const verifyEmailToken = async () => {
      // Si ya verificamos, no hacerlo de nuevo
      if (hasVerified.current) return;
      
      // Marcar como verificado
      hasVerified.current = true;
      
      try {
        console.log('🔍 Verificando token:', token);
        
        const { data } = await axios.get(`/auth/verify-email/${token}`);
        
        console.log('✅ Respuesta del servidor:', data);
        
        if (data.success) {
          setStatus('success');
          setMessage(data.message);
          setUserName(data.user?.nombre || '');
        } else {
          setStatus('error');
          setMessage(data.message || 'Error al verificar el email');
        }
      } catch (error) {
        console.error('❌ Error en verificación:', error);
        
        // Si el error es porque ya fue verificado, mostrar éxito de todos modos
        if (error.response?.data?.message?.includes('Token inválido')) {
          setStatus('error');
          setMessage('Este link de verificación ya fue usado o expiró.');
        } else {
          setStatus('error');
          setMessage(
            error.response?.data?.message || 
            'Error al verificar el email. Intentá de nuevo.'
          );
        }
      }
    };

    if (token) {
      verifyEmailToken();
    } else {
      setStatus('error');
      setMessage('No se recibió un token de verificación');
    }
  }, [token]);

  // Pantalla de carga
  if (status === 'loading') {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="loading-spinner"></div>
          <h2>Verificando tu email...</h2>
          <p>Por favor esperá un momento</p>
        </div>
      </div>
    );
  }

  // Pantalla de éxito
  if (status === 'success') {
    return (
      <div className="auth-container">
        <div className="auth-card success-card">
          <div className="success-icon">🎉</div>
          <h2>¡Email Verificado!</h2>
          
          <div className="success-message">
            {userName && <p>¡Bienvenido/a {userName}!</p>}
            <p>Tu cuenta ha sido verificada exitosamente.</p>
            <p>Ya podés iniciar sesión y comenzar a comprar en MERA'S.</p>
          </div>

          <div className="verification-benefits">
            <h3>Ahora podés:</h3>
            <ul>
              <li>✅ Comprar productos de nuestro catálogo</li>
              <li>✅ Diseñar tus propias prendas personalizadas</li>
              <li>✅ Guardar tus diseños favoritos</li>
              <li>✅ Seguir el estado de tus pedidos</li>
            </ul>
          </div>

          <Link to="/login" className="btn-submit">
            Iniciar Sesión
          </Link>

          <Link to="/" className="btn-secondary">
            Volver al Inicio
          </Link>
        </div>
      </div>
    );
  }

  // Pantalla de error
  return (
    <div className="auth-container">
      <div className="auth-card error-card">
        <div className="error-icon">❌</div>
        <h2>Error de Verificación</h2>
        
        <div className="error-message">
          <p>{message}</p>
        </div>

        <div className="error-instructions">
          <h3>¿Qué podés hacer?</h3>
          <ul>
            <li>Si ya verificaste tu email antes, intentá iniciar sesión directamente</li>
            <li>Si no podés iniciar sesión, solicitá un nuevo email de verificación</li>
            <li>Contactanos si el problema persiste</li>
          </ul>
        </div>

        <Link to="/login" className="btn-submit">
          Ir a Iniciar Sesión
        </Link>

        <Link to="/" className="btn-secondary">
          Volver al Inicio
        </Link>
      </div>
    </div>
  );
};

export default VerifyEmail;