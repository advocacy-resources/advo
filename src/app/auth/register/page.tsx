"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const SignUpPage: React.FC = () => {
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const response = await fetch("/api/auth/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ password, email }),
    });

    if (response.ok) {
      setSuccess("User registered successfully!");
      setTimeout(() => router.push("/auth/signin"), 2000);
    } else {
      const data = await response.json();
      setError(data.message || "An error occurred during registration");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="max-w-md w-full space-y-8 p-10 bg-gray-800 rounded-xl shadow-lg">
        {/* Header */}
        <div className="text-center text-3xl font-extrabold">
          Create Your Account
        </div>
        {/* Form */}
        <form onSubmit={handleSignUp} className="space-y-6">
          {error && <div className="text-red-500">{error}</div>}
          {success && <div className="text-green-500">{success}</div>}
          <div>
            <label htmlFor="email" className="block text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-700 bg-black text-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-700 bg-black text-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 px-4 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Sign Up
          </button>
        </form>
        {/* Footer Links */}
        <div className="text-center text-sm">
          Already have an account?{" "}
          <Link href="/auth/signin" className="text-indigo-400 hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
