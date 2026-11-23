"use client";
import { createContext, useContext } from "react";
import type { Lang } from "@/lib/types";
const Ctx = createContext<Lang>("it");
export const LangProvider = ({ lang, children }: { lang: Lang; children: React.ReactNode }) => <Ctx.Provider value={lang}>{children}</Ctx.Provider>;
export const useLang = () => useContext(Ctx);
