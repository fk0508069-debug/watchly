"use client";

import React, { useEffect, useState } from 'react';
import { redirect, useRouter } from 'next/navigation';
import Link from 'next/link';

interface Product {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface Order {
  _id: string;
  shippingName: string;
  shippingAddress: string;
  shippingEmail: string;
  shippingPhone: string;
  shippingCity: string;
  shippingPostalCode: string;
  shippingCountry: string;
  products: Product[];
  totalPrice: number;
  paymentMethod: string;
  orderStatus: string;
  createdAt: string;
}

interface User {
 role: string;
  name: string;
}

export default function Dashboard() {
 const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [deletingOrderId, setDeletingOrderId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/user/me');
        if (!res.ok) {
          if (res.status === 401) {
            router.push('/login');
            return;
          }
          throw new Error('Failed to fetch user data');
        }
        const data = await res.json();
        setUser(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setOrdersLoading(true);
        const res = await fetch('/api/Order');
        if (!res.ok) throw new Error('Failed to fetch orders');
        const data = await res.json();
        setOrders(data.orders || []);
      } catch (err) {
        console.error('Error fetching orders:', err);
      } finally {
        setOrdersLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Delivered': return 'bg-green-50 text-green-700 border-green-200';
      case 'Processing': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Shipped': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Cancelled': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-yellow-50 text-yellow-700 border-yellow-200';
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!window.confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
      return;
    }

    setDeletingOrderId(orderId);
    setError(null);

    try {
      const res = await fetch(`/api/Order?orderId=${orderId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error('Failed to delete order');
      }

      // Remove order from list
      setOrders(orders.filter(order => order._id !== orderId));
      setSelectedOrder(null);
      setSuccessMessage('Order deleted successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete order');
    } finally {
      setDeletingOrderId(null);
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingOrderId(orderId);
    setError(null);

    try {
      const res = await fetch('/api/Order', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          orderStatus: newStatus,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to update order status');
      }

      const data = await res.json();

      // Update the orders list and selected order
      const updatedOrders = orders.map(order =>
        order._id === orderId ? data.order : order
      );
      setOrders(updatedOrders);
      
      if (selectedOrder?._id === orderId) {
        setSelectedOrder(data.order);
      }

      setSuccessMessage(`Order status updated to ${newStatus}!`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update order status');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  return(
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Success Message */}
        {successMessage && (
          <div className="mb-4 sm:mb-6 bg-green-50 border border-green-200 text-green-700 px-3 sm:px-4 py-3 rounded-lg text-sm sm:text-base">
            {successMessage}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-4 sm:mb-6 bg-red-50 border border-red-200 text-red-700 px-3 sm:px-4 py-3 rounded-lg text-sm sm:text-base">
            {error}
          </div>
        )}

        {/* Admin Section */}
        {user?.role === 'admin' && (
          <div className="mb-6 sm:mb-8">
            <div className="mb-4 sm:mb-6 p-4 sm:p-6 bg-blue-50 border border-blue-200 rounded-2xl">
              <h2 className="text-base sm:text-lg font-bold text-blue-900 mb-2 sm:mb-4">Admin Dashboard</h2>
              <Link
                href="/add-card"
                className="inline-block bg-blue-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all shadow-md text-sm sm:text-base"
              >
                ＋ Add New Product
              </Link>
            </div>

            {/* Orders Section */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-6">
              <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">All Orders</h3>
              
              {ordersLoading ? (
                <div className="flex items-center justify-center py-8 sm:py-12">
                  <div className="animate-spin rounded-full h-8 w-8 sm:h-10 sm:w-10 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-8 sm:py-12">
                  <p className="text-gray-500 text-base sm:text-lg">No orders yet</p>
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  {orders.map((order) => (
                    <div 
                      key={order._id}
                      className="border border-gray-200 rounded-lg sm:rounded-xl p-3 sm:p-4 hover:border-blue-400 hover:bg-blue-50 cursor-pointer transition-all"
                    >
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-4">
                        <div 
                          className="flex-1"
                          onClick={() => setSelectedOrder(order)}
                        >
                          <h4 className="font-bold text-gray-900 text-sm sm:text-base">Order {order._id.slice(0, 8)}</h4>
                          <p className="text-xs sm:text-sm text-gray-600">{order.shippingName}</p>
                        </div>
                        <div className="flex flex-col sm:items-end gap-1 sm:gap-2">
                          <p className="font-bold text-gray-900 text-sm sm:text-base">${order.totalPrice.toFixed(2)}</p>
                          <span className={`inline-block px-2 sm:px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.orderStatus)}`}>
                            {order.orderStatus}
                          </span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteOrder(order._id);
                          }}
                          disabled={deletingOrderId === order._id}
                          className="px-3 sm:px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
                        >
                          {deletingOrderId === order._id ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* User Section */}
        {user?.role === 'user' && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-6">
            <h1 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">Welcome back!</h1>
            <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">You are logged in as a regular user. Return to home to browse products.</p>
            <Link 
              href="/home"
              className="inline-block bg-blue-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all text-sm sm:text-base"
            >
              Go to Home
            </Link>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 sm:p-6 flex justify-between items-center">
              <h2 className="text-lg sm:text-2xl font-bold">Order Details</h2>
              <button 
                onClick={() => setSelectedOrder(null)}
                className="text-gray-500 hover:text-gray-700 text-xl sm:text-2xl"
              >
                ✕
              </button>
            </div>

            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              {/* Order Header */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Order ID</p>
                  <p className="text-base sm:text-lg font-bold text-gray-900">{selectedOrder._id}</p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Order Date</p>
                  <p className="text-base sm:text-lg font-bold text-gray-900">
                    {new Date(selectedOrder.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Status and Payment */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 py-4 sm:py-6 border-y border-gray-200">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600 mb-2">Order Status</p>
                  <span className={`inline-block px-3 sm:px-4 py-2 rounded-full font-semibold border text-sm sm:text-base ${getStatusColor(selectedOrder.orderStatus)}`}>
                    {selectedOrder.orderStatus}
                  </span>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-600 mb-2">Payment Method</p>
                  <p className="text-base sm:text-lg font-bold text-gray-900">{selectedOrder.paymentMethod}</p>
                </div>
              </div>

              {/* Status Update Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
                <button
                  onClick={() => handleStatusChange(selectedOrder._id, 'Pending')}
                  disabled={updatingOrderId === selectedOrder._id || selectedOrder.orderStatus === 'Pending'}
                  className="px-3 sm:px-4 py-2 bg-yellow-500 text-white rounded-lg font-semibold hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm sm:text-base"
                >
                  Pending
                </button>
                <button
                  onClick={() => handleStatusChange(selectedOrder._id, 'Shipped')}
                  disabled={updatingOrderId === selectedOrder._id || selectedOrder.orderStatus === 'Shipped'}
                  className="px-3 sm:px-4 py-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm sm:text-base"
                >
                  Dispatch
                </button>
                <button
                  onClick={() => handleStatusChange(selectedOrder._id, 'Delivered')}
                  disabled={updatingOrderId === selectedOrder._id || selectedOrder.orderStatus === 'Delivered'}
                  className="px-3 sm:px-4 py-2 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm sm:text-base"
                >
                  Deliver
                </button>
              </div>

              {/* Shipping Information */}
              <div>
                <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4">Shipping Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600">Name</p>
                    <p className="font-semibold text-gray-900 text-sm sm:text-base">{selectedOrder.shippingName}</p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600">Email</p>
                    <p className="font-semibold text-gray-900 text-sm sm:text-base">{selectedOrder.shippingEmail}</p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600">Phone</p>
                    <p className="font-semibold text-gray-900 text-sm sm:text-base">{selectedOrder.shippingPhone}</p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600">Address</p>
                    <p className="font-semibold text-gray-900 text-sm sm:text-base">{selectedOrder.shippingAddress}</p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600">City</p>
                    <p className="font-semibold text-gray-900 text-sm sm:text-base">{selectedOrder.shippingCity}</p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600">Postal Code</p>
                    <p className="font-semibold text-gray-900 text-sm sm:text-base">{selectedOrder.shippingPostalCode}</p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600">Country</p>
                    <p className="font-semibold text-gray-900 text-sm sm:text-base">{selectedOrder.shippingCountry}</p>
                  </div>
                </div>
              </div>

              {/* Products */}
              <div>
                <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4">Products</h3>
                <div className="space-y-3 sm:space-y-4">
                  {selectedOrder.products.map((product, idx) => (
                    <div key={idx} className="flex flex-col sm:flex-row gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200">
                      {product.image && (
                        <img 
                          src={product.image} 
                          alt={product.name}
                          className="h-20 w-20 sm:h-24 sm:w-24 object-cover rounded-lg flex-shrink-0"
                        />
                      )}
                      <div className="flex-1">
                        <p className="font-bold text-gray-900 text-sm sm:text-base">{product.name}</p>
                        <p className="text-xs sm:text-sm text-gray-600">SKU: {product.productId}</p>
                        <div className="mt-2 flex flex-wrap gap-4 sm:gap-6">
                          <div>
                            <p className="text-xs sm:text-sm text-gray-600">Price</p>
                            <p className="font-semibold text-gray-900 text-sm sm:text-base">RS {product.price.toFixed(2)}\-</p>
                          </div>
                          <div>
                            <p className="text-xs sm:text-sm text-gray-600">Quantity</p>
                            <p className="font-semibold text-gray-900 text-sm sm:text-base">{product.quantity}</p>
                          </div>
                          <div>
                            <p className="text-xs sm:text-sm text-gray-600">Subtotal</p>
                            <p className="font-semibold text-gray-900 text-sm sm:text-base">RS {(product.price * product.quantity).toFixed(2)}\-</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total Price */}
              <div className="flex justify-end py-3 sm:py-4 border-t border-gray-200">
                <div className="text-right">
                  <p className="text-gray-600 mb-1 sm:mb-2 text-sm sm:text-base">Total Amount</p>
                  <p className="text-3xl sm:text-4xl font-bold text-gray-900">RS {selectedOrder.totalPrice.toFixed(2)}\-</p>
                </div>
              </div>

              {/* Close Button */}
              <div className="flex gap-2 sm:gap-4 pt-3 sm:pt-4">
                <button
                  onClick={() => handleDeleteOrder(selectedOrder._id)}
                  disabled={deletingOrderId === selectedOrder._id}
                  className="flex-1 bg-red-600 text-white py-2 sm:py-3 rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm sm:text-base"
                >
                  {deletingOrderId === selectedOrder._id ? 'Deleting...' : 'Delete Order'}
                </button>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="flex-1 bg-gray-900 text-white py-2 sm:py-3 rounded-lg font-semibold hover:bg-gray-800 transition text-sm sm:text-base"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}