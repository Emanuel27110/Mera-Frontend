import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from '../utils/axios';
import './MyOrders.css';

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('/orders/myorders');
      setOrders(data);
      setLoading(false);
    } catch (error) {
      console.error('Error al cargar pedidos:', error);
      setError('Error al cargar los pedidos');
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchOrders();
  }, []);

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
    return <div className="loading">Cargando pedidos...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="my-orders-page">
      <div className="my-orders-container">
        <h1>Mis Pedidos</h1>

        {orders.length === 0 ? (
          <div className="no-orders">
            <p>Todavía no tenés pedidos</p>
            <Link to="/productos" className="btn btn-primary">
              Ir a Comprar
            </Link>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((order) => {
              const badge = getEstadoBadge(order.estado);
              return (
                <div key={order._id} className="order-card">
                  <div className="order-header">
                    <div className="order-number">
                      <strong>Pedido #{order._id.slice(-8).toUpperCase()}</strong>
                      <span className="order-date">
                        {new Date(order.createdAt).toLocaleDateString('es-AR')}
                      </span>
                    </div>
                    <span className={`order-badge ${badge.class}`}>
                      {badge.text}
                    </span>
                  </div>

                  <div className="order-products">
                    {order.productos.map((item, index) => (
                      <div key={index} className="order-product">
                        <div className="product-info">
                          <p className="product-name">{item.nombre}</p>
                          <p className="product-details">
                            Talle: {item.talle} | Cantidad: {item.cantidad}
                          </p>
                        </div>
                        <p className="product-price">${item.precio * item.cantidad}</p>
                      </div>
                    ))}
                  </div>

                  <div className="order-footer">
                    <div className="order-info">
                      <p>
                        <strong>Total:</strong> ${order.total}
                      </p>
                      <p>
                        <strong>Método de pago:</strong>{' '}
                        <span className="payment-method">{order.metodoPago}</span>
                      </p>
                    </div>

                    <Link
                      to={`/pedido/${order._id}`}
                      className="btn-view-details"
                    >
                      Ver Detalles
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrders;