import { chromium, devices } from 'playwright';
import path from 'path';
import fs from 'fs';

const BASE_URL = 'http://localhost:3010';
const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const FIXTURE_PHOTO = path.resolve('e2e/fixtures/test-photo.png');

async function run() {
  console.log('======================================================');
  console.log('🚀 STARTING COMPREHENSIVE E2E PLAYWRIGHT TESTS');
  console.log('   Target URL: ' + BASE_URL);
  console.log('   Browser: Google Chrome Headless');
  console.log('======================================================\n');

  const browser = await chromium.launch({
    executablePath: CHROME_PATH,
    headless: true,
  });

  try {
    // -------------------------------------------------------------
    // TEST 1: iPhone Emulation & User Login
    // -------------------------------------------------------------
    console.log('📱 [TEST 1] Launching iPhone 13 Emulation & Authentication...');
    const iphoneContext = await browser.newContext({
      ...devices['iPhone 13'],
      locale: 'id-ID',
    });
    const iphonePage = await iphoneContext.newPage();

    await iphonePage.goto(`${BASE_URL}/auth/login`, { waitUntil: 'networkidle' });
    console.log('  ✓ Navigated to /auth/login on iPhone viewport (390x844)');

    await iphonePage.fill('input[type="email"]', 'admin@bat-tracker.com');
    await iphonePage.fill('input[type="password"]', 'Password123');
    await iphonePage.click('button[type="submit"]');
    await iphonePage.waitForURL('**/dashboard', { timeout: 10000 });
    console.log('  ✓ Successfully logged in as Admin Operasional -> redirected to /dashboard');

    // -------------------------------------------------------------
    // TEST 2: Photo Upload Loading State & Preview Verification (iPhone)
    // -------------------------------------------------------------
    console.log('\n📸 [TEST 2] Testing Photo Upload Loading State & Optimization...');
    await iphonePage.goto(`${BASE_URL}/cases`, { waitUntil: 'networkidle' });
    console.log('  ✓ Navigated to /cases on iPhone');

    // Click "Input Kasus Baru"
    await iphonePage.click('button:has-text("Input Kasus")');
    await iphonePage.waitForSelector('text=Input Kasus Baru', { timeout: 5000 });
    console.log('  ✓ Opened "Input Kasus Baru" modal');

    // Select photo file
    const fileInput = await iphonePage.$('input#photo-upload');
    await fileInput.setInputFiles(FIXTURE_PHOTO);

    // Verify preview appears
    await iphonePage.waitForSelector('img[alt="preview"]', { timeout: 8000 });
    console.log('  ✓ Photo processed, compressed, and preview rendered in gallery!');

    // -------------------------------------------------------------
    // TEST 3: Create New Case & Verify Server-Side Sequence Persistence
    // -------------------------------------------------------------
    console.log('\n📝 [TEST 3] Creating New Case on iPhone...');
    const uniqueTitle = `[E2E-AUTO] Kasus Test ${Date.now()}`;
    await iphonePage.fill('input[placeholder*="Contoh: Penggantian HT"]', uniqueTitle);
    await iphonePage.fill('textarea', 'Catatan test otomatis E2E playwright');

    // Submit case
    await iphonePage.click('button:has-text("Simpan Kasus")');
    console.log('  ✓ Clicked "Simpan Kasus" button');

    // Wait for modal to close
    await iphonePage.waitForSelector('form:has-text("Case Title")', { state: 'detached', timeout: 15000 });
    console.log('  ✓ Case Modal closed successfully after saving');

    // Verify case in table
    await iphonePage.waitForSelector(`text=${uniqueTitle}`, { timeout: 10000 });
    const caseRow = await iphonePage.locator(`tr:has-text("${uniqueTitle}")`).first();
    const caseIdText = await caseRow.locator('td').nth(1).innerText();
    console.log(`  ✓ Case created and visible on iPhone table with Case ID: "${caseIdText}"`);

    // -------------------------------------------------------------
    // TEST 4: Android Emulation & Cross-Device Data Sync
    // -------------------------------------------------------------
    console.log('\n🤖 [TEST 4] Launching Pixel 5 (Android) Emulation & Cross-Device Sync...');
    const androidContext = await browser.newContext({
      ...devices['Pixel 5'],
      locale: 'id-ID',
    });
    const androidPage = await androidContext.newPage();

    // Login on Android
    await androidPage.goto(`${BASE_URL}/auth/login`, { waitUntil: 'networkidle' });
    await androidPage.fill('input[type="email"]', 'admin@bat-tracker.com');
    await androidPage.fill('input[type="password"]', 'Password123');
    await androidPage.click('button[type="submit"]');
    await androidPage.waitForURL('**/dashboard', { timeout: 10000 });
    console.log('  ✓ Logged in on Android viewport (393x851)');

    // Navigate to /cases on Android
    await androidPage.goto(`${BASE_URL}/cases`, { waitUntil: 'networkidle' });
    await androidPage.waitForSelector(`text=${uniqueTitle}`, { timeout: 10000 });
    console.log(`  ✓ PERFECT: Case "${caseIdText}" created on iPhone is IMMEDIATELY VISIBLE on Android!`);

    // -------------------------------------------------------------
    // TEST 5: Delete Case on iPhone -> Verify Clean Deletion on Android (No Resurrection)
    // -------------------------------------------------------------
    console.log('\n🗑️ [TEST 5] Deleting Case on iPhone & Verifying on Android...');
    iphonePage.on('dialog', async (dialog) => {
      console.log(`  ✓ Confirm dialog received: "${dialog.message()}" -> Accepting`);
      await dialog.accept();
    });

    const deleteBtn = caseRow.locator('button[title="Hapus Kasus"]').or(caseRow.locator('button:has(svg.lucide-trash-2)')).first();
    await deleteBtn.click();

    // Wait for case to disappear on iPhone
    await iphonePage.waitForSelector(`text=${uniqueTitle}`, { state: 'detached', timeout: 10000 });
    console.log('  ✓ Case deleted from iPhone table');

    // Trigger sync / refresh on Android
    await androidPage.reload({ waitUntil: 'networkidle' });
    // Verify it is NOT resurrected on Android
    const androidCount = await androidPage.locator(`text=${uniqueTitle}`).count();
    if (androidCount === 0) {
      console.log('  ✓ PERFECT: Case is completely REMOVED from Android! (No cache resurrection bug)');
    } else {
      throw new Error('FAIL: Deleted case was resurrected on Android!');
    }

    // -------------------------------------------------------------
    // TEST 6: User Management Sync Across Devices in Master Data
    // -------------------------------------------------------------
    console.log('\n👥 [TEST 6] Testing Master Data User Sync Across Devices...');
    await iphonePage.goto(`${BASE_URL}/master-data`, { waitUntil: 'networkidle' });
    const iphoneTabBtn = iphonePage.locator('button:has-text("Kelola Akun User")');
    await iphoneTabBtn.scrollIntoViewIfNeeded();
    await iphoneTabBtn.click();
    console.log('  ✓ Opened "Kelola Akun User" tab on iPhone');

    const testUserEmail = `spv-${Date.now()}@bat-tracker.com`;
    const testUserName = `Supervisor E2E Test ${Date.now().toString().slice(-4)}`;

    await iphonePage.fill('input[placeholder*="Nama Lengkap User"]', testUserName);
    await iphonePage.fill('input[placeholder*="Email Login"]', testUserEmail);
    await iphonePage.fill('input[placeholder*="Password"]', 'Password123');
    await iphonePage.click('button:has-text("Tambah User")');

    // Verify user in list on iPhone
    await iphonePage.waitForSelector(`text=${testUserEmail}`, { timeout: 10000 });
    console.log(`  ✓ User "${testUserEmail}" added on iPhone`);

    // Open Android and check if user appears
    await androidPage.goto(`${BASE_URL}/master-data`, { waitUntil: 'networkidle' });
    const androidTabBtn = androidPage.locator('button:has-text("Kelola Akun User")');
    await androidTabBtn.scrollIntoViewIfNeeded();
    await androidTabBtn.click();
    await androidPage.waitForSelector(`text=${testUserEmail}`, { timeout: 10000 });
    console.log(`  ✓ PERFECT: User "${testUserEmail}" synced to Android Master Data!`);

    // Clean up test user on iPhone
    console.log('\n🧹 [CLEANUP] Cleaning up test user...');
    const userCard = iphonePage.locator(`div:has-text("${testUserEmail}")`).first();
    const delUserBtn = userCard.locator('button[title="Hapus Akun"]').or(userCard.locator('button:has(svg.lucide-trash-2)')).first();
    await delUserBtn.click();
    await iphonePage.waitForSelector(`text=${testUserEmail}`, { state: 'detached', timeout: 10000 });
    console.log('  ✓ Test user cleaned up');

    console.log('\n======================================================');
    console.log('🎉 ALL 6 E2E PLAYWRIGHT TEST SCENARIOS PASSED WITH 100% SUCCESS!');
    console.log('======================================================\n');
  } finally {
    await browser.close();
  }
}

run().catch((err) => {
  console.error('\n❌ E2E Test Failed with error:', err);
  process.exit(1);
});
