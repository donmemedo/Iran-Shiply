'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { Menu, Moon, Package, Sun, X } from 'lucide-react';
import { dict, type Locale } from '@/i18n/dict';
import { useAuth } from '@/lib/auth';
import { Logo } from './Logo';

export function Header({ locale }: { locale: Locale }) {
  const t = dict[locale];
  const path = usePathname();
  const { user, logout, ready } = useAuth();
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  useEffect(() => setOpen(false), [path]);

  const base = `/${locale}`;
  const links = [
    { href: `${base}/shipments`, label: t.nav.shipments },
    { href: `${base}/new`, label: t.nav.post },
    ...(user ? [{ href: `${base}/dashboard`, label: t.nav.dashboard }] : []),
  ];
  const other = locale === 'fa' ? 'en' : 'fa';
  const swapped = path.replace(`/${locale}`, `/${other}`);

  return (
    <header className="sticky top-0 z-50 px-3 pt-3 sm:px-5 sm:pt-4">
      <nav
        className={`mx-auto flex max-w-6xl items-center gap-2 rounded-3xl px-3 py-2.5 transition-all duration-500 sm:px-4 ${
          scrolled ? 'glass shadow-[0_18px_50px_-30px_rgba(0,0,0,.6)]' : 'border border-transparent'
        }`}
      >
        <Link href={base} className="flex items-center gap-2.5 pe-2 font-extrabold tracking-tight">
          <Logo />
          <span className="hidden text-[15px] sm:inline">{t.brand}</span>
        </Link>

        <div className="mx-auto hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`rounded-xl px-3.5 py-2 text-sm font-medium transition-colors ${
                path === l.href ? 'text-ink bg-[rgb(var(--line)/0.07)]' : 'text-muted hover:text-ink'
              }`}
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="ms-auto flex items-center gap-1.5 md:ms-0">
          <Link href={swapped} className="chip hover:text-ink" aria-label="language">
            {other === 'en' ? 'EN' : 'فا'}
          </Link>
          <button
            onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
            className="chip hover:text-ink"
            aria-label="theme"
          >
            {mounted && resolvedTheme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
          </button>

          {ready && user ? (
            <div className="hidden items-center gap-1.5 md:flex">
              <Link href={`${base}/dashboard`} className="chip text-ink">
                <Package size={14} /> {user.name.split(' ')[0]}
              </Link>
              <button onClick={logout} className="chip hover:text-ink">
                {t.nav.logout}
              </button>
            </div>
          ) : (
            <div className="hidden items-center gap-1.5 md:flex">
              <Link href={`${base}/auth`} className="chip hover:text-ink">
                {t.nav.login}
              </Link>
              <Link href={`${base}/new`} className="btn-primary !px-4 !py-2">
                {t.nav.post}
              </Link>
            </div>
          )}

          <button className="chip md:hidden" onClick={() => setOpen((v) => !v)} aria-label="menu">
            {open ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>
      </nav>

      {open && (
        <div className="glass mx-auto mt-2 max-w-6xl space-y-1 rounded-3xl p-3 md:hidden">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="block rounded-2xl px-4 py-3 text-sm font-medium hover:bg-[rgb(var(--line)/0.06)]">
              {l.label}
            </Link>
          ))}
          {user ? (
            <button onClick={logout} className="block w-full rounded-2xl px-4 py-3 text-start text-sm font-medium text-muted">
              {t.nav.logout}
            </button>
          ) : (
            <Link href={`${base}/auth`} className="block rounded-2xl px-4 py-3 text-sm font-medium">
              {t.nav.login} / {t.nav.signup}
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
