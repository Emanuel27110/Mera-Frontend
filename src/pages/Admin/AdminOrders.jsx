import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from '../../utils/axios';
import './AdminOrders.css';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [confirmingId, setConfirmingId] = useState(null);
  const [notasAdmin, setNotasAdmin] = useState('');

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const url = filter === 'all' ? '/orders' : `/orders?estado=${filter}`;
      const { data } = await axios.get(url);
      setOrders(data);
      setLoading(false);
    } catch (error) {
      console.error('Error al cargar pedidos:', error);
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchOrders();
  }, [filter]);

  const handleConfirmOrder = async (orderId) => {
    if (!window.confirm('¿Confirmar este pedido? Se descontará el stock.')) return;

    try {
      await axios.put(`/orders/${orderId}/confirm`, { notasAdmin });
      alert('✅ Pedido confirmado. Ahora podés enviarle los datos de pago al cliente.');
      setConfirmingId(null);
      setNotasAdmin('');
      fetchOrders();
    } catch (error) {
      alert(error.response?.data?.message || 'Error al confirmar pedido');
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await axios.put(`/orders/${orderId}/status`, { estado: newStatus });
      fetchOrders();
    } catch (error) {
      console.error('Error al actualizar estado:', error);
      alert('Error al actualizar el estado del pedido');
    }
  };

  const handlePaymentStatusChange = async (orderId, newStatus) => {
    try {
      await axios.put(`/orders/${orderId}/payment`, { estadoPago: newStatus });
      fetchOrders();
    } catch (error) {
      console.error('Error al actualizar pago:', error);
      alert('Error al actualizar el estado de pago');
    }
  };

  const getEstadoBadge = (estado) => {
    const badges = {
      pendiente_confirmacion: { text: '⏳ Pendiente Confirmación', class: 'badge-pending-confirm' },
      confirmado: { text: '✅ Confirmado', class: 'badge-confirmed' },
      en_preparacion: { text: '📦 En Preparación', class: 'badge-preparacion' },
      enviado: { text: '🚚 Enviado', class: 'badge-enviado' },
      entregado: { text: '✅ Entregado', class: 'badge-entregado' },
      cancelado: { text: '❌ Cancelado', class: 'badge-cancelado' }
    };
    return badges[estado] || { text: estado, class: '' };
  };

  if (loading) {
    return <div className="loading">Cargando pedidos...</div>;
  }

  return (
    <div className="admin-orders-page">
      <div className="admin-orders-header">
        <h1>Gestión de Pedidos</h1>
        <Link to="/admin" className="btn-back">
          ← Volver al Dashboard
        </Link>
      </div>

      {/* Filtros */}
      <div className="orders-filters">
        <button
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          Todos ({orders.length})
        </button>
        <button
          className={`filter-btn ${filter === 'pendiente_confirmacion' ? 'active' : ''}`}
          onClick={() => setFilter('pendiente_confirmacion')}
        >
          ⏳ Pendientes
        </button>
        <button
          className={`filter-btn ${filter === 'confirmado' ? 'active' : ''}`}
          onClick={() => setFilter('confirmado')}
        >
          ✅ Confirmados
        </button>
        <button
          className={`filter-btn ${filter === 'en_preparacion' ? 'active' : ''}`}
          onClick={() => setFilter('en_preparacion')}
        >
          📦 En Preparación
        </button>
        <button
          className={`filter-btn ${filter === 'enviado' ? 'active' : ''}`}
          onClick={() => setFilter('enviado')}
        >
          🚚 Enviados
        </button>
        <button
          className={`filter-btn ${filter === 'entregado' ? 'active' : ''}`}
          onClick={() => setFilter('entregado')}
        >
          ✅ Entregados
        </button>
      </div>

      {/* Lista de pedidos */}
      {orders.length === 0 ? (
        <div className="no-orders-admin">
          <p>No hay pedidos en esta categoría</p>
        </div>
      ) : (
        <div className="admin-orders-list">
          {orders.map((order) => {
            const badge = getEstadoBadge(order.estado);
            const isPendingConfirmation = order.estado === 'pendiente_confirmacion';
            
            return (
              <div key={order._id} className="admin-order-card">
                <div className="order-card-header">
                  <div>
                    <h3>Pedido #{order._id.slice(-8).toUpperCase()}</h3>
                    <p className="order-date">
                      {new Date(order.createdAt).toLocaleString('es-AR')}
                    </p>
                  </div>
                  <div className="order-header-right">
                    <span className={`order-badge ${badge.class}`}>{badge.text}</span>
                    <div className="order-total">
                      <span>Total:</span>
                      <strong>${order.total}</strong>
                    </div>
                  </div>
                </div>

                {/* Alerta de confirmación pendiente */}
                {isPendingConfirmation && (
                  <div className="pending-alert">
                    <strong>⚠️ Este pedido requiere tu confirmación</strong>
                    <p>Verificá el stock y confirmá para que el cliente reciba los datos de pago.</p>
                  </div>
                )}

                <div className="order-card-body">
                  {/* Información del cliente */}
                  <div className="order-section">
                    <h4>Cliente</h4>
                    <p>
                      <strong>{order.usuario?.nombre} {order.usuario?.apellido}</strong>
                    </p>
                    <p>📧 {order.usuario?.email}</p>
                    <p>📱 {order.usuario?.telefono}</p>
                  </div>

                  {/* Dirección */}
                  <div className="order-section">
                    <h4>Dirección de Envío</h4>
                    <p>{order.direccionEnvio.calle}</p>
                    <p>
                      {order.direccionEnvio.ciudad}, {order.direccionEnvio.provincia}
                    </p>
                    <p>CP: {order.direccionEnvio.codigoPostal}</p>
                  </div>

                  {/* Productos */}
                  <div className="order-section order-products-section">
                    <h4>Productos</h4>
                    {order.productos.map((item, index) => (
                      <div key={index} className="order-product-row">
                        <span>
                          {item.nombre} - Talle {item.talle} x {item.cantidad}
                        </span>
                        <span>${item.precio * item.cantidad}</span>
                      </div>
                    ))}
                  </div>

                  {/* Notas del cliente */}
                  {order.notas && (
                    <div className="order-section">
                      <h4>Notas del Cliente</h4>
                      <p className="order-notes">{order.notas}</p>
                    </div>
                  )}

                  {/* Notas admin */}
                  {order.notasAdmin && (
                    <div className="order-section">
                      <h4>Notas Internas</h4>
                      <p className="order-notes-admin">{order.notasAdmin}</p>
                    </div>
                  )}
                </div>

                <div className="order-card-footer">
                  {/* Botón de confirmación */}
                  {isPendingConfirmation && (
                    <div className="confirm-section">
                      {confirmingId === order._id ? (
                        <div className="confirm-form">
                          <textarea
                            placeholder="Notas internas (opcional): Ej: Stock verificado, datos de pago enviados..."
                            value={notasAdmin}
                            onChange={(e) => setNotasAdmin(e.target.value)}
                            rows="2"
                            className="notas-textarea"
                          ></textarea>
                          <div className="confirm-actions">
                            <button
                              onClick={() => {
                                setConfirmingId(null);
                                setNotasAdmin('');
                              }}
                              className="btn-cancel-confirm"
                            >
                              Cancelar
                            </button>
                            <button
                              onClick={() => handleConfirmOrder(order._id)}
                              className="btn-confirm-order"
                            >
                              ✅ Confirmar Pedido
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmingId(order._id)}
                          className="btn-start-confirm"
                        >
                          ✅ Confirmar Stock y Enviar Datos de Pago
                        </button>
                      )}
                    </div>
                  )}

                  {/* Controles normales (solo si ya está confirmado) */}
                  {!isPendingConfirmation && (
                    <>
                      {/* Estado del pedido */}
                      <div className="status-control">
                        <label>Estado del Pedido:</label>
                        <select
                          value={order.estado}
                          onChange={(e) => handleStatusChange(order._id, e.target.value)}
                          className="status-select"
                        >
                          <option value="confirmado">Confirmado</option>
                          <option value="en_preparacion">En Preparación</option>
                          <option value="enviado">Enviado</option>
                          <option value="entregado">Entregado</option>
                          <option value="cancelado">Cancelado</option>
                        </select>
                      </div>

                      {/* Estado de pago */}
                      <div className="status-control">
                        <label>Estado de Pago:</label>
                        <select
                          value={order.estadoPago}
                          onChange={(e) =>
                            handlePaymentStatusChange(order._id, e.target.value)
                          }
                          className="status-select"
                        >
                          <option value="pendiente">Pendiente</option>
                          <option value="pagado">Pagado</option>
                          <option value="rechazado">Rechazado</option>
                        </select>
                      </div>

                      <div className="payment-method-info">
                        <span>Método de pago:</span>
                        <strong>{order.metodoPago}</strong>
                      </div>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminOrders;