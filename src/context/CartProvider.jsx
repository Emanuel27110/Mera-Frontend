import { useState, useEffect } from 'react';
import { CartContext } from './CartContext';

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product, talle, cantidad = 1) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find(
        (item) => item._id === product._id && item.selectedTalle === talle
      );

      if (existingItem) {
        return prevCart.map((item) =>
          item._id === product._id && item.selectedTalle === talle
            ? { ...item, cantidad: item.cantidad + cantidad }
            : item
        );
      } else {
        return [
          ...prevCart,
          {
            ...product,
            selectedTalle: talle,
            cantidad
          }
        ];
      }
    });
  };

  const removeFromCart = (productId, talle) => {
    setCart((prevCart) =>
      prevCart.filter(
        (item) => !(item._id === productId && item.selectedTalle === talle)
      )
    );
  };

  const updateQuantity = (productId, talle, cantidad) => {
    if (cantidad <= 0) {
      removeFromCart(productId, talle);
      return;
    }

    setCart((prevCart) =>
      prevCart.map((item) =>
        item._id === productId && item.selectedTalle === talle
          ? { ...item, cantidad }
          : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('cart');
  };

  const getTotal = () => {
    return cart.reduce((total, item) => total + item.precio * item.cantidad, 0);
  };

  const getItemCount = () => {
    return cart.reduce((count, item) => count + item.cantidad, 0);
  };

  const value = {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotal,
    getItemCount
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};