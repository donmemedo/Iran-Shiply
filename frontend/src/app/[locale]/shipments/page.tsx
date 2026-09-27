'use client';

import { use, useEffect, useMemo, useState } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import { dict, type Locale } from '@/i18n/dict';
import { api, type Shipment } from '@/lib/api';
import { city } from '@/lib/format';
import { ShipmentCard } from '@/components/ShipmentCard';
import { Reveal } from '@/components/ui';

const CATS = ['all', 'furniture', 'vehicle', 'motorcycle', 'pallet', 'appliance', 'other'];

export default function ShipmentsPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = use(params);
  const t = dict[locale];

  const [items, setItems] = useState<Shipment[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('all');
  const [origin, setOrigin] = useState('');
  const [dest, setDest] = useState('');
  const [sort, setSort] = useState('new');

  useEffect(() => { api<string[]>('/api/cities').then(setCities).catch(() => {}); }, []);

  const query = useMemo(() => {
    const p = new URLSearchParams({ category: cat, sort, limit: '60' });
    if (q) p.set('q', q);
    if (origin) p.set('origin', origin);
    if (dest) p.set('destination', dest);
    return p.toString();
  }, [q, cat, origin, dest, sort]);

  useEffect(() => {
    setLoading(true);
    const id = setTimeout(() => {
      api<Shipment[]>(`/api/shipments?${query}`).then(setItems).catch(() => setItems([])).finally(() => setLoading(false));
    }, 250);
    return () => clearTimeout(id);
  }, [query]);

  return (
    <div className="mx-auto max-w-6xl px-5 pb-20 pt-10">
      <Reveal>
        <h1 className="text-4xl font-black tracking-tight">{t.list.title}</h1>
        <p className="mt-2 text-muted">{t.list.sub}</p>
      </Reveal>

      <Reveal delay={0.05} className="card mt-8 p-5">
        <div className="flex flex-col gap-4">
          <div className="relative">
            <Search size={17} className="absolute top-1/2 -translate-y-1/2 text-muted start-4" />
            <input className="field ps-11" placeholder={t.list.search} value={q} onChange={(e) => setQ(e.target.value)} />
          </div>

          <div className="flex flex-wrap gap-2">
            {CATS.map((c) => (
              <button
                key={c}
                onClick={() => setCat(c)}
                className={`chip !px-4 !py-2 ${cat === c ? '!border-brand !bg-brand/10 !text-brand' : 'hover:!text-ink'}`}
              >
                {(t.cat as Record<string, string>)[c]}
              </button>
            ))}
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <select className="field" value={origin} onChange={(e) => setOrigin(e.target.value)}>
              <option value="">{t.form.origin} — {t.list.all}</option>
              {cities.map((c) => <option key={c} value={c}>{city(c, locale)}</option>)}
            </select>
            <select className="field" value={dest} onChange={(e) => setDest(e.target.value)}>
              <option value="">{t.form.destination} — {t.list.all}</option>
              {cities.map((c) => <option key={c} value={c}>{city(c, locale)}</option>)}
            </select>
            <select className="field" value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="new">{t.list.sortNew}</option>
              <option value="distance">{t.list.sortFar}</option>
            </select>
          </div>
        </div>
      </Reveal>

      {loading ? (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card h-56 animate-pulse bg-[rgb(var(--line)/0.04)]" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="card mt-8 grid place-items-center gap-3 p-16 text-center">
          <SlidersHorizontal className="text-muted" />
          <p className="text-muted">{t.list.empty}</p>
        </div>
      ) : (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((s, i) => (
            <Reveal key={s.id} delay={Math.min(i, 5) * 0.05}>
              <ShipmentCard s={s} locale={locale} />
            </Reveal>
          ))}
        </div>
      )}
    </div>
  );
}
