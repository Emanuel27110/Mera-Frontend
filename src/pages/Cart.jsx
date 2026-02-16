import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../utils/useCart';
import { useAuth } from '../utils/useAuth';
import './Cart.css';

const Cart = () => {
  const { cart, removeFromCart, updateQuantity, getTotal, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (!isAuthenticated) {
    return (
      <div className="cart-empty">
        <h2>Necesitás iniciar sesión</h2>
        <Link to="/login" className="btn btn-primary">
          Iniciar Sesión
        </Link>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="cart-empty">
        <h2>Tu carrito está vacío</h2>
        <p>¡Agregá algunos productos para empezar!</p>
        <Link to="/productos" className="btn btn-primary">
          Ver Productos
        </Link>
      </div>
    );
  }

  const handleCheckout = () => {
    navigate('/checkout');
  };

  return (
    <div className="cart-page">
      <div className="cart-container">
        <h1>Mi Carrito</h1>

        <div className="cart-content">
          {/* Lista de productos */}
          <div className="cart-items">
            {cart.map((item) => {
              const talleInfo = item.talles?.find(
                (t) => t.talle === item.selectedTalle
              );
              const stockDisponible = talleInfo?.stock || 0;

              return (
                <div key={`${item._id}-${item.selectedTalle}`} className="cart-item">
                  <div className="cart-item-image">
                    {item.imagenes && item.imagenes.length > 0 ? (
                      <img src={item.imagenes[0].url} alt={item.nombre} />
                    ) : (
                      <div className="no-image-cart">Sin imagen</div>
                    )}
                  </div>

                  <div className="cart-item-details">
                    <h3>{item.nombre}</h3>
                    <p className="cart-item-talle">Talle: {item.selectedTalle}</p>
                    <p className="cart-item-price">${item.precio}</p>
                  </div>

                  <div className="cart-item-quantity">
                    <button
                      onClick={() =>
                        updateQuantity(
                          item._id,
                          item.selectedTalle,
                          item.cantidad - 1
                        )
                      }
                      className="qty-btn-cart"
                    >
                      -
                    </button>
                    <span>{item.cantidad}</span>
                    <button
                      onClick={() =>
                        updateQuantity(
                          item._id,
                          item.selectedTalle,
                          item.cantidad + 1
                        )
                      }
                      className="qty-btn-cart"
                      disabled={item.cantidad >= stockDisponible}
                    >
                      +
                    </button>
                  </div>

                  <div className="cart-item-subtotal">
                    <p>${item.precio * item.cantidad}</p>
                  </div>

                  <button
                    onClick={() => removeFromCart(item._id, item.selectedTalle)}
                    className="cart-item-remove"
                  >
                    🗑️
                  </button>
                </div>
              );
            })}
          </div>

          {/* Resumen del pedido */}
          <div className="cart-summary">
            <h2>Resumen del Pedido</h2>

            <div className="summary-row">
              <span>Subtotal:</span>
              <span>${getTotal()}</span>
            </div>

            <div className="summary-row">
              <span>Envío:</span>
              <span>A calcular</span>
            </div>

            <div className="summary-divider"></div>

            <div className="summary-row summary-total">
              <span>Total:</span>
              <span>${getTotal()}</span>
            </div>

            <button onClick={handleCheckout} className="btn-checkout">
              Proceder al Pago
            </button>

            <button onClick={clearCart} className="btn-clear-cart">
              Vaciar Carrito
            </button>

            <Link to="/productos" className="btn-continue-shopping">
              ← Seguir Comprando
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;