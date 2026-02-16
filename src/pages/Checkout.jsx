import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../utils/useCart';
import { useAuth } from '../utils/useAuth';
import axios from '../utils/axios';
import './Checkout.css';

const Checkout = () => {
  const { cart, getTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    calle: user?.direccion?.calle || '',
    ciudad: user?.direccion?.ciudad || '',
    provincia: user?.direccion?.provincia || '',
    codigoPostal: user?.direccion?.codigoPostal || '',
    metodoPago: 'efectivo',
    notas: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Redirigir si el carrito está vacío
  useEffect(() => {
    if (cart.length === 0) {
      navigate('/carrito');
    }
  }, [cart, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');
  setLoading(true);

  // Preparar productos para el pedido
  const productos = cart.map((item) => ({
    producto: item._id,
    cantidad: item.cantidad,
    talle: item.selectedTalle
  }));

  const orderData = {
    productos,
    direccionEnvio: {
      calle: formData.calle,
      ciudad: formData.ciudad,
      provincia: formData.provincia,
      codigoPostal: formData.codigoPostal
    },
    metodoPago: formData.metodoPago,
    notas: formData.notas
  };

  try {
    const { data } = await axios.post('/orders', orderData);
    
    console.log('✅ PEDIDO CREADO:', data);
    console.log('📍 ID:', data._id);
    
    const orderId = data._id;
    
    // Primero navegar, DESPUÉS limpiar el carrito
    navigate(`/pedido-exitoso/${orderId}`, { replace: true });
    
    // Pequeño delay antes de limpiar el carrito
    setTimeout(() => {
      clearCart();
    }, 100);
    
  } catch (error) {
    console.error('❌ ERROR al crear pedido:', error);
    console.error('Response:', error.response?.data);
    setError(error.response?.data?.message || 'Error al procesar el pedido');
    setLoading(false);
  }
};

  // Mostrar loading mientras redirecciona
  if (cart.length === 0) {
    return null;
  }

  return (
    <div className="checkout-page">
      <div className="checkout-container">
        <h1>Finalizar Compra</h1>

        <div className="checkout-content">
          {/* Formulario */}
          <form onSubmit={handleSubmit} className="checkout-form">
            <div className="form-section">
              <h2>Dirección de Envío</h2>

              <div className="form-group">
                <label htmlFor="calle">Calle y Número *</label>
                <input
                  type="text"
                  id="calle"
                  name="calle"
                  value={formData.calle}
                  onChange={handleChange}
                  required
                  placeholder="Ej: San Martín 123"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="ciudad">Ciudad *</label>
                  <input
                    type="text"
                    id="ciudad"
                    name="ciudad"
                    value={formData.ciudad}
                    onChange={handleChange}
                    required
                    placeholder="Ej: San Miguel de Tucumán"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="provincia">Provincia *</label>
                  <input
                    type="text"
                    id="provincia"
                    name="provincia"
                    value={formData.provincia}
                    onChange={handleChange}
                    required
                    placeholder="Ej: Tucumán"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="codigoPostal">Código Postal *</label>
                <input
                  type="text"
                  id="codigoPostal"
                  name="codigoPostal"
                  value={formData.codigoPostal}
                  onChange={handleChange}
                  required
                  placeholder="Ej: 4000"
                />
              </div>
            </div>

            <div className="form-section">
              <h2>Método de Pago</h2>

              <div className="payment-methods">
                <label className="payment-option">
                  <input
                    type="radio"
                    name="metodoPago"
                    value="efectivo"
                    checked={formData.metodoPago === 'efectivo'}
                    onChange={handleChange}
                  />
                  <span>💵 Efectivo (Pago contra entrega)</span>
                </label>

                <label className="payment-option">
                  <input
                    type="radio"
                    name="metodoPago"
                    value="transferencia"
                    checked={formData.metodoPago === 'transferencia'}
                    onChange={handleChange}
                  />
                  <span>🏦 Transferencia Bancaria</span>
                </label>

                <label className="payment-option">
                  <input
                    type="radio"
                    name="metodoPago"
                    value="mercadopago"
                    checked={formData.metodoPago === 'mercadopago'}
                    onChange={handleChange}
                  />
                  <span>💳 MercadoPago</span>
                </label>
              </div>
            </div>

            <div className="form-section">
              <h2>Notas Adicionales (Opcional)</h2>
              <textarea
                name="notas"
                value={formData.notas}
                onChange={handleChange}
                placeholder="Ej: Entregar por la tarde, dejar en portería, etc."
                rows="4"
              ></textarea>
            </div>

            {error && <div className="error-message">{error}</div>}

            <button type="submit" className="btn-submit-order" disabled={loading}>
              {loading ? 'Procesando...' : 'Confirmar Pedido'}
            </button>
          </form>

          {/* Resumen del pedido */}
          <div className="checkout-summary">
            <h2>Resumen del Pedido</h2>

            <div className="order-items">
              {cart.map((item) => (
                <div key={`${item._id}-${item.selectedTalle}`} className="order-item">
                  <div className="order-item-info">
                    <p className="order-item-name">{item.nombre}</p>
                    <p className="order-item-details">
                      Talle: {item.selectedTalle} | Cantidad: {item.cantidad}
                    </p>
                  </div>
                  <p className="order-item-price">${item.precio * item.cantidad}</p>
                </div>
              ))}
            </div>

            <div className="order-summary-divider"></div>

            <div className="order-summary-row">
              <span>Subtotal:</span>
              <span>${getTotal()}</span>
            </div>

            <div className="order-summary-row">
              <span>Envío:</span>
              <span>A coordinar</span>
            </div>

            <div className="order-summary-divider"></div>

            <div className="order-summary-total">
              <span>Total:</span>
              <span>${getTotal()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;