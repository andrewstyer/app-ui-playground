// Timeline Screen Renderer
// Matches iOS TimelineView.swift, TimelineEventRow.swift, CardGridView.swift, LanesView.swift

// ============================================================
// State
// ============================================================

const timelineState = {
  viewMode: 'list', // list | card | lanes
  sortOption: 'newest', // newest | oldest
  sourceFilter: null, // null = All, 'manual' | 'document' | 'healthKit'
  selectedCategories: new Set(),
  selectedTags: new Set(),
  isDenseView: false,
  timeScale: 'month', // week | month | year | all
  zoomLevel: 1.0,
};

// ============================================================
// Constants
// ============================================================

const VIEW_MODE_PICKER_WIDTH = 120;
const DOT_SIZE = 12;
const MIN_CARD_WIDTH = 300;

const VIEW_MODES = [
  { id: 'list', icon: 'list.bullet', label: 'List' },
  { id: 'card', icon: 'rectangle.grid.1x2', label: 'Cards' },
  { id: 'lanes', icon: 'arrow.right.to.line', label: 'Lanes' },
];

const SORT_OPTIONS = [
  { id: 'newest', label: 'Newest first' },
  { id: 'oldest', label: 'Oldest first' },
];

const SOURCE_OPTIONS = [
  { id: null, label: 'All' },
  { id: 'manual', label: 'Manual Entry' },
  { id: 'document', label: 'Document' },
  { id: 'healthKit', label: 'Apple Health' },
];

const TIME_SCALES = [
  { id: 'week', label: 'Week' },
  { id: 'month', label: 'Month' },
  { id: 'year', label: 'Year' },
  { id: 'all', label: 'All Time' },
];

const EVENT_CATEGORIES = [
  'diagnosis',
  'appointment',
  'symptom',
  'surgery',
  'prescription_change',
  'major_life_event',
  'other',
];

// ============================================================
// State Handlers
// ============================================================

function setTimelineViewMode(mode) {
  timelineState.viewMode = mode;
  render();
}

function setTimelineSortOption(option) {
  timelineState.sortOption = option;
  render();
}

function setTimelineSourceFilter(source) {
  timelineState.sourceFilter = source;
  render();
}

function toggleTimelineCategory(category) {
  if (timelineState.selectedCategories.has(category)) {
    timelineState.selectedCategories.delete(category);
  } else {
    timelineState.selectedCategories.add(category);
  }
  render();
}

function toggleTimelineTag(tagId) {
  if (timelineState.selectedTags.has(tagId)) {
    timelineState.selectedTags.delete(tagId);
  } else {
    timelineState.selectedTags.add(tagId);
  }
  render();
}

function clearTimelineFilters() {
  timelineState.selectedCategories.clear();
  timelineState.selectedTags.clear();
  render();
}

function toggleTimelineDensity() {
  timelineState.isDenseView = !timelineState.isDenseView;
  render();
}

function setTimelineScale(scale) {
  timelineState.timeScale = scale;
  render();
}

function zoomTimelineIn() {
  timelineState.zoomLevel = Math.min(2.0, timelineState.zoomLevel + 0.25);
  render();
}

function zoomTimelineOut() {
  timelineState.zoomLevel = Math.max(0.25, timelineState.zoomLevel - 0.25);
  render();
}

// ============================================================
// Data Helpers
// ============================================================

function getFilteredEvents() {
  let events = [...DATA.events];

  // Apply source filter
  if (timelineState.sourceFilter) {
    events = events.filter(e => {
      // For demo purposes, assign sources based on linkedDocuments
      const source = e.linkedDocuments?.length > 0 ? 'document' : 'manual';
      return source === timelineState.sourceFilter;
    });
  }

  // Apply category filters
  if (timelineState.selectedCategories.size > 0) {
    events = events.filter(e => timelineState.selectedCategories.has(e.category));
  }

  // Apply tag filters
  if (timelineState.selectedTags.size > 0) {
    events = events.filter(e => {
      const eventTags = DATA.tagAssignments.events[e.id] || [];
      return eventTags.some(tagId => timelineState.selectedTags.has(tagId));
    });
  }

  return events;
}

function getSortedEvents(events) {
  return [...events].sort((a, b) => {
    const da = getEventDate(a);
    const db = getEventDate(b);
    return timelineState.sortOption === 'newest'
      ? db.localeCompare(da)
      : da.localeCompare(db);
  });
}

function getEventsGroupedByMonth(events) {
  const groups = {};
  for (const event of events) {
    const dateStr = getEventDate(event);
    const monthYear = getMonthYear(dateStr);
    if (!groups[monthYear]) {
      groups[monthYear] = [];
    }
    groups[monthYear].push(event);
  }
  return groups;
}

function getEventsGroupedByYear(events) {
  const groups = {};
  for (const event of events) {
    const dateStr = getEventDate(event);
    const year = dateStr.substring(0, 4);
    if (!groups[year]) {
      groups[year] = [];
    }
    groups[year].push(event);
  }
  // Sort by year (descending for newest first)
  const sortedYears = Object.keys(groups).sort((a, b) => b - a);
  return sortedYears.map(year => ({ year: parseInt(year), events: groups[year] }));
}

function getEventsByCategory(events) {
  const categories = [...new Set(events.map(e => e.category))];
  return categories.map(cat => ({
    category: cat,
    events: events.filter(e => e.category === cat),
  }));
}

function getEventDateRange() {
  const dates = DATA.events.flatMap(event => {
    const start = event.date || event.startDate;
    const end = event.endDate || (event.ongoing ? new Date().toISOString().split('T')[0] : start);
    return [start, end];
  });
  if (dates.length === 0) return null;
  const sorted = dates.sort();
  return { start: sorted[0], end: sorted[sorted.length - 1] };
}

function formatDateRange(range) {
  if (!range) return '';
  const formatMonth = (dateStr) => {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };
  return `${formatMonth(range.start)} - ${formatMonth(range.end)}`;
}

function isOngoingEvent(event) {
  return event.ongoing === true;
}

function formatEventDateRange(event) {
  if (event.date) {
    return formatDate(event.date);
  }
  if (event.startDate && event.endDate) {
    return `${formatDate(event.startDate)} - ${formatDate(event.endDate)}`;
  }
  if (event.startDate && event.ongoing) {
    return `${formatDate(event.startDate)} - Present`;
  }
  return formatDate(event.startDate || event.date);
}

// ============================================================
// Component Renderers
// ============================================================

/**
 * Render the navigation bar with segmented picker in principal position
 */
function renderTimelineNavBar() {
  return `
    <div class="timeline-nav-bar">
      <div class="timeline-nav-spacer"></div>
      <div class="timeline-view-mode-picker" style="width: ${VIEW_MODE_PICKER_WIDTH}px">
        ${VIEW_MODES.map(mode => `
          <button
            class="timeline-view-mode-segment ${timelineState.viewMode === mode.id ? 'active' : ''}"
            onclick="setTimelineViewMode('${mode.id}')"
            aria-label="${mode.label}"
          >
            ${icon(mode.icon, 16)}
          </button>
        `).join('')}
      </div>
      <div class="timeline-nav-actions">
        <button class="timeline-add-btn" aria-label="Add event">
          ${icon('plus', 20)}
        </button>
      </div>
    </div>
  `;
}

/**
 * Render time scale control (only for Card/Lanes modes)
 */
function renderTimeScaleControl() {
  const dateRange = getEventDateRange();
  const zoomEnabled = timelineState.viewMode === 'lanes';
  const zoomPercent = Math.round(timelineState.zoomLevel * 100);

  return `
    <div class="time-scale-control">
      <div class="time-scale-left">
        <button class="time-scale-menu" onclick="showTimeScaleMenu()">
          ${TIME_SCALES.find(s => s.id === timelineState.timeScale)?.label || 'Month'}
          ${icon('chevron.down', 10)}
        </button>
        ${dateRange ? `<span class="time-scale-range">${formatDateRange(dateRange)}</span>` : ''}
      </div>
      <div class="time-scale-right">
        <span class="time-scale-zoom-percent ${zoomEnabled ? '' : 'disabled'}">${zoomPercent}%</span>
        <div class="time-scale-zoom-buttons">
          <button
            class="time-scale-zoom-btn"
            onclick="zoomTimelineOut()"
            ${!zoomEnabled || timelineState.zoomLevel <= 0.25 ? 'disabled' : ''}
            aria-label="Zoom out"
          >
            ${icon('minus', 14)}
          </button>
          <button
            class="time-scale-zoom-btn"
            onclick="zoomTimelineIn()"
            ${!zoomEnabled || timelineState.zoomLevel >= 2.0 ? 'disabled' : ''}
            aria-label="Zoom in"
          >
            ${icon('plus', 14)}
          </button>
        </div>
      </div>
    </div>
  `;
}

/**
 * Render the unified filter bar matching FilterBar.swift
 */
function renderTimelineFilterBar() {
  const hasActiveFilters = timelineState.selectedCategories.size > 0 || timelineState.selectedTags.size > 0;
  const showSortInList = timelineState.viewMode === 'list';
  const uniqueCategories = [...new Set(DATA.events.map(e => e.category))];

  return `
    <div class="timeline-filter-bar">
      <div class="timeline-filter-scroll">
        ${showSortInList ? `
          <div class="filter-picker-chip active" onclick="showTimelineSortMenu()">
            <span>Sort: ${SORT_OPTIONS.find(o => o.id === timelineState.sortOption)?.label}</span>
            ${icon('chevron.down', 10)}
          </div>
          <div class="filter-divider"></div>
        ` : ''}

        <div class="filter-picker-chip ${timelineState.sourceFilter ? 'active' : ''}" onclick="showTimelineSourceMenu()">
          <span>Source: ${SOURCE_OPTIONS.find(o => o.id === timelineState.sourceFilter)?.label}</span>
          ${icon('chevron.down', 10)}
        </div>

        <div class="filter-divider"></div>

        <button
          class="filter-chip ${!hasActiveFilters ? 'selected' : ''}"
          onclick="clearTimelineFilters()"
        >
          All
        </button>

        ${uniqueCategories.map(cat => `
          <button
            class="filter-chip ${timelineState.selectedCategories.has(cat) ? 'selected' : ''}"
            style="--chip-color: ${getCategoryColor(cat)}"
            onclick="toggleTimelineCategory('${cat}')"
          >
            ${getCategoryLabel(cat)}
          </button>
        `).join('')}

        ${DATA.tags.length > 0 ? `
          <div class="filter-divider"></div>
          ${DATA.tags.map(tag => `
            <button
              class="filter-chip ${timelineState.selectedTags.has(tag.id) ? 'selected' : ''}"
              style="--chip-color: ${getTagColor(tag.color)}"
              onclick="toggleTimelineTag('${tag.id}')"
            >
              ${icon(tag.icon, 12)}
              ${tag.name}
            </button>
          `).join('')}
        ` : ''}
      </div>

      ${timelineState.viewMode === 'list' ? `
        <div class="filter-divider" style="margin-left: 0"></div>
        <button
          class="timeline-density-toggle"
          onclick="toggleTimelineDensity()"
          aria-label="${timelineState.isDenseView ? 'Comfortable view' : 'Dense view'}"
        >
          ${icon(timelineState.isDenseView ? 'rectangle.expand.vertical' : 'rectangle.compress.vertical', 18)}
        </button>
      ` : ''}
    </div>
  `;
}

/**
 * Render a single timeline event row matching TimelineEventRow.swift
 */
function renderTimelineEventRow(event) {
  const tags = getTagsForItem('event', event.id);
  const dense = timelineState.isDenseView;
  const verticalPadding = dense ? 'var(--spacing-xs)' : 'var(--spacing-sm)';
  const titleFont = dense ? 'var(--font-body)' : 'var(--font-headline)';
  const spacing = dense ? 'var(--spacing-xxs)' : 'var(--spacing-xs)';

  return `
    <div
      class="timeline-event-row"
      style="padding-top: ${verticalPadding}; padding-bottom: ${verticalPadding};"
      onclick="pushView(() => renderEventDetail('${event.id}'))"
    >
      <div class="timeline-event-dot" style="background: ${getCategoryColor(event.category)}; width: ${DOT_SIZE}px; height: ${DOT_SIZE}px;"></div>
      <div class="timeline-event-row-content" style="gap: ${spacing}">
        <div class="timeline-event-date">${formatEventDateRange(event)}</div>
        <div class="timeline-event-title" style="font: ${titleFont}">${event.title}</div>
        ${!dense ? `
          <div class="timeline-event-badges">
            ${renderCategoryBadge(event.category)}
            ${renderTypeBadge(event.type)}
            ${event.linkedDocuments?.length > 0 ? renderSourceBadge('document') : ''}
          </div>
        ` : ''}
      </div>
    </div>
  `;
}

/**
 * Render badges
 */
function renderCategoryBadge(category) {
  const color = getCategoryColor(category);
  const label = getCategoryLabel(category);
  return `<span class="timeline-badge" style="background: color-mix(in srgb, ${color} 20%, transparent); color: ${color};">${label}</span>`;
}

function renderTypeBadge(type) {
  const label = type === 'health_event' ? 'Health' : 'Life';
  const color = type === 'health_event' ? 'var(--color-accent)' : 'var(--color-category-life-event)';
  return `<span class="timeline-badge" style="background: color-mix(in srgb, ${color} 20%, transparent); color: ${color};">${label}</span>`;
}

function renderSourceBadge(source) {
  const labels = { manual: 'Manual', document: 'Document', healthKit: 'HealthKit' };
  const colors = {
    manual: 'var(--color-source-manual)',
    document: 'var(--color-source-document)',
    healthKit: 'var(--color-source-healthkit)',
  };
  const color = colors[source] || colors.manual;
  return `<span class="timeline-badge" style="background: color-mix(in srgb, ${color} 20%, transparent); color: ${color};">${labels[source]}</span>`;
}

/**
 * Render the list view with grouped month headers
 */
function renderTimelineListView(events) {
  const sorted = getSortedEvents(events);
  const groups = getEventsGroupedByMonth(sorted);
  const monthOrder = Object.keys(groups);

  // Sort months based on sort option
  if (timelineState.sortOption === 'newest') {
    monthOrder.sort((a, b) => {
      const da = new Date(groups[a][0].date || groups[a][0].startDate);
      const db = new Date(groups[b][0].date || groups[b][0].startDate);
      return db - da;
    });
  } else {
    monthOrder.sort((a, b) => {
      const da = new Date(groups[a][0].date || groups[a][0].startDate);
      const db = new Date(groups[b][0].date || groups[b][0].startDate);
      return da - db;
    });
  }

  return `
    <div class="timeline-list">
      ${monthOrder.map(month => `
        <div class="timeline-section">
          <div class="timeline-section-header">${month}</div>
          ${groups[month].map(event => renderTimelineEventRow(event)).join('')}
        </div>
      `).join('')}
    </div>
  `;
}

/**
 * Render a single card for Card View matching TimelineCardView.swift
 */
function renderTimelineCard(event) {
  const tags = getTagsForItem('event', event.id);
  const isOngoing = isOngoingEvent(event);
  const hasDocuments = event.linkedDocuments?.length > 0;
  const hasTags = tags.length > 0;

  return `
    <div class="timeline-card" onclick="pushView(() => renderEventDetail('${event.id}'))">
      <div class="timeline-card-header">
        <div class="timeline-card-dot" style="background: ${getCategoryColor(event.category)}"></div>
        <div class="timeline-card-title">${event.title}</div>
      </div>
      <div class="timeline-card-date">
        ${formatEventDateRange(event)}
        ${isOngoing ? '<span class="timeline-ongoing-badge">Ongoing</span>' : ''}
      </div>
      ${event.description ? `
        <div class="timeline-card-description">${event.description}</div>
      ` : ''}
      ${hasDocuments || hasTags ? `
        <div class="timeline-card-footer">
          ${hasDocuments ? `
            <span class="timeline-card-attachment">
              ${icon('paperclip', 12)}
              ${event.linkedDocuments.length}
            </span>
          ` : ''}
          ${tags.slice(0, 3).map(tag => `
            <span class="timeline-tag-pill" style="color: ${getTagColor(tag.color)}; background: color-mix(in srgb, ${getTagColor(tag.color)} 10%, transparent);">
              ${tag.name}
            </span>
          `).join('')}
          ${tags.length > 3 ? `<span class="timeline-card-more-tags">+${tags.length - 3}</span>` : ''}
        </div>
      ` : ''}
      ${isOngoing ? '<div class="timeline-card-ongoing-gradient"></div>' : ''}
    </div>
  `;
}

/**
 * Render year marker for Card View matching TimeAxisMarker
 */
function renderYearMarker(year) {
  return `
    <div class="timeline-year-marker">
      <span class="timeline-year-text">${year}</span>
      <div class="timeline-year-line"></div>
    </div>
  `;
}

/**
 * Render the card grid view matching CardGridView.swift
 */
function renderTimelineCardView(events) {
  const sorted = getSortedEvents(events);
  const grouped = getEventsGroupedByYear(sorted);

  return `
    <div class="timeline-card-grid-container">
      ${grouped.map(group => `
        <div class="timeline-card-year-section">
          ${renderYearMarker(group.year)}
          <div class="timeline-card-grid">
            ${group.events.map(event => renderTimelineCard(event)).join('')}
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

/**
 * Render a lane row for Lanes View
 */
function renderTimelineLane(category, events) {
  const color = getCategoryColor(category);
  const label = getCategoryLabel(category);

  return `
    <div class="timeline-lane">
      <div class="timeline-lane-header">
        <span class="timeline-lane-label" style="color: ${color}">${label}</span>
        <span class="timeline-lane-count">${events.length}</span>
      </div>
      <div class="timeline-lane-bars">
        ${events.slice(0, 8).map(event => `
          <div
            class="timeline-lane-bar"
            style="background: ${color}"
            onclick="pushView(() => renderEventDetail('${event.id}'))"
            title="${event.title}"
          >
            ${event.title.length > 20 ? event.title.substring(0, 18) + '...' : event.title}
          </div>
        `).join('')}
        ${events.length > 8 ? `<span class="timeline-lane-more">+${events.length - 8} more</span>` : ''}
      </div>
    </div>
  `;
}

/**
 * Render the lanes view matching LanesView.swift
 */
function renderTimelineLanesView(events) {
  const byCategory = getEventsByCategory(events);

  return `
    <div class="timeline-lanes-container">
      <div class="timeline-date-nav-bar">
        <button class="timeline-date-nav-btn" onclick="void(0)">${icon('chevron.left', 16)}</button>
        <span class="timeline-date-nav-current">Jan 2020 - Jan 2025</span>
        <button class="timeline-date-nav-btn" onclick="void(0)">${icon('chevron.right', 16)}</button>
      </div>
      <div class="timeline-lanes">
        ${byCategory.map(({ category, events }) => renderTimelineLane(category, events)).join('')}
      </div>
      <div class="timeline-minibar">
        <div class="timeline-minibar-track">
          <div class="timeline-minibar-thumb" style="width: 30%; left: 70%;"></div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Render empty state
 */
function renderTimelineEmptyState() {
  return `
    <div class="empty-state">
      <div class="empty-state-icon">${icon('calendar.badge.clock', 64)}</div>
      <div class="empty-state-title">No Events</div>
      <div class="empty-state-desc">Add your first event to start building your timeline.</div>
      <button class="empty-state-btn">Add Event</button>
    </div>
  `;
}

// ============================================================
// Main Timeline Renderer
// ============================================================

/**
 * Main render function for Timeline screen
 */
function renderTimelineScreen() {
  const events = getFilteredEvents();
  const isEmpty = events.length === 0 && DATA.events.length === 0;
  const isFilteredEmpty = events.length === 0 && DATA.events.length > 0;

  return `
    <div class="timeline-screen">
      <div class="screen-header">
        <div class="screen-title">Timeline</div>
      </div>

      ${renderTimelineNavBar()}

      ${timelineState.viewMode !== 'list' ? renderTimeScaleControl() : ''}

      ${DATA.events.length > 0 ? `
        ${renderTimelineFilterBar()}
        <div class="timeline-divider"></div>
      ` : ''}

      <div class="timeline-content">
        ${isEmpty ? renderTimelineEmptyState() : ''}
        ${isFilteredEmpty ? `
          <div class="empty-state">
            <div class="empty-state-icon">${icon('calendar.badge.clock', 64)}</div>
            <div class="empty-state-title">No Matching Events</div>
            <div class="empty-state-desc">Try adjusting your filters to see more events.</div>
          </div>
        ` : ''}
        ${!isEmpty && !isFilteredEmpty ? `
          ${timelineState.viewMode === 'list' ? renderTimelineListView(events) : ''}
          ${timelineState.viewMode === 'card' ? renderTimelineCardView(events) : ''}
          ${timelineState.viewMode === 'lanes' ? renderTimelineLanesView(events) : ''}
        ` : ''}
      </div>
    </div>
  `;
}

// ============================================================
// Menu Functions (placeholders for demo)
// ============================================================

function showTimelineSortMenu() {
  // In a real implementation, this would show a dropdown menu
  const current = timelineState.sortOption;
  const next = current === 'newest' ? 'oldest' : 'newest';
  setTimelineSortOption(next);
}

function showTimelineSourceMenu() {
  // In a real implementation, this would show a dropdown menu
  const sources = [null, 'manual', 'document', 'healthKit'];
  const currentIndex = sources.indexOf(timelineState.sourceFilter);
  const nextIndex = (currentIndex + 1) % sources.length;
  setTimelineSourceFilter(sources[nextIndex]);
}

function showTimeScaleMenu() {
  // In a real implementation, this would show a dropdown menu
  const scales = ['week', 'month', 'year', 'all'];
  const currentIndex = scales.indexOf(timelineState.timeScale);
  const nextIndex = (currentIndex + 1) % scales.length;
  setTimelineScale(scales[nextIndex]);
}

// ============================================================
// Export
// ============================================================

// Make functions available globally for onclick handlers
window.setTimelineViewMode = setTimelineViewMode;
window.setTimelineSortOption = setTimelineSortOption;
window.setTimelineSourceFilter = setTimelineSourceFilter;
window.toggleTimelineCategory = toggleTimelineCategory;
window.toggleTimelineTag = toggleTimelineTag;
window.clearTimelineFilters = clearTimelineFilters;
window.toggleTimelineDensity = toggleTimelineDensity;
window.setTimelineScale = setTimelineScale;
window.zoomTimelineIn = zoomTimelineIn;
window.zoomTimelineOut = zoomTimelineOut;
window.showTimelineSortMenu = showTimelineSortMenu;
window.showTimelineSourceMenu = showTimelineSourceMenu;
window.showTimeScaleMenu = showTimeScaleMenu;
window.renderTimelineScreen = renderTimelineScreen;
