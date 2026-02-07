// App Shell - Core framework for iOS-style UI playground
// Provides state management, theme toggle, sheet system, and shared component renderers

// ============================================================
// App State (Apps should extend this)
// ============================================================

const appState = {
  themeMode: 'auto', // auto | light | dark
};

// ============================================================
// Legacy Navigation Wrappers
// These provide compatibility with existing screen code
// ============================================================

function currentStack() {
  return Navigation.currentStack();
}

function pushView(viewFn) {
  Navigation.push(viewFn);
}

function popView() {
  Navigation.pop();
}

function switchTab(tabId) {
  Navigation.switchTab(tabId);
}

// ============================================================
// Sheet / Modal System
// ============================================================

function showSheet(contentFn) {
  const overlay = document.getElementById('sheet-overlay');
  const container = document.getElementById('sheet-container');
  overlay.classList.remove('hidden');
  container.classList.remove('hidden');
  container.innerHTML = `
    <div class="sheet-handle"></div>
    ${contentFn()}
  `;
  requestAnimationFrame(() => {
    overlay.classList.add('visible');
    container.classList.add('visible');
  });
  overlay.onclick = dismissSheet;
}

function dismissSheet() {
  const overlay = document.getElementById('sheet-overlay');
  const container = document.getElementById('sheet-container');
  overlay.classList.remove('visible');
  container.classList.remove('visible');
  setTimeout(() => {
    overlay.classList.add('hidden');
    container.classList.add('hidden');
  }, 300);
}

// ============================================================
// Theme Toggle
// ============================================================

function cycleTheme() {
  const modes = ['auto', 'light', 'dark'];
  const idx = modes.indexOf(appState.themeMode);
  appState.themeMode = modes[(idx + 1) % modes.length];
  applyTheme();
}

function applyTheme() {
  const html = document.documentElement;
  html.removeAttribute('data-theme');
  if (appState.themeMode === 'light') html.setAttribute('data-theme', 'light');
  if (appState.themeMode === 'dark') html.setAttribute('data-theme', 'dark');
  // Update toggle icon
  const toggle = document.querySelector('.theme-toggle');
  if (toggle) {
    const icons = { auto: 'circle', light: 'sun.max', dark: 'moon' };
    toggle.innerHTML = icon(icons[appState.themeMode], 18);
  }
}

// ============================================================
// Shared Component Renderers
// ============================================================

function renderNavBar(title, options = {}) {
  const { back, actions = '' } = options;
  return `
    <div class="nav-bar">
      ${back ? `<button class="nav-bar-back" onclick="popView()">${icon('chevron.left', 20)} Back</button>` : '<div style="min-width:44px"></div>'}
      <span class="nav-bar-title">${title}</span>
      ${actions || '<div style="min-width:44px"></div>'}
    </div>
  `;
}

function renderBadge(label, color) {
  return `<span class="badge" style="background: color-mix(in srgb, ${color} 20%, transparent); color: ${color};">${label}</span>`;
}

function renderTagChip(tag, getTagColorFn) {
  const color = getTagColorFn ? getTagColorFn(tag.color) : tag.color;
  return `<span class="tag-chip" style="background: color-mix(in srgb, ${color} 15%, transparent); color: ${color};">${icon(tag.icon, 12)} ${tag.name}</span>`;
}

function renderSearchBar(placeholder = 'Search') {
  return `
    <div class="search-bar">
      ${icon('magnifyingglass', 16)}
      <input type="text" placeholder="${placeholder}" readonly>
    </div>
  `;
}

function renderFilterBar(chips) {
  return `
    <div class="filter-bar">
      ${chips.map(c => `<div class="chip ${c.selected ? 'selected' : ''}">${c.icon ? icon(c.icon, 14) : ''}${c.label}</div>`).join('')}
    </div>
  `;
}

function renderSegmentedControl(segments, activeId, onClickPrefix) {
  return `
    <div class="segmented-control">
      ${segments.map(s => `<div class="segment ${s.id === activeId ? 'active' : ''}" onclick="${onClickPrefix}('${s.id}')">${s.label}</div>`).join('')}
    </div>
  `;
}

// ============================================================
// Onboarding Screen Renderer
// ============================================================

function renderOnboardingScreen(page, pages) {
  const pageData = pages[page - 1] || pages[0];
  const isLast = page === pages.length;

  return `
    <div class="onboarding-screen">
      <div class="onboarding-progress">
        ${pages.map((_, i) => `
          <div class="onboarding-dot ${i + 1 === page ? 'active' : ''} ${i + 1 < page ? 'completed' : ''}"></div>
        `).join('')}
      </div>
      <div class="onboarding-content">
        <div class="onboarding-icon">${icon(pageData.icon, 80)}</div>
        <h1 class="onboarding-title">${pageData.title}</h1>
        <p class="onboarding-description">${pageData.description}</p>
      </div>
      <div class="onboarding-actions">
        ${page > 1 ? `
          <button class="onboarding-btn onboarding-btn-secondary" onclick="Navigation.navigateTo('welcome-${page - 1}')">
            Back
          </button>
        ` : '<div></div>'}
        ${isLast ? `
          <button class="onboarding-btn onboarding-btn-primary" onclick="Navigation.exitSpecialScreen()">
            Get Started
          </button>
        ` : `
          <button class="onboarding-btn onboarding-btn-primary" onclick="Navigation.navigateTo('welcome-${page + 1}')">
            Next
          </button>
        `}
      </div>
    </div>
  `;
}

// ============================================================
// Loading Screen Renderer
// ============================================================

function renderLoadingScreen() {
  return `
    <div class="loading-screen">
      <div class="loading-spinner"></div>
      <div class="loading-text">Loading...</div>
      <button class="loading-exit-btn" onclick="Navigation.exitSpecialScreen()">
        Exit Loading
      </button>
    </div>
  `;
}

// ============================================================
// App Initialization Helper
// ============================================================

function initAppShell() {
  // Add theme toggle button
  const toggle = document.createElement('button');
  toggle.className = 'theme-toggle';
  toggle.onclick = cycleTheme;
  toggle.innerHTML = icon('circle', 18);
  document.body.appendChild(toggle);

  applyTheme();
}
