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
  const [updating, setUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: '',
    image: '',
    description: '',
    stockStatus: 'available'
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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
        // Initialize form data
        setFormData({
          name: data.name || '',
          price: data.price ? data.price.toString() : '',
          category: data.category || '',
          image: data.image || '',
          description: data.description || '',
          stockStatus: 'available' // Default, since stock isn't in model
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchProduct();
  }, [id]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setUpdateSuccess(false);

    try {
      let imageUrl = formData.image;

      // If a file is selected, upload it first
      if (selectedFile) {
        setUploading(true);
        try {
          imageUrl = await uploadImage(selectedFile);
          setUploading(false);
        } catch (uploadError) {
          setUploading(false);
          setError('Error uploading image. Please try again.');
          setUpdating(false);
          return;
        }
      }

      // Validate that we have an image URL
      if (!imageUrl) {
        setError('Please provide an image URL or upload an image file.');
        setUpdating(false);
        return;
      }

      const response = await fetch('/api/cards', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id,
          name: formData.name,
          price: formData.price,
          category: formData.category,
          image: imageUrl,
          description: formData.description,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update product');
      }

      const result = await response.json();
      setProduct(result.card);
      setUpdateSuccess(true);
      setSelectedFile(null);
      setImagePreview('');
      // Reset success message after 3 seconds
      setTimeout(() => setUpdateSuccess(false), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdating(false);
      setUploading(false);
    }
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
      // Clear the image URL field when file is selected
      setFormData(prev => ({
        ...prev,
        image: ''
      }));
    }
  };

  const uploadImage = async (file) => {
    const formDataUpload = new FormData();
    formDataUpload.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formDataUpload,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      return data.imageUrl;
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    setError(null);

    try {
      const response = await fetch(`/api/cards?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to delete card');
      }

      // Redirect to home page after successful deletion
      window.location.href = '/home';
    } catch (err) {
      setError(err.message);
      setShowDeleteConfirm(false);
      setDeleting(false);
    }
  };

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
                href="/"
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
              href="/"
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Store</h1>
          <Link href="/home" className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium transition">
            ← Back to Products
          </Link>
        </div>

      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {updateSuccess && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            Product updated successfully!
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Product Detail */}
          <div className="grid md:grid-cols-2 gap-12">
          {/* Product Image */}
          <div className="flex items-center justify-center bg-white rounded-lg border border-gray-200 p-8 min-h-[500px]">
            <img 
              src={product.image} 
              alt={product.name}
              className="w-full h-full object-cover rounded-lg"
            />
          </div>

          {/* Product Information */}
          <div className="space-y-6">
            {/* Category */}
            <p className="text-sm text-gray-500 uppercase tracking-wider font-semibold">
              {product.category}
            </p>

            {/* Name */}
            <input 
              type="text" 
              name="name"
              value={formData.name} 
              onChange={handleChange}
              className="text-4xl font-bold text-gray-900 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            

            {/* Price */}
            <input 
              type="number" 
              name="price"
              value={formData.price} 
              onChange={handleChange}
              step="0.01"
              min="0"
              className="text-3xl font-semibold text-gray-700 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />

            {/* Description */}
            {product.description && (
  <div className="space-y-3 py-6 border-y border-gray-100">
    <label className="text-sm font-semibold uppercase tracking-wider text-gray-500">
      Product Description
    </label>
    <textarea
      name="description"
      value={formData.description}
      onChange={handleChange}
      rows={5}
      className="w-full block rounded-xl border-gray-200 bg-gray-50 p-4 text-gray-700 leading-relaxed 
                 focus:border-indigo-500 focus:ring-indigo-500 focus:bg-white 
                 transition-all duration-200 resize-none shadow-sm"
      placeholder="Describe your product..."
    />
  </div>
)}

            {/* Category */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                Category
              </label>
              <input 
                type="text" 
                name="category"
                value={formData.category} 
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Image Upload/URL */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                Product Image
              </label>
              
              {/* File Upload */}
              <div className="mb-4">
                <label className="block text-sm text-gray-600 mb-2">Upload New Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {uploading && (
                  <p className="text-sm text-blue-600 mt-1">Uploading image...</p>
                )}
              </div>

              {/* OR separator */}
              <div className="flex items-center my-4">
                <div className="flex-1 border-t border-gray-300"></div>
                <span className="px-3 bg-white text-sm text-gray-500">OR</span>
                <div className="flex-1 border-t border-gray-300"></div>
              </div>

              {/* Image URL */}
              {/* <div>
                <label className="block text-sm text-gray-600 mb-2">
                  Image URL
                </label>
                <input 
                  type="url" 
                  name="image"
                  value={formData.image} 
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., https://via.placeholder.com/300"
                />
              </div> */}

              {/* Image Preview */}
              {(imagePreview || formData.image || product?.image) && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600 mb-2">Image Preview:</p>
                  <img
                    src={imagePreview || formData.image || product?.image}
                    alt="Preview"
                    className="w-32 h-32 object-cover rounded-lg border border-gray-300"
                  />
                </div>
              )}
            </div>

            {/* Stock Status */}
     <div className="space-y-2">
  <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">
    Inventory Status
  </label>
  
  <div className="relative w-full max-w-[200px]">
    <select 
      name="stockStatus"
      value={formData.stockStatus}
      onChange={handleChange}
      className={`block w-full appearance-none rounded-lg border-0 py-2.5 pl-4 pr-10 font-bold shadow-sm ring-1 ring-inset transition-all focus:ring-2 focus:ring-offset-1 
        ${formData.stockStatus === 'available' 
          ? 'bg-green-50 text-green-700 ring-green-200 focus:ring-green-500' 
          : 'bg-red-50 text-red-700 ring-red-200 focus:ring-red-500'
        }`}
    >
      <option value="available" className="bg-white text-gray-900 font-medium">
        🟢 Available
      </option>
      <option value="unavailable" className="bg-white text-gray-900 font-medium">
        🔴 Not Available
      </option>
    </select>

    {/* Custom Arrow Icon */}
    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
      <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
      </svg>
    </div>
  </div>
</div>

            {/* CTA Buttons */}
            <div className="flex gap-4 pt-6">
              <button
                type="submit"
                disabled={updating || uploading}
                className="flex-1 bg-black text-white py-4 rounded-lg font-bold text-lg hover:bg-gray-800 transition text-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? 'Uploading Image...' : updating ? 'Updating...' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                disabled={deleting}
                className="bg-red-600 text-white py-4 px-6 rounded-lg font-bold text-lg hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleting ? 'Deleting...' : 'Delete Card'}
              </button>
              <Link 
                href="/home"
                className="flex-1 border-2 border-gray-300 text-gray-900 py-4 rounded-lg font-bold text-lg hover:border-gray-400 transition text-center"
              >
               Go Home
              </Link>
            </div>
          </div>
        </div>
        </form>

        {/* Additional Info */}
        {product.createdAt && (
          <p className="text-xs text-gray-500 mt-4">
            Added on {new Date(product.createdAt).toLocaleDateString(undefined, { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        )}
      </main>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4v2m0 0v-2m0 2V9m0 2h0" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 8H5a2 2 0 00-2 2v10a2 2 0 002 2h14a2 2 0 002-2V10a2 2 0 00-2-2z" />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-bold text-gray-900 text-center">
                Delete Card?
              </h3>
              <p className="mt-2 text-sm text-gray-500 text-center">
                This action cannot be undone. The card "{product.name}" will be permanently deleted.
              </p>
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={deleting}
                  className="flex-1 bg-gray-200 text-gray-900 py-2 rounded-lg font-semibold hover:bg-gray-300 transition disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex-1 bg-red-600 text-white py-2 rounded-lg font-semibold hover:bg-red-700 transition disabled:opacity-50"
                >
                  {deleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg shadow-lg max-w-sm z-40">
          <p className="font-semibold">Error</p>
          <p className="text-sm">{error}</p>
        </div>
      )}
    </div>
  );
}
