'use client';

import Link from 'next/link';
import { use, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, BadgeCheck, CalendarDays, Check, Gauge, Package2, ShieldCheck, Star, Weight } from 'lucide-react';
import { dict, type Locale } from '@/i18n/dict';
import { api, type Shipment } from '@/lib/api';
import { city, money, num } from '@/lib/format';
import { useAuth } from '@/lib/auth';
import { CatIcon, Reveal } from '@/components/ui';

export default function ShipmentDetail({ params }: { params: Promise<{ locale: Locale; id: string }> }) {
  const { locale, id } = use(params);
  const t = dict[locale];
  const { user } = useAuth();
  const Back = locale === 'fa' ? ArrowRight : ArrowLeft;

  const [s, setS] = useState<Shipment | null>(null);
  const [amount, setAmount] = useState('');
  const [eta, setEta] = useState('2');
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const load = () => api<Shipment>(`/api/shipments/${id}`).then(setS).catch(() => setS(null));
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [id]);

  const isOwner = !!user && !!s && user.id === s.owner.id;
  const myBid = s?.bids.find((b) => b.carrier.id === user?.id);

  async function placeBid(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setErr('');
    try {
      const updated = await api<Shipment>(`/api/shipments/${id}/bids`, {
        method: 'POST',
        body: JSON.stringify({ amount: Number(amount), eta_days: Number(eta), message: msg || null }),
      });
      setS(updated); setAmount(''); setMsg('');
    } catch { setErr(t.auth.err.generic); } finally { setBusy(false); }
  }

  async function accept(bidId: number) {
    setS(await api<Shipment>(`/api/bids/${bidId}/accept`, { method: 'POST' }));
  }

  if (!s) return <div className="mx-auto max-w-6xl px-5 py-24 text-center text-muted">{t.common.loading}</div>;

  const facts = [
    { icon: Gauge, k: t.detail.route, v: `${num(s.distance_km, locale)} ${t.list.km}` },
    { icon: Weight, k: t.detail.weight, v: `${num(s.weight_kg, locale)} kg` },
    { icon: Package2, k: t.detail.volume, v: `${num(s.volume_m3, locale)} m³` },
    { icon: CalendarDays, k: t.detail.window, v: `${s.pickup_from ?? '—'} → ${s.pickup_to ?? '—'}` },
  ];

  return (
    <div className="mx-auto max-w-6xl px-5 pb-20 pt-8">
      <Link href={`/${locale}/shipments`} className="chip mb-6 hover:text-ink">
        <Back size={14} /> {t.detail.back}
      </Link>

      <div className="grid gap-6 lg:grid-cols-[1.35fr_1fr]">
        <Reveal className="card p-7">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand/12 text-brand">
                <CatIcon cat={s.category} size={22} />
              </span>
              <div>
                <h1 className="text-2xl font-black tracking-tight">{s.title}</h1>
                <span className="text-sm text-muted">{(t.cat as Record<string, string>)[s.category]}</span>
              </div>
            </div>
            <span className={`chip ${s.status === 'open' ? '!border-brand-3/40 !text-brand-3' : '!text-muted'}`}>
              {(t.dash.status as Record<string, string>)[s.status]}
            </span>
          </div>

          <div className="mt-7 flex items-center gap-4 rounded-2xl bg-[rgb(var(--line)/0.04)] p-5 text-lg font-bold">
            <span>{city(s.origin, locale)}</span>
            <span className="h-px flex-1 bg-gradient-to-r from-brand to-brand-2" />
            <span>{city(s.destination, locale)}</span>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {facts.map((f) => (
              <div key={f.k} className="flex items-center gap-3 rounded-2xl border border-[rgb(var(--line)/0.08)] p-4">
                <f.icon size={18} className="text-brand-2" />
                <div>
                  <div className="text-[11px] text-muted">{f.k}</div>
                  <div className="text-sm font-semibold" dir="ltr">{f.v}</div>
                </div>
              </div>
            ))}
          </div>

          {(s.needs_loader || s.needs_packing || s.insured) && (
            <div className="mt-6">
              <h3 className="mb-3 text-sm font-bold">{t.detail.needs}</h3>
              <div className="flex flex-wrap gap-2">
                {s.needs_loader && <span className="chip"><Check size={13} /> {t.detail.loader}</span>}
                {s.needs_packing && <span className="chip"><Check size={13} /> {t.detail.packing}</span>}
                {s.insured && <span className="chip !border-brand-3/30 !text-brand-3"><ShieldCheck size={13} /> {t.detail.insured}</span>}
              </div>
            </div>
          )}

          {s.description && (
            <div className="mt-6">
              <h3 className="mb-2 text-sm font-bold">{t.detail.desc}</h3>
              <p className="text-sm leading-8 text-muted">{s.description}</p>
            </div>
          )}

          <div className="mt-7 flex items-center gap-3 border-t border-[rgb(var(--line)/0.08)] pt-5">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-brand to-brand-2 text-xs font-bold text-white">
              {s.owner.name.slice(0, 2)}
            </span>
            <div className="text-sm">
              <div className="flex items-center gap-1.5 font-semibold">
                {s.owner.name} {s.owner.verified && <BadgeCheck size={15} className="text-brand-2" />}
              </div>
              <div className="text-xs text-muted">{city(s.owner.city ?? '', locale)}</div>
            </div>
          </div>
        </Reveal>

        <div className="space-y-6">
          {/* bid box */}
          <Reveal delay={0.06} className="card p-6">
            <div className="flex items-baseline justify-between">
              <h2 className="font-bold">{t.detail.yourBid}</h2>
              <span className="text-sm text-muted">
                {t.list.budget}: <b className="text-ink">{money(s.budget, locale)}</b>
              </span>
            </div>

            {!user ? (
              <Link href={`/${locale}/auth`} className="btn-primary mt-5 w-full">{t.detail.loginToBid}</Link>
            ) : isOwner ? (
              <p className="mt-4 text-sm text-muted">{t.detail.ownShipment}</p>
            ) : s.status !== 'open' ? (
              <p className="mt-4 text-sm text-muted">{t.detail.assigned}</p>
            ) : (
              <form onSubmit={placeBid} className="mt-5 space-y-3">
                <input className="field" inputMode="numeric" required placeholder={t.detail.amount}
                  value={amount} onChange={(e) => setAmount(e.target.value.replace(/\D/g, ''))} />
                <input className="field" inputMode="numeric" required placeholder={t.detail.eta}
                  value={eta} onChange={(e) => setEta(e.target.value.replace(/\D/g, ''))} />
                <textarea className="field min-h-[84px]" placeholder={t.detail.message}
                  value={msg} onChange={(e) => setMsg(e.target.value)} />
                {err && <p className="text-xs text-red-500">{err}</p>}
                <button className="btn-primary w-full" disabled={busy}>
                  {myBid ? `${t.detail.submit} ↻` : t.detail.submit}
                </button>
              </form>
            )}
          </Reveal>

          {/* bids list */}
          <Reveal delay={0.1} className="card p-6">
            <h2 className="font-bold">
              {t.detail.bidsTitle} <span className="text-muted">({num(s.bids.length, locale)})</span>
            </h2>
            <div className="mt-4 space-y-3">
              {s.bids.length === 0 && <p className="text-sm text-muted">{t.list.noBid}</p>}
              {s.bids.map((b, i) => (
                <motion.div
                  key={b.id}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className={`rounded-2xl border p-4 ${
                    b.status === 'accepted' ? 'border-brand-3/50 bg-brand-3/[0.07]'
                    : i === 0 ? 'border-brand/35' : 'border-[rgb(var(--line)/0.09)]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-brand to-brand-2 text-[11px] font-bold text-white">
                        {b.carrier.name.slice(0, 2)}
                      </span>
                      <div>
                        <div className="text-[13px] font-semibold">{b.carrier.name}</div>
                        <div className="flex items-center gap-1 text-[11px] text-muted">
                          <Star size={11} className="text-amber-400" /> {num(b.carrier.rating, locale)} ·{' '}
                          {num(b.carrier.trips, locale)} {t.detail.trips} · {b.carrier.vehicle}
                        </div>
                      </div>
                    </div>
                    <div className="text-end">
                      <div className="text-sm font-extrabold gradient-text">{money(b.amount, locale)}</div>
                      <div className="text-[11px] text-muted">{num(b.eta_days, locale)} {t.common.day}</div>
                    </div>
                  </div>
                  {b.message && <p className="mt-3 text-xs leading-6 text-muted">{b.message}</p>}
                  {isOwner && s.status === 'open' && (
                    <button onClick={() => accept(b.id)} className="btn-primary mt-3 w-full !py-2 text-xs">
                      {t.detail.accept}
                    </button>
                  )}
                  {b.status !== 'pending' && (
                    <span className={`chip mt-3 ${b.status === 'accepted' ? '!border-brand-3/40 !text-brand-3' : ''}`}>
                      {b.status === 'accepted' ? t.detail.accepted : t.detail.rejected}
                    </span>
                  )}
                </motion.div>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </div>
  );
}
