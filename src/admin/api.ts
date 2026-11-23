"use client";
/**
 * Client dell'API admin. Il frontend NON sa nulla del PIN oltre a inviarlo al login:
 * verifica, sessione e permessi sono tutti lato server (PHP).
 * - cookie di sessione HttpOnly (illeggibile da JS) inviato in automatico (same-origin);
 * - header X-CSRF-Token = valore del cookie __Host-sr_csrf (double submit).
 */
export class ApiError extends Error {
  constructor(public status: number, message: string, public fields: Record<string, string> = {}) { super(message); }
}

const listeners = new Set<() => void>();
export const onUnauthorized = (cb: () => void) => { listeners.add(cb); return () => { listeners.delete(cb); }; };

function csrf(): string {
  const m = document.cookie.match(/(?:^|;\s*)__Host-sr_csrf=([a-f0-9]{64})/);
  return m ? m[1] : "";
}

export async function api<T = unknown>(method: string, path: string, body?: unknown): Promise<T> {
  const headers: Record<string, string> = { Accept: "application/json" };
  if (method !== "GET") headers["X-CSRF-Token"] = csrf();
  if (body !== undefined) headers["Content-Type"] = "application/json";
  let res: Response;
  try {
    res = await fetch(`/api/${path}`, { method, headers, credentials: "same-origin", body: body !== undefined ? JSON.stringify(body) : undefined, cache: "no-store" });
  } catch {
    throw new ApiError(0, "Connessione assente: controlla la rete e riprova");
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401 && !path.startsWith("auth/login") && !path.startsWith("auth/me")) listeners.forEach((l) => l());
    throw new ApiError(res.status, data.error || "Errore imprevisto", data.fields || {});
  }
  return data as T;
}

/** Upload con barra di avanzamento (XHR). */
export function uploadPhoto(carId: number, file: Blob, name: string, onProgress: (p: number) => void): Promise<{ photo: AdminPhoto }> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/admin/photos.php");
    xhr.setRequestHeader("X-CSRF-Token", csrf());
    xhr.withCredentials = true;
    xhr.upload.onprogress = (e) => { if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100)); };
    xhr.onload = () => {
      let data: { error?: string; photo?: AdminPhoto } = {};
      try { data = JSON.parse(xhr.responseText); } catch { /* */ }
      if (xhr.status >= 200 && xhr.status < 300 && data.photo) resolve({ photo: data.photo });
      else {
        if (xhr.status === 401) listeners.forEach((l) => l());
        reject(new ApiError(xhr.status, data.error || (xhr.status === 413 ? "Foto troppo grande" : "Caricamento non riuscito")));
      }
    };
    xhr.onerror = () => reject(new ApiError(0, "Connessione interrotta"));
    const fd = new FormData();
    fd.append("car_id", String(carId));
    fd.append("file", file, name);
    xhr.send(fd);
  });
}

/* ---------- tipi ---------- */
export type Role = "owner" | "staff";
export type Me = { user: { id: number; name: string; role: Role }; capabilities: { heic: boolean; imagick: boolean; webp: boolean; maxBytes: number; serverMaxUpload: number }; pinMinLength: number };
export type L10n = { it?: string; en?: string } | null;
export type AdminPhoto = { id: number; uuid: string; base: string; widths: number[]; w: number; h: number; alt: { it?: string; en?: string } };
export type CarStatus = "draft" | "published" | "hidden";
export type AdminCar = {
  id: number; slug: string; brand: string; model: string; version: string | null; category: string | null; year: number | null;
  plate: string | null; status: CarStatus; featured: boolean; badge: string | null; sortOrder: number;
  color: { name?: string; hex?: string } | null; specs: Record<string, unknown>; features: string[]; rental: Record<string, unknown>;
  content: { short?: L10n; long?: L10n; highlights?: L10n[] }; perfectFor: string[]; whatsappMessage: L10n; seo: { title?: L10n; description?: L10n } | null;
  internalNotes: string | null; photos: AdminPhoto[]; createdAt: string; updatedAt: string; updatedBy: { id: number; name: string } | null; deletedAt: string | null;
};
export type CarRow = {
  id: number; slug: string; brand: string; model: string; version: string | null; category: string | null; status: CarStatus; featured: boolean;
  sortOrder: number; plate: string | null; updatedAt: string; updatedBy: string | null; deletedAt: string | null; cover: string | null; photoCount: number;
};
export type CatalogItem = { key: string; label: { it: string; en?: string }; icon?: string; active?: boolean };
export type Catalog = { categories: CatalogItem[]; features: CatalogItem[]; tags: CatalogItem[] };

export const statusLabel: Record<CarStatus, string> = { draft: "Bozza", published: "Pubblicata", hidden: "Nascosta" };
export const fmtDate = (s?: string | null) => (s ? new Date(s.replace(" ", "T") + (s.includes("Z") ? "" : "Z")).toLocaleString("it-IT", { dateStyle: "short", timeStyle: "short" }) : "—");
