'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const pathname = usePathname();

  const tabs = [
    { href: '/writeups', label: 'Stories' },
    { href: '/infographics', label: 'Infographics' },
  ];

  return (
    <nav className="flex items-center gap-6">
      {tabs.map((tab) => {
        const isActive = pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`
              text-lg md:text-xl font-medium transition-colors nav-hover
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
        className="ml-8 px-6 py-2.5 bg-[var(--accent)] text-white text-sm font-semibold uppercase tracking-wider hover:bg-[var(--accent-hover)] hover:scale-105 active:scale-95 transition-all duration-200 rounded shadow-lg shadow-red-500/30"
      >
        Donate
      </a>
    </nav>
  );
}
