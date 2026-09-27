'use client';

import Link from 'next/link';
import { ArrowLeft, ArrowRight, Gauge, ShieldCheck, Users } from 'lucide-react';
import { dict, type Locale } from '@/i18n/dict';
import { city, money, num } from '@/lib/format';
import type { Shipment } from '@/lib/api';
import { CatIcon } from './ui';

export function ShipmentCard({ s, locale }: { s: Shipment; locale: Locale }) {
  const t = dict[locale];
  const Arrow = locale === 'fa' ? ArrowLeft : ArrowRight;

  return (
    <Link href={`/${locale}/shipments/${s.id}`} className="card group block overflow-hidden p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-brand/12 text-brand">
            <CatIcon cat={s.category} />
          </span>
          <div>
            <h3 className="line-clamp-1 text-[15px] font-bold">{s.title}</h3>
            <span className="text-xs text-muted">{(t.cat as Record<string, string>)[s.category]}</span>
          </div>
        </div>
        {s.insured && (
          <span className="chip !border-brand-3/30 !text-brand-3">
            <ShieldCheck size={13} /> {t.detail.insured}
          </span>
        )}
      </div>

      <div className="my-5 flex items-center gap-3 text-sm font-semibold">
        <span>{city(s.origin, locale)}</span>
        <span className="relative h-px flex-1 bg-[rgb(var(--line)/0.15)]">
          <span className="absolute inset-y-0 start-0 w-0 bg-gradient-to-r from-brand to-brand-2 transition-all duration-700 group-hover:w-full" />
        </span>
        <Arrow size={15} className="text-brand-2" />
        <span>{city(s.destination, locale)}</span>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
        <span className="chip"><Gauge size={13} /> {num(s.distance_km, locale)} {t.list.km}</span>
        <span className="chip">{num(s.weight_kg, locale)} kg</span>
        <span className="chip"><Users size={13} /> {num(s.bid_count, locale)} {t.list.bids}</span>
      </div>

      <div className="mt-5 flex items-end justify-between border-t border-[rgb(var(--line)/0.08)] pt-4">
        <div>
          <div className="text-[11px] text-muted">{s.best_bid ? t.list.best : t.list.budget}</div>
          <div className="text-lg font-extrabold gradient-text">
            {money(s.best_bid ?? s.budget, locale)}{' '}
            <span className="text-xs font-medium text-muted">{t.common.toman}</span>
          </div>
        </div>
        <span className="text-xs font-semibold text-brand-2 opacity-0 transition-opacity group-hover:opacity-100">
          {t.list.view} →
        </span>
      </div>
    </Link>
  );
}
