"use client";

import { useSession } from "next-auth/react";
import { Image } from "next/image";
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

  if (session) {
    const userImage = session.user?.image;
    return (
      <>
        <Navbar />
        <h3 className="text-2xl p-8">
          Congratulations, {session.user?.email}, you have made it to the
          account page.
        </h3>
        <Image src={userImage} alt="" />
      </>
    );
  }

  return null;
};

export default AccountPage;
