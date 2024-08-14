"use client";

import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast";
import { useToast } from "@/components/ui/use-toast";
import { TOAST_REMOVE_DELAY } from "@/components/ui/use-toast";

export function Toaster() {
  const { toasts } = useToast({ title: "", description: "" });

  return (
    <div className="absolute max-w-full">
      <ToastProvider duration={TOAST_REMOVE_DELAY}>
        {toasts.map(
          ({ id, title, description, action, duration, ...props }) => (
            <Toast key={id} duration={duration} {...props}>
              <div className="flex flex-col w-full">
                <div className="flex justify-start items-center w-full p-2 gap-2 mr-4">
                  <div className="grid gap-1">
                    {title && <ToastTitle>{title}</ToastTitle>}
                    {description && (
                      <ToastDescription>{description}</ToastDescription>
                    )}
                  </div>
                  {action}
                </div>
                <ToastClose />
              </div>
            </Toast>
          ),
        )}
        <ToastViewport />
      </ToastProvider>
    </div>
  );
}
