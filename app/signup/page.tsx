"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react"

export default function SignupPage() {
  const router = useRouter();
  // Added confirmPassword to state
  const [formData, setFormData] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); // Clear previous errors

    // 1. Check if passwords match
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    // 2. Check password length (Bonus: Good practice)
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password
        }),
        headers: { "Content-Type": "application/json" },
      });

      if (res.ok) {
        alert("Account created successfully! 🎉");
        router.push("/login"); // Redirect to login page after successful signup
      } else {
        setError("Signup failed. Please try again.");
      }
    } catch (err) {
      setError("Something went wrong. Check your connection.");
    } finally {
      setLoading(false);
    }
  };
  const handleGoogleLogin = () => {
     signIn('google');
   };



  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 px-4 sm:px-6 lg:px-8">
      <form
        onSubmit={handleSubmit}
        className="p-6 sm:p-8 bg-white shadow-xl shadow-blue-100/50 rounded-2xl w-full max-w-md space-y-4 sm:space-y-5 border border-slate-100"
      >
        <h2 className="text-xl sm:text-2xl font-bold text-slate-800 text-center">Create Account</h2>

        {/* Error Message Display */}
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-medium border border-red-100 animate-pulse text-center">
            {error}
          </div>
        )}

        <div className="space-y-3 sm:space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase ml-1">Full Name</label>
            <input
              required
              className="w-full mt-1 border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-slate-50/50 text-sm sm:text-base"
              placeholder="FULL NAME"
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase ml-1">Email</label>
            <input
              required
              type="email"
              className="w-full mt-1 border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-slate-50/50 text-sm sm:text-base"
              placeholder="name@example.com"
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>

          {/* Password Field */}
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase ml-1">Password</label>
            <input
              required
              type="password"
              className={`w-full mt-1 border p-3 rounded-xl focus:ring-2 focus:border-transparent outline-none transition-all bg-slate-50/50 text-sm sm:text-base ${error.includes("match") ? 'border-red-300' : 'border-slate-200'}`}
              placeholder="••••••••"
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
          </div>

          {/* Confirm Password Field */}
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase ml-1">Confirm Password</label>
            <input
              required
              type="password"
              className={`w-full mt-1 border p-3 rounded-xl focus:ring-2 focus:border-transparent outline-none transition-all bg-slate-50/50 text-sm sm:text-base ${error.includes("match") ? 'border-red-300' : 'border-slate-200'}`}
              placeholder="••••••••"
              onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
            />
          </div>
        </div>

        <button
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 sm:py-3.5 rounded-xl font-bold hover:bg-blue-700 active:scale-[0.98] transition-all shadow-lg shadow-blue-200 disabled:opacity-70 text-sm sm:text-base"
        >
          {loading ? "Processing..." : "Sign Up"}
        </button>

        <div className="flex items-center gap-2">
          <span className="h-px flex-1 bg-slate-200" />
          <span className="text-xs uppercase tracking-[0.3em] text-slate-400">or</span>
          <span className="h-px flex-1 bg-slate-200" />
        </div>

  <button
          type="button"
          onClick={handleGoogleLogin}
          className="w-full py-3 font-bold text-white rounded-lg transition-colors text-sm sm:text-base bg-red-600 hover:bg-red-700"
        >
          Sign up with Google
        </button>
     

        <p className="text-center text-sm text-slate-600 pt-2">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-600 font-bold hover:underline">
            Log In
          </Link>
        </p>
      </form>
    </div>
  );
}