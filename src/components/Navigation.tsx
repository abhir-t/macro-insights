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
              text-sm font-medium transition-colors
              ${isActive
                ? 'text-[var(--accent)]'
                : 'text-[var(--muted)] hover:text-[var(--foreground)]'
              }
            `}
          >
            {tab.label}
          </Link>
        );
      })}
      <Link
        href="/admin"
        className="btn-outline text-sm px-4 py-2 rounded-none"
      >
        Sign In
      </Link>
    </nav>
  );
}
