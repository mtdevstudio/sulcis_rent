import { expect, test } from "@playwright/test";

/** Pagina /flotta/: tutte le auto pubblicate, filtri per categoria, scheda, modale (nessuna prenotazione online). */
test("pagina flotta: elenco completo, filtri, scheda auto e modale contatti", async ({ page, request }) => {
  await page.addInitScript(() => sessionStorage.setItem("sr_pl", "1"));
  const fleet = await (await request.get(`/data/fleet.json?t=${Date.now()}`)).json();
  test.skip(!fleet.cars?.length, "nessuna auto pubblicata nel DB di test");

  await page.goto("/flotta/");
  await expect(page.getByRole("heading", { level: 1, name: "La flotta" })).toBeVisible();
  const cards = page.locator("main article").filter({ has: page.getByRole("button", { name: /Voglio questa auto/ }) });
  await expect(cards).toHaveCount(fleet.cars.length);

  // filtro per la prima categoria presente (i filtri compaiono solo con almeno 2 categorie)
  const usedCats = new Set(fleet.cars.map((x: { category: string }) => x.category));
  if (usedCats.size > 1) {
  const firstCat = fleet.categories.find((c: { key: string }) => fleet.cars.some((x: { category: string }) => x.category === c.key));
  const expected = fleet.cars.filter((x: { category: string }) => x.category === firstCat.key).length;
  await page.getByRole("group", { name: "Filtra per categoria" }).getByRole("button", { name: new RegExp(`^${firstCat.label.it}`) }).click();
  await expect(cards).toHaveCount(expected);
  await page.getByRole("button", { name: /^Tutte/ }).click();
  await expect(cards).toHaveCount(fleet.cars.length);
  }

  // nessun form, data o orario
  expect(await page.locator('input[type="date"], input[type="time"], form').count()).toBe(0);

  // modale dalla card
  await cards.first().getByRole("button", { name: /Voglio questa auto/ }).click();
  const dialog = page.getByRole("dialog", { name: "Prenota con noi" });
  await expect(dialog.getByRole("link", { name: /WhatsApp/ })).toHaveAttribute("href", new RegExp(`wa\\.me/393313906076\\?text=.*${encodeURIComponent(fleet.cars[0].brand)}`));
  await page.keyboard.press("Escape");

  // scheda auto
  await page.goto(`/flotta/${fleet.cars[0].slug}/`);
  await expect(page.getByRole("heading", { level: 1 })).toContainText(fleet.cars[0].model);
  await expect(page.getByRole("link", { name: /Tutta la flotta/ })).toHaveAttribute("href", "/flotta/");
});

test("la home rimanda alla flotta completa", async ({ page }) => {
  await page.addInitScript(() => sessionStorage.setItem("sr_pl", "1"));
  await page.goto("/");
  await page.getByRole("link", { name: /Vedi tutta la flotta/ }).click();
  await expect(page).toHaveURL(/\/flotta\/$/);
});
