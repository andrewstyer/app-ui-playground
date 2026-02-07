// Navigation system for iOS-style UI playground
// Provides tab bar navigation with push/pop screen navigation

// ============================================================
// Navigation State
// ============================================================

/**
 * Navigation state management
 * Apps should call Navigation.configure() to set up their screens
 */
const Navigation = {
  // Screen registry (configured per-app)
  screenRegistry: null,

  // Current active tab
  activeTab: 'home',

  // Navigation stacks per tab (for push/pop within tabs)
  stacks: {},

  // Screen panel visibility
  screenPanelOpen: false,

  // Current special screen (overrides tab navigation)
  specialScreen: null,

  // ============================================================
  // Configuration
  // ============================================================

  /**
   * Configure navigation with app-specific screen registry
   * @param {Object} config - Configuration object
   * @param {Object} config.screenRegistry - Screen registry with tabs, details, onboarding, utility
   * @param {string} config.defaultTab - Default tab ID (defaults to first tab)
   */
  configure(config) {
    this.screenRegistry = config.screenRegistry;

    // Initialize stacks for each tab
    this.stacks = {};
    if (this.screenRegistry?.tabs) {
      this.screenRegistry.tabs.forEach(tab => {
        this.stacks[tab.id] = [];
      });
    }

    // Set default tab
    this.activeTab = config.defaultTab || (this.screenRegistry?.tabs?.[0]?.id || 'home');

    // Render tab bar now that registry is set
    this._renderTabBar();
  },

  // ============================================================
  // Tab Navigation
  // ============================================================

  /**
   * Switch to a tab
   * @param {string} tabId - Tab identifier
   */
  switchTab(tabId) {
    if (!this.stacks[tabId]) return;
    this.activeTab = tabId;
    this.specialScreen = null;
    this._render();
  },

  /**
   * Get the current navigation stack for active tab
   * @returns {Array} Current stack
   */
  currentStack() {
    return this.stacks[this.activeTab] || [];
  },

  // ============================================================
  // Stack Navigation (push/pop within tabs)
  // ============================================================

  /**
   * Push a view onto the current tab's stack
   * @param {Function} viewFn - Function that returns HTML for the view
   */
  push(viewFn) {
    this.currentStack().push(viewFn);
    this._render();
  },

  /**
   * Pop the top view from the current tab's stack
   */
  pop() {
    this.currentStack().pop();
    this._render();
  },

  /**
   * Clear the current tab's navigation stack
   */
  popToRoot() {
    this.stacks[this.activeTab] = [];
    this._render();
  },

  // ============================================================
  // Direct Screen Navigation
  // ============================================================

  /**
   * Navigate directly to any screen by ID
   * @param {string} screenId - Screen identifier from screen registry
   * @param {Object} params - Optional parameters for the screen
   */
  navigateTo(screenId, params = {}) {
    if (!this.screenRegistry) return;

    // Check if it's a tab
    const tab = this.screenRegistry.tabs?.find(t => t.id === screenId);
    if (tab) {
      this.switchTab(screenId);
      return;
    }

    // Check if it's a detail screen
    const detail = this.screenRegistry.details?.find(d => d.id === screenId);
    if (detail) {
      // Switch to parent tab first
      if (detail.parent) {
        this.activeTab = detail.parent;
      }
      // Push the detail view
      this.push(() => this._renderDetailScreen(screenId, params));
      return;
    }

    // Check if it's an onboarding screen
    const onboarding = this.screenRegistry.onboarding?.find(o => o.id === screenId);
    if (onboarding) {
      this.specialScreen = { type: 'onboarding', id: screenId, page: onboarding.page };
      this._render();
      return;
    }

    // Check if it's a utility screen
    const utility = this.screenRegistry.utility?.find(u => u.id === screenId);
    if (utility) {
      this.specialScreen = { type: 'utility', id: screenId };
      this._render();
      return;
    }
  },

  /**
   * Exit special screen mode and return to tabs
   */
  exitSpecialScreen() {
    this.specialScreen = null;
    this._render();
  },

  // ============================================================
  // Screen Panel (Developer Navigation)
  // ============================================================

  /**
   * Toggle the screen navigation panel visibility
   */
  toggleScreenPanel() {
    this.screenPanelOpen = !this.screenPanelOpen;
    this._renderScreenPanel();
  },

  /**
   * Close the screen navigation panel
   */
  closeScreenPanel() {
    this.screenPanelOpen = false;
    this._renderScreenPanel();
  },

  // ============================================================
  // Rendering
  // ============================================================

  /**
   * Trigger a full render
   */
  _render() {
    // Close panel when navigating
    this.closeScreenPanel();

    // Delegate to app.js render if it exists
    if (typeof render === 'function') {
      render();
    }
    this._renderTabBar();
  },

  /**
   * Render the tab bar
   */
  _renderTabBar() {
    const bar = document.getElementById('tab-bar');
    if (!bar || !this.screenRegistry?.tabs) return;

    // Hide tab bar if in special screen mode
    if (this.specialScreen) {
      bar.classList.add('hidden');
      return;
    }
    bar.classList.remove('hidden');

    bar.innerHTML = `
      ${this.screenRegistry.tabs.map(tab => `
        <button
          class="tab-item ${this.activeTab === tab.id ? 'active' : ''}"
          onclick="Navigation.switchTab('${tab.id}')"
          aria-label="${tab.label}"
          ${tab.accessibilityId ? `data-testid="${tab.accessibilityId}"` : ''}
        >
          ${icon(tab.icon, 22)}
          <span class="tab-label">${tab.label}</span>
        </button>
      `).join('')}
    `;
  },

  /**
   * Render the screen navigation panel
   */
  _renderScreenPanel() {
    let panel = document.getElementById('screen-panel');
    let overlay = document.getElementById('screen-panel-overlay');

    // Create elements if they don't exist
    if (!panel) {
      panel = document.createElement('div');
      panel.id = 'screen-panel';
      panel.className = 'screen-panel';
      document.body.appendChild(panel);
    }

    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'screen-panel-overlay';
      overlay.className = 'screen-panel-overlay';
      overlay.onclick = () => this.closeScreenPanel();
      document.body.appendChild(overlay);
    }

    if (this.screenPanelOpen) {
      panel.classList.add('open');
      overlay.classList.add('visible');
      panel.innerHTML = this._renderScreenPanelContent();
    } else {
      panel.classList.remove('open');
      overlay.classList.remove('visible');
    }
  },

  /**
   * Render the screen panel content
   */
  _renderScreenPanelContent() {
    if (!this.screenRegistry) {
      return `
        <div class="screen-panel-header">
          <span class="screen-panel-title">All Screens</span>
          <button class="screen-panel-close" onclick="Navigation.closeScreenPanel()">
            ${icon('xmark', 16)}
          </button>
        </div>
        <div class="empty-state">
          <div class="empty-state-title">No screens configured</div>
        </div>
      `;
    }

    let content = `
      <div class="screen-panel-header">
        <span class="screen-panel-title">All Screens</span>
        <button class="screen-panel-close" onclick="Navigation.closeScreenPanel()">
          ${icon('xmark', 16)}
        </button>
      </div>
    `;

    // Main tabs
    if (this.screenRegistry.tabs?.length) {
      content += `
        <div class="screen-panel-section">
          <div class="screen-panel-section-title">Main Tabs</div>
          ${this.screenRegistry.tabs.map(screen => `
            <button class="screen-panel-item ${this.activeTab === screen.id && !this.specialScreen ? 'active' : ''}" onclick="Navigation.navigateTo('${screen.id}')">
              <span class="screen-panel-item-icon">${icon(screen.icon, 18)}</span>
              <span class="screen-panel-item-label">${screen.label}</span>
            </button>
          `).join('')}
        </div>
      `;
    }

    // Detail screens
    if (this.screenRegistry.details?.length) {
      content += `
        <div class="screen-panel-section">
          <div class="screen-panel-section-title">Detail Screens</div>
          ${this.screenRegistry.details.map(screen => `
            <button class="screen-panel-item" onclick="Navigation.navigateTo('${screen.id}', { demo: true })">
              <span class="screen-panel-item-icon">${icon(screen.icon, 18)}</span>
              <span class="screen-panel-item-label">${screen.label}</span>
              <span class="screen-panel-item-hint">${screen.parent}</span>
            </button>
          `).join('')}
        </div>
      `;
    }

    // Onboarding screens
    if (this.screenRegistry.onboarding?.length) {
      content += `
        <div class="screen-panel-section">
          <div class="screen-panel-section-title">Onboarding</div>
          ${this.screenRegistry.onboarding.map(screen => `
            <button class="screen-panel-item ${this.specialScreen?.id === screen.id ? 'active' : ''}" onclick="Navigation.navigateTo('${screen.id}')">
              <span class="screen-panel-item-icon">${icon(screen.icon, 18)}</span>
              <span class="screen-panel-item-label">${screen.label}</span>
            </button>
          `).join('')}
        </div>
      `;
    }

    // Utility screens
    if (this.screenRegistry.utility?.length) {
      content += `
        <div class="screen-panel-section">
          <div class="screen-panel-section-title">Utility</div>
          ${this.screenRegistry.utility.map(screen => `
            <button class="screen-panel-item ${this.specialScreen?.id === screen.id ? 'active' : ''}" onclick="Navigation.navigateTo('${screen.id}')">
              <span class="screen-panel-item-icon">${icon(screen.icon, 18)}</span>
              <span class="screen-panel-item-label">${screen.label}</span>
            </button>
          `).join('')}
        </div>
      `;
    }

    return content;
  },

  /**
   * Render a detail screen by ID
   * Apps can override this by defining renderDetailScreen globally
   * @param {string} screenId - Screen ID
   * @param {Object} params - Screen parameters
   */
  _renderDetailScreen(screenId, params) {
    // Check for app-defined detail renderer
    if (typeof renderDetailScreen === 'function') {
      return renderDetailScreen(screenId, params);
    }

    // Default demo screen
    return this._renderDemoDetailScreen('Detail Screen', 'doc.text', 'Detail content would appear here');
  },

  /**
   * Render a demo/placeholder detail screen
   */
  _renderDemoDetailScreen(title, iconName, description) {
    return `
      ${typeof renderNavBar === 'function' ? renderNavBar(title, { back: true }) : `
        <div class="nav-bar">
          <button class="nav-bar-back" onclick="Navigation.pop()">${icon('chevron.left', 20)} Back</button>
          <span class="nav-bar-title">${title}</span>
          <div style="min-width:44px"></div>
        </div>
      `}
      <div class="empty-state">
        <div class="empty-state-icon">${icon(iconName, 64)}</div>
        <div class="empty-state-title">${title}</div>
        <div class="empty-state-desc">${description}</div>
      </div>
    `;
  },

  /**
   * Get current screen info for the active state
   * @returns {Object} Current screen info
   */
  getCurrentScreen() {
    if (this.specialScreen) {
      return {
        type: this.specialScreen.type,
        id: this.specialScreen.id,
        ...this.specialScreen,
      };
    }

    const stack = this.currentStack();
    if (stack.length > 0) {
      return {
        type: 'detail',
        tab: this.activeTab,
        depth: stack.length,
      };
    }

    return {
      type: 'tab',
      id: this.activeTab,
    };
  },
};

// ============================================================
// Screen Panel Toggle Button
// ============================================================

function renderScreenPanelToggle() {
  let toggle = document.getElementById('screen-panel-toggle');
  if (!toggle) {
    toggle = document.createElement('button');
    toggle.id = 'screen-panel-toggle';
    toggle.className = 'screen-panel-toggle';
    toggle.onclick = () => Navigation.toggleScreenPanel();
    toggle.innerHTML = icon('rectangle.3.group', 18);
    toggle.setAttribute('aria-label', 'Open screen navigator');
    toggle.setAttribute('title', 'All Screens');
    document.body.appendChild(toggle);
  }
}

// ============================================================
// Initialize
// ============================================================

function initNavigation() {
  // Render initial tab bar
  Navigation._renderTabBar();

  // Add screen panel toggle button
  renderScreenPanelToggle();
}

// Auto-init when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initNavigation);
} else {
  initNavigation();
}
