import { webkit, chromium } from 'playwright';

const base = 'http://localhost:5174/grid-b';

async function readNotes(page) {
  // Notas is gridcell index 7 in row 0. Read its committed text (span content).
  return page.evaluate(() => {
    const cell = document.querySelectorAll('[role="gridcell"]')[7];
    return cell ? (cell.textContent || '').trim() : '(no cell)';
  });
}

async function run(name, browser) {
  const page = await browser.newPage({ viewport: { width: 1500, height: 900 } });
  await page.goto(base, { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);

  console.log(`[${name}] notes BEFORE:`, JSON.stringify(await readNotes(page)));

  const notesCell = page.locator('[role="gridcell"]').nth(7);
  await notesCell.dblclick();
  await page.waitForTimeout(150);
  await page.keyboard.type(' EDITADO');
  await page.waitForTimeout(900); // debouncedSave(300) + batch checkpoint(300) fire while editing
  console.log(`[${name}] notes after pause1:`, JSON.stringify(await readNotes(page)));

  // Re-open and edit again to see the increment
  const notesCell2 = page.locator('[role="gridcell"]').nth(7);
  await notesCell2.dblclick();
  await page.waitForTimeout(150);
  await page.keyboard.type(' DOS');
  await page.waitForTimeout(900);
  console.log(`[${name}] notes after pause2:`, JSON.stringify(await readNotes(page)));

  await page.close();
}

const wk = await webkit.launch({
  executablePath: '/Users/carlosgarzagarza/Library/Caches/ms-playwright/webkit-2182/pw_run.sh'
});
await run('WEBKIT', wk);
await wk.close();

const cr = await chromium.launch({
  executablePath:
    '/Users/carlosgarzagarza/Library/Caches/ms-playwright/chromium-1217/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing'
});
await run('CHROME', cr);
await cr.close();
