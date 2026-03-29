const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto('https://leetcode.com/accounts/login/');
  console.log("Login manually, then press Enter here...");

  process.stdin.once('data', async () => {
    await context.storageState({ path: 'leetcode-auth.json' });
    await browser.close();
    process.exit();
  });
})();
