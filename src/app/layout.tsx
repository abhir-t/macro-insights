import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";
import StickySignup from "@/components/StickySignup";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Macro Insights",
  description: "Business, Finance & Market Intelligence",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${playfair.variable} ${inter.variable} antialiased`}>
        <div className="min-h-screen pb-24">
          <header className="bg-[var(--background)]">
            <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
              <a href="/" className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[var(--accent)] flex items-center justify-center">
                  <span className="text-white font-bold text-xl">M</span>
                </div>
                <span className="text-[var(--accent)] font-serif text-3xl md:text-4xl font-bold tracking-tight">
                  MACRO INSIGHTS
                </span>
              </a>
              <Navigation />
            </div>
          </header>
          <main>{children}</main>
        </div>
        <StickySignup />
      </body>
    </html>
  );
}
