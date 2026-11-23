"use client";
/** Chip filtro (categorie flotta). Stato con aria-pressed; attivo = campitura trachite. */
export function Chip({ active, children, onClick, count }: { active?: boolean; children: React.ReactNode; onClick?: () => void; count?: number }) {
  return (
    <button
      type="button"
      aria-pressed={!!active}
      onClick={onClick}
      className={[
        "inline-flex h-11 items-center gap-2 border-filo px-4 text-sm font-semibold uppercase tracking-[0.06em]",
        "transition-colors duration-fast ease-trama",
        active ? "border-trachite bg-trachite text-sand" : "border-sand-300 bg-transparent text-trachite hover:border-trachite",
      ].join(" ")}
    >
      {children}
      {typeof count === "number" && <span className={active ? "text-magenta" : "text-stone"}>{count}</span>}
    </button>
  );
}
