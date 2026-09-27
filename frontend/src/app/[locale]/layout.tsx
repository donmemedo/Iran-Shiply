import type { Metadata, Viewport } from 'next';
import '../globals.css';
import { dict, locales, type Locale } from '@/i18n/dict';
import { Providers } from '@/components/Providers';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Aurora } from '@/components/Aurora';

export const dynamicParams = false;
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F8F9FC' },
    { media: '(prefers-color-scheme: dark)', color: '#080910' },
  ],
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = dict[locale] ?? dict.fa;
  return {
    title: { default: `${t.brand} — ${t.tagline}`, template: `%s · ${t.brand}` },
    description: t.hero.sub,
    manifest: '/manifest.webmanifest',
    appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: t.brand },
    icons: { icon: '/icon.svg', apple: '/icon.svg' },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const t = dict[locale] ?? dict.fa;

  return (
    <html lang={locale} dir={t.dir} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://cdn.jsdelivr.net" />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/rastikerdar/vazirmatn@33.003/Vazirmatn-font-face.css"
        />
        <style>{`:root{--font-ui:${locale === 'fa' ? "'Vazirmatn'," : ''}ui-sans-serif,system-ui,'Segoe UI',sans-serif}`}</style>
      </head>
      <body className="min-h-screen font-sans antialiased">
        <Providers>
          <Aurora />
          <Header locale={locale} />
          <main className="relative z-10">{children}</main>
          <Footer locale={locale} />
        </Providers>
      </body>
    </html>
  );
}
