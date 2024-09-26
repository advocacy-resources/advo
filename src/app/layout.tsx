import "./globals.css";
import NextAuthProvider from "@/components/utils/SessionProvider";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <NextAuthProvider>{children}</NextAuthProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
