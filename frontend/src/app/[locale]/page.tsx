'use client';

import Link from 'next/link';
import { use, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft, ArrowRight, BadgeCheck, ClipboardList, Gavel, Leaf, Lock, Route, Sparkles, TrendingDown, Truck,
} from 'lucide-react';
import { dict, type Locale } from '@/i18n/dict';
import { api, type Shipment, type Stats } from '@/lib/api';
import { city, money, num } from '@/lib/format';
import { Counter, Reveal } from '@/components/ui';
import { ShipmentCard } from '@/components/ShipmentCard';

const CORRIDORS = [
  ['تهران', 'مشهد'], ['تهران', 'اصفهان'], ['بندرعباس', 'تهران'], ['تهران', 'شیراز'],
  ['کرج', 'تبریز'], ['قم', 'اهواز'], ['تهران', 'رشت'], ['اصفهان', 'یزد'],
];

export default function Home({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = use(params);
  const t = dict[locale];
  const base = `/${locale}`;
  const Arrow = locale === 'fa' ? ArrowLeft : ArrowRight;

  const [stats, setStats] = useState<Stats | null>(null);
  const [latest, setLatest] = useState<Shipment[]>([]);

  useEffect(() => {
    api<Stats>('/api/stats').then(setStats).catch(() => {});
    api<Shipment[]>('/api/shipments?limit=6').then(setLatest).catch(() => {});
  }, []);

  const steps = [
    { icon: ClipboardList, title: t.how.s1t, desc: t.how.s1d },
    { icon: Gavel, title: t.how.s2t, desc: t.how.s2d },
    { icon: Truck, title: t.how.s3t, desc: t.how.s3d },
  ];
  const features = [
    { icon: TrendingDown, title: t.why.a, desc: t.why.ad },
    { icon: BadgeCheck, title: t.why.b, desc: t.why.bd },
    { icon: Lock, title: t.why.c, desc: t.why.cd },
    { icon: Route, title: t.why.d, desc: t.why.dd },
    { icon: Sparkles, title: t.why.e, desc: t.why.ed },
    { icon: Leaf, title: t.why.f, desc: t.why.fd },
  ];

  return (
    <>
      {/* ---------- hero ---------- */}
      <section className="mx-auto grid max-w-6xl items-center gap-12 px-5 pb-16 pt-14 lg:grid-cols-[1.05fr_.95fr] lg:pt-24">
        <div>
          <motion.span
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            className="chip !border-brand/30 !text-brand"
          >
            <Sparkles size={14} /> {t.hero.badge}
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.08 }}
            className="mt-6 text-[2.6rem] font-black leading-[1.15] tracking-tight sm:text-6xl sm:leading-[1.08]"
          >
            {t.hero.title1}
            <br />
            <span className="gradient-text">{t.hero.title2}</span> {t.hero.title3}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.16 }}
            className="mt-6 max-w-xl text-[15px] leading-8 text-muted"
          >
            {t.hero.sub}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.24 }}
            className="mt-8 flex flex-wrap items-center gap-3"
          >
            <Link href={`${base}/new`} className="btn-primary !px-7 !py-3.5">
              {t.hero.cta1} <Arrow size={17} />
            </Link>
            <Link href={`${base}/shipments`} className="btn-ghost !px-6 !py-3.5">
              {t.hero.cta2}
            </Link>
          </motion.div>

          <p className="mt-5 text-xs text-muted">{t.hero.note}</p>
        </div>

        {/* live bidding mock */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="relative"
        >
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-bold">
                <span className="grid h-9 w-9 place-items-center rounded-2xl bg-brand/12 text-brand"><Truck size={17} /></span>
                {locale === 'fa' ? 'اثاثیه منزل • تهران ← مشهد' : 'Home furniture • Tehran → Mashhad'}
              </div>
              <span className="chip !border-brand-3/40 !text-brand-3">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand-3" />
                {locale === 'fa' ? 'زنده' : 'live'}
              </span>
            </div>

            <div className="mt-6 space-y-3">
              {[
                { n: locale === 'fa' ? 'باربری آرین ترابر' : 'Aryan Tarabar', p: 9800000, r: 4.9, d: 0.5 },
                { n: locale === 'fa' ? 'رضا محمدی' : 'Reza Mohammadi', p: 8450000, r: 4.7, d: 0.75 },
                { n: locale === 'fa' ? 'پارس بار' : 'Pars Bar', p: 7200000, r: 5.0, d: 1, best: true },
              ].map((b) => (
                <motion.div
                  key={b.n}
                  initial={{ opacity: 0, x: locale === 'fa' ? 24 : -24 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + b.d, duration: 0.6 }}
                  className={`flex items-center justify-between rounded-2xl border p-3.5 ${
                    b.best ? 'border-brand-3/45 bg-brand-3/[0.07]' : 'border-[rgb(var(--line)/0.09)]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-brand to-brand-2 text-[11px] font-bold text-white">
                      {b.n.slice(0, 2)}
                    </span>
                    <div>
                      <div className="text-[13px] font-semibold">{b.n}</div>
                      <div className="text-[11px] text-muted">★ {num(b.r, locale)} · {t.detail.trips}</div>
                    </div>
                  </div>
                  <div className={`text-sm font-extrabold ${b.best ? 'text-brand-3' : ''}`}>
                    {money(b.p, locale)}
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.8 }}
              className="mt-5 flex items-center justify-between rounded-2xl bg-[rgb(var(--line)/0.05)] p-4"
            >
              <span className="text-xs text-muted">{locale === 'fa' ? 'صرفه‌جویی شما' : 'You save'}</span>
              <span className="text-lg font-black gradient-text">
                {money(2600000, locale)} {t.common.toman}
              </span>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* ---------- stats ---------- */}
      <section className="mx-auto max-w-6xl px-5">
        <Reveal className="card grid grid-cols-2 gap-6 p-7 sm:grid-cols-3 lg:grid-cols-5">
          {[
            { k: t.stats.shipments, v: stats?.shipments ?? 0 },
            { k: t.stats.carriers, v: stats?.carriers ?? 0 },
            { k: t.stats.bids, v: stats?.bids ?? 0 },
            { k: t.stats.saving, v: stats?.avg_saving_pct ?? 0, s: '٪' },
            { k: t.stats.co2, v: stats?.co2_saved_tons ?? 0 },
          ].map((s) => (
            <div key={s.k}>
              <div className="text-3xl font-black tracking-tight">
                <Counter value={s.v} locale={locale} suffix={s.s ? (locale === 'fa' ? '٪' : '%') : ''} />
              </div>
              <div className="mt-1 text-xs text-muted">{s.k}</div>
            </div>
          ))}
        </Reveal>
      </section>

      {/* ---------- corridors marquee ---------- */}
      <section className="mt-16 overflow-hidden py-4">
        <div className="flex w-max animate-marquee gap-3 hover:[animation-play-state:paused]">
          {[...CORRIDORS, ...CORRIDORS].map(([a, b], i) => (
            <span key={i} className="chip !px-4 !py-2.5 !text-[13px] glass">
              <Route size={14} className="text-brand-2" />
              {city(a, locale)} <Arrow size={12} /> {city(b, locale)}
            </span>
          ))}
        </div>
      </section>

      {/* ---------- how it works ---------- */}
      <section className="mx-auto mt-20 max-w-6xl px-5">
        <Reveal>
          <h2 className="text-center text-3xl font-black tracking-tight sm:text-4xl">{t.how.title}</h2>
          <p className="mt-3 text-center text-muted">{t.how.sub}</p>
        </Reveal>

        <div className="relative mt-12 grid gap-5 md:grid-cols-3">
          <div className="absolute inset-x-[16%] top-16 hidden h-px bg-gradient-to-r from-brand/0 via-brand/50 to-brand-2/0 md:block" />
          {steps.map((s, i) => (
            <Reveal key={s.title} delay={i * 0.12} className="card relative p-7">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-brand to-brand-2 text-white shadow-lg shadow-brand/30">
                <s.icon size={22} />
              </span>
              <span className="absolute end-6 top-6 text-5xl font-black text-[rgb(var(--line)/0.06)]">
                {num(i + 1, locale)}
              </span>
              <h3 className="mt-5 text-lg font-bold">{s.title}</h3>
              <p className="mt-2 text-sm leading-7 text-muted">{s.desc}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---------- features ---------- */}
      <section className="mx-auto mt-24 max-w-6xl px-5">
        <Reveal><h2 className="text-3xl font-black tracking-tight sm:text-4xl">{t.why.title}</h2></Reveal>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <Reveal key={f.title} delay={(i % 3) * 0.08} className="card group p-6">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand/10 text-brand transition-colors group-hover:bg-brand group-hover:text-white">
                <f.icon size={20} />
              </span>
              <h3 className="mt-4 font-bold">{f.title}</h3>
              <p className="mt-2 text-sm leading-7 text-muted">{f.desc}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---------- latest loads ---------- */}
      <section className="mx-auto mt-24 max-w-6xl px-5">
        <div className="flex items-end justify-between">
          <Reveal><h2 className="text-3xl font-black tracking-tight sm:text-4xl">{t.list.title}</h2></Reveal>
          <Link href={`${base}/shipments`} className="text-sm font-semibold text-brand-2 hover:underline">
            {t.common.seeAll} →
          </Link>
        </div>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {latest.map((s, i) => (
            <Reveal key={s.id} delay={(i % 3) * 0.07}>
              <ShipmentCard s={s} locale={locale} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---------- cta ---------- */}
      <section className="mx-auto mt-24 max-w-6xl px-5">
        <Reveal className="card relative overflow-hidden p-10 text-center sm:p-16">
          <div className="absolute inset-0 -z-10 bg-gradient-to-br from-brand/15 via-transparent to-brand-2/15" />
          <h2 className="text-3xl font-black tracking-tight sm:text-4xl">{t.hero.title1} {t.hero.title2}</h2>
          <p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-muted">{t.hero.note}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href={`${base}/new`} className="btn-primary !px-8 !py-3.5">{t.hero.cta1}</Link>
            <Link href={`${base}/auth`} className="btn-ghost !px-6 !py-3.5">{t.nav.signup}</Link>
          </div>
        </Reveal>
      </section>
    </>
  );
}
