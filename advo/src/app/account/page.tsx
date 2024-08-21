"use client";

import { useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
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

  if (!session) return null;

  const userImage = session.user?.image || "/images/default-user-image.png";
  return (
    <>
      <Navbar />
      <h3 className="text-2xl p-8">
        Congratulations, {session.user?.email}, you have made it to the account
        page.
      </h3>
      <Image
        src={userImage}
        alt="User Profile Image"
        width={100} // Provide a default width
        height={100} // Provide a default height
        priority // Optional: if you want to load it as a priority
      />
    </>
  );
};

export default AccountPage;
