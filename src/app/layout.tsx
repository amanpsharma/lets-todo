import type { Metadata } from "next";
import Script from "next/script";
import { Plus_Jakarta_Sans, Space_Grotesk } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-heading",
});

export const metadata: Metadata = {
  title: "TaskFlow - Advanced Todo Application",
  description:
    "A beautifully designed, feature-rich task management application",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "TaskFlow",
    startupImage: "/icons/icon-512x512.png",
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <head>
          <meta name="theme-color" content="#7c3aed" />
          <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
          <Script src="/theme-init.js" strategy="beforeInteractive" />
        </head>
        <body className={`${plusJakarta.variable} ${spaceGrotesk.variable} font-sans antialiased`}>
          {children}
          <ServiceWorkerRegister />
        </body>
      </html>
    </ClerkProvider>
  );
}
