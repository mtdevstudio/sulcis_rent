import { execFileSync } from "node:child_process";
import type { Page } from "@playwright/test";

export const OWNER = { name: "Titolare", pin: "48151623" };

/** SQL diretto nel container MariaDB (solo ambiente di test locale). */
export function sql(q: string) {
  execFileSync("docker", ["compose", "exec", "-T", "db", "mariadb", "-uroot", "-plocalroot", "sulcisrent", "-e", q], { stdio: "pipe" });
}

export function resetDb() {
  sql("DELETE FROM auth_attempts; DELETE FROM auth_locks; DELETE FROM admin_sessions; DELETE FROM cars;");
  // PIN owner noto (bcrypt cost 10 generato lato host)
  const hash = execFileSync("php", ["-r", `echo password_hash('${OWNER.pin}', PASSWORD_BCRYPT, ['cost'=>10]);`]).toString();
  sql(`UPDATE admin_users SET pin_hash='${hash}', active=1 WHERE name='${OWNER.name}'`);
}

export async function login(page: Page) {
  await page.goto("/admin/");
  await pickUser(page, OWNER.name);
  const pad = page.getByRole("group", { name: "Tastierino numerico" });
  for (const d of OWNER.pin) await pad.getByRole("button", { name: d, exact: true }).click();
  await pad.getByRole("button", { name: "Entra" }).click();
  await page.getByRole("heading", { level: 1, name: /^Ciao / }).waitFor();
}

/** Scelta utente: aspetta che compaia l'elenco (o direttamente il tastierino se c'è un solo utente). */
export async function pickUser(page: Page, name: string) {
  const picker = page.getByRole("button", { name });
  const pad = page.getByRole("group", { name: "Tastierino numerico" });
  await picker.or(pad).first().waitFor();
  if (await picker.isVisible()) await picker.click();
  await pad.waitFor();
}
