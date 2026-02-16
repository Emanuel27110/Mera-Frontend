import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from '../utils/axios';
import './OrderSuccess.css';

const OrderSuccess = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchOrder = async () => {
    try {
      const { data } = await axios.get(`/orders/${id}`);
      setOrder(data);
      setLoading(false);
    } catch (error) {
      console.error('Error al cargar pedido:', error);
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchOrder();
  }, [id]);

  if (loading) {
    return <div className="loading">Cargando...</div>;
  }

  if (!order) {
    return (
      <div className="order-error">
        <h2>Pedido no encontrado</h2>
        <Link to="/" className="btn btn-primary">
          Volver al inicio
        </Link>
      </div>
    );
  }

  const isPending = order.estado === 'pendiente_confirmacion';

  return (
    <div className="order-success-page">
      <div className="success-container">
        <div className="success-icon">✅</div>
        <h1>¡Pedido Realizado con Éxito!</h1>
        
        {isPending ? (
          <p className="success-message">
            Tu pedido ha sido registrado. <strong>En breve te enviaremos un email</strong> con la confirmación de stock y los datos de pago.
          </p>
        ) : (
          <p className="success-message">
            Tu pedido ha sido confirmado. Revisá tu email para más información.
          </p>
        )}

        <div className="order-details">
          <h2>Detalles del Pedido</h2>

          <div className="order-info-row">
            <span>Número de pedido:</span>
            <strong>#{order._id.slice(-8).toUpperCase()}</strong>
          </div>

          <div className="order-info-row">
            <span>Estado:</span>
            <span className={`order-status ${isPending ? 'pending' : 'confirmed'}`}>
              {isPending ? '⏳ Pendiente de Confirmación' : order.estado}
            </span>
          </div>

          <div className="order-info-row">
            <span>Total:</span>
            <strong>${order.total}</strong>
          </div>

          <div className="order-info-row">
            <span>Método de pago:</span>
            <span className="payment-method">{order.metodoPago}</span>
          </div>

          <div className="order-address">
            <h3>Dirección de Envío:</h3>
            <p>{order.direccionEnvio.calle}</p>
            <p>
              {order.direccionEnvio.ciudad}, {order.direccionEnvio.provincia}
            </p>
            <p>CP: {order.direccionEnvio.codigoPostal}</p>
          </div>

          <div className="order-products">
            <h3>Productos:</h3>
            {order.productos.map((item, index) => (
              <div key={index} className="order-product-item">
                <span>
                  {item.nombre} - Talle: {item.talle} x {item.cantidad}
                </span>
                <span>${item.precio * item.cantidad}</span>
              </div>
            ))}
          </div>

          {isPending && (
            <div className="pending-info">
              <h3>📧 Próximos pasos:</h3>
              <ol>
                <li>Verificaremos el stock de tus productos</li>
                <li>Te enviaremos un email con la confirmación</li>
                <li>Recibirás los datos para realizar el pago</li>
                <li>Una vez confirmado el pago, preparamos tu pedido</li>
              </ol>
            </div>
          )}
        </div>

        <div className="success-actions">
          <Link to="/mis-pedidos" className="btn btn-primary">
            Ver Mis Pedidos
          </Link>
          <Link to="/productos" className="btn btn-secondary">
            Seguir Comprando
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;