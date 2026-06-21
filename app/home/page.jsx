"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from "@/components/Navbar";
import ProductCard from "@/components/ProductCard"; 
import CartSidebar from "@/components/CartSidebar";
import Chatbot from "@/components/chatbot";
import Link from "next/link";
export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cardsLoading, setCardsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [cartOpen, setCartOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);
  const [supportLevel, setSupportLevel] = useState(50);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/user/me');
        if (!res.ok) {
          router.push('/login');
          return;
        }
        const userData = await res.json();
        setUser(userData);
        setIsAuthenticated(true);
      } catch (error) {
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  useEffect(() => {
    const fetchCards = async () => {
      try {
        const res = await fetch('/api/cards');
        if (res.ok) {
          const data = await res.json();
          setCards(data);
        }
      } catch (error) {
        console.error('Error fetching cards:', error);
      } finally {
        setCardsLoading(false);
      }
    };
  

    if (isAuthenticated) {
      fetchCards();
    }
  }, [isAuthenticated]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  // Filter cards based on search and category
  const filteredCards = cards.filter((card) => {
    const matchesSearch = card.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          card.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || card.category.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  // Get unique categories
  const categories = ['all', ...new Set(cards.map(card => card.category))];

  return (
    <div className="min-h-screen bg-gray-50">
  
      <Navbar onCartOpen={() => setCartOpen(true)} />

      <CartSidebar open={cartOpen} onClose={() => setCartOpen(false)} />

      <Chatbot open={supportOpen} onClose={() => setSupportOpen(false)} supportLevel={supportLevel} setSupportLevel={setSupportLevel} />
      <main className="max-w-7xl m-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        {/* Header Section */}


      
        <div className="mb-6 sm:mb-8 m-12 space-y-4 sm:space-y-5 ">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by product name or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 pl-10 sm:pl-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-gray-900 text-sm sm:text-base"
            />
            <svg className="absolute left-3 sm:left-4 top-3.5 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 overflow-x-auto pb-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-3 sm:px-4 py-2 rounded-full font-medium transition-all whitespace-nowrap text-xs sm:text-sm ${
                  selectedCategory === category
                    ? 'bg-black text-white'
                    : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
                }`}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {cardsLoading ? (
          <div className="flex justify-center items-center py-8 sm:py-12">
            <p className="text-gray-600 text-sm sm:text-base">Loading products...</p>
          </div>
        ) : filteredCards.length === 0 ? (
          <div className="flex justify-center items-center py-8 sm:py-12">
            <p className="text-gray-600 text-sm sm:text-base">
              {cards.length === 0
                ? 'No products available yet.'
                : `No products found matching "${searchQuery}". Try a different search.`}
            </p>
          </div>
        ) : (
          /* Responsive Grid Layout */
          <div className="space-y-3 sm:space-y-4">
            <p className="text-xs sm:text-sm text-gray-600">
              Showing {filteredCards.length} of {cards.length} products
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
              {filteredCards.map((card) => (
                <ProductCard
                  key={card._id}
                  id={card._id}
                  name={card.name}
                  price={card.price}
                  category={card.category}
                  image={card.image}
                />


              ))}


            </div>
          </div>
        )}
      </main>
    </div>
  );
}