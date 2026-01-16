import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";
import MobileNav from "@/components/MobileNav";
import StickySignup from "@/components/StickySignup";
import ThemeProvider from "@/components/ThemeProvider";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
  style: ["normal", "italic"],
  weight: ["400", "500", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Vantage Post",
  description: "Business, Finance & Market Intelligence",
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="dark">
      <body className={`${playfair.variable} ${inter.variable} antialiased`}>
        <ThemeProvider>
        <div className="min-h-screen flex flex-col">
          <header className="bg-[var(--dark)] relative z-50">
            <div className="max-w-[1400px] mx-auto px-4 md:px-8 lg:px-16 py-4 md:py-5 flex items-center justify-between">
              <a href="/" className="flex items-center">
                <span
                  className="text-2xl md:text-4xl lg:text-5xl font-bold italic leading-none"
                  style={{ fontFamily: 'var(--font-playfair), Georgia, serif', marginTop: '-4px' }}
                >
                  <span className="text-white">vantage</span>
                  <span className="text-[var(--accent)]">post</span>
                </span>
              </a>
              <Navigation />
            </div>
          </header>
          <main className="flex-1 pb-16 md:pb-0 overflow-x-hidden">{children}</main>
          <footer className="bg-[var(--dark)] text-white">
            <div className="max-w-[1400px] mx-auto px-8 lg:px-16 py-6">
              <div className="flex flex-col md:flex-row md:justify-between gap-8 mb-4">
                {/* Brand */}
                <div>
                  <span
                    className="text-2xl font-bold italic mb-4 block"
                    style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}
                  >
                    <span className="text-white">vantage</span>
                    <span className="text-[var(--accent)]">post</span>
                  </span>
                  <p className="text-white/60 text-sm leading-relaxed max-w-xs">
                    Insights that move markets. Deep dives into business, finance, and the forces shaping our world.
                  </p>
                </div>

                {/* Quick Links */}
                <div>
                  <h4 className="text-sm font-semibold uppercase tracking-wider mb-4 text-[var(--accent)]">
                    Explore
                  </h4>
                  <div className="flex flex-col gap-2">
                    <a href="/writeups" className="text-white/60 hover:text-white transition-colors text-sm">
                      Stories
                    </a>
                    <a href="/infographics" className="text-white/60 hover:text-white transition-colors text-sm">
                      Infographics
                    </a>
                  </div>
                </div>

                {/* Company */}
                <div>
                  <h4 className="text-sm font-semibold uppercase tracking-wider mb-4 text-[var(--accent)]">
                    Company
                  </h4>
                  <div className="flex flex-col gap-2">
                    <a href="/about" className="text-white/60 hover:text-white transition-colors text-sm">
                      About Us
                    </a>
                    <a href="/contact" className="text-white/60 hover:text-white transition-colors text-sm">
                      Contact
                    </a>
                  </div>
                </div>
              </div>

              {/* Bottom Bar */}
              <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-white/40 text-xs">
                  © {new Date().getFullYear()} Vantage Post. All rights reserved.
                </p>
                <p className="text-white/40 text-xs">
                  Made with <span className="text-[var(--accent)]">♥</span> for informed readers
                </p>
              </div>
            </div>
          </footer>
        </div>
        <StickySignup />
        <MobileNav />
        </ThemeProvider>
      </body>
    </html>
  );
}
