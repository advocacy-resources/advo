"use client";

import {
  getProviders,
  signIn,
  useSession,
  ClientSafeProvider,
} from "next-auth/react";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

interface SignInProps {
  providers: Record<string, ClientSafeProvider>;
}

const SignIn: React.FC<SignInProps> = ({ providers }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { status, data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname(); // Use `usePathname` to get the current path

  useEffect(() => {
    if (status === "authenticated" && session) {
      if (pathname !== "/dashboard/account") {
        router.push("/dashboard/account");
      }
    }
  }, [status, session, router, pathname]); // Add pathname as a dependency

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const response = await signIn("credentials", {
      username,
      password,
      redirect: false,
    });

    if (response?.ok) {
      router.push("/dashboard/account");
    } else {
      setError("Invalid username or password");
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
          {/* Large logo above the form */}
          <div className="flex justify-center">
            <Image
              src="/advo-color-physPurp-black.svg" // Replace with your actual logo path
              alt="Logo"
              width={100} // Adjust width as needed
              height={100} // Adjust height as needed
            />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <form onSubmit={handleSignIn} className="space-y-6">
            {error && <p className="text-red-500">{error}</p>}
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700"
              >
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            {/* Parallelogram Button for Sign In */}
            <div className="flex justify-center space-x-4">
              <button type="submit" className="parallelogram-btn">
                <span className="inline-block transform skew-x-[18deg]">
                  Sign In
                </span>
              </button>
            </div>
          </form>
          <div className="mt-6">
            {providers &&
              Object.values(providers).map((provider) =>
                provider.name !== "Credentials" ? (
                  <div
                    key={provider.name}
                    className="flex justify-center space-x-4"
                  >
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
          <p className="text-center text-sm text-gray-600 mt-4">
            Don&apos;t have an account?{" "}
            <Link
              href="/auth/register"
              className="text-indigo-600 hover:text-indigo-500"
            >
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

const SignInPage: React.FC = () => {
  const [providers, setProviders] = useState<Record<
    string,
    ClientSafeProvider
  > | null>(null);

  useEffect(() => {
    if (!providers) {
      const fetchProviders = async () => {
        console.log("Fetching providers..."); // Debugging line
        const providers = await getProviders();
        console.log("Providers fetched:", providers); // Debugging line
        setProviders(providers);
      };

      fetchProviders();
    }
  }, [providers]);

  return providers ? <SignIn providers={providers} /> : null;
};

export default SignInPage;
