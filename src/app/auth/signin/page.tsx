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
import LogoImage from "@/assets/myAdvo-peachWhite.svg";

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
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="max-w-md w-full space-y-8 p-10 bg-gray-800 rounded-xl shadow-lg">
        {/* Logo */}
        <div className="flex justify-center">
          <Image src={LogoImage} alt="Logo" width={100} height={100} />
        </div>
        <div className="mt-6 text-center text-3xl font-extrabold">
          Sign in to your account
        </div>
        <form onSubmit={handleSignIn} className="space-y-6">
          {error && <div className="text-red-500">{error}</div>}
          <div>
            <label htmlFor="email" className="block text-sm font-medium">
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
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-700 bg-black text-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 px-4 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Sign In
          </button>
        </form>
        <div className="mt-6 space-y-4">
          {providers &&
            Object.values(providers).map((provider) =>
              provider.name !== "Credentials" ? (
                <div key={provider.name} className="flex justify-center">
                  <button
                    onClick={() => signIn(provider.id)}
                    className="w-full py-2 px-4 rounded-md bg-pink-600 hover:bg-pink-700 text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
                  >
                    Sign in with {provider.name}
                  </button>
                </div>
              ) : null,
            )}
        </div>
        <div className="flex justify-between items-center mt-4 text-sm">
          <Link
            href="/auth/register"
            className="text-indigo-400 hover:underline"
          >
            Don&apos;t have an account? Sign Up
          </Link>
          <Link
            href="/auth/change-password"
            className="text-indigo-400 hover:underline"
          >
            Forgot password?
          </Link>
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
