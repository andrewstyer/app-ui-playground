/**
 * Settings Screen
 */

function renderSettings() {
  return `
    <div class="screen-header">
      <div class="screen-title">Settings</div>
    </div>

    <div class="list-section" style="margin: var(--spacing-md);">
      <div class="list-section-header">Appearance</div>

      <div class="list-row" onclick="toggleTheme()">
        <div class="list-row-icon" style="background: rgba(var(--color-accent-rgb), 0.1);">
          ${icon('moon', 20)}
        </div>
        <div class="list-row-content">
          <div class="list-row-title">Dark Mode</div>
          <div class="list-row-subtitle">Toggle light/dark appearance</div>
        </div>
        <div class="list-row-chevron">${icon('chevron.right', 14)}</div>
      </div>
    </div>

    <div class="list-section" style="margin: var(--spacing-md);">
      <div class="list-section-header">About</div>

      <div class="list-row">
        <div class="list-row-content">
          <div class="list-row-title">Version</div>
        </div>
        <div class="list-row-value">1.0.0</div>
      </div>

      <div class="list-row">
        <div class="list-row-content">
          <div class="list-row-title">Framework</div>
        </div>
        <div class="list-row-value">app-ui-playground</div>
      </div>
    </div>
  `;
}
