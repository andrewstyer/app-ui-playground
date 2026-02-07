// Narrativ App Configuration
// Screen registry and app-specific settings

// ============================================================
// Screen Registry
// ============================================================

/**
 * All available screens in the Narrativ app, organized by category.
 * Each screen has an id, label, icon, and optional render function reference.
 */
const SCREEN_REGISTRY = {
  // Main tabs (matches iOS AppTabView)
  tabs: [
    { id: 'home', label: 'Home', icon: 'house', accessibilityId: 'tab-home' },
    { id: 'timeline', label: 'Timeline', icon: 'calendar.day.timeline.left', accessibilityId: 'tab-timeline' },
    { id: 'documents', label: 'Documents', icon: 'doc.text', accessibilityId: 'tab-documents' },
    { id: 'story', label: 'Story', icon: 'book.pages', accessibilityId: 'tab-story' },
    { id: 'tags', label: 'Tags', icon: 'tag', accessibilityId: 'tab-tags' },
    { id: 'settings', label: 'Settings', icon: 'gear', accessibilityId: 'tab-more' },
  ],

  // Detail screens (pushed onto navigation stacks)
  details: [
    { id: 'event-detail', label: 'Event Detail', icon: 'calendar', parent: 'timeline' },
    { id: 'document-viewer', label: 'Document Viewer', icon: 'doc.text.fill', parent: 'documents' },
    { id: 'tag-detail', label: 'Tag Detail', icon: 'tag', parent: 'tags' },
    { id: 'chapter-reading', label: 'Chapter Reading', icon: 'book', parent: 'story' },
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
};

// ============================================================
// Onboarding Pages Content
// ============================================================

const ONBOARDING_PAGES = [
  {
    icon: 'sparkles',
    title: 'Welcome to Narrativ',
    description: 'Your personal health story, beautifully organized.',
  },
  {
    icon: 'doc.text',
    title: 'Import Your Documents',
    description: 'Add medical records, lab results, and health documents with ease.',
  },
  {
    icon: 'calendar.day.timeline.left',
    title: 'See Your Timeline',
    description: 'View your health journey on an interactive timeline.',
  },
  {
    icon: 'book.pages',
    title: 'Tell Your Story',
    description: 'Transform your health data into a narrative you can share.',
  },
  {
    icon: 'checkmark',
    title: 'You\'re All Set!',
    description: 'Start building your health story today.',
  },
];

// ============================================================
// Category Colors (Narrativ-specific)
// ============================================================

const CATEGORY_COLORS = {
  appointment: 'var(--color-category-appointment)',
  diagnosis: 'var(--color-category-diagnosis)',
  medication: 'var(--color-category-medication)',
  procedure: 'var(--color-category-procedure)',
  symptom: 'var(--color-category-symptom)',
  labResult: 'var(--color-category-lab-result)',
  other: 'var(--color-category-other)',
};

// ============================================================
// App State
// ============================================================

const state = {
  narrativeChapter: 0,
  narrativeEditing: false,
  narrativeShowReferences: false,
  narrativeViewMode: 'book',
};

// ============================================================
// Initialize Navigation
// ============================================================

function initNarrativApp() {
  // Configure navigation with Narrativ screens
  Navigation.configure({
    screenRegistry: SCREEN_REGISTRY,
    defaultTab: 'home',
  });

  // Initialize app shell (theme toggle, etc.)
  initAppShell();

  // Initial render
  render();
}

// ============================================================
// Render Engine
// ============================================================

function render() {
  const container = document.getElementById('screen-container');

  // Check for special screens (onboarding, loading, etc.)
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

/**
 * Render special screens (onboarding, loading, etc.)
 */
function renderSpecialScreen(specialScreen) {
  switch (specialScreen.type) {
    case 'onboarding':
      return renderOnboardingScreen(specialScreen.page, ONBOARDING_PAGES);
    case 'utility':
      if (specialScreen.id === 'loading') {
        return renderLoadingScreen();
      }
      break;
  }
  return '<div class="empty-state"><span class="empty-state-title">Unknown screen</span></div>';
}

/**
 * Render the main screen for a tab
 */
function renderScreen(tabId) {
  switch (tabId) {
    case 'home': return renderDashboard();
    case 'timeline': return renderTimelineScreen();
    case 'documents': return renderDocumentsScreen();
    case 'story': return renderNarrative();
    case 'tags': return renderTags();
    case 'settings': return renderSettings();
    default: return '<div class="empty-state"><span class="empty-state-title">Coming soon</span></div>';
  }
}

/**
 * Render detail screens (called by Navigation)
 */
function renderDetailScreen(screenId, params) {
  switch (screenId) {
    case 'event-detail':
      const eventId = params.eventId || DATA.events[0]?.id;
      if (eventId && typeof renderEventDetail === 'function') {
        return renderEventDetail(eventId);
      }
      break;

    case 'document-viewer':
      const docId = params.docId || DATA.documents[0]?.id;
      if (docId && typeof renderDocDetail === 'function') {
        return renderDocDetail(docId);
      }
      break;

    case 'tag-detail':
      const tagId = params.tagId || DATA.tags[0]?.id;
      if (tagId && typeof renderTagDetail === 'function') {
        return renderTagDetail(tagId);
      }
      break;
  }

  // Fallback to demo screen
  return Navigation._renderDemoDetailScreen('Detail', 'doc.text', 'Detail content would appear here');
}

// ============================================================
// Initialize on DOM Ready
// ============================================================

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initNarrativApp);
} else {
  initNarrativApp();
}
