/**
 * Home Screen
 */

function renderHome() {
  return `
    <div class="screen-header">
      <div class="screen-title">Home</div>
    </div>

    <div class="card" style="margin: var(--spacing-md);">
      <div class="card-header">
        <span class="card-title">Welcome</span>
      </div>
      <div class="card-body">
        <p style="color: var(--color-foreground-secondary); margin: 0;">
          This is a minimal example app demonstrating the app-ui-playground structure.
        </p>
      </div>
    </div>

    <div class="list-section" style="margin: var(--spacing-md);">
      <div class="list-section-header">Quick Actions</div>

      <div class="list-row" onclick="Navigation.switchTab('list')">
        <div class="list-row-icon" style="background: rgba(var(--color-accent-rgb), 0.1);">
          ${icon('list.bullet', 20)}
        </div>
        <div class="list-row-content">
          <div class="list-row-title">View Items</div>
          <div class="list-row-subtitle">Browse the item list</div>
        </div>
        <div class="list-row-chevron">${icon('chevron.right', 14)}</div>
      </div>

      <div class="list-row" onclick="Navigation.switchTab('settings')">
        <div class="list-row-icon" style="background: rgba(var(--color-foreground-secondary-rgb), 0.1);">
          ${icon('gear', 20)}
        </div>
        <div class="list-row-content">
          <div class="list-row-title">Settings</div>
          <div class="list-row-subtitle">Configure the app</div>
        </div>
        <div class="list-row-chevron">${icon('chevron.right', 14)}</div>
      </div>
    </div>
  `;
}
