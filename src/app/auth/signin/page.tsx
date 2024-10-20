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
      router.push("/");
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
      console.log("Sign in successful");
    } else {
      setError(response?.error || "An unexpected error occurred");
    }
  };

  return (
    <div className="relative flex grow h-full">
      <div className="flex items-center justify-center w-full p-2">
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
          <div className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </div>
          <form onSubmit={handleSignIn} className="space-y-6">
            {error && <div className="text-red-500">{error}</div>}
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
                    <Button
                      onClick={(e) => handleSignIn(e)}
                      className="parallelogram-btn"
                    >
                      <span className="inline-block transform skew-x-[18deg]">
                        Sign in with {provider.name}
                      </span>
                    </Button>
                  </div>
                ) : null,
              )}
          </div>
          <div className="flex justify-between items-center mt-4">
            <Link
              href="/auth/register"
              className="text-sm text-indigo-600 hover:text-indigo-500"
            >
              Don&apos;t have an account? Sign Up
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
