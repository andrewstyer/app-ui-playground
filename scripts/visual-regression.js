#!/usr/bin/env node
/**
 * Visual Regression Testing
 *
 * Compares iOS Simulator screenshots with web playground screenshots.
 * Generates an XCUITest to capture iOS screens, uses Puppeteer for web.
 *
 * Usage:
 *   node scripts/visual-regression.js --app narrativ --ios-project ../narrativ
 *   node scripts/visual-regression.js --app narrativ --ios-project ../narrativ --threshold 0.1
 *   node scripts/visual-regression.js --app narrativ --web-only
 *   node scripts/visual-regression.js --app narrativ --ios-only
 *   node scripts/visual-regression.js --app narrativ --compare-only
 *
 * Requirements:
 *   - Xcode with iOS Simulator
 *   - npm install puppeteer pixelmatch pngjs (run automatically if missing)
 */

const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');

// ============================================================
// CLI Argument Parsing
// ============================================================

const args = process.argv.slice(2);
const config = {
  appName: 'narrativ',
  iosProjectPath: null,
  threshold: 0.1, // 0.1 = 10% pixel difference allowed
  webOnly: false,
  iosOnly: false,
  compareOnly: false,
  simulator: 'iPhone 16 Pro',
  port: 8080,
  darkMode: false,
};

for (let i = 0; i < args.length; i++) {
  switch (args[i]) {
    case '--app':
      config.appName = args[++i];
      break;
    case '--ios-project':
      config.iosProjectPath = args[++i];
      break;
    case '--threshold':
      config.threshold = parseFloat(args[++i]);
      break;
    case '--simulator':
      config.simulator = args[++i];
      break;
    case '--port':
      config.port = parseInt(args[++i], 10);
      break;
    case '--web-only':
      config.webOnly = true;
      break;
    case '--ios-only':
      config.iosOnly = true;
      break;
    case '--compare-only':
      config.compareOnly = true;
      break;
    case '--dark':
      config.darkMode = true;
      break;
    case '--help':
      console.log(`
Visual Regression Testing for App UI Playground

Usage: visual-regression.js [options]

Options:
  --app <name>           App name (default: narrativ)
  --ios-project <path>   Path to iOS project root (required for iOS screenshots)
  --threshold <0-1>      Pixel difference threshold (default: 0.1 = 10%)
  --simulator <name>     iOS Simulator name (default: "iPhone 16 Pro")
  --port <number>        Web server port (default: 8080)
  --web-only             Only capture web screenshots
  --ios-only             Only capture iOS screenshots
  --compare-only         Only compare existing screenshots
  --dark                 Capture dark mode screenshots
  --help                 Show this help

Examples:
  # Full comparison
  node scripts/visual-regression.js --app narrativ --ios-project ../narrativ

  # Just update web screenshots
  node scripts/visual-regression.js --app narrativ --web-only

  # Compare with stricter threshold
  node scripts/visual-regression.js --app narrativ --threshold 0.05 --compare-only
`);
      process.exit(0);
  }
}

const playgroundRoot = path.resolve(__dirname, '..');
const snapshotsDir = path.join(playgroundRoot, 'apps', config.appName, 'snapshots');
const iosSnapshotsDir = path.join(snapshotsDir, 'ios');
const webSnapshotsDir = path.join(snapshotsDir, 'web');
const diffDir = path.join(snapshotsDir, 'diff');
const reportPath = path.join(snapshotsDir, 'report.html');

// ============================================================
// Ensure Dependencies
// ============================================================

function ensureDependencies() {
  const deps = ['puppeteer', 'pixelmatch', 'pngjs'];
  const missing = deps.filter(dep => {
    try {
      require.resolve(dep);
      return false;
    } catch {
      return true;
    }
  });

  if (missing.length > 0) {
    console.log(`\n📦 Installing missing dependencies: ${missing.join(', ')}`);
    execSync(`npm install ${missing.join(' ')}`, {
      cwd: playgroundRoot,
      stdio: 'inherit',
    });
  }
}

// ============================================================
// Read Screen Registry
// ============================================================

function getScreenRegistry() {
  const configPath = path.join(playgroundRoot, 'apps', config.appName, 'config.js');
  const content = fs.readFileSync(configPath, 'utf8');

  // Extract SCREEN_REGISTRY
  const match = content.match(/const SCREEN_REGISTRY = (\{[\s\S]*?\n\});/);
  if (!match) {
    console.error('Could not find SCREEN_REGISTRY in config.js');
    process.exit(1);
  }

  // Safely evaluate (it's our own code)
  const registry = eval(`(${match[1]})`);
  return registry;
}

// ============================================================
// Generate XCUITest for iOS Screenshots
// ============================================================

function generateXCUITest(registry) {
  const testCases = [];

  // Generate test for each tab
  for (const tab of registry.tabs) {
    const testName = `testScreenshot_${tab.id.replace(/-/g, '_')}`;
    testCases.push(`
    func ${testName}() {
        let app = XCUIApplication()
        app.launch()

        // Navigate to tab
        let tabButton = app.buttons["${tab.accessibilityId}"]
        XCTAssertTrue(tabButton.waitForExistence(timeout: 5))
        tabButton.tap()

        // Wait for content to load
        sleep(1)

        // Take screenshot
        let screenshot = app.windows.firstMatch.screenshot()
        let attachment = XCTAttachment(screenshot: screenshot)
        attachment.name = "${tab.id}"
        attachment.lifetime = .keepAlways
        add(attachment)
    }`);
  }

  // Generate test for detail screens (if we can navigate to them)
  for (const detail of registry.details || []) {
    const testName = `testScreenshot_${detail.id.replace(/-/g, '_')}`;
    testCases.push(`
    func ${testName}() {
        let app = XCUIApplication()
        app.launch()

        // Navigate to parent tab first
        let tabButton = app.buttons["tab-${detail.parent}"]
        XCTAssertTrue(tabButton.waitForExistence(timeout: 5))
        tabButton.tap()

        // Wait for content
        sleep(1)

        // Try to tap first item to open detail
        // This is a best-effort approach - may need customization per app
        let firstCell = app.cells.firstMatch
        if firstCell.waitForExistence(timeout: 3) {
            firstCell.tap()
            sleep(1)

            // Take screenshot
            let screenshot = app.windows.firstMatch.screenshot()
            let attachment = XCTAttachment(screenshot: screenshot)
            attachment.name = "${detail.id}"
            attachment.lifetime = .keepAlways
            add(attachment)

            // Go back
            if app.navigationBars.buttons.firstMatch.exists {
                app.navigationBars.buttons.firstMatch.tap()
            }
        }
    }`);
  }

  const testClass = `//
// VisualRegressionTests.swift
// Generated by app-ui-playground visual-regression script
//
// Run with: xcodebuild test -scheme YourScheme -destination 'platform=iOS Simulator,name=${config.simulator}'
//

import XCTest

final class VisualRegressionTests: XCTestCase {

    override func setUpWithError() throws {
        continueAfterFailure = true
    }
${testCases.join('\n')}
}
`;

  return testClass;
}

// ============================================================
// Capture iOS Screenshots
// ============================================================

async function captureIOSScreenshots(registry) {
  if (!config.iosProjectPath) {
    console.error('Error: --ios-project is required for iOS screenshots');
    process.exit(1);
  }

  const iosProjectRoot = path.resolve(config.iosProjectPath);

  console.log('\n📱 Capturing iOS screenshots...');

  // Find or create UI test target
  const testDir = path.join(iosProjectRoot, 'VisualRegressionTests');
  if (!fs.existsSync(testDir)) {
    fs.mkdirSync(testDir, { recursive: true });
  }

  // Generate and write test file
  const testContent = generateXCUITest(registry);
  const testFilePath = path.join(testDir, 'VisualRegressionTests.swift');
  fs.writeFileSync(testFilePath, testContent);
  console.log(`   Generated: ${testFilePath}`);

  // Create snapshot output directory
  if (!fs.existsSync(iosSnapshotsDir)) {
    fs.mkdirSync(iosSnapshotsDir, { recursive: true });
  }

  console.log(`
╔════════════════════════════════════════════════════════════╗
║  iOS Screenshot Capture                                    ║
╠════════════════════════════════════════════════════════════╣
║                                                            ║
║  A test file has been generated at:                        ║
║    ${testFilePath.slice(-50).padStart(50)}  ║
║                                                            ║
║  To capture screenshots:                                   ║
║                                                            ║
║  1. Add VisualRegressionTests folder to your Xcode project ║
║     as a UI Test target (if not already added)             ║
║                                                            ║
║  2. Run the tests:                                         ║
║     xcodebuild test \\                                      ║
║       -scheme YourScheme \\                                 ║
║       -destination 'platform=iOS Simulator,name=${config.simulator.slice(0, 12)}' \\    ║
║       -only-testing:VisualRegressionTests                  ║
║                                                            ║
║  3. Screenshots will be in test results. Extract with:     ║
║     node scripts/visual-regression.js --extract-ios        ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
`);

  // Alternative: Use simctl for manual screenshot capture
  console.log('\n   Alternative: Manual capture with simctl');
  console.log('   Boot simulator and navigate to each screen, then run:');

  for (const tab of registry.tabs) {
    const screenshotPath = path.join(iosSnapshotsDir, `${tab.id}.png`);
    console.log(`   xcrun simctl io booted screenshot ${screenshotPath}`);
  }
}

// ============================================================
// Capture Web Screenshots with Puppeteer
// ============================================================

async function captureWebScreenshots(registry) {
  ensureDependencies();

  const puppeteer = require('puppeteer');

  console.log('\n🌐 Capturing web screenshots...');

  // Ensure directory exists
  if (!fs.existsSync(webSnapshotsDir)) {
    fs.mkdirSync(webSnapshotsDir, { recursive: true });
  }

  // Get device dimensions (iPhone 16 Pro = 430x932)
  const viewport = { width: 430, height: 932 };

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport(viewport);

  // Set dark mode if requested
  if (config.darkMode) {
    await page.emulateMediaFeatures([
      { name: 'prefers-color-scheme', value: 'dark' },
    ]);
  }

  const baseUrl = `http://localhost:${config.port}?app=${config.appName}`;

  try {
    // Navigate to app
    await page.goto(baseUrl, { waitUntil: 'networkidle0' });

    // Capture each tab
    for (const tab of registry.tabs) {
      console.log(`   Capturing: ${tab.label}`);

      // Click on tab
      await page.evaluate((accessibilityId) => {
        const tabButton = document.querySelector(`[data-accessibility-id="${accessibilityId}"]`) ||
                          document.querySelector(`.tab-item[onclick*="'${accessibilityId.replace('tab-', '')}'"`) ||
                          Array.from(document.querySelectorAll('.tab-item')).find(el =>
                            el.onclick?.toString().includes(`'${accessibilityId.replace('tab-', '')}'`)
                          );
        if (tabButton) tabButton.click();
      }, tab.accessibilityId);

      // Also try direct navigation
      await page.evaluate((tabId) => {
        if (typeof switchTab === 'function') {
          switchTab(tabId);
        } else if (typeof Navigation !== 'undefined' && Navigation.switchTab) {
          Navigation.switchTab(tabId);
        }
      }, tab.id);

      // Wait for render
      await page.waitForTimeout(500);

      // Take screenshot
      const screenshotPath = path.join(webSnapshotsDir, `${tab.id}.png`);
      await page.screenshot({ path: screenshotPath });
    }

    // Capture detail screens
    for (const detail of registry.details || []) {
      console.log(`   Capturing: ${detail.label}`);

      // Navigate to parent tab first
      await page.evaluate((parentId) => {
        if (typeof Navigation !== 'undefined' && Navigation.switchTab) {
          Navigation.switchTab(parentId);
        }
      }, detail.parent);

      await page.waitForTimeout(300);

      // Try to navigate to detail screen
      await page.evaluate((screenId) => {
        if (typeof Navigation !== 'undefined' && Navigation.navigateTo) {
          Navigation.navigateTo(screenId);
        }
      }, detail.id);

      await page.waitForTimeout(500);

      // Take screenshot
      const screenshotPath = path.join(webSnapshotsDir, `${detail.id}.png`);
      await page.screenshot({ path: screenshotPath });

      // Go back
      await page.evaluate(() => {
        if (typeof Navigation !== 'undefined' && Navigation.pop) {
          Navigation.pop();
        }
      });
    }

    console.log(`   ✓ Captured ${registry.tabs.length + (registry.details?.length || 0)} screenshots`);

  } finally {
    await browser.close();
  }
}

// ============================================================
// Compare Screenshots
// ============================================================

async function compareScreenshots(registry) {
  ensureDependencies();

  const { PNG } = require('pngjs');
  const pixelmatch = require('pixelmatch');

  console.log('\n🔍 Comparing screenshots...');

  if (!fs.existsSync(diffDir)) {
    fs.mkdirSync(diffDir, { recursive: true });
  }

  const results = [];
  const allScreens = [...registry.tabs, ...(registry.details || [])];

  for (const screen of allScreens) {
    const iosPath = path.join(iosSnapshotsDir, `${screen.id}.png`);
    const webPath = path.join(webSnapshotsDir, `${screen.id}.png`);

    const iosExists = fs.existsSync(iosPath);
    const webExists = fs.existsSync(webPath);

    if (!iosExists && !webExists) {
      results.push({
        screen: screen.id,
        label: screen.label,
        status: 'missing',
        message: 'Both screenshots missing',
      });
      continue;
    }

    if (!iosExists) {
      results.push({
        screen: screen.id,
        label: screen.label,
        status: 'ios-missing',
        message: 'iOS screenshot missing',
        webPath,
      });
      continue;
    }

    if (!webExists) {
      results.push({
        screen: screen.id,
        label: screen.label,
        status: 'web-missing',
        message: 'Web screenshot missing',
        iosPath,
      });
      continue;
    }

    // Load and compare images
    const iosImg = PNG.sync.read(fs.readFileSync(iosPath));
    const webImg = PNG.sync.read(fs.readFileSync(webPath));

    // Handle size mismatch
    if (iosImg.width !== webImg.width || iosImg.height !== webImg.height) {
      results.push({
        screen: screen.id,
        label: screen.label,
        status: 'size-mismatch',
        message: `Size mismatch: iOS ${iosImg.width}x${iosImg.height} vs Web ${webImg.width}x${webImg.height}`,
        iosPath,
        webPath,
      });
      continue;
    }

    const { width, height } = iosImg;
    const diff = new PNG({ width, height });

    const mismatchedPixels = pixelmatch(
      iosImg.data,
      webImg.data,
      diff.data,
      width,
      height,
      {
        threshold: 0.1, // Per-pixel threshold for color difference
        alpha: 0.1,
        diffColor: [255, 0, 0],
        diffColorAlt: [0, 255, 0],
      }
    );

    const totalPixels = width * height;
    const diffPercent = (mismatchedPixels / totalPixels) * 100;
    const passed = diffPercent <= config.threshold * 100;

    // Save diff image
    const diffPath = path.join(diffDir, `${screen.id}.png`);
    fs.writeFileSync(diffPath, PNG.sync.write(diff));

    results.push({
      screen: screen.id,
      label: screen.label,
      status: passed ? 'pass' : 'fail',
      diffPercent: diffPercent.toFixed(2),
      mismatchedPixels,
      totalPixels,
      threshold: config.threshold * 100,
      iosPath,
      webPath,
      diffPath,
    });

    const icon = passed ? '✓' : '✗';
    console.log(`   ${icon} ${screen.label}: ${diffPercent.toFixed(2)}% difference`);
  }

  return results;
}

// ============================================================
// Generate HTML Report
// ============================================================

function generateReport(results) {
  const passCount = results.filter(r => r.status === 'pass').length;
  const failCount = results.filter(r => r.status === 'fail').length;
  const otherCount = results.length - passCount - failCount;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Visual Regression Report - ${config.appName}</title>
  <style>
    :root {
      --color-pass: #34c759;
      --color-fail: #ff3b30;
      --color-warn: #ff9500;
      --color-bg: #f5f5f7;
      --color-card: #ffffff;
      --color-text: #1d1d1f;
      --color-muted: #86868b;
    }
    @media (prefers-color-scheme: dark) {
      :root {
        --color-bg: #000000;
        --color-card: #1c1c1e;
        --color-text: #f5f5f7;
        --color-muted: #98989d;
      }
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, sans-serif;
      background: var(--color-bg);
      color: var(--color-text);
      padding: 24px;
      line-height: 1.5;
    }
    h1 { font-size: 28px; font-weight: 600; margin-bottom: 8px; }
    .summary {
      display: flex;
      gap: 16px;
      margin-bottom: 24px;
    }
    .stat {
      background: var(--color-card);
      padding: 16px 24px;
      border-radius: 12px;
      text-align: center;
    }
    .stat-value { font-size: 32px; font-weight: 600; }
    .stat-label { font-size: 12px; color: var(--color-muted); text-transform: uppercase; }
    .stat.pass .stat-value { color: var(--color-pass); }
    .stat.fail .stat-value { color: var(--color-fail); }
    .results { display: grid; gap: 16px; }
    .result {
      background: var(--color-card);
      border-radius: 12px;
      padding: 16px;
    }
    .result-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }
    .result-title { font-weight: 600; }
    .result-status {
      padding: 4px 12px;
      border-radius: 999px;
      font-size: 12px;
      font-weight: 500;
    }
    .result-status.pass { background: var(--color-pass); color: white; }
    .result-status.fail { background: var(--color-fail); color: white; }
    .result-status.warn { background: var(--color-warn); color: white; }
    .images {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
    }
    .image-box { text-align: center; }
    .image-box img {
      max-width: 100%;
      height: auto;
      border-radius: 8px;
      border: 1px solid var(--color-muted);
    }
    .image-label {
      font-size: 12px;
      color: var(--color-muted);
      margin-top: 4px;
    }
    .diff-info {
      font-size: 14px;
      color: var(--color-muted);
    }
    .threshold { font-size: 12px; color: var(--color-muted); margin-top: 16px; }
  </style>
</head>
<body>
  <h1>Visual Regression Report</h1>
  <p class="threshold">App: ${config.appName} | Threshold: ${config.threshold * 100}% | Generated: ${new Date().toLocaleString()}</p>

  <div class="summary">
    <div class="stat pass">
      <div class="stat-value">${passCount}</div>
      <div class="stat-label">Passed</div>
    </div>
    <div class="stat fail">
      <div class="stat-value">${failCount}</div>
      <div class="stat-label">Failed</div>
    </div>
    <div class="stat">
      <div class="stat-value">${otherCount}</div>
      <div class="stat-label">Other</div>
    </div>
  </div>

  <div class="results">
    ${results.map(r => `
    <div class="result">
      <div class="result-header">
        <span class="result-title">${r.label} (${r.screen})</span>
        <span class="result-status ${r.status === 'pass' ? 'pass' : r.status === 'fail' ? 'fail' : 'warn'}">
          ${r.status === 'pass' ? 'PASS' : r.status === 'fail' ? 'FAIL' : r.status.toUpperCase()}
        </span>
      </div>
      ${r.diffPercent ? `<p class="diff-info">${r.diffPercent}% pixel difference (${r.mismatchedPixels.toLocaleString()} / ${r.totalPixels.toLocaleString()} pixels)</p>` : ''}
      ${r.message ? `<p class="diff-info">${r.message}</p>` : ''}
      ${r.iosPath || r.webPath || r.diffPath ? `
      <div class="images">
        ${r.iosPath ? `<div class="image-box"><img src="ios/${r.screen}.png" alt="iOS"><div class="image-label">iOS</div></div>` : '<div></div>'}
        ${r.webPath ? `<div class="image-box"><img src="web/${r.screen}.png" alt="Web"><div class="image-label">Web</div></div>` : '<div></div>'}
        ${r.diffPath ? `<div class="image-box"><img src="diff/${r.screen}.png" alt="Diff"><div class="image-label">Diff</div></div>` : '<div></div>'}
      </div>
      ` : ''}
    </div>
    `).join('')}
  </div>
</body>
</html>`;

  fs.writeFileSync(reportPath, html);
  console.log(`\n📄 Report generated: ${reportPath}`);
}

// ============================================================
// Main
// ============================================================

async function main() {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║              Visual Regression Testing                     ║
╠════════════════════════════════════════════════════════════╣
║  App: ${config.appName.padEnd(52)}║
║  Threshold: ${(config.threshold * 100).toFixed(0)}%${' '.repeat(47)}║
╚════════════════════════════════════════════════════════════╝`);

  const registry = getScreenRegistry();
  console.log(`\n   Found ${registry.tabs.length} tabs, ${registry.details?.length || 0} detail screens`);

  if (!config.compareOnly) {
    if (!config.webOnly) {
      await captureIOSScreenshots(registry);
    }

    if (!config.iosOnly) {
      await captureWebScreenshots(registry);
    }
  }

  if (!config.iosOnly && !config.webOnly) {
    const results = await compareScreenshots(registry);
    generateReport(results);

    const passCount = results.filter(r => r.status === 'pass').length;
    const failCount = results.filter(r => r.status === 'fail').length;

    console.log(`
╔════════════════════════════════════════════════════════════╗
║                      Summary                               ║
╠════════════════════════════════════════════════════════════╣
║  ✓ Passed: ${passCount.toString().padEnd(48)}║
║  ✗ Failed: ${failCount.toString().padEnd(48)}║
║                                                            ║
║  Open report: file://${reportPath.slice(-37).padEnd(37)}║
╚════════════════════════════════════════════════════════════╝
`);

    // Exit with error code if any failures
    if (failCount > 0) {
      process.exit(1);
    }
  }
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
