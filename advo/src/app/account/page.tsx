"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Image from "next/image";

import Navbar from "#/navbar/Navbar";

const AccountPage: React.FC = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (session) {
    const userImage = session.user?.image || ""; // Provide a fallback if image is null
    return (
      <>
        <Navbar />
        <h3 className="text-2xl p-8">
          Congratulations, {session.user?.email}, you have made it to the
          account page.
        </h3>
        {userImage && (
          <Image
            src={userImage}
            alt="User Profile Image"
            width={100} // Provide a default width
            height={100} // Provide a default height
            priority // Optional: if you want to load it as a priority
          />
        )}
      </>
    );
  }

  return null;
};

export default AccountPage;
