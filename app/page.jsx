"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Home() {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

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
        setLoading(false);
      }
    };

    fetchCards();
  }, []);

  

  // Filter cards based on search
  const filteredCards = cards.filter((card) => {
    const matchesSearch = card.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          card.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
   <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm sticky top-0 z-50">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="flex justify-between items-center h-16">
      {/* Logo Section */}
      <div className="flex-shrink-0 flex items-center">
        <h1 className="text-2xl font-extrabold tracking-tight cursor-default">
          <span className="text-black">watch</span><span className="text-yellow-400">ly</span>
        </h1>
      </div>

      {/* Navigation Links */}
      <nav className="hidden md:flex space-x-8 items-center">
        <Link 
          href="/home" 
           className="px-4 py-2 rounded-lg bg-yellow-400 text-gray-900 hover:bg-yellow-500 transition-all shadow-md shadow-indigo-100"
        >
          Home
        </Link>
        
      </nav>

      {/* Mobile Menu Button (Optional placeholder) */}
      <div className="md:hidden flex items-center">
        <button className="text-gray-500 hover:text-gray-600">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Title */}
       

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-gray-900"
            />
            <svg className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <p className="text-gray-600">Loading products...</p>
          </div>
        ) : filteredCards.length === 0 ? (
          <div className="flex justify-center items-center py-12">
            <p className="text-gray-600">
              {cards.length === 0 
                ? 'No products available.' 
                : `No products found matching "${searchQuery}".`}
            </p>
          </div>
        ) : (
          <div>
            <p className="text-sm text-gray-600 mb-6">
              Showing {filteredCards.length} of {cards.length} products
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredCards.map((card) => (
                <Link key={card._id} href={`/product/${card._id}`}>
                  <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer h-full">
                    {/* Product Image */}
                    <div className="h-48 bg-gray-100 overflow-hidden">
                      <img 
                        src={card.image} 
                        alt={card.name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform"
                      />
                    </div>
                    
                    {/* Product Info */}
                    <div className="p-4">
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                        {card.category}
                      </p>
                      <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                        {card.name}
                      </h3>
                      <p className="text-2xl font-bold text-gray-900">
                        Rs {card.price}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}