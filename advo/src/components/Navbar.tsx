"use client";

import Link from "next/link";

import { signIn, signOut, useSession } from "next-auth/react";

function Navbar() {
    const { data: session } = useSession();
    console.log(session?.user);

    return (
        <nav className="bg-white-800 p-4">
            <div className="container mx-auto flex justify-between items-center">
                <Link href="/dashboard" className="text-black"><span className="font-bold">ADVO</span> | Connecting Youth with Support</Link>
                <ul className="flex p-4">
                    <li className="px-5">
                        <Link href="/">
                            Home
                        </Link>
                    </li>
                    <li className="px-5">
                        <Link href="/about">
                            About Us
                        </Link>
                    </li>
                    <li className="px-5">
                        <Link href="/contact">
                            Contact
                        </Link>
                    </li>
                    <li className="px-5">
                        <Link href="/faq">
                            FAQ
                        </Link>
                    </li>
                </ul>
            </div>

        </nav>
    );
}

export default Navbar;