import { expect, test } from "@playwright/test";
import path from "node:path";
import { login, pickUser, resetDb } from "./helpers";

const fixtures = path.join(__dirname, "..", "fixtures");

test.beforeAll(() => resetDb());

test("login → crea auto con 3 foto → pubblica → visibile sul sito con meta e JSON-LD → nascondi → cestino → ripristina", async ({ page, request }) => {
  await login(page);

  // --- crea auto ---
  await page.getByRole("link", { name: "+ Aggiungi auto" }).first().click();
  await page.getByLabel("Marca *").fill("Citroën");
  await page.getByLabel("Modello *").fill("C3 Prova E2E");
  await page.getByLabel("Categoria *").selectOption("utilitaria");
  await expect(page.getByLabel("Indirizzo della pagina (slug)")).toHaveValue("citroen-c3-prova-e2e");
  await page.getByLabel("Targa (solo interna, mai sul sito)").fill("EE123EE");
  await page.getByLabel("Posti").fill("5");
  await page.getByRole("button", { name: "Salva bozza" }).click();
  await expect(page.getByText("Salvata", { exact: true })).toBeVisible();
  await expect(page).toHaveURL(/modifica\/\?id=\d+/);

  // --- 3 foto (la prima con GPS: il server la ripulisce) ---
  const input = page.locator('input[type="file"][multiple]');
  await input.setInputFiles([path.join(fixtures, "gps.jpg"), path.join(fixtures, "plain.png"), path.join(fixtures, "gps.jpg")]);
  await expect(page.getByText("Copertina")).toBeVisible({ timeout: 60_000 });
  await expect(page.locator('img[src*="/media/cars/"]')).toHaveCount(3 + 1 /* card anteprima */, { timeout: 60_000 });

  // --- pubblica ---
  await page.getByRole("button", { name: "Pubblica" }).click();
  await expect(page.getByText(/Salvata: le modifiche sono già sul sito/)).toBeVisible();

  // --- sito pubblico: JSON e home ---
  const fleet = await (await request.get(`/data/fleet.json?t=${Date.now()}`)).json();
  const car = fleet.cars.find((c: { slug: string }) => c.slug === "citroen-c3-prova-e2e");
  expect(car).toBeTruthy();
  expect(car.images).toHaveLength(3);
  expect(JSON.stringify(fleet)).not.toContain("EE123EE");

  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Citroën C3 Prova E2E" })).toBeVisible();

  // --- scheda: meta e JSON-LD dal server (car.php) ---
  const html = await (await request.get("/flotta/citroen-c3-prova-e2e/")).text();
  expect(html).toContain("<title>Noleggio Citroën C3 Prova E2E · Utilitaria in Sardegna</title>");
  expect(html).toContain('"@type":["Product","Car"]');
  expect(html).toContain('"seatingCapacity":5');
  expect(html).not.toContain("EE123EE");
  await page.goto("/flotta/citroen-c3-prova-e2e/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("C3 Prova E2E");
  await expect(page).toHaveTitle(/Noleggio Citroën C3 Prova E2E/);

  // --- nascondi dalla lista ---
  await page.goto("/admin/auto/");
  const row = page.locator("li", { hasText: "Citroën C3 Prova E2E" }).first();
  await row.getByRole("button", { name: "Nascondi" }).first().click();
  await expect(page.getByText("Nascosta dal sito")).toBeVisible();
  const fleet2 = await (await request.get(`/data/fleet.json?t=${Date.now()}`)).json();
  expect(fleet2.cars.find((c: { slug: string }) => c.slug === "citroen-c3-prova-e2e")).toBeFalsy();
  expect((await request.get("/flotta/citroen-c3-prova-e2e/")).status()).toBe(404);

  // --- elimina → cestino → ripristina ---
  await row.getByRole("button", { name: /Elimina Citroën C3 Prova E2E/ }).first().click();
  await page.getByRole("button", { name: "Elimina Citroën C3 Prova E2E" }).last().click();
  await expect(page.getByText(/Spostata nel cestino/)).toBeVisible();
  await page.goto("/admin/cestino/");
  await page.getByRole("button", { name: "Ripristina" }).click();
  await expect(page.getByText("Ripristinata")).toBeVisible();
  await page.goto("/admin/auto/");
  await expect(page.locator("li", { hasText: "Citroën C3 Prova E2E" }).first()).toContainText("Nascosta");

  // --- di nuovo pubblica: torna sul sito ---
  await page.locator("li", { hasText: "Citroën C3 Prova E2E" }).first().getByRole("button", { name: "Pubblica" }).first().click();
  await expect(page.getByText("Pubblicata: è già sul sito")).toBeVisible();
  expect((await request.get("/flotta/citroen-c3-prova-e2e/")).status()).toBe(200);
});

test("il sito non permette di prenotare: ogni CTA apre il modale con WhatsApp e chiamata", async ({ page }) => {
  await page.addInitScript(() => sessionStorage.setItem("sr_pl", "1"));
  await page.goto("/");
  expect(await page.locator('input[type="date"], input[type="time"], input[type="datetime-local"], form').count()).toBe(0);
  for (const name of [/Ajò, si parte/, /Voglio questa auto/]) {
    await page.getByRole("button", { name }).first().click();
    const dialog = page.getByRole("dialog", { name: "Prenota con noi" });
    await expect(dialog).toBeVisible();
    const wa = dialog.getByRole("link", { name: /WhatsApp/ });
    await expect(wa).toHaveAttribute("href", /^https:\/\/wa\.me\/393313906076\?text=/);
    await expect(dialog.getByRole("link", { name: /Chiamaci/ })).toHaveAttribute("href", "tel:+393313906076");
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
  }
});

test("login dal telefono: tastierino e messaggio d'errore generico @mobile", async ({ page }) => {
  resetDb();
  await page.goto("/admin/");
  await pickUser(page, "Titolare");
  const pad = page.getByRole("group", { name: "Tastierino numerico" });
  for (const d of "11112222") await pad.getByRole("button", { name: d, exact: true }).click();
  await pad.getByRole("button", { name: "Entra" }).click();
  await expect(page.getByRole("alert").filter({ hasText: "PIN non valido" })).toBeVisible();
});
