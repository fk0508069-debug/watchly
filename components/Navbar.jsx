"use client";
import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { UserCircle } from 'lucide-react';
// import Chatbot from '@/components/chatbot';

import Link from "next/link";
export default function Navbar({ onCartOpen , onSupportOpen}) {
  const { count } = useCart();
  const [supportOpen, setSupportOpen] = useState(false);
  const [supportLevel, setSupportLevel] = useState(50);

  const handleSupportClose = () => setSupportOpen(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-30 border-b border-white/8">
      <div className="absolute inset-0 bg-ink/80 backdrop-blur-md" />
      <nav className="relative  max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        
      <div className="flex-shrink-0 flex items-center">
        <Link href="/home" className="text-xl sm:text-2xl font-extrabold tracking-tight cursor-pointer">
          <span className="text-black">watch</span><span className="text-yellow-400">ly</span>
        </Link>
      </div>

      

        {/* Actions */}
        <div className="flex items-center gap-2 sm:gap-4">
          <button
            onClick={onCartOpen}
            className="relative flex items-center gap-1 sm:gap-2 text-cream/70 hover:text-cream transition-colors p-2"
          >
            <svg
              className="w-5 h-5 sm:w-6 sm:h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
              />
            </svg>
            <span className="text-xs sm:text-sm tracking-wide hidden sm:inline">Cart</span>
            {count > 0 && (
              <span
              className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-4 h-4 sm:w-5 sm:h-5 bg-amber-400 text-ink text-[10px] sm:text-xs
              font-bold rounded-full flex items-center justify-center"
              >
              {count}
              </span>
              )}
          </button>
              <Link href="/profile" className="p-2">
                <UserCircle className="h-5 w-5 sm:h-6 sm:w-6 text-cream/70 hover:text-cream transition-colors" />
                <span className="sr-only">Profile</span>
              </Link>
          
        </div>
      </nav>

     
    </header>
  );
}
