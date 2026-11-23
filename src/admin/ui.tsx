"use client";
import { forwardRef, useEffect, useId, useRef, useState, type ReactNode } from "react";

/** Kit UI dell'admin: pulito, brand, niente animazioni pesanti. Label vere, focus visibili, errori annunciati. */

export function Btn({ variant = "primary", size = "md", className = "", ...p }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "dark" | "ghost" | "danger" | "blue"; size?: "sm" | "md" | "lg" }) {
  const v = {
    primary: "bg-magenta text-white hover:bg-magenta-deep",
    blue: "bg-blue text-white hover:bg-blue-deep",
    dark: "bg-trachite text-sand hover:bg-trachite-800",
    ghost: "border-filo border-trachite bg-transparent text-trachite hover:bg-trachite hover:text-sand",
    danger: "bg-[#9F1239] text-white hover:bg-[#7f0f2e]",
  }[variant];
  const s = { sm: "h-10 px-3 text-sm", md: "h-12 px-5 text-sm", lg: "h-14 px-6 text-base" }[size];
  return <button type="button" className={`inline-flex items-center justify-center gap-2 font-bold uppercase tracking-[0.06em] transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${v} ${s} ${className}`} {...p} />;
}

export function Field({ label, hint, error, children, id, className = "" }: { label: string; hint?: string; error?: string; children: (id: string, describedBy?: string) => ReactNode; id?: string; className?: string }) {
  const auto = useId();
  const fid = id ?? auto;
  const hintId = hint ? `${fid}-h` : undefined;
  const errId = error ? `${fid}-e` : undefined;
  return (
    <div className={className}>
      <label htmlFor={fid} className="mb-1.5 block text-sm font-semibold">{label}</label>
      {children(fid, [hintId, errId].filter(Boolean).join(" ") || undefined)}
      {hint && !error && <p id={hintId} className="mt-1 text-xs text-stone">{hint}</p>}
      {error && <p id={errId} role="alert" className="mt-1 text-sm font-semibold text-[#9F1239]">{error}</p>}
    </div>
  );
}

const inputCls = "block w-full border-filo border-trachite bg-white px-3 text-base text-trachite placeholder:text-stone/60 aria-[invalid=true]:border-[#9F1239] aria-[invalid=true]:bg-[#fff5f7]";

export const Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(function Input({ className = "", ...p }, ref) {
  return <input ref={ref} className={`${inputCls} h-12 ${className}`} {...p} />;
});
export const Textarea = forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(function Textarea({ className = "", ...p }, ref) {
  return <textarea ref={ref} className={`${inputCls} min-h-[6rem] py-2.5 ${className}`} {...p} />;
});
export const Select = forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(function Select({ className = "", children, ...p }, ref) {
  return <select ref={ref} className={`${inputCls} h-12 ${className}`} {...p}>{children}</select>;
});

export function Switch({ checked, onChange, label, hint, id }: { checked: boolean; onChange: (v: boolean) => void; label: string; hint?: string; id?: string }) {
  const auto = useId();
  const fid = id ?? auto;
  return (
    <div className="flex items-start justify-between gap-4 py-2">
      <label htmlFor={fid} className="cursor-pointer">
        <span className="block font-semibold">{label}</span>
        {hint && <span className="block text-xs text-stone">{hint}</span>}
      </label>
      <button id={fid} type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)}
        className={`relative h-8 w-14 shrink-0 rounded-full border-filo border-trachite transition-colors ${checked ? "bg-blue" : "bg-sand-200"}`}>
        <span className={`absolute top-1/2 h-6 w-6 -translate-y-1/2 rounded-full bg-white shadow transition-[left] ${checked ? "left-[1.6rem]" : "left-0.5"}`} />
        <span className="sr-only">{checked ? "Sì" : "No"}</span>
      </button>
    </div>
  );
}

export function Section({ title, subtitle, children, open = true, id, badge }: { title: string; subtitle?: string; children: ReactNode; open?: boolean; id?: string; badge?: ReactNode }) {
  return (
    <details id={id} open={open} className="group border-filo border-trachite bg-white">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-4 md:px-6 [&::-webkit-details-marker]:hidden">
        <span>
          <span className="display block text-xl md:text-2xl" style={{ fontVariationSettings: '"wdth" 75, "wght" 800' }}>{title}</span>
          {subtitle && <span className="block text-xs text-stone">{subtitle}</span>}
        </span>
        <span className="flex items-center gap-3">{badge}<span className="grid h-9 w-9 place-items-center border-filo border-trachite transition-transform group-open:rotate-45" aria-hidden>+</span></span>
      </summary>
      <div className="space-y-5 border-t border-sand-300 px-4 py-5 md:px-6">{children}</div>
    </details>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`border-filo border-trachite bg-white p-4 md:p-6 ${className}`}>{children}</div>;
}

export function StatusBadge({ status }: { status: "draft" | "published" | "hidden" }) {
  const c = { draft: "bg-sand-200 text-trachite", published: "bg-blue text-white", hidden: "bg-trachite text-sand" }[status];
  const l = { draft: "Bozza", published: "Pubblicata", hidden: "Nascosta" }[status];
  return <span className={`eyebrow inline-flex h-7 items-center px-2 ${c}`}>{l}</span>;
}

export function PageHeader({ title, children, back }: { title: string; children?: ReactNode; back?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>{back}<h1 className="display text-[clamp(2rem,6vw,3.25rem)] leading-[0.9]" style={{ fontVariationSettings: '"wdth" 70, "wght" 850' }}>{title}</h1></div>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

/** Dialog di conferma accessibile (focus sul bottone, Esc chiude). */
export function Confirm({ open, title, body, confirmLabel, danger, onConfirm, onCancel, children, confirmDisabled }: {
  open: boolean; title: string; body?: ReactNode; confirmLabel: string; danger?: boolean; onConfirm: () => void; onCancel: () => void; children?: ReactNode; confirmDisabled?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    ref.current?.querySelector<HTMLElement>("input,button[data-cancel]")?.focus();
    const k = (e: KeyboardEvent) => { if (e.key === "Escape") onCancel(); };
    addEventListener("keydown", k);
    return () => { removeEventListener("keydown", k); prev?.focus(); };
  }, [open, onCancel]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-modal flex items-end justify-center bg-trachite/70 p-0 sm:items-center sm:p-4" role="presentation" onClick={onCancel}>
      <div ref={ref} role="alertdialog" aria-modal="true" aria-labelledby="cf-t" className="w-full max-w-md bg-sand p-6" onClick={(e) => e.stopPropagation()}>
        <h2 id="cf-t" className="display text-2xl" style={{ fontVariationSettings: '"wdth" 75, "wght" 800' }}>{title}</h2>
        {body && <div className="mt-3 text-stone">{body}</div>}
        {children}
        <div className="mt-6 grid grid-cols-2 gap-2">
          <Btn variant="ghost" data-cancel onClick={onCancel}>Annulla</Btn>
          <Btn variant={danger ? "danger" : "primary"} onClick={onConfirm} disabled={confirmDisabled}>{confirmLabel}</Btn>
        </div>
      </div>
    </div>
  );
}

export function Empty({ title, children }: { title: string; children?: ReactNode }) {
  return <div className="border-filo border-dashed border-trachite bg-white/60 p-8 text-center"><p className="font-semibold">{title}</p>{children && <div className="mt-3">{children}</div>}</div>;
}

export function Spinner({ label = "Caricamento…" }: { label?: string }) {
  return <div role="status" className="flex items-center gap-3 py-10 text-stone"><span className="h-5 w-5 animate-spin rounded-full border-2 border-trachite border-t-transparent" aria-hidden />{label}</div>;
}

/** Campo bilingue IT / EN con tab. */
export function L10nInput({ label, value, onChange, max, multiline, hint, error, required }: {
  label: string; value: { it?: string; en?: string } | null | undefined; onChange: (v: { it?: string; en?: string }) => void; max?: number; multiline?: boolean; hint?: string; error?: string; required?: boolean;
}) {
  const [tab, setTab] = useState<"it" | "en">("it");
  const id = useId();
  const v = value ?? {};
  const cur = v[tab] ?? "";
  const common = { id: `${id}-${tab}`, value: cur, maxLength: max, "aria-invalid": !!error, onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange({ ...v, [tab]: e.target.value }) };
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <label htmlFor={`${id}-${tab}`} className="text-sm font-semibold">{label}{required && " *"} <span className="font-normal text-stone">({tab === "it" ? "italiano" : "inglese"})</span></label>
        <div role="tablist" aria-label="Lingua" className="flex border-filo border-trachite text-xs font-bold">
          {(["it", "en"] as const).map((l) => (
            <button key={l} type="button" role="tab" aria-selected={tab === l} onClick={() => setTab(l)} className={`h-8 px-3 uppercase ${tab === l ? "bg-trachite text-sand" : ""}`}>
              {l}{l === "en" && !v.en && v.it ? " ·" : ""}
            </button>
          ))}
        </div>
      </div>
      {multiline ? <Textarea {...common} /> : <Input {...common} />}
      <div className="mt-1 flex justify-between text-xs text-stone">
        <span role={error ? "alert" : undefined} className={error ? "font-semibold text-[#9F1239]" : ""}>{error || hint || (tab === "en" ? "Se vuoto, sul sito inglese si usa il testo italiano." : "")}</span>
        {max && <span aria-hidden>{cur.length}/{max}</span>}
      </div>
    </div>
  );
}

/** Numero con tastiera numerica su mobile. */
export function NumberInput({ value, onChange, decimal, ...p }: { value: number | null | undefined; onChange: (v: number | null) => void; decimal?: boolean } & Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange">) {
  const [txt, setTxt] = useState(value == null ? "" : String(value).replace(".", ","));
  useEffect(() => { setTxt((t) => (Number(t.replace(",", ".")) === value ? t : value == null ? "" : String(value).replace(".", ","))); }, [value]);
  return (
    <Input
      inputMode={decimal ? "decimal" : "numeric"}
      value={txt}
      onChange={(e) => {
        const s = e.target.value.replace(decimal ? /[^0-9,.]/g : /\D/g, "");
        setTxt(s);
        onChange(s === "" ? null : Number(s.replace(",", ".")));
      }}
      {...p}
    />
  );
}

/** Scelta multipla a chip (dotazioni, «Perfetta per»). */
export function ChipsMulti({ options, value, onChange, label }: { options: { key: string; label: string }[]; value: string[]; onChange: (v: string[]) => void; label: string }) {
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-semibold">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => {
          const on = value.includes(o.key);
          return (
            <button key={o.key} type="button" aria-pressed={on} onClick={() => onChange(on ? value.filter((x) => x !== o.key) : [...value, o.key])}
              className={`min-h-11 border-filo px-3 py-2 text-left text-sm font-semibold ${on ? "border-blue bg-blue text-white" : "border-sand-300 bg-white hover:border-trachite"}`}>
              {on ? "✓ " : ""}{o.label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

/**
 * Editor di testo ricco MINIMALE: grassetto, elenco puntato/numerato, link. Niente HTML libero:
 * il server sanifica comunque con una whitelist (p, br, strong, em, ul, ol, li, a).
 */
export function RichText({ value, onChange, label }: { value: string; onChange: (html: string) => void; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const id = useId();
  useEffect(() => { if (ref.current && ref.current.innerHTML !== value) ref.current.innerHTML = value || ""; }, [value]);
  const cmd = (c: string, arg?: string) => { ref.current?.focus(); document.execCommand(c, false, arg); onChange(ref.current?.innerHTML ?? ""); };
  return (
    <div>
      <p id={`${id}-l`} className="mb-1.5 text-sm font-semibold">{label}</p>
      <div className="flex flex-wrap gap-1 border-filo border-b-0 border-trachite bg-sand-200 p-1" role="toolbar" aria-label="Formattazione">
        <button type="button" className="h-9 min-w-9 px-2 font-bold hover:bg-white" onClick={() => cmd("bold")} aria-label="Grassetto">B</button>
        <button type="button" className="h-9 px-2 text-sm hover:bg-white" onClick={() => cmd("insertUnorderedList")} aria-label="Elenco puntato">• Elenco</button>
        <button type="button" className="h-9 px-2 text-sm hover:bg-white" onClick={() => cmd("insertOrderedList")} aria-label="Elenco numerato">1. Elenco</button>
        <button type="button" className="h-9 px-2 text-sm hover:bg-white" onClick={() => { const u = prompt("Indirizzo del link (https://…)"); if (u && /^https?:\/\//.test(u)) cmd("createLink", u); }} aria-label="Inserisci link">Link</button>
      </div>
      <div
        ref={ref}
        role="textbox"
        aria-multiline="true"
        aria-labelledby={`${id}-l`}
        contentEditable
        suppressContentEditableWarning
        onInput={() => onChange(ref.current?.innerHTML ?? "")}
        onPaste={(e) => { e.preventDefault(); document.execCommand("insertText", false, e.clipboardData.getData("text/plain")); }}
        className="prose-car min-h-[9rem] border-filo border-trachite bg-white p-3 focus:outline-none focus-visible:outline-magenta"
      />
    </div>
  );
}
