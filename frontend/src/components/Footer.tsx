import Link from 'next/link';
import { dict, type Locale } from '@/i18n/dict';
import { Logo } from './Logo';

export function Footer({ locale }: { locale: Locale }) {
  const t = dict[locale];
  const base = `/${locale}`;
  return (
    <footer className="relative z-10 mt-24 border-t border-[rgb(var(--line)/0.08)] px-5 py-12">
      <div className="mx-auto grid max-w-6xl gap-10 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2.5 font-extrabold">
            <Logo className="h-8 w-8" /> {t.brand}
          </div>
          <p className="max-w-xs text-sm leading-7 text-muted">{t.footer.built}</p>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-bold">{t.footer.links}</h4>
          <ul className="space-y-2 text-sm text-muted">
            <li><Link className="hover:text-ink" href={`${base}/shipments`}>{t.nav.shipments}</Link></li>
            <li><Link className="hover:text-ink" href={`${base}/new`}>{t.nav.post}</Link></li>
            <li><Link className="hover:text-ink" href={`${base}/auth`}>{t.nav.login}</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-bold">{t.footer.support}</h4>
          <ul className="space-y-2 text-sm text-muted">
            <li>{t.footer.privacy}</li>
            <li>{t.footer.terms}</li>
            <li dir="ltr">۰۲۱ - ۹۱۰۰ ۲۱۲۱</li>
          </ul>
        </div>
        <div className="text-sm text-muted">
          <h4 className="mb-3 text-sm font-bold text-ink">{t.tagline}</h4>
          <p className="leading-7">{locale === 'fa' ? 'تهران، خیابان ولیعصر، مرکز نوآوری' : 'Tehran, Valiasr St., Innovation Hub'}</p>
        </div>
      </div>
      <p className="mx-auto mt-10 max-w-6xl text-xs text-muted">
        © {locale === 'fa' ? '۱۴۰۵' : '2026'} {t.brand} — {t.footer.rights}
      </p>
    </footer>
  );
}
