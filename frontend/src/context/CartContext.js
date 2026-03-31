import { createContext, useState, useEffect } from "react";

export const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem("cart");
      const parsed = saved ? JSON.parse(saved) : [];

      if (!Array.isArray(parsed)) return [];

      return parsed.filter(item => item && item._id);
    } catch (error) {
      console.error("Cart parse error:", error);
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  const getCartItemKey = (item) => {
    const size = item?.selectedVariant?.size || "";
    const color = item?.selectedVariant?.color || "";
    const sku = item?.selectedVariant?.sku || "";
    return `${item._id}-${size}-${color}-${sku}`;
  };

  const addToCart = (product) => {
    setCart(prev => {
      const productKey = getCartItemKey(product);

      const exist = prev.find(item => getCartItemKey(item) === productKey);

      if (exist) {
        return prev.map(item =>
          getCartItemKey(item) === productKey
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (id, action = "remove", sku = "", size = "", color = "") => {
    setCart(prev => {
      const updatedCart = prev
        .map(item => {
          const sameItem =
            item._id === id &&
            (item?.selectedVariant?.sku || "") === sku &&
            (item?.selectedVariant?.size || "") === size &&
            (item?.selectedVariant?.color || "") === color;

          if (!sameItem) return item;

          if (action === "decrease") {
            return { ...item, quantity: item.quantity - 1 };
          }

          return null;
        })
        .filter(item => item && item.quantity > 0);

      return updatedCart;
    });
  };

  const updateQuantity = (id, type, sku = "", size = "", color = "") => {
    setCart(prev =>
      prev.map(item => {
        const sameItem =
          item._id === id &&
          (item?.selectedVariant?.sku || "") === sku &&
          (item?.selectedVariant?.size || "") === size &&
          (item?.selectedVariant?.color || "") === color;

        if (!sameItem) return item;

        return {
          ...item,
          quantity:
            type === "inc"
              ? item.quantity + 1
              : Math.max(1, item.quantity - 1)
        };
      })
    );
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem("cart");
  };

  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  const totalPrice = cart.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice
      }}
    >
      {children}
    </CartContext.Provider>
  );
}