"use client";

import { useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

const CookieNotice = () => {
  const { toast, dismiss } = useToast({ title: "", description: "" });
  const toastIdRef = useRef<string | null>(null);

  const handleAcceptAll = useCallback(() => {
    console.log("All cookies accepted");
    if (toastIdRef.current) {
      dismiss(toastIdRef.current);
    }
  }, [dismiss]);

  const handleDenyAll = useCallback(() => {
    console.log("All cookies except essential ones denied");
    if (toastIdRef.current) {
      dismiss(toastIdRef.current);
    }
  }, [dismiss]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const { id } = toast({
        title: "Cookie Notice",
        description: (
          <>
            <p>
              This site uses cookies to improve your experience. You can accept
              or deny all cookies except essential ones.
            </p>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: "1rem",
              }}
            >
              <Button variant="default" onClick={handleAcceptAll}>
                Accept All
              </Button>
              <Button variant="default" onClick={handleDenyAll}>
                Deny All
              </Button>
            </div>
          </>
        ),
        duration: 10000, // Adjust the duration as needed
      });
      toastIdRef.current = id;
    }, 3000);

    return () => clearTimeout(timer);
  }, [toast, handleAcceptAll, handleDenyAll]);

  return null;
};

export default CookieNotice;
