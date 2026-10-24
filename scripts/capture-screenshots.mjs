import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2 // Crisp retina screenshot
  });

  const page = await context.newPage();
  console.log('Navigating to Cadence workstation...');
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  // 1. Capture Main CAD Workstation
  console.log('Capturing main workstation...');
  await page.screenshot({ path: 'docs/images/cadence-workstation-main.png' });

  // 2. Capture Cybernetic Vector Robot Face Node
  console.log('Capturing Neural Synthesis Interface node...');
  const avatarNode = page.locator('div:has-text("[01 // NEURAL SYNTHESIS INTERFACE")').first();
  if (await avatarNode.isVisible()) {
    await avatarNode.screenshot({ path: 'docs/images/cadence-cybernetic-face.png' });
  }

  // 3. Click [CHAOS POST-MORTEM & BRIEFING] in header
  console.log('Opening Higgs TTS Narrator modal...');
  const ttsBtn = await page.getByRole('button', { name: /CHAOS POST-MORTEM/i });
  if (await ttsBtn.isVisible()) {
    await ttsBtn.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'docs/images/cadence-tts-narrator.png' });
    // Close modal
    const closeBtn = await page.locator('button:has(svg.lucide-x)');
    if (await closeBtn.isVisible()) await closeBtn.click();
    await page.waitForTimeout(500);
  }

  // 4. Click [EXPORT TERRAFORM]
  console.log('Opening Terraform drawer...');
  const tfBtn = await page.getByRole('button', { name: /EXPORT TERRAFORM/i });
  if (await tfBtn.isVisible()) {
    await tfBtn.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'docs/images/cadence-terraform-drawer.png' });
  }

  await browser.close();
  console.log('All screenshots captured successfully!');
}

main().catch((err) => {
  console.error('Screenshot capture failed:', err);
  process.exit(1);
});
