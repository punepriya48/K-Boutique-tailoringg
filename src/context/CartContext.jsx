import { createContext, useContext, useState, useEffect } from "react";
import { useToast } from "./ToastContext.jsx";
import { useAuth } from "./AuthContext.jsx";
import api, { getAuthToken } from "../utils/api.js";

const CartContext = createContext();
const CART_STORAGE_KEY = "priyas_boutique_cart";

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const { addToast } = useToast();

  // Fetch cart from backend whenever user logs in or token is available
  useEffect(() => {
    const token = getAuthToken();
    if (user && token) {
      api.get("/api/cart")
        .then((items) => {
          if (Array.isArray(items)) {
            setCart(items);
          }
        })
        .catch((err) => {
          console.warn("Failed to fetch user cart from server:", err.message);
        });
    }
  }, [user]);

  // Sync cart state to localStorage for offline fallback
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (e) {
      console.error("Failed to save cart to localStorage", e);
    }
  }, [cart]);

  const addToCart = async (product, quantity = 1, selectedSize = "Standard", customMeasurements = {}) => {
    const token = getAuthToken();

    if (user && token) {
      try {
        const updatedCart = await api.post("/api/cart", {
          product,
          quantity,
          selectedSize,
          customMeasurements,
        });
        if (Array.isArray(updatedCart)) {
          setCart(updatedCart);
          addToast(`Added "${product.name}" to your cart!`, "success");
          return;
        }
      } catch (err) {
        console.warn("API addToCart fallback to local:", err.message);
      }
    }

    // Local cart fallback
    setCart((prevCart) => {
      const itemKey = `${product.id}-${selectedSize}`;
      const existingIndex = prevCart.findIndex((item) => item.key === itemKey);

      if (existingIndex > -1) {
        const updated = [...prevCart];
        updated[existingIndex].quantity += quantity;
        updated[existingIndex].customMeasurements = {
          ...updated[existingIndex].customMeasurements,
          ...customMeasurements,
        };
        return updated;
      }

      return [
        ...prevCart,
        {
          key: itemKey,
          productId: product.id,
          product,
          quantity,
          selectedSize,
          customMeasurements,
          addedAt: new Date().toISOString(),
        },
      ];
    });

    addToast(`Added "${product.name}" to your cart!`, "success");
  };

  const removeFromCart = async (itemKey) => {
    const token = getAuthToken();

    if (user && token) {
      try {
        const updatedCart = await api.delete(`/api/cart/${encodeURIComponent(itemKey)}`);
        if (Array.isArray(updatedCart)) {
          setCart(updatedCart);
          addToast("Item removed from cart", "info");
          return;
        }
      } catch (err) {
        console.warn("API removeFromCart error:", err.message);
      }
    }

    setCart((prev) => {
      const item = prev.find((i) => i.key === itemKey);
      if (item && addToast) {
        addToast(`Removed "${item.product?.name || "item"}" from cart`, "info");
      }
      return prev.filter((i) => i.key !== itemKey);
    });
  };

  const updateQuantity = async (itemKey, delta) => {
    const token = getAuthToken();

    if (user && token) {
      try {
        const updatedCart = await api.put(`/api/cart/${encodeURIComponent(itemKey)}`, { delta });
        if (Array.isArray(updatedCart)) {
          setCart(updatedCart);
          return;
        }
      } catch (err) {
        console.warn("API updateQuantity error:", err.message);
      }
    }

    setCart((prev) =>
      prev
        .map((item) => {
          if (item.key === itemKey) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const clearCart = async () => {
    const token = getAuthToken();

    if (user && token) {
      try {
        await api.delete("/api/cart");
      } catch (err) {
        console.warn("API clearCart error:", err.message);
      }
    }

    setCart([]);
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce(
    (sum, item) => sum + (item.product?.price || 0) * item.quantity,
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
        cartCount,
        cartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
