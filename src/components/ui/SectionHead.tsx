import { Nodo } from "./icons";

/** Intestazione di sezione: numero + etichetta, filo sotto. Ritmo editoriale. */
export function SectionHead({ index, label, tone = "light" }: { index: string; label: string; tone?: "light" | "dark" }) {
  const line = tone === "light" ? "border-trachite text-trachite" : "border-sand/40 text-sand";
  return (
    <div className={`flex items-center gap-4 border-b-filo pb-3 eyebrow ${line}`}>
      <span className={tone === "light" ? "text-magenta-deep" : "text-sand"}>{index}</span>
      <Nodo className="h-2 w-2" />
      <span>{label}</span>
    </div>
  );
}
