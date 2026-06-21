"use client";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
// import { Link } from "lucide-react";
import { createContext, useContext, useEffect, useState } from "react";
const CartContext = createContext();

export default function CartSidebar({ open, onClose }) {
  const { items, remove, updateQty, total, clear } = useCart();
  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-/60 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Drawer */}
      <aside
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white z-50 flex flex-col
          transform transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]
          ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-white/10">
          <div>
            <p className="text-[10px] tracking-[0.3em] text-amber-400 uppercase font-medium">YOUR</p>
            <h2 className="font-display text-2xl text-cream mt-0.5">Cart</h2>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full border border-white/20 flex items-center justify-center text-cream/60
              hover:border-amber-400 hover:text-amber-400 transition-all duration-200"
          >
            ✕
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="text-5xl mb-4 opacity-30">◯</div>
              <p className="text-cream/40 text-sm tracking-wide">Your cart is empty</p>
              <button
                onClick={onClose}
                className="mt-6 text-amber-400 text-xs tracking-[0.2em] uppercase hover:text-amber-300 transition-colors"
              >
                Continue Shopping →
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="flex gap-4 group">
                <div className="w-20 h-20 rounded-lg overflow-hidden bg-stone-800 flex-shrink-0">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <p className="text-cream text-sm font-medium leading-tight truncate pr-2">{item.name}</p>
                    <button
                      onClick={() => remove(item.id)}
                      className="text-cream/30 hover:text-red-400 transition-colors text-xs flex-shrink-0 mt-0.5"
                    >
                      ✕
                    </button>
                  </div>
                  <p className="text-amber-400 text-sm mt-1">Rs{item.price}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <button
                      onClick={() => updateQty(item.id, item.qty - 1)}
                      className="w-6 h-6 rounded border border-white/20 text-cream/60 text-xs
                        hover:border-amber-400 hover:text-amber-400 transition-all flex items-center justify-center"
                    >
                      −
                    </button>
                    <span className="text-cream text-sm w-4 text-center">{item.qty}</span>
                    <button
                      onClick={() => updateQty(item.id, item.qty + 1)}
                      className="w-6 h-6 rounded border border-white/20 text-cream/60 text-xs
                        hover:border-amber-400 hover:text-amber-400 transition-all flex items-center justify-center"
                    >
                      +
                    </button>

                    <Link
                key={item.id}
                href={`/checkout/${item.id}`}
                className=" py-1.5 m-2 p-2 bg-amber-400 text-ink font-semibold text-sm tracking-[0.15em] uppercase
                  hover:bg-amber-300 transition-colors duration-200 rounded"
              >
                Checkout
              </Link>
                  <Link
              
                href={`/product/${item.id}`}
                className=" py-1.5 m-2 p-2 bg-blue-400 text-ink font-semibold text-sm tracking-[0.15em] uppercase
                  hover:bg-blue-300 transition-colors duration-200 rounded"
              >
                VIEW
              </Link>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="px-8 py-6 border-t border-white/10 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-cream/60 text-sm tracking-wide">Subtotal</span>
              <span className="text-cream font-display text-xl">Rs {total.toFixed(2)}</span>
            </div>
           
            <button
              onClick={clear}
              className="w-full text-cream/30 text-xs tracking-[0.2em] uppercase hover:text-red-400 transition-colors"
            >
              Clear Cart
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
