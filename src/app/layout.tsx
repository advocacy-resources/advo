import "./globals.css";
import NextAuthProvider from "@/components/utils/SessionProvider";
import { Analytics } from "@vercel/analytics/react";

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
      </body>
    </html>
  );
}
