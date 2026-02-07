#!/usr/bin/env node
/**
 * Sync UI Playground from iOS App
 *
 * Syncs screen structure and design tokens from the iOS app to the playground.
 *
 * Usage:
 *   node scripts/sync-from-ios.js --ios-path ../my-app/MyApp --app my-app
 *   node scripts/sync-from-ios.js --ios-path ../my-app/MyApp --app my-app --dry-run
 *   node scripts/sync-from-ios.js --ios-path ../my-app/MyApp --app my-app --tokens-only
 *   node scripts/sync-from-ios.js --ios-path ../my-app/MyApp --app my-app --screens-only
 */

const fs = require('fs');
const path = require('path');

// ============================================================
// CLI Argument Parsing
// ============================================================

const args = process.argv.slice(2);
const config = {
  iosPath: null,
  appName: null,
  dryRun: false,
  tokensOnly: false,
  screensOnly: false,
  visualTest: false,
};

for (let i = 0; i < args.length; i++) {
  switch (args[i]) {
    case '--ios-path':
      config.iosPath = args[++i];
      break;
    case '--app':
      config.appName = args[++i];
      break;
    case '--dry-run':
      config.dryRun = true;
      break;
    case '--tokens-only':
      config.tokensOnly = true;
      break;
    case '--screens-only':
      config.screensOnly = true;
      break;
    case '--visual-test':
      config.visualTest = true;
      break;
    case '--help':
      console.log(`
Usage: sync-from-ios.js [options]

Options:
  --ios-path <path>   Path to the iOS app's source directory (e.g., ../my-app/MyApp)
  --app <name>        App name in the playground (required)
  --dry-run           Show what would change without making changes
  --tokens-only       Only sync design tokens (theme.css)
  --screens-only      Only sync screen structure (config.js)
  --visual-test       Run visual regression tests after sync
  --help              Show this help message
`);
      process.exit(0);
  }
}

if (!config.iosPath) {
  console.error('Error: --ios-path is required');
  process.exit(1);
}

if (!config.appName) {
  console.error('Error: --app is required');
  process.exit(1);
}

const playgroundRoot = path.resolve(__dirname, '..');
const iosRoot = path.resolve(config.iosPath);

console.log(`\n🔄 Syncing from iOS app: ${iosRoot}`);
console.log(`   To playground app: ${config.appName}`);
if (config.dryRun) console.log('   (dry-run mode)\n');

// ============================================================
// Parse Swift Files
// ============================================================

function readFile(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (e) {
    console.warn(`  Warning: Could not read ${filePath}`);
    return null;
  }
}

function findFile(dir, filename) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  for (const file of files) {
    const fullPath = path.join(dir, file.name);
    if (file.isDirectory()) {
      const found = findFile(fullPath, filename);
      if (found) return found;
    } else if (file.name === filename) {
      return fullPath;
    }
  }
  return null;
}

// ============================================================
// Extract Screen Structure from AppTabView.swift
// ============================================================

function parseAppTabView(content) {
  const tabs = [];

  // Match TabView tab items
  // Pattern: Label("Timeline", systemImage: "calendar.day.timeline.left")
  //          .tag(Tab.timeline)
  //          .accessibilityIdentifier("tab-timeline")
  const labelRegex = /Label\("([^"]+)",\s*systemImage:\s*"([^"]+)"\)/g;
  const tagRegex = /\.tag\(Tab\.(\w+)\)/g;
  const accessibilityRegex = /\.accessibilityIdentifier\("([^"]+)"\)/g;

  let match;
  const labels = [];
  const tags = [];
  const accessibilityIds = [];

  while ((match = labelRegex.exec(content)) !== null) {
    labels.push({ label: match[1], icon: match[2] });
  }

  while ((match = tagRegex.exec(content)) !== null) {
    tags.push(match[1]);
  }

  while ((match = accessibilityRegex.exec(content)) !== null) {
    accessibilityIds.push(match[1]);
  }

  // Combine them (they should be in order)
  for (let i = 0; i < labels.length && i < tags.length; i++) {
    tabs.push({
      id: tags[i],
      label: labels[i].label,
      icon: labels[i].icon,
      accessibilityId: accessibilityIds[i] || `tab-${tags[i]}`,
    });
  }

  return tabs;
}

// ============================================================
// Extract Design Tokens from PrototypeTheme.swift
// ============================================================

function parsePrototypeTheme(content) {
  const tokens = {
    colors: {},
    spacing: {},
    radii: {},
    sizes: {},
    opacity: {},
    motion: {},
  };

  // Parse spacing values
  const spacingMatch = content.match(/let spacing = SpacingTokens\(([\s\S]*?)\)/);
  if (spacingMatch) {
    const spacingBlock = spacingMatch[1];
    const valueRegex = /(\w+):\s*([\d.]+)/g;
    let match;
    while ((match = valueRegex.exec(spacingBlock)) !== null) {
      tokens.spacing[match[1]] = parseFloat(match[2]);
    }
  }

  // Parse radii values
  const radiiMatch = content.match(/let radii = RadiiTokens\(([\s\S]*?)\)/);
  if (radiiMatch) {
    const radiiBlock = radiiMatch[1];
    const valueRegex = /(\w+):\s*([\d.]+)/g;
    let match;
    while ((match = valueRegex.exec(radiiBlock)) !== null) {
      tokens.radii[match[1]] = parseFloat(match[2]);
    }
  }

  // Parse sizes values
  const sizesMatch = content.match(/let sizes = SizeTokens\(([\s\S]*?)\)/);
  if (sizesMatch) {
    const sizesBlock = sizesMatch[1];
    const valueRegex = /(\w+):\s*([\d.]+)/g;
    let match;
    while ((match = valueRegex.exec(sizesBlock)) !== null) {
      tokens.sizes[match[1]] = parseFloat(match[2]);
    }
  }

  // Parse opacity values
  const opacityMatch = content.match(/let opacity = OpacityTokens\(([\s\S]*?)\)/);
  if (opacityMatch) {
    const opacityBlock = opacityMatch[1];
    const valueRegex = /(\w+):\s*([\d.]+)/g;
    let match;
    while ((match = valueRegex.exec(opacityBlock)) !== null) {
      tokens.opacity[match[1]] = parseFloat(match[2]);
    }
  }

  // Parse motion values
  const motionMatch = content.match(/let motion = MotionTokens\(([\s\S]*?)\)/);
  if (motionMatch) {
    const motionBlock = motionMatch[1];
    const valueRegex = /(\w+):\s*([\d.]+)/g;
    let match;
    while ((match = valueRegex.exec(motionBlock)) !== null) {
      tokens.motion[match[1]] = parseFloat(match[2]);
    }
  }

  // Parse color values (simple ones like Color.blue, Color.red)
  const colorsMatch = content.match(/let colors = ColorTokens\(([\s\S]*?)\n\s*\)/);
  if (colorsMatch) {
    const colorsBlock = colorsMatch[1];

    // Match category colors: categoryDiagnosis: Color.red
    const simpleColorRegex = /category(\w+):\s*Color\.(\w+)/g;
    let match;
    while ((match = simpleColorRegex.exec(colorsBlock)) !== null) {
      tokens.colors[`category${match[1]}`] = match[2];
    }

    // Match semantic colors
    const semanticRegex = /(destructive|warning|success):\s*Color\.(\w+)/g;
    while ((match = semanticRegex.exec(colorsBlock)) !== null) {
      tokens.colors[match[1]] = match[2];
    }
  }

  return tokens;
}

// ============================================================
// Find Detail Screens
// ============================================================

function findDetailScreens(iosRoot) {
  const details = [];
  const featuresDir = path.join(iosRoot, 'Features');

  if (!fs.existsSync(featuresDir)) {
    console.warn('  Warning: Features directory not found');
    return details;
  }

  // Known detail screen patterns
  const detailPatterns = [
    { file: 'EventDetailView.swift', id: 'event-detail', label: 'Event Detail', icon: 'calendar', parent: 'timeline' },
    { file: 'DocumentViewerView.swift', id: 'document-viewer', label: 'Document Viewer', icon: 'doc.text.fill', parent: 'documents' },
    { file: 'TagDetailView.swift', id: 'tag-detail', label: 'Tag Detail', icon: 'tag', parent: 'tags' },
    { file: 'ChapterReadingView.swift', id: 'chapter-reading', label: 'Chapter Reading', icon: 'book', parent: 'story' },
  ];

  for (const pattern of detailPatterns) {
    const filePath = findFile(featuresDir, pattern.file);
    if (filePath) {
      details.push({
        id: pattern.id,
        label: pattern.label,
        icon: pattern.icon,
        parent: pattern.parent,
      });
    }
  }

  return details;
}

// ============================================================
// Generate Updated Files
// ============================================================

function generateScreenRegistry(tabs, details) {
  return `const SCREEN_REGISTRY = {
  // Main tabs (matches iOS AppTabView)
  tabs: [
${tabs.map(t => `    { id: '${t.id}', label: '${t.label}', icon: '${t.icon}', accessibilityId: '${t.accessibilityId}' },`).join('\n')}
  ],

  // Detail screens (pushed onto navigation stacks)
  details: [
${details.map(d => `    { id: '${d.id}', label: '${d.label}', icon: '${d.icon}', parent: '${d.parent}' },`).join('\n')}
  ],

  // Onboarding screens
  onboarding: [
    { id: 'welcome-1', label: 'Welcome (1/5)', icon: 'sparkles', page: 1 },
    { id: 'welcome-2', label: 'Welcome (2/5)', icon: 'doc.text', page: 2 },
    { id: 'welcome-3', label: 'Welcome (3/5)', icon: 'calendar.day.timeline.left', page: 3 },
    { id: 'welcome-4', label: 'Welcome (4/5)', icon: 'book.pages', page: 4 },
    { id: 'welcome-5', label: 'Welcome (5/5)', icon: 'checkmark', page: 5 },
  ],

  // Utility screens
  utility: [
    { id: 'loading', label: 'Loading Screen', icon: 'arrow.clockwise' },
  ],
};`;
}

function camelToKebab(str) {
  return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

function generateThemeTokensCSS(tokens) {
  const lines = [];

  // Spacing
  lines.push('  /* Spacing (from PrototypeTheme.swift) */');
  for (const [key, value] of Object.entries(tokens.spacing)) {
    const cssKey = camelToKebab(key);
    lines.push(`  --spacing-${cssKey}: ${value}px;`);
  }

  lines.push('');
  lines.push('  /* Radii (from PrototypeTheme.swift) */');
  for (const [key, value] of Object.entries(tokens.radii)) {
    lines.push(`  --radius-${key}: ${value}px;`);
  }

  lines.push('');
  lines.push('  /* Sizes (from PrototypeTheme.swift) */');
  for (const [key, value] of Object.entries(tokens.sizes)) {
    const cssKey = camelToKebab(key);
    lines.push(`  --size-${cssKey}: ${value}px;`);
  }

  lines.push('');
  lines.push('  /* Motion (from PrototypeTheme.swift) */');
  for (const [key, value] of Object.entries(tokens.motion)) {
    lines.push(`  --motion-${key}: ${value}s;`);
  }

  lines.push('');
  lines.push('  /* Opacity (from PrototypeTheme.swift) */');
  for (const [key, value] of Object.entries(tokens.opacity)) {
    lines.push(`  --opacity-${key}: ${value};`);
  }

  return lines.join('\n');
}

// ============================================================
// Main Sync Logic
// ============================================================

function sync() {
  const changes = [];

  // Find and parse AppTabView.swift
  const appTabViewPath = findFile(iosRoot, 'AppTabView.swift');
  if (!appTabViewPath) {
    console.error('Error: Could not find AppTabView.swift');
    process.exit(1);
  }

  const appTabViewContent = readFile(appTabViewPath);
  const tabs = parseAppTabView(appTabViewContent);
  console.log(`\n📱 Found ${tabs.length} tabs in AppTabView.swift:`);
  tabs.forEach(t => console.log(`   - ${t.label} (${t.id})`));

  // Find detail screens
  const details = findDetailScreens(iosRoot);
  console.log(`\n📄 Found ${details.length} detail screens:`);
  details.forEach(d => console.log(`   - ${d.label} (${d.id}) -> ${d.parent}`));

  // Find and parse PrototypeTheme.swift
  const themePath = findFile(iosRoot, 'PrototypeTheme.swift');
  let tokens = null;
  if (themePath) {
    const themeContent = readFile(themePath);
    tokens = parsePrototypeTheme(themeContent);
    console.log(`\n🎨 Parsed design tokens from PrototypeTheme.swift`);
    console.log(`   - ${Object.keys(tokens.spacing).length} spacing values`);
    console.log(`   - ${Object.keys(tokens.radii).length} radii values`);
    console.log(`   - ${Object.keys(tokens.sizes).length} size values`);
  }

  // Update config.js (screen structure)
  if (!config.tokensOnly) {
    const configPath = path.join(playgroundRoot, 'apps', config.appName, 'config.js');
    if (fs.existsSync(configPath)) {
      let configContent = readFile(configPath);
      const newRegistry = generateScreenRegistry(tabs, details);

      // Replace SCREEN_REGISTRY block
      const registryRegex = /const SCREEN_REGISTRY = \{[\s\S]*?\n\};/;
      if (registryRegex.test(configContent)) {
        const newContent = configContent.replace(registryRegex, newRegistry);
        if (newContent !== configContent) {
          changes.push({ file: configPath, type: 'update', description: 'Updated SCREEN_REGISTRY' });
          if (!config.dryRun) {
            fs.writeFileSync(configPath, newContent);
          }
        }
      }
    }
  }

  // Update theme.css (design tokens)
  if (!config.screensOnly && tokens) {
    const themePath = path.join(playgroundRoot, 'core', 'theme.css');
    if (fs.existsSync(themePath)) {
      let themeContent = readFile(themePath);
      const newTokensCSS = generateThemeTokensCSS(tokens);

      // Look for a marker comment to replace tokens
      const markerStart = '/* === SYNCED FROM iOS (START) === */';
      const markerEnd = '/* === SYNCED FROM iOS (END) === */';

      if (themeContent.includes(markerStart)) {
        const startIdx = themeContent.indexOf(markerStart);
        const endIdx = themeContent.indexOf(markerEnd) + markerEnd.length;
        const newContent = themeContent.slice(0, startIdx) +
          `${markerStart}\n${newTokensCSS}\n  ${markerEnd}` +
          themeContent.slice(endIdx);

        if (newContent !== themeContent) {
          changes.push({ file: themePath, type: 'update', description: 'Updated design tokens' });
          if (!config.dryRun) {
            fs.writeFileSync(themePath, newContent);
          }
        }
      } else {
        console.log('\n⚠️  No sync markers found in theme.css. Add these markers where tokens should be inserted:');
        console.log(`   ${markerStart}`);
        console.log(`   ${markerEnd}`);
      }
    }
  }

  // Summary
  console.log('\n' + '='.repeat(50));
  if (changes.length === 0) {
    console.log('✅ No changes needed - playground is in sync!');
  } else if (config.dryRun) {
    console.log(`📝 Would make ${changes.length} change(s):`);
    changes.forEach(c => console.log(`   - ${c.description}: ${path.basename(c.file)}`));
  } else {
    console.log(`✅ Made ${changes.length} change(s):`);
    changes.forEach(c => console.log(`   - ${c.description}: ${path.basename(c.file)}`));
  }
  console.log('');

  // Run visual regression tests if requested
  if (config.visualTest && !config.dryRun) {
    console.log('\n🔍 Running visual regression tests...\n');
    const { spawn } = require('child_process');
    const visualTestScript = path.join(playgroundRoot, 'scripts', 'visual-regression.js');
    const child = spawn('node', [visualTestScript, '--app', config.appName, '--ios-project', path.dirname(iosRoot)], {
      cwd: playgroundRoot,
      stdio: 'inherit',
    });
    child.on('close', (code) => {
      process.exit(code);
    });
  }
}

sync();
