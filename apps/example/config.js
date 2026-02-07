/**
 * Example App Configuration
 *
 * Minimal example demonstrating the app-ui-playground structure.
 * Use this as a template when creating new apps.
 */

// ============================================================
// Screen Registry
// ============================================================

const SCREEN_REGISTRY = {
  // Main tab screens (shown in bottom tab bar)
  tabs: [
    { id: 'home', label: 'Home', icon: 'house' },
    { id: 'list', label: 'Items', icon: 'list.bullet' },
    { id: 'settings', label: 'Settings', icon: 'gear' },
  ],

  // Detail screens (pushed onto navigation stack)
  details: [
    { id: 'item-detail', label: 'Item Detail', icon: 'doc.text', parent: 'list' },
  ],

  // Onboarding/welcome screens
  onboarding: [],

  // Utility screens (modals, sheets)
  utility: [],
};

// ============================================================
// App State
// ============================================================

const state = {
  // Add app-specific state here
};

// ============================================================
// Initialization
// ============================================================

function initExampleApp() {
  Navigation.configure({
    screenRegistry: SCREEN_REGISTRY,
    defaultTab: 'home',
  });

  initAppShell();
  render();
}

// ============================================================
// Rendering
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

function renderScreen(tabId) {
  switch (tabId) {
    case 'home':
      return renderHome();
    case 'list':
      return renderList();
    case 'settings':
      return renderSettings();
    default:
      return `
        <div class="empty-state">
          <span class="empty-state-title">Coming soon</span>
        </div>
      `;
  }
}

function renderSpecialScreen(screenId) {
  // Handle special screens (onboarding, modals, etc.)
  return `
    <div class="empty-state">
      <span class="empty-state-title">${screenId}</span>
    </div>
  `;
}

// ============================================================
// Initialize on DOM ready
// ============================================================

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initExampleApp);
} else {
  initExampleApp();
}
