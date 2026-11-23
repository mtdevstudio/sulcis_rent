"use client";
import { useSyncExternalStore } from "react";
import type { FaqData, FleetData, ReviewsData, SettingsData } from "./types";
import { faqSnapshot, fleetSnapshot, reviewsSnapshot, settingsSnapshot } from "@/data/snapshot.generated";

/**
 * Dati pubblici a runtime (stale-while-revalidate):
 * 1. primo render = snapshot inclusa nel build (nessun flash, nessun layout shift);
 * 2. al mount: GET /data/version.json (no-store, pochi byte) → GET /data/{nome}.json?v={versione};
 * 3. se il JSON non esiste (sito statico senza API) resta la snapshot.
 */
type Store = { fleet: FleetData; reviews: ReviewsData; faq: FaqData; settings: SettingsData };
let state: Store = { fleet: fleetSnapshot, reviews: reviewsSnapshot, faq: faqSnapshot, settings: settingsSnapshot };
const listeners = new Set<() => void>();
let started = false;

function emit() { listeners.forEach((l) => l()); }

async function revalidate() {
  try {
    const vr = await fetch("/data/version.json", { cache: "no-store" });
    if (!vr.ok) return;
    const { v } = (await vr.json()) as { v: string };
    const names = ["fleet", "reviews", "faq", "settings"] as const;
    const results = await Promise.all(
      names.map((n) => fetch(`/data/${n}.json?v=${encodeURIComponent(v)}`).then((r) => (r.ok ? r.json() : null)).catch(() => null)),
    );
    const next = { ...state };
    let changed = false;
    names.forEach((n, i) => {
      const val = results[i];
      if (val && val.version !== (state[n] as { version: string }).version) {
        (next as Record<string, unknown>)[n] = val;
        changed = true;
      }
    });
    if (changed) { state = next; emit(); }
  } catch { /* offline o niente API: resta la snapshot */ }
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  if (!started && typeof window !== "undefined") { started = true; void revalidate(); }
  return () => listeners.delete(cb);
}

export function usePublicData<K extends keyof Store>(key: K): Store[K] {
  return useSyncExternalStore(subscribe, () => state[key], () => state[key]);
}
export const useFleet = () => usePublicData("fleet");
export const useReviews = () => usePublicData("reviews");
export const useFaq = () => usePublicData("faq");
export const useSettingsData = () => usePublicData("settings");
