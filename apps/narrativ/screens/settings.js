// Settings screen renderer - matches MoreView.swift exactly

/**
 * Renders the Settings screen.
 * Matches the iOS MoreView with:
 * - NavigationStack with title "Settings"
 * - Grouped List style (NOT plain)
 * - Sections with uppercase caption headers
 * - Rows with colored icon containers
 * - backgroundSecondary for grouped rows with large radius
 */
function renderSettings() {
  return `
    <div class="screen-header">
      <div class="screen-title">Settings</div>
    </div>
    <div class="settings-list">
      ${renderSettingsDataSection()}
      ${renderSettingsPreferencesSection()}
      ${renderSettingsCategoriesSection()}
      ${renderSettingsExtractionSection()}
      ${renderSettingsHealthSection()}
    </div>
    <div style="height: var(--spacing-lg)"></div>
  `;
}

/**
 * Renders the Data section.
 * Matches MoreView.dataSection with CurrentModeRow and ClearDataButton.
 */
function renderSettingsDataSection() {
  return `
    <div class="settings-section">
      <div class="settings-section-header">Data</div>
      <div class="settings-group">
        <div class="settings-row">
          <div class="settings-row-icon" style="background: var(--color-accent-secondary); color: var(--color-accent);">
            ${icon('square.grid.2x2', 18)}
          </div>
          <div class="settings-row-content">
            <div class="settings-row-title">Current Mode</div>
            <div class="settings-row-subtitle">Sample Data</div>
          </div>
          ${icon('chevron.right', 16)}
        </div>
        <div class="settings-row" style="color: var(--color-destructive);">
          <div class="settings-row-icon" style="background: color-mix(in srgb, var(--color-destructive) 15%, transparent); color: var(--color-destructive);">
            ${icon('trash', 18)}
          </div>
          <div class="settings-row-content">
            <div class="settings-row-title" style="color: var(--color-destructive);">Clear Data</div>
            <div class="settings-row-subtitle">Delete all local data</div>
          </div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Renders the Preferences section.
 * Matches MoreView.preferencesSection with AppearanceModeRow, ModeSwitchWarningToggle, ReplayWelcomeRow.
 */
function renderSettingsPreferencesSection() {
  return `
    <div class="settings-section">
      <div class="settings-section-header">Preferences</div>
      <div class="settings-group">
        <div class="settings-row">
          <div class="settings-row-icon" style="background: color-mix(in srgb, var(--color-success) 15%, transparent); color: var(--color-success);">
            ${icon('sun.max', 18)}
          </div>
          <div class="settings-row-content">
            <div class="settings-row-title">Appearance</div>
            <div class="settings-row-subtitle">System</div>
          </div>
          ${icon('chevron.right', 16)}
        </div>
        <div class="settings-row">
          <div class="settings-row-icon" style="background: color-mix(in srgb, var(--color-warning) 15%, transparent); color: var(--color-warning);">
            ${icon('exclamationmark.triangle', 18)}
          </div>
          <div class="settings-row-content">
            <div class="settings-row-title">Mode Switch Warning</div>
            <div class="settings-row-subtitle">Show confirmation dialog</div>
          </div>
          <div class="settings-toggle active"></div>
        </div>
        <div class="settings-row">
          <div class="settings-row-icon" style="background: color-mix(in srgb, var(--color-category-surgery) 15%, transparent); color: var(--color-category-surgery);">
            ${icon('play', 18)}
          </div>
          <div class="settings-row-content">
            <div class="settings-row-title">Replay Welcome</div>
            <div class="settings-row-subtitle">View the welcome screens again</div>
          </div>
          ${icon('chevron.right', 16)}
        </div>
      </div>
    </div>
  `;
}

/**
 * Renders the Customization section.
 * Matches MoreView.categoriesSection with CategoryManagerView link.
 */
function renderSettingsCategoriesSection() {
  // Match the subtitle format from SettingsStrings.Categories.subtitle
  const builtInCount = 11; // EventCategory.allCases.count
  const customCount = 0;

  return `
    <div class="settings-section">
      <div class="settings-section-header">Customization</div>
      <div class="settings-group">
        <div class="settings-row">
          <div class="settings-row-icon" style="background: var(--color-accent-secondary); color: var(--color-accent);">
            ${icon('folder', 18)}
          </div>
          <div class="settings-row-content">
            <div class="settings-row-title">Categories</div>
            <div class="settings-row-subtitle">${builtInCount} built-in, ${customCount} custom</div>
          </div>
          ${icon('chevron.right', 16)}
        </div>
      </div>
    </div>
  `;
}

/**
 * Renders the Extraction section.
 * Matches MoreView.extractionSection with ExtractionSettingsView link.
 */
function renderSettingsExtractionSection() {
  return `
    <div class="settings-section">
      <div class="settings-section-header">Extraction</div>
      <div class="settings-group">
        <div class="settings-row">
          <div class="settings-row-icon" style="background: var(--color-accent-secondary); color: var(--color-accent);">
            ${icon('cpu', 18)}
          </div>
          <div class="settings-row-content">
            <div class="settings-row-title">AI Processing</div>
            <div class="settings-row-subtitle">Configure extraction settings</div>
          </div>
          ${icon('chevron.right', 16)}
        </div>
      </div>
    </div>
  `;
}

/**
 * Renders the Health section.
 * Matches MoreView.healthSection with HealthRecordsHomeView link.
 */
function renderSettingsHealthSection() {
  return `
    <div class="settings-section">
      <div class="settings-section-header">Health</div>
      <div class="settings-group">
        <div class="settings-row">
          <div class="settings-row-icon" style="background: color-mix(in srgb, var(--color-source-healthkit) 15%, transparent); color: var(--color-source-healthkit);">
            ${icon('heart.text.square', 18)}
          </div>
          <div class="settings-row-content">
            <div class="settings-row-title">Health Records</div>
            <div class="settings-row-subtitle">Import from Apple Health</div>
          </div>
          ${icon('chevron.right', 16)}
        </div>
      </div>
    </div>
  `;
}
