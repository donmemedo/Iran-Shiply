export const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8021';

export type User = {
  id: number; phone: string; name: string; role: 'shipper' | 'carrier';
  city?: string | null; vehicle?: string | null; rating: number; trips: number; verified: boolean;
};
export type Bid = {
  id: number; amount: number; eta_days: number; message?: string | null;
  status: 'pending' | 'accepted' | 'rejected'; created_at: string; carrier: User;
};
export type Shipment = {
  id: number; title: string; category: string; origin: string; destination: string;
  distance_km: number; weight_kg: number; volume_m3: number; needs_loader: boolean;
  needs_packing: boolean; insured: boolean; pickup_from?: string | null; pickup_to?: string | null;
  description?: string | null; photo?: string | null; budget?: number | null;
  status: 'open' | 'assigned' | 'in_transit' | 'delivered' | 'cancelled';
  created_at: string; owner: User; bid_count: number; best_bid?: number | null; bids: Bid[];
};
export type Stats = { shipments: number; carriers: number; bids: number; avg_saving_pct: number; co2_saved_tons: number };

export const TOKEN_KEY = 'shiply_token';

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null;
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      'content-type': 'application/json',
      ...(token ? { authorization: `Bearer ${token}` } : {}),
      ...(init.headers || {}),
    },
    cache: 'no-store',
  });
  if (!res.ok) {
    let code = 'ERROR';
    try { code = (await res.json()).detail ?? code; } catch {}
    throw new Error(code);
  }
  return res.json() as Promise<T>;
}
