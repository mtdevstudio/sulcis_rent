import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { Nodo } from "./icons";

export type ButtonVariant = "magenta" | "blue" | "dark" | "sand" | "outline";
export type ButtonSize = "md" | "lg" | "xl";

/**
 * Bottone «filo»: rettangolo netto, nessun raggio. In hover una campitura più scura
 * scorre da sinistra con easing «trama» (stacco deciso, arrivo morbido).
 * Contrasti: bianco su magenta 5.1:1 · su blu 5.5:1 · sabbia su trachite 14.8:1 (AA).
 */
const variants: Record<ButtonVariant, string> = {
  magenta: "bg-magenta text-white before:bg-magenta-deep",
  blue: "bg-blue text-white before:bg-blue-deep",
  dark: "bg-trachite text-sand before:bg-magenta",
  sand: "bg-sand text-trachite before:bg-white",
  outline: "bg-transparent text-trachite border-filo border-trachite before:bg-trachite hover:text-sand",
};
const sizes: Record<ButtonSize, string> = {
  md: "h-12 px-5 text-sm gap-2.5",
  lg: "h-14 px-7 text-base gap-3",
  xl: "h-16 md:h-[4.5rem] px-8 md:px-10 text-base md:text-lg gap-3.5",
};

export const buttonClass = (variant: ButtonVariant = "magenta", size: ButtonSize = "lg", extra = "") =>
  [
    "group relative inline-flex items-center justify-center overflow-hidden isolate select-none",
    "font-sans font-bold uppercase tracking-[0.08em] whitespace-nowrap",
    "transition-colors duration-base ease-trama",
    "before:absolute before:inset-0 before:-z-10 before:origin-left before:scale-x-0",
    "before:transition-transform before:duration-base before:ease-trama hover:before:scale-x-100",
    "disabled:opacity-50",
    variants[variant],
    sizes[size],
    extra,
  ].join(" ");

type Common = { variant?: ButtonVariant; size?: ButtonSize; icon?: ReactNode; nodo?: boolean; children: ReactNode };

export function Button({
  variant, size, icon, nodo, children, className = "", ...rest
}: Common & ComponentPropsWithoutRef<"button">) {
  return (
    <button type="button" className={buttonClass(variant, size, className)} {...rest}>
      {nodo && <Nodo className="h-2.5 w-2.5 transition-transform duration-base ease-trama group-hover:rotate-90" />}
      <span>{children}</span>
      {icon}
    </button>
  );
}

export function ButtonLink({
  variant, size, icon, nodo, children, className = "", href, ...rest
}: Common & ComponentPropsWithoutRef<"a"> & { href: string }) {
  const cls = buttonClass(variant, size, className);
  const inner = (
    <>
      {nodo && <Nodo className="h-2.5 w-2.5 transition-transform duration-base ease-trama group-hover:rotate-90" />}
      <span>{children}</span>
      {icon}
    </>
  );
  if (href.startsWith("/")) return <Link href={href} className={cls} {...rest}>{inner}</Link>;
  return <a href={href} className={cls} {...rest}>{inner}</a>;
}
