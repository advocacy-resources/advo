"use client";

import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";

function Navbar() {
    const { data: session } = useSession();
    console.log(session?.user);

    return (
        <nav className="bg-gray-800 p-4">
            <div className="container mx-auto flex justify-between items-center">
            <Link href="/dashboard" className="text-white">Dashboard</Link>
            <div>
                    {session ? (
                        <div className="flex items-center space-x-4">
                            <span className="text-white">{session.user?.name}</span>
                            <button 
                                onClick={() => signOut()} 
                                className="bg-red-600 main-button px-4 py-2 rounded hover:bg-red-700"
                            >
                                Sign out
                            </button>
                        </div>
                    ) : (
                        <button 
                            onClick={() => signIn()} 
                            className="bg-blue-600 text-main-button px-4 py-2 rounded hover:bg-blue-700"
                        >
                            Sign in
                        </button>
                    )}
                </div>
            </div>
        </nav>
    );
}

export default Navbar;