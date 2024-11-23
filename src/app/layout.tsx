import "./globals.css";

import { Suspense } from "react";

import NextAuthProvider from "@/components/utils/SessionProvider";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

import Footbar from "@/components/layout/footbar/Footbar";
import Navbar from "@/components/layout/Navbar";
import { BackgroundContextProvider } from "@/providers/BackgroundProvider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <NextAuthProvider>
        <body className="relaive flex flex-col min-h-screen">
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
      </NextAuthProvider>
    </html>
  );
}
