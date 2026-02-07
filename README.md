# App UI Playground

A standalone utility for prototyping iOS-style app UIs in the browser. Create high-fidelity mockups with working navigation, dark mode support, and device viewport simulation.

## Recommended Claude Code Skills

For the best UI prototyping experience, install these skills:

```bash
/install-skill frontend-design      # Distinctive, production-grade interfaces
/install-skill interaction-design   # Microinteractions and motion design
/install-skill baseline-ui          # Prevents AI-generated UI slop
/install-skill ui-ux-pro-max        # Design intelligence with styles and palettes
```

The dev server will check for these skills on startup and remind you if any are missing.

## Quick Start

```bash
cd ~/dev/app-ui-playground

# Development server (enables sync button)
node server.js

# Or any static server (sync button won't work)
python -m http.server 8080

# Open in browser
open http://localhost:8080
```

## Usage

### Default App (Example)
```
http://localhost:8080
```

### Specific App
```
http://localhost:8080?app=example
http://localhost:8080?app=my-imported-app
```

## Directory Structure

```
app-ui-playground/
├── core/                    # Framework (reusable across apps)
│   ├── theme.css           # Design tokens (colors, spacing, typography)
│   ├── components.css      # Component primitives (buttons, cards, modals)
│   ├── icons.js            # SF Symbol SVG icon system
│   ├── navigation.js       # Tab bar, push/pop navigation
│   ├── viewport-switcher.js # Device preview controls
│   └── app-shell.js        # Theme toggle, sheet system, utilities
│
├── apps/                    # App-specific implementations
│   └── example/            # Minimal example app
│       ├── config.js       # Screen registry, app initialization
│       ├── data.js         # Sample data
│       ├── screens/        # Screen renderers
│       │   ├── home.js
│       │   ├── list.js
│       │   └── settings.js
│       └── styles/         # App-specific CSS
│           └── app.css
│
├── scripts/                 # CLI tools
│   ├── import-ios-app.js   # Import and scaffold from iOS project
│   ├── sync-from-ios.js    # Sync tokens/screens from iOS
│   └── visual-regression.js # Screenshot comparison
│
├── index.html              # Entry point with app loader
├── server.js               # Dev server with sync API
└── README.md               # This file
```

## Creating a New App

### 1. Create the App Directory

```bash
mkdir -p apps/my-app/{screens,styles}
```

### 2. Create config.js

Define your screen registry and initialize the app:

```javascript
// apps/my-app/config.js

const SCREEN_REGISTRY = {
  tabs: [
    { id: 'home', label: 'Home', icon: 'house' },
    { id: 'profile', label: 'Profile', icon: 'person' },
    { id: 'settings', label: 'Settings', icon: 'gear' },
  ],
  details: [
    { id: 'item-detail', label: 'Item Detail', icon: 'doc.text', parent: 'home' },
  ],
  onboarding: [],
  utility: [],
};

const state = {
  // Your app state here
};

function initMyApp() {
  Navigation.configure({
    screenRegistry: SCREEN_REGISTRY,
    defaultTab: 'home',
  });
  initAppShell();
  render();
}

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

function renderScreen(tabId) {
  switch (tabId) {
    case 'home': return renderHome();
    case 'profile': return renderProfile();
    case 'settings': return renderSettings();
    default: return '<div class="empty-state"><span class="empty-state-title">Coming soon</span></div>';
  }
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initMyApp);
} else {
  initMyApp();
}
```

### 3. Create data.js

```javascript
// apps/my-app/data.js

const DATA = {
  items: [
    { id: '1', title: 'First Item', description: 'Description here' },
    { id: '2', title: 'Second Item', description: 'Another description' },
  ],
};
```

### 4. Create Screen Renderers

```javascript
// apps/my-app/screens/home.js

function renderHome() {
  return `
    <div class="screen-header">
      <div class="screen-title">Home</div>
    </div>
    <div class="list-row" onclick="pushView(() => renderItemDetail('1'))">
      <div class="list-row-content">
        <div class="list-row-title">First Item</div>
        <div class="list-row-subtitle">Tap to view details</div>
      </div>
      <div class="list-row-chevron">${icon('chevron.right', 14)}</div>
    </div>
  `;
}

function renderItemDetail(id) {
  const item = DATA.items.find(i => i.id === id);
  return `
    ${renderNavBar(item.title, { back: true })}
    <div class="detail-section">
      <p>${item.description}</p>
    </div>
  `;
}
```

### 5. Update index.html Script Loader

Add your app's scripts to the `loadAppScripts` function in index.html:

```javascript
case 'my-app':
  scripts.push(
    `${appDir}/data.js`,
    `${appDir}/screens/home.js`,
    `${appDir}/screens/profile.js`,
    `${appDir}/screens/settings.js`,
    `${appDir}/config.js`
  );
  break;
```

### 6. Access Your App

```
http://localhost:8080?app=my-app
```

## Features

### Navigation
- **Tab Bar**: iOS-style bottom navigation
- **Push/Pop**: Stack-based navigation within tabs
- **Screen Panel**: Developer tool to jump to any screen

### Theming
- **Light/Dark Mode**: Toggle with button or auto-detect
- **Design Tokens**: Consistent spacing, colors, typography via CSS variables

### Viewport Simulation
- Device presets (iPhone SE, iPhone Pro, iPad)
- Scale options (100%, 75%, 50%)

### Components
- Cards, lists, badges, chips
- Sheets and modals
- Search bars and filter chips
- Segmented controls
- Empty states
- Loading states

## Core API

### Navigation

```javascript
// Switch tabs
Navigation.switchTab('timeline');

// Push a detail view
Navigation.push(() => renderEventDetail(eventId));

// Pop back
Navigation.pop();

// Direct navigation
Navigation.navigateTo('welcome-1');
```

### Sheets

```javascript
// Show a sheet
showSheet(() => `
  <div class="sheet-header">
    <span class="sheet-title">Title</span>
    <button class="sheet-close" onclick="dismissSheet()">${icon('xmark', 14)}</button>
  </div>
  <div class="sheet-body">Content here</div>
`);

// Dismiss
dismissSheet();
```

### Icons

```javascript
// SF Symbol icons (returns SVG)
icon('calendar', 20)  // name, size
icon('heart.fill', 24)
```

### Shared Components

```javascript
renderNavBar('Title', { back: true, actions: '...' })
renderBadge('Label', 'var(--color-accent)')
renderSearchBar('Search events')
renderFilterBar([{ label: 'All', selected: true }, { label: 'Active' }])
renderSegmentedControl([{ id: 'list', label: 'List' }, { id: 'grid', label: 'Grid' }], 'list', 'setView')
```

## Design Tokens

All visual values are defined as CSS custom properties in `core/theme.css`:

### Colors
```css
--color-background
--color-foreground
--color-accent
--color-success
--color-warning
--color-destructive
```

### Spacing
```css
--spacing-xxs: 2px
--spacing-xs: 4px
--spacing-sm: 8px
--spacing-md: 16px
--spacing-lg: 24px
--spacing-xl: 32px
```

### Typography
```css
--font-display-large
--font-title-medium
--font-headline
--font-body
--font-caption
```

## Syncing from iOS App

The playground can sync its screen structure and design tokens from an iOS app source.

### In-Browser Sync

When using the dev server (`node server.js`), click the **sync button** (↻) in the viewport toolbar to sync from iOS. The page will reload automatically with your changes.

### CLI Usage

```bash
# Dry run (preview changes)
node scripts/sync-from-ios.js --ios-path ../my-app/MyApp --app my-app --dry-run

# Sync everything
node scripts/sync-from-ios.js --ios-path ../my-app/MyApp --app my-app

# Sync only design tokens
node scripts/sync-from-ios.js --ios-path ../my-app/MyApp --app my-app --tokens-only

# Sync only screen structure
node scripts/sync-from-ios.js --ios-path ../my-app/MyApp --app my-app --screens-only
```

### What Gets Synced

**Screen Structure** (→ `apps/{app}/config.js`):
- Tab definitions from `AppTabView.swift` (labels, icons, accessibility IDs)
- Detail screen registry based on known patterns

**Design Tokens** (→ `core/theme.css`):
- Spacing values from `PrototypeTheme.swift`
- Radii values
- Size values (icons, touch targets, thumbnails)
- Motion values (animation durations)
- Opacity values

### Sync Markers

The script updates content between these markers in `theme.css`:

```css
/* === SYNCED FROM iOS (START) === */
/* Spacing, radii, sizes, motion, opacity */
/* === SYNCED FROM iOS (END) === */
```

### Adding Support for a New iOS App

Use the import script to automatically scaffold a new app:

```bash
# Preview what will be created
node scripts/import-ios-app.js --ios-path ../my-app/MyApp --app my-app --dry-run

# Run the import
node scripts/import-ios-app.js --ios-path ../my-app/MyApp --app my-app
```

The importer will:
1. Parse `AppTabView.swift` for tab structure
2. Parse `PrototypeTheme.swift` for colors and tokens
3. Find bundled fonts in Info.plist and copy them (or fall back to Google Fonts)
4. Create stub screen renderers for each tab
5. Update `index.html` and `server.js` with the new app config

After import:
```bash
node server.js
open http://localhost:8080?app=my-app
```

### Manual Setup (Alternative)

If you prefer manual setup:

1. Create the app directory structure in `apps/`
2. Ensure the iOS app has:
   - `AppTabView.swift` with Label/tag/accessibilityIdentifier patterns
   - `PrototypeTheme.swift` with token definitions
3. Add the app config to `server.js`:
   ```javascript
   const APP_CONFIGS = {
     'my-app': { iosPath: '../my-app/MyApp' },
   };
   ```
4. Run sync via the button or CLI

## Visual Regression Testing

Compare iOS Simulator screenshots with web playground screenshots to catch visual drift.

### Quick Start

```bash
# Full comparison (captures iOS + web, then compares)
node scripts/visual-regression.js --app my-app --ios-project ../my-app

# Just capture web screenshots (faster iteration)
node scripts/visual-regression.js --app my-app --web-only

# Compare existing screenshots
node scripts/visual-regression.js --app my-app --compare-only

# Run after sync
node scripts/sync-from-ios.js --ios-path ../my-app/MyApp --app my-app --visual-test
```

### Options

| Option | Description |
|--------|-------------|
| `--app <name>` | App name (required) |
| `--ios-project <path>` | Path to iOS project root |
| `--threshold <0-1>` | Pixel difference threshold (default: 0.1 = 10%) |
| `--simulator <name>` | iOS Simulator name (default: "iPhone 16 Pro") |
| `--web-only` | Only capture web screenshots |
| `--ios-only` | Only capture iOS screenshots |
| `--compare-only` | Only compare existing screenshots |
| `--dark` | Capture dark mode screenshots |

### How It Works

1. **iOS Screenshots**: Generates an XCUITest that navigates to each screen using accessibility IDs and captures screenshots
2. **Web Screenshots**: Uses Puppeteer to navigate the playground and capture matching screenshots
3. **Comparison**: Uses pixelmatch for structural comparison with configurable tolerance
4. **Report**: Generates an HTML report with side-by-side comparisons and diff highlighting

Screenshots are stored in `apps/{app}/snapshots/`:
- `ios/` - iOS Simulator screenshots
- `web/` - Web playground screenshots
- `diff/` - Diff images highlighting changes
- `report.html` - Visual comparison report

### Setting Up iOS Screenshots

The script generates `VisualRegressionTests.swift`. To use it:

1. Add the generated test file to your iOS project as a UI Test target
2. Run: `xcodebuild test -scheme YourScheme -destination 'platform=iOS Simulator,name=iPhone 16 Pro' -only-testing:VisualRegressionTests`
3. Extract screenshots from test results

Or use simctl for manual capture:
```bash
xcrun simctl io booted screenshot path/to/screenshot.png
```

## License

MIT
