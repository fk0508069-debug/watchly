'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

export default function ProductDetail() {
  const params = useParams();
  const { id } = params;

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [error, setError] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [relatedLoading, setRelatedLoading] = useState(false);

  // Check authentication
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/user/me');
        setIsAuthenticated(res.ok);
      } catch (error) {
        setIsAuthenticated(false);
      } finally {
        setCheckingAuth(false);
      }
    };

    checkAuth();
  }, []);

  // Fetch product
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/cards?id=${id}`);
        if (!response.ok) throw new Error('Product not found');
        const data = await response.json();
        setProduct(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchProduct();
  }, [id]);

  // Fetch related products
  useEffect(() => {
    const fetchRelatedProducts = async () => {
      if (!product || !product.category) return;

      setRelatedLoading(true);
      try {
        const response = await fetch('/api/cards');
        if (!response.ok) throw new Error('Failed to fetch products');
        const allProducts = await response.json();

        // Filter products by same category and exclude current product
        const related = allProducts.filter(
          (p) => p.category === product.category && p._id !== product._id
        );

        setRelatedProducts(related);
      } catch (err) {
        console.error('Error fetching related products:', err);
        setRelatedProducts([]);
      } finally {
        setRelatedLoading(false);
      }
    };

    fetchRelatedProducts();
  }, [product]);

  if (loading || checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  // Show login prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Store</h1>
            <Link href="/login" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium">
              Login
            </Link>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex items-center justify-center min-h-[600px]">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Login Required</h2>
            <p className="text-gray-600 mb-8 max-w-md">
              You need to log in to view product details and make purchases.
            </p>
            <div className="flex gap-4 justify-center">
              <Link 
                href="/login"
                className="bg-blue-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-700 transition"
              >
                Go to Login
              </Link>
              <Link 
                href="/home"
                className="border-2 border-gray-300 text-gray-900 px-8 py-3 rounded-lg font-bold hover:border-gray-400 transition"
              >
                Back to Store
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Store</h1>
            <Link href="/login" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium">
              Login
            </Link>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex items-center justify-center min-h-[600px]">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Product not found</h2>
            <p className="text-gray-600 mb-6">{error || 'The product you are looking for does not exist.'}</p>
            <Link 
              href="/home"
              className="inline-block bg-black text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition"
            >
              Back to Store
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex justify-between items-center">
           <div className="flex-shrink-0 flex items-center">
        <Link href="/home" className="text-xl sm:text-2xl font-extrabold tracking-tight cursor-pointer">
          <span className="text-black">watch</span><span className="text-yellow-400">ly</span>
        </Link>
      </div>
          <Link href="/home" className="px-3 sm:px-4 py-2 text-gray-700 hover:text-gray-900 font-medium transition text-sm sm:text-base">
            ← Back to Products
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* YouTube-Style Layout: Main product + Related products sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* LEFT SECTION: Main Product (Big) - Takes 2 columns on desktop */}
          <div className="lg:col-span-2">
            {/* Product Detail Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Product Image */}
              <div className="flex items-center justify-center bg-white rounded-lg border border-gray-200 p-4 sm:p-8 min-h-[300px] sm:min-h-[500px]">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>

              {/* Product Information */}
              <div className="space-y-4 sm:space-y-6">
                {/* Category */}
                <p className="text-xs sm:text-sm text-gray-500 uppercase tracking-wider font-semibold">
                  {product.category}
                </p>

                {/* Name */}
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
                  {product.name}
                </h1>

                {/* Price */}
                <div className="space-y-2">
                  <p className="text-sm sm:text-base text-gray-600">Price</p>
                  <p className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900">
                    RS  {product.price}\-
                  </p>
                </div>

                {/* Description */}
                {product.description && (
                  <div className="space-y-2 py-4 sm:py-6 border-y border-gray-200">
                    <p className="text-sm sm:text-base text-gray-600">Description</p>
                    <p className="text-sm sm:text-base text-gray-900 leading-relaxed">
                      {product.description}
                    </p>
                  </div>
                )}

                {/* Stock Status */}
                <div className="space-y-2">
                  <p className="text-sm sm:text-base text-gray-600">Availability</p>
                  <p className="text-base sm:text-lg font-semibold text-green-600">
                    In Stock
                  </p>
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 sm:pt-6">
                  <Link
                    href={`/checkout/${product._id}`}
                    className="flex-1 bg-black text-white py-3 sm:py-4 rounded-lg font-bold text-base sm:text-lg hover:bg-gray-800 transition text-center"
                  >
                    Buy Now
                  </Link>
                  <Link
                    href="/home"
                    className="flex-1 border-2 border-gray-300 text-gray-900 py-3 sm:py-4 rounded-lg font-bold text-base sm:text-lg hover:border-gray-400 transition text-center"
                  >
                    Continue Shopping
                  </Link>
                </div>

                {/* Additional Info */}
                {product.createdAt && (
                  <p className="text-xs text-gray-500">
                    Added on {new Date(product.createdAt).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT SECTION: Related Products Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-4">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">
                You May Also Like
              </h3>

              {relatedLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-black mx-auto mb-2"></div>
                    <p className="text-xs text-gray-600">Loading...</p>
                  </div>
                </div>
              ) : relatedProducts.length === 0 ? (
                <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                  <p className="text-gray-600 text-sm">No related products found.</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[calc(180vh-300px)]">
                  {relatedProducts.slice(0, 6).map((relatedProduct) => (
                    <Link
                      key={relatedProduct._id}
                      href={`/product/${relatedProduct._id}`}
                      className="group block bg-white border border-gray-200 rounded-lg  hover:shadow-md transition-all hover:border-gray-300"
                    >
                      <div className="flex gap-3">
                        {/* Small Thumbnail */}
                        <div className="relative w-24 h-24 flex-shrink-0  bg-gray-100">
                          <img
                            src={relatedProduct.image}
                            alt={relatedProduct.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        </div>

                        {/* Product Info */}
                        <div className="flex-1 p-2 flex flex-col justify-between min-w-0">
                          <div>
                            <h4 className="text-xs sm:text-sm font-semibold text-gray-900 line-clamp-2">
                              {relatedProduct.name}
                            </h4>
                            <p className="text-xs text-yellow-500 mt-1 uppercase tracking-wider">
                              {relatedProduct.category}
                            </p>
                          </div>

                          <div className="flex items-center justify-between mt-2">
                            <p className="text-sm font-bold text-gray-900">
                              Rs. {relatedProduct.price.toFixed(0)}
                            </p>
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
