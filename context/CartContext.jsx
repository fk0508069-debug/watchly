"use client";
import { createContext, useContext, useReducer, useEffect, useState } from "react";

const CartContext = createContext({
  items: [],
  add: (product) => {},
  remove: (id) => {},
  updateQty: (id, qty) => {},
  clear: () => {},
  total: 0,
  count: 0
});

function cartReducer(state, action) {
  switch (action.type) {
    case "LOAD": {
      return action.payload;
    }
    case "ADD": {
      const existing = state.items.find((i) => i.id === action.product.id);
      if (existing) {
        return {
          ...state,
          items: state.items.map((i) =>
            i.id === action.product.id ? { ...i, qty: i.qty + 1 } : i
          ),
        };
      }
      return { ...state, items: [...state.items, { ...action.product, qty: 1 }] };
    }
    case "REMOVE":
      return { ...state, items: state.items.filter((i) => i.id !== action.id) };
    case "UPDATE_QTY":
      if (action.qty < 1) return { ...state, items: state.items.filter((i) => i.id !== action.id) };
      return {
        ...state,
        items: state.items.map((i) =>
          i.id === action.id ? { ...i, qty: action.qty } : i
        ),
      };
    case "CLEAR":
      return { ...state, items: [] };
    default:
      return state;
  }
}

const CART_STORAGE_KEY = "watchly_cart";

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [] });
  const [isMounted, setIsMounted] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (savedCart) {
        const cartData = JSON.parse(savedCart);
        dispatch({ type: "LOAD", payload: cartData });
      }
    } catch (error) {
      console.error("Failed to load cart from cache:", error);
    }
    setIsMounted(true);
  }, []);

  // Save cart to localStorage whenever state changes
  useEffect(() => {
    if (isMounted) {
      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state));
      } catch (error) {
        console.error("Failed to save cart to cache:", error);
      }
    }
  }, [state, isMounted]);

  const add = (product) => dispatch({ type: "ADD", product });
  const remove = (id) => dispatch({ type: "REMOVE", id });
  const updateQty = (id, qty) => dispatch({ type: "UPDATE_QTY", id, qty });
  const clear = () => dispatch({ type: "CLEAR" });

  const total = state.items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const count = state.items.reduce((sum, i) => sum + i.qty, 0);

  return (
    <CartContext.Provider value={{ items: state.items, add, remove, updateQty, clear, total, count }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
