"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from "@/components/Navbar";

export default function AddCard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: '',
    image: '',
    description: '',
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

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
        
        // Check if user is admin
        if (userData.role === 'admin') {
          setIsAdmin(true);
        }
      } catch (error) {
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');

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
          setMessage('Error uploading image. Please try again.');
          setSubmitting(false);
          return;
        }
      }

      // Validate that we have an image URL
      if (!imageUrl) {
        setMessage('Error: Please provide an image URL or upload an image file.');
        setSubmitting(false);
        return;
      }

      const res = await fetch('/api/cards/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          image: imageUrl,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(`Error: ${data.message}`);
        return;
      }

      setMessage('Card added successfully!');
      setFormData({
        name: '',
        price: '',
        category: '',
        image: '',
        description: '',
      });
      setSelectedFile(null);
      setImagePreview('');

      // Redirect to home after 2 seconds
      setTimeout(() => {
        router.push('/home');
      }, 2000);
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setSubmitting(false);
      setUploading(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  // 404 Page for non-admins
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <Navbar onCartOpen={() => {}} />
        <div className="text-center mt-10">
          <h1 className="text-6xl font-bold text-gray-900">404</h1>
          <p className="text-2xl text-gray-700 mt-4">Page Not Found</p>
          <p className="text-gray-600 mt-2">You do not have permission to access this page.</p>
          <a
            href="/home"
            className="mt-6 inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Go to Home
          </a>
        </div>
      </div>
    );
  }

  // Admin Form
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onCartOpen={() => {}} />
      
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Add New Card</h1>
          <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">Admin only - Add products to the store</p>

          {message && (
            <div className={`mb-4 p-3 sm:p-4 rounded-lg text-sm sm:text-base ${message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Product Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                placeholder="e.g., Classic Sneakers"
              />
            </div>

            {/* Price */}
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                Price (Rs) *
              </label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                placeholder="e.g., 89.99 Rs"
              />
            </div>

            {/* Category */}
            {/* <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                Category *
              </label>
              <input
                type="text"
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Shoes"
              />
            </div> */}
            <div>
  <label htmlFor="category" className="block text-sm font-medium text-gray-700">
    Category *
  </label>
  <select
    id="category"
    name="category"
    value={formData.category}
    onChange={handleChange}
    required
    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm bg-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 cursor-pointer text-sm sm:text-base"
  >
    <option value="" disabled>Select a category</option>
    <option value="Electronics">GENERAL</option>
    <option value="Clothing">Clothing</option>
    <option value="Footwear">WATCHES</option>
    <option value="Accessories">Accessories</option>
    <option value="Appliances">FOOT WEAR</option>
  </select>
</div>

            {/* Image Upload/URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Image *
              </label>
              
              {/* File Upload */}
              <div className="mb-4">
                <label className="block text-sm text-gray-600 mb-2">Upload Image File</label>
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
              <div>
                <label htmlFor="image" className="block text-sm text-gray-600 mb-2">
                  Image URL
                </label>
                <input
                  type="url"
                  id="image"
                  name="image"
                  value={formData.image}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., https://via.placeholder.com/300"
                />
              </div>

              {/* Image Preview */}
              {(imagePreview || formData.image) && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600 mb-2">Image Preview:</p>
                  <img
                    src={imagePreview || formData.image}
                    alt="Preview"
                    className="w-32 h-32 object-cover rounded-lg border border-gray-300"
                  />
                </div>
              )}
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description (Optional)
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter product description..."
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting || uploading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
            >
              {uploading ? 'Uploading Image...' : submitting ? 'Adding Card...' : 'Add Card'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
