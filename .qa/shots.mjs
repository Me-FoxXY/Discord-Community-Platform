import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const OUT = ".qa/shots";
mkdirSync(OUT, { recursive: true });
const BASE = "http://localhost:3000";

const shots = [
  { name: "landing-desktop", url: "/", w: 1360, h: 900, full: true },
  { name: "landing-mobile", url: "/", w: 390, h: 844, full: true },
  { name: "shop-desktop", url: "/shop", w: 1360, h: 900, full: true },
  { name: "product-desktop", url: "/shop/premium-pro", w: 1360, h: 900, full: true },
  { name: "community-desktop", url: "/community", w: 1360, h: 900, full: true },
  { name: "login-desktop", url: "/login", w: 1360, h: 900, full: false },
];

const browser = await chromium.launch();
for (const s of shots) {
  const ctx = await browser.newContext({
    viewport: { width: s.w, height: s.h },
    reducedMotion: "reduce",
    deviceScaleFactor: 1,
  });
  const page = await ctx.newPage();
  await page.goto(`${BASE}${s.url}`, { waitUntil: "networkidle", timeout: 30000 });
  await page.waitForTimeout(600);
  await page.screenshot({ path: `${OUT}/${s.name}.png`, fullPage: s.full });
  console.log("shot:", s.name);
  await ctx.close();
}
await browser.close();
console.log("done");
