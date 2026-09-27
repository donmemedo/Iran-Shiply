'use client';

import { useRouter } from 'next/navigation';
import { use, useState } from 'react';
import { Truck, Package } from 'lucide-react';
import { dict, type Locale } from '@/i18n/dict';
import { useAuth } from '@/lib/auth';
import { Reveal } from '@/components/ui';

export default function AuthPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = use(params);
  const t = dict[locale];
  const { login, register } = useAuth();
  const router = useRouter();

  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [role, setRole] = useState<'shipper' | 'carrier'>('shipper');
  const [f, setF] = useState({ phone: '', password: '', name: '', city: '', vehicle: '' });
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k: string, v: string) => setF((p) => ({ ...p, [k]: v }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setErr('');
    try {
      if (mode === 'login') await login(f.phone, f.password);
      else await register({ ...f, role });
      router.push(`/${locale}/dashboard`);
    } catch (e) {
      const code = (e as Error).message;
      setErr(code === 'BAD_CREDENTIALS' ? t.auth.err.bad : code === 'PHONE_TAKEN' ? t.auth.err.taken : t.auth.err.generic);
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-5 pb-20 pt-14">
      <Reveal className="card p-8">
        <div className="mb-7 flex gap-2">
          {(['login', 'signup'] as const).map((m) => (
            <button key={m} onClick={() => { setMode(m); setErr(''); }}
              className={`flex-1 rounded-2xl px-4 py-2.5 text-sm font-semibold transition-all ${
                mode === m ? 'bg-gradient-to-r from-brand to-brand-2 text-white' : 'text-muted hover:text-ink'
              }`}>
              {m === 'login' ? t.auth.login : t.auth.signup}
            </button>
          ))}
        </div>

        <form onSubmit={submit} className="space-y-4">
          {mode === 'signup' && (
            <>
              <div>
                <label className="mb-2 block text-sm font-semibold">{t.auth.role}</label>
                <div className="grid grid-cols-2 gap-2">
                  {([['shipper', t.auth.shipper, Package], ['carrier', t.auth.carrier, Truck]] as const).map(([k, label, I]) => (
                    <button type="button" key={k} onClick={() => setRole(k)}
                      className={`flex items-center justify-center gap-2 rounded-2xl border p-3 text-sm transition-all ${
                        role === k ? 'border-brand bg-brand/10 text-brand' : 'border-[rgb(var(--line)/0.1)] text-muted'
                      }`}>
                      <I size={16} /> {label}
                    </button>
                  ))}
                </div>
              </div>
              <input className="field" required placeholder={t.auth.name} value={f.name} onChange={(e) => set('name', e.target.value)} />
              <input className="field" placeholder={t.auth.city} value={f.city} onChange={(e) => set('city', e.target.value)} />
              {role === 'carrier' && (
                <input className="field" placeholder={t.auth.vehicle} value={f.vehicle} onChange={(e) => set('vehicle', e.target.value)} />
              )}
            </>
          )}

          <input className="field" dir="ltr" required inputMode="tel" placeholder={t.auth.phone}
            value={f.phone} onChange={(e) => set('phone', e.target.value.replace(/\D/g, ''))} />
          <input className="field" dir="ltr" required type="password" placeholder={t.auth.password}
            value={f.password} onChange={(e) => set('password', e.target.value)} />

          {err && <p className="text-sm text-red-500">{err}</p>}
          <button className="btn-primary w-full !py-3.5" disabled={busy}>
            {mode === 'login' ? t.auth.submitLogin : t.auth.submitSignup}
          </button>
        </form>

        <div className="mt-7 rounded-2xl border border-dashed border-[rgb(var(--line)/0.15)] p-4 text-xs leading-6 text-muted">
          <b className="text-ink">{t.auth.demo}</b>
          <div dir="ltr" className="mt-2 space-y-1 font-mono">
            <div>09121000002 — {t.auth.carrier}</div>
            <div>09351000001 — {t.auth.shipper}</div>
          </div>
          <div className="mt-2">{t.auth.demoHint}</div>
        </div>
      </Reveal>
    </div>
  );
}
