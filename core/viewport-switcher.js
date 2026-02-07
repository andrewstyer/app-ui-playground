// Viewport Switcher - Device preset buttons for the style playground
// Allows quick switching between iPhone/iPad portrait/landscape sizes and zoom levels

// ============================================================
// Device Presets
// ============================================================

const DEVICE_PRESETS = [
  {
    id: 'iphone-portrait',
    label: 'iPhone Portrait',
    shortLabel: 'iPhone',
    icon: 'iphone',
    width: 430,
    height: 932,
    isLandscape: false,
  },
  {
    id: 'iphone-landscape',
    label: 'iPhone Landscape',
    shortLabel: 'iPhone',
    icon: 'iphone.landscape',
    width: 932,
    height: 430,
    isLandscape: true,
  },
  {
    id: 'ipad-portrait',
    label: 'iPad 11" Portrait',
    shortLabel: 'iPad',
    icon: 'ipad',
    width: 834,
    height: 1194,
    isLandscape: false,
  },
  {
    id: 'ipad-landscape',
    label: 'iPad 11" Landscape',
    shortLabel: 'iPad',
    icon: 'ipad.landscape',
    width: 1194,
    height: 834,
    isLandscape: true,
  },
  {
    id: 'auto',
    label: 'Auto (Responsive)',
    shortLabel: 'Auto',
    icon: 'arrow.up.left.and.arrow.down.right',
    width: null,
    height: null,
    isLandscape: false,
  },
];

// ============================================================
// Scale Presets
// ============================================================

const SCALE_PRESETS = [
  { id: 'scale-100', label: '100%', value: 1.0 },
  { id: 'scale-75', label: '75%', value: 0.75 },
  { id: 'scale-50', label: '50%', value: 0.5 },
];

// ============================================================
// Sync Feature
// ============================================================

const SyncFeature = {
  isSyncing: false,
  lastSyncResult: null,

  /**
   * Trigger sync from iOS app
   */
  async sync() {
    if (this.isSyncing) return;

    this.isSyncing = true;
    this.updateSyncButton();

    try {
      const response = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ app: APP_NAME }),
      });

      const result = await response.json();
      this.lastSyncResult = result;

      if (result.success) {
        this.showNotification('Synced from iOS', 'success');
        // Reload the page to pick up changes
        setTimeout(() => window.location.reload(), 500);
      } else {
        this.showNotification('Sync failed: ' + (result.error || 'Unknown error'), 'error');
      }
    } catch (error) {
      // If the API isn't available (using python -m http.server), show a helpful message
      this.showNotification('Sync unavailable. Use: node server.js', 'error');
      this.lastSyncResult = { success: false, error: error.message };
    } finally {
      this.isSyncing = false;
      this.updateSyncButton();
    }
  },

  /**
   * Update sync button state
   */
  updateSyncButton() {
    const btn = document.querySelector('.viewport-sync-btn');
    if (!btn) return;

    if (this.isSyncing) {
      btn.classList.add('syncing');
      btn.disabled = true;
      btn.title = 'Syncing...';
    } else {
      btn.classList.remove('syncing');
      btn.disabled = false;
      btn.title = 'Sync from iOS';
    }
  },

  /**
   * Show a notification toast
   */
  showNotification(message, type = 'info') {
    // Remove existing notification
    const existing = document.querySelector('.sync-notification');
    if (existing) existing.remove();

    const notification = document.createElement('div');
    notification.className = `sync-notification sync-notification-${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);

    // Animate in
    requestAnimationFrame(() => notification.classList.add('visible'));

    // Auto-dismiss after 3 seconds
    setTimeout(() => {
      notification.classList.remove('visible');
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  },

  /**
   * Render the sync button HTML
   */
  renderButton() {
    return `
      <button
        class="viewport-btn viewport-sync-btn"
        onclick="SyncFeature.sync()"
        title="Sync from iOS"
        aria-label="Sync from iOS app"
      >
        ${icon('arrow.triangle.2.circlepath', 16)}
      </button>
    `;
  },
};

// ============================================================
// Viewport State
// ============================================================

const ViewportSwitcher = {
  currentPreset: 'auto',
  currentScale: 1.0,

  /**
   * Switch to a device preset
   * @param {string} presetId - Device preset ID
   */
  switchPreset(presetId) {
    const preset = DEVICE_PRESETS.find(p => p.id === presetId);
    if (!preset) return;

    this.currentPreset = presetId;
    this.applyPreset(preset);
    this.applyScale(this.currentScale);
    this.updateButtons();
  },

  /**
   * Switch to a scale preset
   * @param {number} scale - Scale value (0.5, 0.75, 1.0)
   */
  switchScale(scale) {
    this.currentScale = scale;
    this.applyScale(scale);
    this.updateButtons();
  },

  /**
   * Apply a device preset to the #app container
   * @param {Object} preset - Device preset object
   */
  applyPreset(preset) {
    const app = document.getElementById('app');
    if (!app) return;

    if (preset.id === 'auto') {
      // Remove inline styles, let CSS media queries handle it
      app.style.removeProperty('width');
      app.style.removeProperty('height');
      app.style.removeProperty('max-width');
      app.style.removeProperty('max-height');
      document.body.classList.remove('viewport-fixed');
    } else {
      // Apply fixed dimensions
      app.style.width = `${preset.width}px`;
      app.style.height = `${preset.height}px`;
      app.style.maxWidth = `${preset.width}px`;
      app.style.maxHeight = `${preset.height}px`;
      document.body.classList.add('viewport-fixed');
    }
  },

  /**
   * Apply scale transform to the #app container
   * @param {number} scale - Scale value
   */
  applyScale(scale) {
    const app = document.getElementById('app');
    if (!app) return;

    if (scale === 1.0) {
      app.style.removeProperty('transform');
      app.style.removeProperty('transform-origin');
      document.body.classList.remove('viewport-scaled');
    } else {
      app.style.transform = `scale(${scale})`;
      app.style.transformOrigin = 'top center';
      document.body.classList.add('viewport-scaled');
    }
  },

  /**
   * Update button active states
   */
  updateButtons() {
    // Update device preset buttons
    const deviceButtons = document.querySelectorAll('.viewport-btn[data-preset]');
    deviceButtons.forEach(btn => {
      const isActive = btn.dataset.preset === this.currentPreset;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-pressed', isActive);
    });

    // Update scale buttons
    const scaleButtons = document.querySelectorAll('.viewport-btn[data-scale]');
    scaleButtons.forEach(btn => {
      const isActive = parseFloat(btn.dataset.scale) === this.currentScale;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-pressed', isActive);
    });
  },

  /**
   * Render the viewport switcher UI
   */
  render() {
    let container = document.getElementById('viewport-switcher');

    if (!container) {
      container = document.createElement('div');
      container.id = 'viewport-switcher';
      container.className = 'viewport-switcher';
      container.setAttribute('role', 'toolbar');
      container.setAttribute('aria-label', 'Device viewport presets');
      document.body.appendChild(container);
    }

    // Device presets
    const deviceButtons = DEVICE_PRESETS.map(preset => `
      <button
        class="viewport-btn ${preset.id === this.currentPreset ? 'active' : ''}"
        data-preset="${preset.id}"
        onclick="ViewportSwitcher.switchPreset('${preset.id}')"
        title="${preset.label}"
        aria-label="${preset.label}"
        aria-pressed="${preset.id === this.currentPreset}"
      >
        ${icon(preset.icon, 16)}
      </button>
    `).join('');

    // Divider
    const divider = '<span class="viewport-divider"></span>';

    // Scale presets
    const scaleButtons = SCALE_PRESETS.map(scale => `
      <button
        class="viewport-btn viewport-scale-btn ${scale.value === this.currentScale ? 'active' : ''}"
        data-scale="${scale.value}"
        onclick="ViewportSwitcher.switchScale(${scale.value})"
        title="Scale ${scale.label}"
        aria-label="Scale ${scale.label}"
        aria-pressed="${scale.value === this.currentScale}"
      >
        <span class="viewport-scale-label">${scale.label}</span>
      </button>
    `).join('');

    // Sync button
    const syncButton = SyncFeature.renderButton();

    container.innerHTML = deviceButtons + divider + scaleButtons + divider + syncButton;
  },

  /**
   * Initialize the viewport switcher
   */
  init() {
    this.render();
  },
};

// Auto-init when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => ViewportSwitcher.init());
} else {
  ViewportSwitcher.init();
}
