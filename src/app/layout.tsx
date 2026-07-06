import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Space_Grotesk } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
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
  description: "A beautifully designed, feature-rich task management application",
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
          <script
            dangerouslySetInnerHTML={{
              __html: `
                try {
                  if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                    document.documentElement.classList.add('dark')
                  }
                } catch (_) {}
              `,
            }}
          />
        </head>
        <body className={`${plusJakarta.variable} ${spaceGrotesk.variable} font-sans antialiased`}>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
