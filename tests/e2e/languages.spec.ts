import { expect, test } from "@playwright/test";

/** Lingue: redirect automatico in base al browser, selettore, hreflang. */
test.describe("lingue", () => {
  test("browser in francese → /fr/, tutto tradotto", async ({ browser }) => {
    const ctx = await browser.newContext({ locale: "fr-FR", extraHTTPHeaders: { "Accept-Language": "fr-FR,fr;q=0.9" } });
    const page = await ctx.newPage();
    await page.addInitScript(() => sessionStorage.setItem("sr_pl", "1"));
    await page.goto("/");
    await expect(page).toHaveURL(/\/fr\/$/);
    await expect(page.locator("html")).toHaveAttribute("lang", "fr");
    await expect(page.getByRole("button", { name: /Ajò, c'est parti/ }).first()).toBeVisible();
    await ctx.close();
  });

  test("browser in tedesco → resta in italiano; la scelta manuale vince sul browser", async ({ browser }) => {
    const de = await browser.newContext({ locale: "de-DE", extraHTTPHeaders: { "Accept-Language": "de-DE" } });
    const p1 = await de.newPage();
    await p1.goto("/");
    await expect(p1).toHaveURL(/\/$/);
    await expect(p1.locator("html")).toHaveAttribute("lang", "it");
    await de.close();

    const es = await browser.newContext({ locale: "es-ES", extraHTTPHeaders: { "Accept-Language": "es-ES" } });
    const p2 = await es.newPage();
    await p2.addInitScript(() => sessionStorage.setItem("sr_pl", "1"));
    await p2.goto("/");
    await expect(p2).toHaveURL(/\/es\/$/);
    await p2.locator("header button[aria-haspopup]").click();
    await p2.getByRole("link", { name: /Italiano/ }).click();
    await expect(p2).toHaveURL(/\/$/);
    await p2.goto("/"); // ricarica: niente più redirect, c'è il cookie sr_lang=it
    await expect(p2).toHaveURL(/\/$/);
    await expect(p2.locator("html")).toHaveAttribute("lang", "it");
    await es.close();
  });

  test("ogni pagina dichiara le 6 lingue con hreflang", async ({ page }) => {
    await page.goto("/pl/fleet/");
    for (const l of ["it", "en", "fr", "es", "pt", "pl", "x-default"]) {
      await expect(page.locator(`link[rel="alternate"][hreflang="${l}"]`)).toHaveCount(1);
    }
  });
});
