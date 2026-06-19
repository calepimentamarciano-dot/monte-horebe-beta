export default function BillingLoading() {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-horebe-gold">Área administrativa</p>
      <h1 className="mt-2 font-display text-4xl text-horebe-soft md:text-5xl">Faturamento</h1>
      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="glass-panel h-32 animate-pulse rounded-2xl" />
        ))}
      </div>
      <div className="glass-panel mt-6 h-80 animate-pulse rounded-2xl" />
    </div>
  );
}
