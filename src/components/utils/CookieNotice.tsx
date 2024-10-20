"use client";

import React, { useCallback, useRef } from "react";
import { useToast } from "#/ui/use-toast";

const CookieNotice = () => {
  const { toast } = useToast();
  const toastIdRef = useRef<string | null>(null);

  const handleAcceptAll = useCallback(() => {
    // Logic for accepting all cookies
    console.log("All cookies accepted");

    toastIdRef.current = toast({
      title: "Cookies Accepted",
      description: "You have accepted all cookies.",
    }).id;
  }, [toast]);

  const handleRejectAll = useCallback(() => {
    // Logic for rejecting all cookies
    console.log("All cookies rejected");

    toastIdRef.current = toast({
      title: "Cookies Rejected",
      description: "You have rejected all cookies.",
    }).id;
  }, [toast]);

  const handleCustomize = useCallback(() => {
    // Logic for customizing cookie preferences
    console.log("Customize cookie preferences");

    toastIdRef.current = toast({
      title: "Customize Cookies",
      description: "You can now customize your cookie preferences.",
    }).id;
  }, [toast]);

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-100 p-4 shadow-md">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="text-sm text-gray-700">
          We use cookies to enhance your browsing experience and analyze our
          traffic. By clicking &quot;Accept All&quot;, you consent to our use of
          cookies.
        </div>
        <div className="space-x-2">
          <button
            onClick={handleAcceptAll}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Accept All
          </button>
          <button
            onClick={handleRejectAll}
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
          >
            Reject All
          </button>
          <button
            onClick={handleCustomize}
            className="text-blue-500 hover:underline"
          >
            Customize
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieNotice;
