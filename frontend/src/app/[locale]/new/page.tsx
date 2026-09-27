'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { use, useEffect, useState } from 'react';
import { dict, type Locale } from '@/i18n/dict';
import { api, type Shipment } from '@/lib/api';
import { city } from '@/lib/format';
import { useAuth } from '@/lib/auth';
import { CatIcon, Reveal } from '@/components/ui';

const CATS = ['furniture', 'vehicle', 'motorcycle', 'pallet', 'appliance', 'other'];

export default function NewShipment({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = use(params);
  const t = dict[locale];
  const { user, ready } = useAuth();
  const router = useRouter();

  const [cities, setCities] = useState<string[]>([]);
  const [f, setF] = useState({
    title: '', category: 'furniture', origin: 'تهران', destination: 'اصفهان', distance_km: '',
    weight_kg: '', volume_m3: '', pickup_from: '', pickup_to: '', budget: '', description: '',
    needs_loader: false, needs_packing: false, insured: false,
  });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => { api<string[]>('/api/cities').then(setCities).catch(() => {}); }, []);
  const set = (k: string, v: unknown) => setF((p) => ({ ...p, [k]: v }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setErr('');
    try {
      const created = await api<Shipment>('/api/shipments', {
        method: 'POST',
        body: JSON.stringify({
          ...f,
          distance_km: Number(f.distance_km) || 0,
          weight_kg: Number(f.weight_kg) || 0,
          volume_m3: Number(f.volume_m3) || 0,
          budget: f.budget ? Number(f.budget) : null,
        }),
      });
      router.push(`/${locale}/shipments/${created.id}`);
    } catch { setErr(t.auth.err.generic); setBusy(false); }
  }

  if (ready && !user)
    return (
      <div className="mx-auto max-w-md px-5 py-28 text-center">
        <p className="text-muted">{t.form.need}</p>
        <Link href={`/${locale}/auth`} className="btn-primary mt-6">{t.nav.login}</Link>
      </div>
    );

  return (
    <div className="mx-auto max-w-3xl px-5 pb-20 pt-10">
      <Reveal>
        <h1 className="text-4xl font-black tracking-tight">{t.form.title}</h1>
        <p className="mt-2 text-muted">{t.form.sub}</p>
      </Reveal>

      <Reveal delay={0.06}>
        <form onSubmit={submit} className="card mt-8 space-y-6 p-7">
          <div>
            <label className="mb-2 block text-sm font-semibold">{t.form.name}</label>
            <input className="field" required placeholder={t.form.namePh} value={f.title} onChange={(e) => set('title', e.target.value)} />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold">{t.form.category}</label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {CATS.map((c) => (
                <button type="button" key={c} onClick={() => set('category', c)}
                  className={`flex items-center gap-2 rounded-2xl border p-3 text-sm transition-all ${
                    f.category === c ? 'border-brand bg-brand/10 text-brand' : 'border-[rgb(var(--line)/0.1)] text-muted hover:text-ink'
                  }`}>
                  <CatIcon cat={c} size={16} /> {(t.cat as Record<string, string>)[c]}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold">{t.form.origin}</label>
              <select className="field" value={f.origin} onChange={(e) => set('origin', e.target.value)}>
                {cities.map((c) => <option key={c} value={c}>{city(c, locale)}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold">{t.form.destination}</label>
              <select className="field" value={f.destination} onChange={(e) => set('destination', e.target.value)}>
                {cities.map((c) => <option key={c} value={c}>{city(c, locale)}</option>)}
              </select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {([['distance_km', t.form.distance], ['weight_kg', t.form.weight], ['volume_m3', t.form.volume]] as const).map(([k, label]) => (
              <div key={k}>
                <label className="mb-2 block text-sm font-semibold">{label}</label>
                <input className="field" inputMode="decimal" value={(f as never)[k]}
                  onChange={(e) => set(k, e.target.value.replace(/[^\d.]/g, ''))} />
              </div>
            ))}
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm font-semibold">{t.form.from}</label>
              <input className="field" placeholder="1405-07-01" value={f.pickup_from} onChange={(e) => set('pickup_from', e.target.value)} />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold">{t.form.to}</label>
              <input className="field" placeholder="1405-07-10" value={f.pickup_to} onChange={(e) => set('pickup_to', e.target.value)} />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold">{t.form.budget}</label>
              <input className="field" inputMode="numeric" value={f.budget} onChange={(e) => set('budget', e.target.value.replace(/\D/g, ''))} />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold">{t.form.desc}</label>
            <textarea className="field min-h-[110px]" placeholder={t.form.descPh} value={f.description} onChange={(e) => set('description', e.target.value)} />
          </div>

          <div className="flex flex-wrap gap-2">
            {([['needs_loader', t.form.loader], ['needs_packing', t.form.packing], ['insured', t.form.insured]] as const).map(([k, label]) => (
              <button type="button" key={k} onClick={() => set(k, !(f as never)[k])}
                className={`chip !px-4 !py-2.5 ${(f as never)[k] ? '!border-brand !bg-brand/10 !text-brand' : 'hover:!text-ink'}`}>
                {label}
              </button>
            ))}
          </div>

          {err && <p className="text-sm text-red-500">{err}</p>}
          <button className="btn-primary w-full !py-4" disabled={busy}>{t.form.submit}</button>
        </form>
      </Reveal>
    </div>
  );
}
