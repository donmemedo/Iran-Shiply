export function Aurora() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 grid-bg" />
      <div className="absolute -top-40 left-[8%] h-[38rem] w-[38rem] animate-float rounded-full bg-brand/12 blur-[120px] dark:bg-brand/30" />
      <div
        className="absolute top-[18%] right-[4%] h-[30rem] w-[30rem] animate-float rounded-full bg-brand-2/10 blur-[110px] dark:bg-brand-2/25"
        style={{ animationDelay: '-5s' }}
      />
      <div
        className="absolute bottom-[-10%] left-[35%] h-[26rem] w-[26rem] animate-float rounded-full bg-brand-3/[0.08] blur-[120px] dark:bg-brand-3/10"
        style={{ animationDelay: '-9s' }}
      />
    </div>
  );
}
