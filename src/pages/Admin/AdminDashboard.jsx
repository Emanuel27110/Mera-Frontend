import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from '../../utils/axios';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    totalProducts: 0,
    recentOrders: []
  });
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Obtener todos los pedidos
      const { data: orders } = await axios.get('/orders');
      
      // Obtener productos
      const { data: products } = await axios.get('/products');

      setStats({
        totalOrders: orders.length,
        pendingOrders: orders.filter(o => o.estado === 'pendiente').length,
        totalProducts: products.length,
        recentOrders: orders.slice(0, 5)
      });

      setLoading(false);
    } catch (error) {
      console.error('Error al cargar dashboard:', error);
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return <div className="loading">Cargando dashboard...</div>;
  }

  return (
    <div className="admin-dashboard">
      <h1>Panel de Administración</h1>

      {/* Cards de estadísticas */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-info">
            <h3>Total Pedidos</h3>
            <p className="stat-number">{stats.totalOrders}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">⏳</div>
          <div className="stat-info">
            <h3>Pedidos Pendientes</h3>
            <p className="stat-number">{stats.pendingOrders}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">👕</div>
          <div className="stat-info">
            <h3>Total Productos</h3>
            <p className="stat-number">{stats.totalProducts}</p>
          </div>
        </div>
      </div>

      {/* Acciones rápidas */}
      <div className="quick-actions">
        <h2>Acciones Rápidas</h2>
        <div className="actions-grid">
          <Link to="/admin/pedidos" className="action-card">
            <span className="action-icon">📋</span>
            <h3>Gestionar Pedidos</h3>
            <p>Ver y actualizar el estado de los pedidos</p>
          </Link>

          <Link to="/admin/productos" className="action-card">
            <span className="action-icon">🛍️</span>
            <h3>Gestionar Productos</h3>
            <p>Agregar, editar o eliminar productos</p>
          </Link>

          <Link to="/admin/productos/nuevo" className="action-card action-highlight">
            <span className="action-icon">➕</span>
            <h3>Crear Producto</h3>
            <p>Agregar un nuevo producto al catálogo</p>
          </Link>
          <Link to="/admin/categorias" className="action-card">
  <span className="action-icon">📂</span>
  <h3>Gestionar Categorías</h3>
  <p>Crear y administrar categorías de productos</p>
</Link>
        </div>
      </div>

      {/* Pedidos recientes */}
      <div className="recent-orders">
        <h2>Pedidos Recientes</h2>
        {stats.recentOrders.length === 0 ? (
          <p className="no-data">No hay pedidos todavía</p>
        ) : (
          <div className="orders-table">
            <table>
              <thead>
                <tr>
                  <th>Pedido</th>
                  <th>Cliente</th>
                  <th>Total</th>
                  <th>Estado</th>
                  <th>Fecha</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentOrders.map((order) => (
                  <tr key={order._id}>
                    <td>#{order._id.slice(-6).toUpperCase()}</td>
                    <td>{order.usuario?.nombre} {order.usuario?.apellido}</td>
                    <td>${order.total}</td>
                    <td>
                      <span className={`status-badge status-${order.estado}`}>
                        {order.estado}
                      </span>
                    </td>
                    <td>{new Date(order.createdAt).toLocaleDateString('es-AR')}</td>
                    <td>
                      <Link to={`/admin/pedidos/${order._id}`} className="btn-table">
                        Ver
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;