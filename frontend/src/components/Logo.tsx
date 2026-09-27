export function Logo({ className = 'h-9 w-9' }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden>
      <defs>
        <linearGradient id="lg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#7C5CFF" />
          <stop offset="55%" stopColor="#22D3EE" />
          <stop offset="100%" stopColor="#A3E635" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="44" height="44" rx="14" fill="url(#lg)" />
      <path d="M12 30h9l3-12h8l4 6v6h-3" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <circle cx="17" cy="32.5" r="3" fill="#fff" />
      <circle cx="32" cy="32.5" r="3" fill="#fff" />
      <path d="M9 21h8M11 25.5h6" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" opacity=".85" />
    </svg>
  );
}
