import type { Locale } from '@/i18n/dict';

const FA = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

export const toFa = (s: string) => s.replace(/\d/g, (d) => FA[+d]);

export function num(n: number, locale: Locale) {
  const s = new Intl.NumberFormat('en-US').format(n);
  return locale === 'fa' ? toFa(s) : s;
}

/** Money in Toman, compacted for readability (e.g. ۹٫۸ میلیون). */
export function money(n: number | null | undefined, locale: Locale) {
  if (n == null) return '—';
  if (locale === 'fa') {
    if (n >= 1_000_000) {
      const v = (n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1).replace('.', '٫');
      return `${toFa(v)} میلیون`;
    }
    if (n >= 1000) return `${toFa(String(Math.round(n / 1000)))} هزار`;
    return toFa(String(n));
  }
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)}M`;
  if (n >= 1000) return `${Math.round(n / 1000)}K`;
  return String(n);
}

export const CITY_EN: Record<string, string> = {
  'تهران': 'Tehran', 'کرج': 'Karaj', 'قم': 'Qom', 'اصفهان': 'Isfahan', 'مشهد': 'Mashhad',
  'شیراز': 'Shiraz', 'تبریز': 'Tabriz', 'بندرعباس': 'Bandar Abbas', 'اهواز': 'Ahvaz',
  'رشت': 'Rasht', 'کرمان': 'Kerman', 'یزد': 'Yazd', 'ارومیه': 'Urmia', 'کرمانشاه': 'Kermanshah', 'ساری': 'Sari',
};
export const city = (name: string, locale: Locale) => (locale === 'en' ? CITY_EN[name] ?? name : name);
