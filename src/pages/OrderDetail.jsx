import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from '../utils/axios';
import './OrderDetail.css';

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [canceling, setCanceling] = useState(false);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`/orders/${id}`);
      setOrder(data);
      setLoading(false);
    } catch (error) {
      console.error('Error al cargar pedido:', error);
      setError('Pedido no encontrado');
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchOrder();
  }, [id]);

  const handleCancelOrder = async () => {
    if (!window.confirm('¿Estás seguro de que querés cancelar este pedido?')) {
      return;
    }

    try {
      setCanceling(true);
      await axios.put(`/orders/${id}/cancel`);
      // Recargar pedido
      await fetchOrder();
      setCanceling(false);
    } catch (error) {
      console.error('Error al cancelar pedido:', error);
      alert(error.response?.data?.message || 'No se pudo cancelar el pedido');
      setCanceling(false);
    }
  };

  const getEstadoBadge = (estado) => {
    const badges = {
      pendiente: { text: 'Pendiente', class: 'badge-pendiente' },
      en_preparacion: { text: 'En Preparación', class: 'badge-preparacion' },
      enviado: { text: 'Enviado', class: 'badge-enviado' },
      entregado: { text: 'Entregado', class: 'badge-entregado' },
      cancelado: { text: 'Cancelado', class: 'badge-cancelado' }
    };
    return badges[estado] || { text: estado, class: '' };
  };

  if (loading) {
    return <div className="loading">Cargando pedido...</div>;
  }

  if (error || !order) {
    return (
      <div className="order-error">
        <h2>{error}</h2>
        <Link to="/mis-pedidos" className="btn btn-primary">
          Volver a Mis Pedidos
        </Link>
      </div>
    );
  }

  const badge = getEstadoBadge(order.estado);
  const canCancel = order.estado === 'pendiente' || order.estado === 'en_preparacion';

  return (
    <div className="order-detail-page">
      <div className="order-detail-container">
        <div className="order-detail-header">
          <button onClick={() => navigate(-1)} className="btn-back-order">
            ← Volver
          </button>
          <h1>Detalle del Pedido</h1>
        </div>

        <div className="order-detail-content">
          {/* Información principal */}
          <div className="order-main-info">
            <div className="info-card">
              <h2>Información del Pedido</h2>
              
              <div className="info-row">
                <span>Número de pedido:</span>
                <strong>#{order._id.slice(-8).toUpperCase()}</strong>
              </div>

              <div className="info-row">
                <span>Fecha:</span>
                <span>{new Date(order.createdAt).toLocaleString('es-AR')}</span>
              </div>

              <div className="info-row">
                <span>Estado:</span>
                <span className={`order-badge ${badge.class}`}>{badge.text}</span>
              </div>

              <div className="info-row">
                <span>Estado de pago:</span>
                <span className="payment-status">{order.estadoPago}</span>
              </div>

              <div className="info-row">
                <span>Método de pago:</span>
                <span className="payment-method-detail">{order.metodoPago}</span>
              </div>

              <div className="info-row total-row">
                <span>Total:</span>
                <strong>${order.total}</strong>
              </div>
            </div>

            {/* Dirección de envío */}
            <div className="info-card">
              <h2>Dirección de Envío</h2>
              <p>{order.direccionEnvio.calle}</p>
              <p>{order.direccionEnvio.ciudad}, {order.direccionEnvio.provincia}</p>
              <p>CP: {order.direccionEnvio.codigoPostal}</p>
            </div>

            {/* Notas */}
            {order.notas && (
              <div className="info-card">
                <h2>Notas</h2>
                <p>{order.notas}</p>
              </div>
            )}

            {/* Botón cancelar */}
            {canCancel && (
              <button
                onClick={handleCancelOrder}
                className="btn-cancel-order"
                disabled={canceling}
              >
                {canceling ? 'Cancelando...' : 'Cancelar Pedido'}
              </button>
            )}
          </div>

          {/* Productos */}
          <div className="order-products-detail">
            <h2>Productos</h2>
            <div className="products-detail-list">
              {order.productos.map((item, index) => (
                <div key={index} className="product-detail-item">
                  <div className="product-detail-image">
                    {item.imagen ? (
                      <img src={item.imagen} alt={item.nombre} />
                    ) : (
                      <div className="no-image-small">Sin imagen</div>
                    )}
                  </div>

                  <div className="product-detail-info">
                    <h3>{item.nombre}</h3>
                    <p>Talle: {item.talle}</p>
                    <p>Cantidad: {item.cantidad}</p>
                    <p className="product-unit-price">
                      ${item.precio} c/u
                    </p>
                  </div>

                  <div className="product-detail-price">
                    <strong>${item.precio * item.cantidad}</strong>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;