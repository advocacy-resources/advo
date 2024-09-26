// pages/auth/signin.tsx

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  signIn,
  useSession,
  getProviders,
  ClientSafeProvider,
} from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

interface SignInProps {
  providers: Record<string, ClientSafeProvider>;
}

const SignIn: React.FC<SignInProps> = ({ providers }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/dashboard/account");
    }
  }, [status, router]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const response = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (response?.ok) {
      router.replace("/dashboard/account");
    } else {
      setError(response?.error || "An unexpected error occurred");
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left half with the image */}
      <div className="w-1/2 relative hidden md:block">
        <div className="absolute inset-0">
          <Image
            src="/AdvoHomeHeroBanner.png"
            alt="Sign In Image"
            layout="fill"
            objectFit="cover"
          />
        </div>
      </div>

      {/* Right half with the sign-in form */}
      <div className="w-full md:w-1/2 flex items-center justify-center bg-gray-100">
        <div className="max-w-md w-full space-y-8 p-10 bg-white rounded-xl shadow-md">
          {/* Logo */}
          <div className="flex justify-center">
            <Image
              src="/advo-color-physPurp-black.svg"
              alt="Logo"
              width={100}
              height={100}
            />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <form onSubmit={handleSignIn} className="space-y-6">
            {error && <p className="text-red-500">{error}</p>}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div className="flex justify-center space-x-4">
              <button type="submit" className="parallelogram-btn">
                <span className="inline-block transform skew-x-[18deg]">
                  Sign In
                </span>
              </button>
            </div>
          </form>
          <div className="mt-6 space-y-4">
            {providers &&
              Object.values(providers).map((provider) =>
                provider.name !== "Credentials" ? (
                  <div key={provider.name} className="flex justify-center">
                    <button
                      onClick={() =>
                        signIn(provider.id, {
                          callbackUrl: "/dashboard/account",
                        })
                      }
                      className="parallelogram-btn"
                    >
                      <span className="inline-block transform skew-x-[18deg]">
                        Sign in with {provider.name}
                      </span>
                    </button>
                  </div>
                ) : null,
              )}
          </div>
          <div className="flex justify-between items-center mt-4">
            <Link
              href="/auth/register"
              className="text-sm text-indigo-600 hover:text-indigo-500"
            >
              Don't have an account? Sign Up
            </Link>
            <Link
              href="/auth/change-password"
              className="text-sm text-indigo-600 hover:text-indigo-500"
            >
              Forgot password?
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function SignInPage() {
  const [providers, setProviders] = useState<Record<
    string,
    ClientSafeProvider
  > | null>(null);

  useEffect(() => {
    const fetchProviders = async () => {
      const res = await getProviders();
      setProviders(res);
    };

    fetchProviders();
  }, []);

  return providers ? <SignIn providers={providers} /> : null;
}
