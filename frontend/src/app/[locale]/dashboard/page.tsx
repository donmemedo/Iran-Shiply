'use client';

import Link from 'next/link';
import { use, useEffect, useState } from 'react';
import { Star, Wallet } from 'lucide-react';
import { dict, type Locale } from '@/i18n/dict';
import { api, type Shipment } from '@/lib/api';
import { money, num } from '@/lib/format';
import { useAuth } from '@/lib/auth';
import { ShipmentCard } from '@/components/ShipmentCard';
import { Reveal } from '@/components/ui';

export default function Dashboard({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = use(params);
  const t = dict[locale];
  const { user, ready } = useAuth();

  const [tab, setTab] = useState<'shipments' | 'bids'>('shipments');
  const [mine, setMine] = useState<Shipment[]>([]);
  const [bids, setBids] = useState<Shipment[]>([]);

  useEffect(() => {
    if (!user) return;
    api<Shipment[]>('/api/my/shipments').then(setMine).catch(() => {});
    api<Shipment[]>('/api/my/bids').then(setBids).catch(() => {});
  }, [user]);

  useEffect(() => { if (user?.role === 'carrier') setTab('bids'); }, [user]);

  if (ready && !user)
    return (
      <div className="mx-auto max-w-md px-5 py-28 text-center">
        <p className="text-muted">{t.form.need}</p>
        <Link href={`/${locale}/auth`} className="btn-primary mt-6">{t.nav.login}</Link>
      </div>
    );
  if (!user) return <div className="px-5 py-28 text-center text-muted">{t.common.loading}</div>;

  const list = tab === 'shipments' ? mine : bids;

  return (
    <div className="mx-auto max-w-6xl px-5 pb-20 pt-10">
      <Reveal className="card flex flex-wrap items-center justify-between gap-6 p-7">
        <div className="flex items-center gap-4">
          <span className="grid h-14 w-14 place-items-center rounded-3xl bg-gradient-to-br from-brand to-brand-2 text-lg font-black text-white">
            {user.name.slice(0, 2)}
          </span>
          <div>
            <h1 className="text-2xl font-black tracking-tight">{user.name}</h1>
            <p className="text-sm text-muted" dir="ltr">{user.phone} · {user.role === 'carrier' ? t.auth.carrier : t.auth.shipper}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <div className="rounded-2xl border border-[rgb(var(--line)/0.09)] px-5 py-3">
            <div className="flex items-center gap-1.5 text-[11px] text-muted"><Star size={12} /> {t.dash.rating}</div>
            <div className="text-lg font-extrabold">{num(user.rating, locale)}</div>
          </div>
          <div className="rounded-2xl border border-[rgb(var(--line)/0.09)] px-5 py-3">
            <div className="flex items-center gap-1.5 text-[11px] text-muted"><Wallet size={12} /> {t.dash.wallet}</div>
            <div className="text-lg font-extrabold gradient-text">{money(0, locale)}</div>
          </div>
        </div>
      </Reveal>

      <div className="mt-8 flex gap-2">
        {(['shipments', 'bids'] as const).map((k) => (
          <button key={k} onClick={() => setTab(k)}
            className={`chip !px-5 !py-2.5 ${tab === k ? '!border-brand !bg-brand/10 !text-brand' : 'hover:!text-ink'}`}>
            {k === 'shipments' ? t.dash.myShipments : t.dash.myBids}
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <div className="card mt-6 p-16 text-center text-muted">
          {tab === 'shipments' ? t.dash.emptyS : t.dash.emptyB}
        </div>
      ) : (
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((s, i) => (
            <Reveal key={s.id} delay={Math.min(i, 5) * 0.05}>
              <ShipmentCard s={s} locale={locale} />
            </Reveal>
          ))}
        </div>
      )}
    </div>
  );
}
