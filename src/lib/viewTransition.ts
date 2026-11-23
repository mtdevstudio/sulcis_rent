"use client";
import { useRouter, usePathname } from "next/navigation";
import { useCallback, useEffect } from "react";
import { prefersReducedMotion } from "./motion";

/**
 * Transizione Home ↔ scheda auto con la View Transitions API:
 * l'immagine dell'auto (view-transition-name: car-hero) si espande nella scheda.
 * Browser senza supporto o reduced-motion → navigazione normale.
 */
let resolvePending: (() => void) | null = null;

export function useRouteSignal() {
  const pathname = usePathname();
  useEffect(() => { resolvePending?.(); resolvePending = null; }, [pathname]);
}

export function useTransitionNavigate() {
  const router = useRouter();
  return useCallback((href: string, beforeStart?: () => void) => {
    const doc = document as Document & { startViewTransition?: (cb: () => Promise<void>) => unknown };
    if (!doc.startViewTransition || prefersReducedMotion()) { router.push(href); return; }
    beforeStart?.();
    doc.startViewTransition(() => new Promise<void>((resolve) => {
      resolvePending = () => requestAnimationFrame(() => resolve());
      router.push(href);
      setTimeout(resolve, 1200); // rete lenta: non bloccare la UI
    }));
  }, [router]);
}
