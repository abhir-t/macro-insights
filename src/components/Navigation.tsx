'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const tabs = [
    { href: '/writeups', label: 'Stories' },
    { href: '/infographics', label: 'Infographics' },
  ];

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:flex items-center gap-6">
        {tabs.map((tab) => {
          const isActive = pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`
                text-lg font-medium transition-colors nav-hover
                ${isActive
                  ? 'text-white'
                  : 'text-white/70 hover:text-white'
                }
              `}
            >
              {tab.label}
            </Link>
          );
        })}
        <a
          href="https://buymeacoffee.com/macroinsights"
          target="_blank"
          rel="noopener noreferrer"
          className="ml-4 px-5 py-2 bg-[var(--accent)] text-white text-sm font-semibold uppercase tracking-wider hover:bg-[var(--accent-hover)] transition-all duration-200 rounded shadow-lg shadow-red-500/30"
        >
          Donate
        </a>
      </nav>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden text-white p-2"
        aria-label="Toggle menu"
      >
        {isOpen ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        )}
      </button>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 bg-[var(--dark)] border-t border-white/10 md:hidden z-50">
          <div className="px-6 py-4 flex flex-col gap-4">
            {tabs.map((tab) => {
              const isActive = pathname.startsWith(tab.href);
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  onClick={() => setIsOpen(false)}
                  className={`
                    text-lg font-medium py-2
                    ${isActive ? 'text-white' : 'text-white/70'}
                  `}
                >
                  {tab.label}
                </Link>
              );
            })}
            <a
              href="https://buymeacoffee.com/macroinsights"
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-3 bg-[var(--accent)] text-white text-sm font-semibold uppercase tracking-wider text-center rounded"
            >
              Donate
            </a>
          </div>
        </div>
      )}
    </>
  );
}
