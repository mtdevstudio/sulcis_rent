import { Fragment, type ElementType } from "react";

/**
 * Testo spezzato in parole per il reveal (SSR: il testo è nel DOM, leggibile e indicizzabile).
 * L'animazione la fa <MotionDirector/>; con reduced-motion/no-JS resta visibile.
 * `lines`: ogni elemento va a capo; `accent`: indici di riga in magenta.
 */
export function RevealText({
  lines, as: Tag = "p", className = "", accent = [], lineClass = "",
}: { lines: string[]; as?: ElementType; className?: string; accent?: number[]; lineClass?: string }) {
  return (
    <Tag className={`rv ${className}`}>
      {lines.map((line, li) => (
        <Fragment key={li}>
          <span className={`block ${accent.includes(li) ? "text-magenta" : ""} ${lineClass}`}>
            {line.split(" ").map((w, wi, arr) => (
              <Fragment key={wi}>
                <span className="rv-w"><span>{w}</span></span>{wi < arr.length - 1 ? " " : ""}
              </Fragment>
            ))}
          </span>
        </Fragment>
      ))}
    </Tag>
  );
}
