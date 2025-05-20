// File: src/app/layout.tsx
// Purpose: Root layout component that wraps the entire application with providers and common UI elements.
// Owner: Advo Team

import "./globals.css";

import { Suspense } from "react";

import NextAuthProvider from "@/components/utils/SessionProvider";
import ReduxProvider from "@/providers/ReduxProvider";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Footbar from "@/components/layout/footbar/Footbar";
import Navbar from "@/components/layout/Navbar";
// NOTE: BackgroundContextProvider is imported but commented out in the component
// This is kept for future implementation
import { BackgroundContextProvider } from "@/providers/BackgroundProvider";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Advo",
  description: "Connecting you with resources that matter",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "https://myadvo.org",
  ),
  openGraph: {
    title: "Advo",
    description: "Connecting you with resources that matter",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Advo Logo",
      },
    ],
    type: "website",
    siteName: "My Advo",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Advo",
    description: "Connecting you with resources that matter",
    images: ["/opengraph-image"],
  },
};

/**
 * Root layout component that wraps the entire application.
 * Provides authentication, state management, and common UI elements like navbar and footer.
 * Also includes analytics tracking components.
 *
 * @param children - The page content to render within the layout
 * @returns React component with the complete application structure
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <NextAuthProvider>
        <ReduxProvider>
          <body className="relaive flex flex-col min-h-screen bg-black text-white">
            <Navbar />
            {/* <BackgroundContextProvider> */}
            <Suspense>
              <div className="flex flex-col h-full grow">{children}</div>
              <Footbar />
            </Suspense>
            {/* </BackgroundContextProvider> */}
            <Analytics />
            <SpeedInsights />
          </body>
        </ReduxProvider>
      </NextAuthProvider>
    </html>
  );
}
