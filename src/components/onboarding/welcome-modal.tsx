"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import GradientButton from "@/components/onboarding/modal-button";
import router from "next/router";
import Link from "next/link";

export default function WelcomeModal() {
  const [isOpen, setIsOpen] = useState(false);

  // Automatically open the modal on page load
  useEffect(() => {
    setIsOpen(true);
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {/* Dialog Content */}
      <DialogContent className="bg-black text-white rounded-md shadow-lg p-6 max-w-md">
        {/* Header with Logo */}
        <DialogHeader className="flex flex-col items-center gap-4">
          <Image
            src="/images/advo-logo-color.png"
            alt="myAdvo Logo"
            width={80}
            height={80}
            className="rounded-md"
          />
          <DialogTitle className="text-2xl font-bold text-center">
            Welcome to myAdvo
          </DialogTitle>
        </DialogHeader>

        {/* Divider */}
        <hr className="h-1 bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 border-0 rounded-full my-4" />

        {/* Description */}
        <p className="text-center text-lg">
          myAdvo is a web app created to safely connect you with resources for
          your social, mental, or physical health — no matter who you are.
        </p>
        <p className="text-center text-lg mt-4">
          For the best experience finding resources that suit your specific
          needs, we recommend making an account or logging in. You can also
          browse resources anonymously, but you will need to make an account or
          log in to rate resources, submit resources, or save your preferences.
        </p>

        {/* Buttons */}
        <div className="flex flex-col gap-4 mt-6">
          {/* Highlighted Button */}
          <div className="flex flex-col gap-4">
            {/* Highlighted Button with Link */}
            <Link href="/auth/register" passHref>
              <GradientButton highlighted={true}>Make Account</GradientButton>
            </Link>

            {/* Non-Highlighted Buttons */}
            <Link href="/auth/signin" passHref>
              <GradientButton highlighted={false}>Log In</GradientButton>
            </Link>

            <Link href="/resources" passHref>
              <GradientButton highlighted={false}>
                Use Anonymously
              </GradientButton>
            </Link>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
