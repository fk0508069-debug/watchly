"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import LogoutButton from "@/components/logoutbtn";

interface User {
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export default function Profile() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/user/me');
        if (res.ok) {
          const data = await res.json();
          setUser(data);
        } else if (res.status === 401) {
          router.push('/login');
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [router]);

  return (
    <div className="min-h-screen bg-white text-black font-sans">
      <Navbar onCartOpen={() => {}} />
      
      <main className="max-w-3xl mx-auto px-6 py-24">
        <h1 className="text-3xl font-bold mb-8 uppercase tracking-tight">Profile</h1>

        {loading ? (
          <div className="text-sm font-medium text-gray-400 uppercase tracking-widest">Loading...</div>
        ) : user && (
          <div className="space-y-8">
            {/* Responsive Table/List */}
            <div className="border-t-2 border-black">
              {/* Desktop Table */}
              <div className="hidden md:block">
                <table className="w-full text-left">
                  <tbody>
                    <tr className="border-b border-gray-100">
                      <td className="py-5 font-bold uppercase text-xs text-gray-400 w-1/3 text-left">Name</td>
                      <td className="py-5 text-lg font-medium text-right">{user.name}</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-5 font-bold uppercase text-xs text-gray-400 text-left">Email</td>
                      <td className="py-5 text-lg font-medium text-right lowercase">{user.email}</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-5 font-bold uppercase text-xs text-gray-400 text-left">Role</td>
                      <td className="py-5 text-lg font-medium text-right uppercase tracking-tight">{user.role}</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-5 font-bold uppercase text-xs text-gray-400 text-left">Joined</td>
                      <td className="py-5 text-lg font-medium text-right italic text-gray-600">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Mobile List */}
              <div className="md:hidden space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="font-bold uppercase text-xs text-gray-400">Name</span>
                  <span className="text-lg font-medium">{user.name}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="font-bold uppercase text-xs text-gray-400">Email</span>
                  <span className="text-lg font-medium lowercase">{user.email}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="font-bold uppercase text-xs text-gray-400">Role</span>
                  <span className="text-lg font-medium uppercase tracking-tight">{user.role}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="font-bold uppercase text-xs text-gray-400">Joined</span>
                  <span className="text-lg font-medium italic text-gray-600">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Simple Yellow Button Area */}
            <div className="pt-6 flex flex-col items-center gap-6">
              <div className="w-full sm:w-64 [&>button]:w-full [&>button]:bg-yellow-400 [&>button]:text-black [&>button]:py-4 [&>button]:font-bold [&>button]:uppercase [&>button]:tracking-widest [&>button]:hover:bg-black [&>button]:hover:text-white [&>button]:transition-all [&>button]:duration-200">
                <LogoutButton />
              </div>
              
              {user.role === 'admin' && (
                <Link href="/dashboard" className="text-sm font-bold border-b-2 border-black pb-1 hover:text-yellow-500 hover:border-yellow-500 transition-colors">
                  GO TO DASHBOARD
                </Link>
              )}
            
            </div>
          </div>
        )}
      </main>
    </div>
  );
}