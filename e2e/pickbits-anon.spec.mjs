import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, mkdir } from 'node:fs/promises';
import { resolve, relative, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'file:///C:/new/asset-factory/node_modules/playwright/index.mjs';

// Run `npm run build` first. Browser transport uses pipes; HTTP is fulfilled from disk.
// No Vite/HTTP server, browser debug port, or outgoing network requests are used.
const dist = fileURLToPath(new URL('../dist/public/', import.meta.url));
const screenshots = fileURLToPath(new URL('../screenshots/', import.meta.url));
const sdkUrl = 'https://pickbits.ai/sdk/pickbits-sdk.js';
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.gltf': 'model/gltf+json', '.glb': 'model/gltf-binary', '.png': 'image/png', '.jpg': 'image/jpeg', '.mp3': 'audio/mpeg', '.woff': 'font/woff', '.woff2': 'font/woff2' };

for (const scenario of ['anonymous-sdk', 'network-down', 'off-origin', 'mobile']) {
  test(`Chromium ${scenario}: anon chip and playable first board without a TCP port`, { timeout: 60000 }, async () => {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: scenario === 'mobile' ? { width: 390, height: 844 } : { width: 1280, height: 800 }, serviceWorkers: 'block' });
    const errors = [], missing = [];
    let sdkRequests = 0;
    const origin = scenario === 'off-origin' ? 'http://mmmunchers.example.test' : 'http://mmmunchers.pickbits.ai';
    page.on('pageerror', error => errors.push(String(error)));
    await page.addInitScript(() => {
      window.unhandledRejections = [];
      window.addEventListener('unhandledrejection', event => window.unhandledRejections.push(String(event.reason)));
    });
    await page.route('**/*', async route => {
      const url = new URL(route.request().url());
      if (url.href === sdkUrl) {
        sdkRequests++;
        if (scenario === 'network-down') return route.abort();
        return route.fulfill({ path: 'C:/new/pickbits.ai/sdk/pickbits-sdk.js', contentType: 'text/javascript' });
      }
      if (url.hostname === 'cdn.jsdelivr.net' && url.pathname.includes('supabase-js')) {
        // Real SDK with a deterministic anonymous session; no credentials or live writes.
        return route.fulfill({ contentType: 'text/javascript', body: `window.supabase = { createClient: () => ({ auth: {
          getSession: async () => ({ data: { session: null } }), onAuthStateChange: () => {}
        } }) };` });
      }
      if (url.origin !== origin) return route.abort();
      const path = resolve(dist, '.' + decodeURIComponent(url.pathname === '/' ? '/index.html' : url.pathname));
      const rel = relative(dist, path);
      if (rel.startsWith('..') || rel.includes(':')) return route.abort();
      try {
        return await route.fulfill({ body: await readFile(path), contentType: mime[extname(path)] || 'application/octet-stream' });
      } catch { missing.push(url.pathname); return route.fulfill({ status: 404, body: 'Not found' }); }
    });
    try {
      await page.goto(origin + (scenario === 'off-origin' ? '/' : '/?pb=1'));
      await page.getByRole('heading', { name: 'MMMUNCHERS', exact: true }).waitFor();
      assert.equal(await page.getByTestId('pb-auth-state').innerText(), 'anon');
      await page.getByRole('button', { name: '2D', exact: true }).click();
      await page.getByRole('button', { name: 'Streak Chain correct answers' }).click();
      await page.getByRole('button', { name: 'START', exact: true }).first().click();
      await page.getByText('Objective', { exact: true }).waitFor();
      assert.equal(await page.getByTestId('pb-auth-state').innerText(), 'anon');
      assert.equal(await page.locator('select').count(), 0); // Menu gave way to the live board.
      assert.equal(await page.evaluate(() => localStorage.getItem('category_math')), 'random');
      assert.deepEqual(await page.evaluate(() => JSON.parse(localStorage.getItem('mmmunchersCareer_v1')).topicsPlayed), ['math']);
      await mkdir(screenshots, { recursive: true });
      await page.screenshot({ path: resolve(screenshots, `pickbits-${scenario}.png`) });
      // A real keyboard munch changes either score or phase, proving inputs work.
      await page.keyboard.press('Space');
      await page.waitForFunction(() => /Streak Over!|Game Over!|Score:\s*[1-9]/.test(document.body.innerText));
      assert.equal(sdkRequests, scenario === 'off-origin' ? 0 : 1);
      if (scenario === 'anonymous-sdk' || scenario === 'mobile') {
        assert.equal(await page.evaluate(() => typeof window.PickBits?.getLeaderboard), 'function');
        assert.equal(await page.evaluate(() => typeof window.PickBits?.levels?.list), 'function');
      }
      assert.deepEqual(missing, []);
      assert.deepEqual(errors, []);
      assert.deepEqual(await page.evaluate(() => window.unhandledRejections), []);
    } finally { await browser.close(); }
  });
}
