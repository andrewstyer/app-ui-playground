#!/usr/bin/env node
/**
 * Import iOS App to UI Playground
 *
 * Creates a complete playground scaffold from an iOS app, including:
 * - Screen structure (tabs, detail screens)
 * - Design tokens (colors, spacing, typography)
 * - Font files (bundled or Google Fonts fallback)
 * - Stub screen renderers
 *
 * Usage:
 *   node scripts/import-ios-app.js --ios-path ../my-app/MyApp --app my-app
 *   node scripts/import-ios-app.js --ios-path ../my-app/MyApp --app my-app --dry-run
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
    case '--help':
      console.log(`
Usage: import-ios-app.js [options]

Options:
  --ios-path <path>   Path to the iOS app's source directory (required)
  --app <name>        App name for the playground (required)
  --dry-run           Show what would be created without making changes
  --help              Show this help message

Example:
  node scripts/import-ios-app.js --ios-path ../my-app/MyApp --app my-app
`);
      process.exit(0);
  }
}

if (!config.iosPath || !config.appName) {
  console.error('Error: --ios-path and --app are required');
  process.exit(1);
}

const playgroundRoot = path.resolve(__dirname, '..');
const iosRoot = path.resolve(config.iosPath);
const appDir = path.join(playgroundRoot, 'apps', config.appName);

console.log(`
╔════════════════════════════════════════════════════════════╗
║              Import iOS App to Playground                  ║
╠════════════════════════════════════════════════════════════╣
║  iOS Source: ${iosRoot.slice(-45).padStart(45)}║
║  App Name:   ${config.appName.padEnd(45)}║
${config.dryRun ? '║  Mode:       DRY RUN                                       ║\n' : ''}╚════════════════════════════════════════════════════════════╝
`);

// ============================================================
// Google Fonts Mapping (common iOS fonts to web equivalents)
// ============================================================

const GOOGLE_FONTS_MAP = {
  // Sans-serif
  'SF Pro': null, // System font, use -apple-system
  'SF Pro Display': null,
  'SF Pro Text': null,
  'SF Pro Rounded': null,
  'Helvetica Neue': null, // System fallback
  'Avenir': 'Nunito',
  'Avenir Next': 'Nunito',
  'Futura': 'Jost',
  'Gill Sans': 'Lato',
  'Montserrat': 'Montserrat',
  'Open Sans': 'Open Sans',
  'Roboto': 'Roboto',
  'Inter': 'Inter',
  'Poppins': 'Poppins',
  'Raleway': 'Raleway',
  'Source Sans Pro': 'Source Sans 3',
  'Lato': 'Lato',
  'Nunito': 'Nunito',
  'Work Sans': 'Work Sans',
  'DM Sans': 'DM Sans',
  'Plus Jakarta Sans': 'Plus Jakarta Sans',

  // Serif
  'New York': 'Libre Baskerville',
  'Georgia': null, // Web-safe
  'Times New Roman': null, // Web-safe
  'Garamond': 'EB Garamond',
  'Palatino': 'Libre Baskerville',
  'Baskerville': 'Libre Baskerville',
  'Playfair Display': 'Playfair Display',
  'Lora': 'Lora',
  'Merriweather': 'Merriweather',
  'Crimson Text': 'Crimson Text',
  'Source Serif Pro': 'Source Serif 4',
  'Cormorant': 'Cormorant',
  'Spectral': 'Spectral',

  // Monospace
  'SF Mono': null, // System font
  'Menlo': null, // System font
  'Monaco': null, // System font
  'Courier': null, // Web-safe
  'Courier New': null, // Web-safe
  'Fira Code': 'Fira Code',
  'JetBrains Mono': 'JetBrains Mono',
  'Source Code Pro': 'Source Code Pro',
  'IBM Plex Mono': 'IBM Plex Mono',

  // Display/Decorative
  'Bebas Neue': 'Bebas Neue',
  'Oswald': 'Oswald',
  'Anton': 'Anton',
  'Archivo Black': 'Archivo Black',
  'Abril Fatface': 'Abril Fatface',
};

// ============================================================
// iOS System Color to Hex Mapping
// ============================================================

const IOS_COLORS = {
  // Light mode
  light: {
    'systemBackground': '#ffffff',
    'secondarySystemBackground': '#f2f2f7',
    'tertiarySystemBackground': '#ffffff',
    'label': '#000000',
    'secondaryLabel': 'rgba(60, 60, 67, 0.6)',
    'tertiaryLabel': 'rgba(60, 60, 67, 0.3)',
    'separator': 'rgba(60, 60, 67, 0.29)',
    'blue': '#007aff',
    'red': '#ff3b30',
    'orange': '#ff9500',
    'yellow': '#ffcc00',
    'green': '#34c759',
    'mint': '#00c7be',
    'teal': '#30b0c7',
    'cyan': '#32ade6',
    'indigo': '#5856d6',
    'purple': '#af52de',
    'pink': '#ff2d55',
    'brown': '#a2845e',
    'gray': '#8e8e93',
  },
  // Dark mode
  dark: {
    'systemBackground': '#000000',
    'secondarySystemBackground': '#1c1c1e',
    'tertiarySystemBackground': '#2c2c2e',
    'label': '#ffffff',
    'secondaryLabel': 'rgba(235, 235, 245, 0.6)',
    'tertiaryLabel': 'rgba(235, 235, 245, 0.3)',
    'separator': 'rgba(84, 84, 88, 0.6)',
    'blue': '#0a84ff',
    'red': '#ff453a',
    'orange': '#ff9f0a',
    'yellow': '#ffd60a',
    'green': '#30d158',
    'mint': '#63e6e2',
    'teal': '#40c8e0',
    'cyan': '#64d2ff',
    'indigo': '#5e5ce6',
    'purple': '#bf5af2',
    'pink': '#ff375f',
    'brown': '#ac8e68',
    'gray': '#98989d',
  },
};

// ============================================================
// File Utilities
// ============================================================

function readFile(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (e) {
    return null;
  }
}

function findFile(dir, filename) {
  if (!fs.existsSync(dir)) return null;
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

function findFiles(dir, pattern) {
  const results = [];
  if (!fs.existsSync(dir)) return results;

  const files = fs.readdirSync(dir, { withFileTypes: true });
  for (const file of files) {
    const fullPath = path.join(dir, file.name);
    if (file.isDirectory()) {
      results.push(...findFiles(fullPath, pattern));
    } else if (pattern.test(file.name)) {
      results.push(fullPath);
    }
  }
  return results;
}

function ensureDir(dirPath) {
  if (config.dryRun) {
    console.log(`  [dry-run] Would create directory: ${path.relative(playgroundRoot, dirPath)}`);
    return;
  }
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function writeFile(filePath, content) {
  if (config.dryRun) {
    console.log(`  [dry-run] Would create file: ${path.relative(playgroundRoot, filePath)}`);
    return;
  }
  fs.writeFileSync(filePath, content);
  console.log(`  ✓ Created: ${path.relative(playgroundRoot, filePath)}`);
}

function copyFile(src, dest) {
  if (config.dryRun) {
    console.log(`  [dry-run] Would copy: ${path.basename(src)} → ${path.relative(playgroundRoot, dest)}`);
    return;
  }
  fs.copyFileSync(src, dest);
  console.log(`  ✓ Copied: ${path.basename(src)}`);
}

// ============================================================
// Parse AppTabView.swift for Screen Structure
// ============================================================

function parseAppTabView(content) {
  const tabs = [];

  const labelRegex = /Label\("([^"]+)",\s*systemImage:\s*"([^"]+)"\)/g;
  const tagRegex = /\.tag\(Tab\.(\w+)\)/g;
  const accessibilityRegex = /\.accessibilityIdentifier\("([^"]+)"\)/g;

  const labels = [];
  const tags = [];
  const accessibilityIds = [];

  let match;
  while ((match = labelRegex.exec(content)) !== null) {
    labels.push({ label: match[1], icon: match[2] });
  }
  while ((match = tagRegex.exec(content)) !== null) {
    tags.push(match[1]);
  }
  while ((match = accessibilityRegex.exec(content)) !== null) {
    accessibilityIds.push(match[1]);
  }

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
// Parse PrototypeTheme.swift for Design Tokens
// ============================================================

function parsePrototypeTheme(content) {
  const tokens = {
    spacing: {},
    radii: {},
    sizes: {},
    opacity: {},
    motion: {},
    colors: { light: {}, dark: {} },
  };

  // Parse spacing
  const spacingMatch = content.match(/let spacing = SpacingTokens\(([\s\S]*?)\)/);
  if (spacingMatch) {
    const valueRegex = /(\w+):\s*([\d.]+)/g;
    let match;
    while ((match = valueRegex.exec(spacingMatch[1])) !== null) {
      tokens.spacing[match[1]] = parseFloat(match[2]);
    }
  }

  // Parse radii
  const radiiMatch = content.match(/let radii = RadiiTokens\(([\s\S]*?)\)/);
  if (radiiMatch) {
    const valueRegex = /(\w+):\s*([\d.]+)/g;
    let match;
    while ((match = valueRegex.exec(radiiMatch[1])) !== null) {
      tokens.radii[match[1]] = parseFloat(match[2]);
    }
  }

  // Parse sizes
  const sizesMatch = content.match(/let sizes = SizeTokens\(([\s\S]*?)\)/);
  if (sizesMatch) {
    const valueRegex = /(\w+):\s*([\d.]+)/g;
    let match;
    while ((match = valueRegex.exec(sizesMatch[1])) !== null) {
      tokens.sizes[match[1]] = parseFloat(match[2]);
    }
  }

  // Parse opacity
  const opacityMatch = content.match(/let opacity = OpacityTokens\(([\s\S]*?)\)/);
  if (opacityMatch) {
    const valueRegex = /(\w+):\s*([\d.]+)/g;
    let match;
    while ((match = valueRegex.exec(opacityMatch[1])) !== null) {
      tokens.opacity[match[1]] = parseFloat(match[2]);
    }
  }

  // Parse motion
  const motionMatch = content.match(/let motion = MotionTokens\(([\s\S]*?)\)/);
  if (motionMatch) {
    const valueRegex = /(\w+):\s*([\d.]+)/g;
    let match;
    while ((match = valueRegex.exec(motionMatch[1])) !== null) {
      tokens.motion[match[1]] = parseFloat(match[2]);
    }
  }

  // Parse colors - this is complex, we'll handle common patterns
  const colorsMatch = content.match(/let colors = ColorTokens\(([\s\S]*?)\n\s*\)/);
  if (colorsMatch) {
    const colorsBlock = colorsMatch[1];

    // Match Color.colorName patterns
    const colorDotRegex = /(\w+):\s*Color\.(\w+)/g;
    while ((match = colorDotRegex.exec(colorsBlock)) !== null) {
      const propName = match[1];
      const colorName = match[2];
      if (IOS_COLORS.light[colorName]) {
        tokens.colors.light[propName] = IOS_COLORS.light[colorName];
        tokens.colors.dark[propName] = IOS_COLORS.dark[colorName] || IOS_COLORS.light[colorName];
      }
    }

    // Match Color(red: x, green: y, blue: z) patterns
    const rgbRegex = /(\w+):\s*Color\(red:\s*([\d.]+),\s*green:\s*([\d.]+),\s*blue:\s*([\d.]+)\)/g;
    while ((match = rgbRegex.exec(colorsBlock)) !== null) {
      const propName = match[1];
      const r = Math.round(parseFloat(match[2]) * 255);
      const g = Math.round(parseFloat(match[3]) * 255);
      const b = Math.round(parseFloat(match[4]) * 255);
      const hex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
      tokens.colors.light[propName] = hex;
      tokens.colors.dark[propName] = hex; // Same for dark unless specified
    }
  }

  return tokens;
}

// ============================================================
// Parse Info.plist for Bundled Fonts
// ============================================================

function parseFontsFromInfoPlist(iosRoot) {
  const fonts = [];

  // Find Info.plist
  const plistPath = findFile(iosRoot, 'Info.plist');
  if (!plistPath) return fonts;

  const content = readFile(plistPath);
  if (!content) return fonts;

  // Look for UIAppFonts array
  const fontsMatch = content.match(/<key>UIAppFonts<\/key>\s*<array>([\s\S]*?)<\/array>/);
  if (fontsMatch) {
    const stringRegex = /<string>([^<]+)<\/string>/g;
    let match;
    while ((match = stringRegex.exec(fontsMatch[1])) !== null) {
      fonts.push(match[1]);
    }
  }

  return fonts;
}

// ============================================================
// Find and Copy Font Files
// ============================================================

function findAndCopyFonts(iosRoot, appDir) {
  const fontInfo = {
    bundledFonts: [],
    googleFonts: [],
    fontFaces: [],
  };

  // Get fonts from Info.plist
  const declaredFonts = parseFontsFromInfoPlist(iosRoot);
  console.log(`\n📝 Found ${declaredFonts.length} fonts declared in Info.plist`);

  // Find actual font files in the iOS project
  const fontFiles = findFiles(iosRoot, /\.(ttf|otf|woff|woff2)$/i);
  console.log(`   Found ${fontFiles.length} font files in project`);

  const fontsDir = path.join(appDir, 'fonts');

  for (const fontFileName of declaredFonts) {
    // Find the font file
    const fontFile = fontFiles.find(f => path.basename(f) === fontFileName);

    if (fontFile) {
      // Copy the font file
      ensureDir(fontsDir);
      const destPath = path.join(fontsDir, fontFileName);
      copyFile(fontFile, destPath);

      // Extract font family name from filename
      const familyName = fontFileName
        .replace(/\.(ttf|otf|woff|woff2)$/i, '')
        .replace(/[-_](Regular|Bold|Italic|Light|Medium|SemiBold|ExtraBold|Thin|Black|Heavy).*$/i, '')
        .replace(/[-_]/g, ' ');

      // Determine weight from filename
      let weight = '400';
      if (/thin/i.test(fontFileName)) weight = '100';
      else if (/extralight|ultralight/i.test(fontFileName)) weight = '200';
      else if (/light/i.test(fontFileName)) weight = '300';
      else if (/medium/i.test(fontFileName)) weight = '500';
      else if (/semibold|demibold/i.test(fontFileName)) weight = '600';
      else if (/extrabold|ultrabold/i.test(fontFileName)) weight = '800';
      else if (/black|heavy/i.test(fontFileName)) weight = '900';
      else if (/bold/i.test(fontFileName)) weight = '700';

      const style = /italic/i.test(fontFileName) ? 'italic' : 'normal';
      const ext = path.extname(fontFileName).slice(1).toLowerCase();
      const format = ext === 'ttf' ? 'truetype' : ext === 'otf' ? 'opentype' : ext;

      fontInfo.bundledFonts.push({
        family: familyName,
        file: fontFileName,
        weight,
        style,
        format,
      });

      fontInfo.fontFaces.push(`@font-face {
  font-family: '${familyName}';
  src: url('./fonts/${fontFileName}') format('${format}');
  font-weight: ${weight};
  font-style: ${style};
  font-display: swap;
}`);

    } else {
      // Font file not found, try Google Fonts fallback
      const baseName = fontFileName
        .replace(/\.(ttf|otf|woff|woff2)$/i, '')
        .replace(/[-_](Regular|Bold|Italic|Light|Medium|SemiBold|ExtraBold|Thin|Black|Heavy).*$/i, '')
        .replace(/[-_]/g, ' ');

      const googleFont = GOOGLE_FONTS_MAP[baseName];
      if (googleFont) {
        if (!fontInfo.googleFonts.includes(googleFont)) {
          fontInfo.googleFonts.push(googleFont);
          console.log(`   ⚠️  Font not found: ${fontFileName} → Using Google Font: ${googleFont}`);
        }
      } else if (GOOGLE_FONTS_MAP[baseName] === undefined) {
        console.log(`   ⚠️  Font not found: ${fontFileName} (no Google Fonts equivalent)`);
      }
    }
  }

  return fontInfo;
}

// ============================================================
// Generate App Files
// ============================================================

function camelToKebab(str) {
  return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

function generateConfigJS(tabs, appName) {
  const tabsJS = tabs.map(t =>
    `    { id: '${t.id}', label: '${t.label}', icon: '${t.icon}', accessibilityId: '${t.accessibilityId}' },`
  ).join('\n');

  return `// ${appName} App Configuration
// Screen registry and app-specific settings

// ============================================================
// Screen Registry
// ============================================================

const SCREEN_REGISTRY = {
  tabs: [
${tabsJS}
  ],
  details: [],
  onboarding: [],
  utility: [],
};

// ============================================================
// App State
// ============================================================

const state = {
  // Add app-specific state here
};

// ============================================================
// Initialize App
// ============================================================

function init${appName.charAt(0).toUpperCase() + appName.slice(1).replace(/-./g, x => x[1].toUpperCase())}App() {
  Navigation.configure({
    screenRegistry: SCREEN_REGISTRY,
    defaultTab: '${tabs[0]?.id || 'home'}',
  });
  initAppShell();
  render();
}

// ============================================================
// Render Engine
// ============================================================

function render() {
  const container = document.getElementById('screen-container');

  if (Navigation.specialScreen) {
    container.innerHTML = renderSpecialScreen(Navigation.specialScreen);
    return;
  }

  const stack = currentStack();
  if (stack.length > 0) {
    container.innerHTML = stack[stack.length - 1]();
  } else {
    container.innerHTML = renderScreen(Navigation.activeTab);
  }
}

function renderSpecialScreen(specialScreen) {
  return '<div class="empty-state"><span class="empty-state-title">Unknown screen</span></div>';
}

function renderScreen(tabId) {
  switch (tabId) {
${tabs.map(t => `    case '${t.id}': return render${t.label.replace(/\s+/g, '')}();`).join('\n')}
    default: return '<div class="empty-state"><span class="empty-state-title">Coming soon</span></div>';
  }
}

function renderDetailScreen(screenId, params) {
  return Navigation._renderDemoDetailScreen('Detail', 'doc.text', 'Detail content');
}

// ============================================================
// Initialize on DOM Ready
// ============================================================

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init${appName.charAt(0).toUpperCase() + appName.slice(1).replace(/-./g, x => x[1].toUpperCase())}App);
} else {
  init${appName.charAt(0).toUpperCase() + appName.slice(1).replace(/-./g, x => x[1].toUpperCase())}App();
}
`;
}

function generateDataJS(appName) {
  return `// ${appName} Sample Data
// Stub data for prototyping

const DATA = {
  // Add your sample data here
  items: [
    { id: '1', title: 'Sample Item 1', description: 'Description for item 1' },
    { id: '2', title: 'Sample Item 2', description: 'Description for item 2' },
    { id: '3', title: 'Sample Item 3', description: 'Description for item 3' },
  ],
};
`;
}

function generateScreenJS(tab, appName) {
  const functionName = `render${tab.label.replace(/\s+/g, '')}`;
  return `// ${tab.label} Screen
// Stub implementation - customize with your UI

function ${functionName}() {
  return \`
    <div class="screen-header">
      <div class="screen-title">${tab.label}</div>
    </div>
    <div class="screen-content">
      <div class="empty-state">
        <div class="empty-state-icon">\${icon('${tab.icon}', 48)}</div>
        <span class="empty-state-title">${tab.label}</span>
        <span class="empty-state-subtitle">Implement this screen</span>
      </div>
    </div>
  \`;
}
`;
}

function generateThemeCSS(tokens, fontInfo, appName) {
  const lines = [];

  // Google Fonts import
  if (fontInfo.googleFonts.length > 0) {
    const families = fontInfo.googleFonts.map(f => f.replace(/ /g, '+')).join('&family=');
    lines.push(`@import url('https://fonts.googleapis.com/css2?family=${families}&display=swap');`);
    lines.push('');
  }

  // Font faces for bundled fonts
  if (fontInfo.fontFaces.length > 0) {
    lines.push(...fontInfo.fontFaces);
    lines.push('');
  }

  lines.push(`/* ${appName} Theme Overrides */`);
  lines.push(':root {');

  // Font family overrides
  if (fontInfo.bundledFonts.length > 0 || fontInfo.googleFonts.length > 0) {
    const primaryFont = fontInfo.bundledFonts[0]?.family || fontInfo.googleFonts[0];
    if (primaryFont) {
      lines.push(`  --font-family: '${primaryFont}', -apple-system, BlinkMacSystemFont, sans-serif;`);
    }
  }

  // Colors (light mode)
  if (Object.keys(tokens.colors.light).length > 0) {
    lines.push('');
    lines.push('  /* Colors */');
    for (const [key, value] of Object.entries(tokens.colors.light)) {
      const cssKey = camelToKebab(key);
      lines.push(`  --color-${cssKey}: ${value};`);
    }
  }

  lines.push('}');

  // Dark mode colors
  if (Object.keys(tokens.colors.dark).length > 0) {
    lines.push('');
    lines.push('@media (prefers-color-scheme: dark) {');
    lines.push('  :root:not([data-theme="light"]) {');
    for (const [key, value] of Object.entries(tokens.colors.dark)) {
      if (tokens.colors.light[key] !== value) {
        const cssKey = camelToKebab(key);
        lines.push(`    --color-${cssKey}: ${value};`);
      }
    }
    lines.push('  }');
    lines.push('}');

    lines.push('');
    lines.push('[data-theme="dark"] {');
    for (const [key, value] of Object.entries(tokens.colors.dark)) {
      if (tokens.colors.light[key] !== value) {
        const cssKey = camelToKebab(key);
        lines.push(`  --color-${cssKey}: ${value};`);
      }
    }
    lines.push('}');
  }

  return lines.join('\n');
}

function updateIndexHTML(appName) {
  const indexPath = path.join(playgroundRoot, 'index.html');
  let content = readFile(indexPath);
  if (!content) {
    console.log('  ⚠️  Could not read index.html');
    return;
  }

  // Check if app case already exists
  if (content.includes(`case '${appName}':`)) {
    console.log(`  ℹ️  App "${appName}" already in index.html`);
    return;
  }

  // Find the switch statement for stylesheets and add new case
  const stylesSwitchMatch = content.match(/(switch \(appName\) \{[\s\S]*?)(default:[\s\S]*?stylesheets\.push)/);
  if (stylesSwitchMatch) {
    const newStyleCase = `case '${appName}':
          stylesheets.push(\`\${appStylesDir}/theme.css\`);
          break;
        `;
    content = content.replace(
      stylesSwitchMatch[0],
      stylesSwitchMatch[1] + newStyleCase + stylesSwitchMatch[2]
    );
  }

  // Find the switch statement for scripts and add new case
  const scriptsSwitchMatch = content.match(/(switch \(appName\) \{[\s\S]*?case 'narrativ':[\s\S]*?break;)([\s\S]*?default:)/);
  if (scriptsSwitchMatch) {
    const newScriptCase = `
        case '${appName}':
          scripts.push(
            \`\${appDir}/data.js\`,
            \`\${appDir}/screens/index.js\`,
            \`\${appDir}/config.js\`
          );
          break;`;
    content = content.replace(
      scriptsSwitchMatch[0],
      scriptsSwitchMatch[1] + newScriptCase + scriptsSwitchMatch[2]
    );
  }

  writeFile(indexPath, content);
}

function updateServerJS(appName, iosPath) {
  const serverPath = path.join(playgroundRoot, 'server.js');
  let content = readFile(serverPath);
  if (!content) {
    console.log('  ⚠️  Could not read server.js');
    return;
  }

  // Check if app config already exists
  if (content.includes(`'${appName}':`)) {
    console.log(`  ℹ️  App "${appName}" already in server.js`);
    return;
  }

  // Find APP_CONFIGS and add new entry
  const configMatch = content.match(/(const APP_CONFIGS = \{[\s\S]*?)(  \/\/ Add more apps)/);
  if (configMatch) {
    const relativePath = path.relative(playgroundRoot, iosPath).replace(/\\/g, '/');
    const newConfig = `  '${appName}': {
    iosPath: '${relativePath}',
  },
  `;
    content = content.replace(
      configMatch[0],
      configMatch[1] + newConfig + configMatch[2]
    );
    writeFile(serverPath, content);
  }
}

// ============================================================
// Main Import Logic
// ============================================================

function runImport() {
  // Check if app already exists
  if (fs.existsSync(appDir) && !config.dryRun) {
    console.log(`⚠️  App directory already exists: ${appDir}`);
    console.log('   Use --dry-run to preview, or delete the directory first.');
    process.exit(1);
  }

  // Parse iOS source files
  console.log('\n📱 Parsing iOS source...');

  // Find and parse AppTabView
  const appTabViewPath = findFile(iosRoot, 'AppTabView.swift');
  let tabs = [];
  if (appTabViewPath) {
    const content = readFile(appTabViewPath);
    tabs = parseAppTabView(content);
    console.log(`   Found ${tabs.length} tabs`);
  } else {
    console.log('   ⚠️  AppTabView.swift not found - using default tabs');
    tabs = [
      { id: 'home', label: 'Home', icon: 'house', accessibilityId: 'tab-home' },
      { id: 'settings', label: 'Settings', icon: 'gear', accessibilityId: 'tab-settings' },
    ];
  }

  // Find and parse theme
  const themePath = findFile(iosRoot, 'PrototypeTheme.swift');
  let tokens = { spacing: {}, radii: {}, sizes: {}, opacity: {}, motion: {}, colors: { light: {}, dark: {} } };
  if (themePath) {
    const content = readFile(themePath);
    tokens = parsePrototypeTheme(content);
    console.log(`   Found ${Object.keys(tokens.colors.light).length} colors`);
  } else {
    console.log('   ⚠️  PrototypeTheme.swift not found - using defaults');
  }

  // Find and process fonts
  console.log('\n🔤 Processing fonts...');
  const fontInfo = findAndCopyFonts(iosRoot, appDir);

  // Create app directory structure
  console.log('\n📁 Creating app structure...');
  ensureDir(appDir);
  ensureDir(path.join(appDir, 'screens'));
  ensureDir(path.join(appDir, 'styles'));

  // Generate and write files
  console.log('\n📝 Generating files...');

  // config.js
  writeFile(path.join(appDir, 'config.js'), generateConfigJS(tabs, config.appName));

  // data.js
  writeFile(path.join(appDir, 'data.js'), generateDataJS(config.appName));

  // Individual screen files
  for (const tab of tabs) {
    const filename = `${camelToKebab(tab.label.replace(/\s+/g, ''))}.js`;
    writeFile(path.join(appDir, 'screens', filename), generateScreenJS(tab, config.appName));
  }

  // screens/index.js (loads all screens)
  const screenImports = tabs.map(t => {
    const filename = camelToKebab(t.label.replace(/\s+/g, ''));
    return `// ${t.label} screen loaded from ${filename}.js`;
  }).join('\n');
  writeFile(path.join(appDir, 'screens', 'index.js'), `// Screen loader for ${config.appName}\n// Individual screens are loaded via index.html\n\n${screenImports}\n`);

  // Theme CSS
  writeFile(
    path.join(appDir, 'styles', 'theme.css'),
    generateThemeCSS(tokens, fontInfo, config.appName)
  );

  // Update index.html
  console.log('\n🔧 Updating configuration...');
  updateIndexHTML(config.appName);

  // Update server.js
  updateServerJS(config.appName, iosRoot);

  // Summary
  console.log(`
╔════════════════════════════════════════════════════════════╗
║                    Import Complete!                        ║
╠════════════════════════════════════════════════════════════╣
║                                                            ║
║  Created:                                                  ║
║    apps/${config.appName}/                                          ║
║      ├── config.js                                         ║
║      ├── data.js                                           ║
║      ├── screens/                                          ║
${tabs.map(t => `║      │   └── ${camelToKebab(t.label.replace(/\s+/g, ''))}.js`.padEnd(61) + '║').join('\n')}
║      └── styles/                                           ║
║          └── theme.css                                     ║
${fontInfo.bundledFonts.length > 0 ? '║      └── fonts/                                            ║\n' : ''}║                                                            ║
║  Next steps:                                               ║
║    1. Start the dev server: node server.js                 ║
║    2. Open: http://localhost:8080?app=${config.appName.padEnd(20)}║
║    3. Customize the screen renderers                       ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
`);
}

runImport();
