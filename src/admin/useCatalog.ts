"use client";
import { useEffect, useState } from "react";
import { api, type Catalog } from "./api";

let cache: Catalog | null = null;
export function useCatalog() {
  const [c, setC] = useState<Catalog | null>(cache);
  useEffect(() => { if (!cache) api<{ catalog: Catalog }>("GET", "admin/catalog.php").then((r) => { cache = r.catalog; setC(r.catalog); }).catch(() => {}); }, []);
  return c;
}
export const invalidateCatalog = () => { cache = null; };
