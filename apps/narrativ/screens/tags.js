// Tags screen renderer - matches TagsListView.swift exactly

/**
 * Renders the Tags screen.
 * Matches the iOS TagsListView with:
 * - NavigationStack with title "Tags"
 * - Searchable modifier
 * - FilterBar with sort options
 * - Tag list with NavigationLink rows
 * - Empty state with ContentUnavailableView
 * - Plus button in toolbar
 */
function renderTags() {
  // Initialize sort option if not set
  if (!state.tagSortOption) {
    state.tagSortOption = 'nameAZ';
  }

  const tags = getSortedTags();

  // Empty state - matches TagsListView emptyState
  if (!DATA.tags.length) {
    return `
      <div class="screen-header">
        <div class="screen-title">Tags</div>
      </div>
      <div class="tags-toolbar">
        <div style="flex: 1"></div>
        <button class="toolbar-btn" onclick="showNewTagSheet()">
          ${icon('plus', 20)}
        </button>
      </div>
      <div class="empty-state">
        <div class="empty-state-icon">${icon('tag', 64)}</div>
        <div class="empty-state-title">No Tags</div>
        <div class="empty-state-desc">Create tags to organize your documents and events.</div>
        <button class="empty-state-btn" onclick="showNewTagSheet()">Create First Tag</button>
      </div>
    `;
  }

  return `
    <div class="screen-header">
      <div class="screen-title">Tags</div>
    </div>
    <div class="tags-toolbar">
      <div style="flex: 1"></div>
      <button class="toolbar-btn" onclick="showNewTagSheet()">
        ${icon('plus', 20)}
      </button>
    </div>
    ${renderSearchBar('Search tags')}
    ${renderTagFilterBar()}
    ${renderTagsList(tags)}
  `;
}

/**
 * Renders the filter bar with sort options.
 * Matches FilterBar component with TagSortOption.allCases.
 */
function renderTagFilterBar() {
  const sortOptions = [
    { id: 'nameAZ', label: 'Name A-Z' },
    { id: 'nameZA', label: 'Name Z-A' },
    { id: 'mostUsed', label: 'Most Used' },
    { id: 'leastUsed', label: 'Least Used' },
  ];

  return `
    <div class="filter-bar">
      ${sortOptions.map(opt => `
        <div class="chip ${state.tagSortOption === opt.id ? 'selected' : ''}" onclick="setTagSort('${opt.id}')">
          ${opt.id === 'nameAZ' || opt.id === 'nameZA' ? icon('arrow.up.arrow.down', 14) : ''}
          ${opt.label}
        </div>
      `).join('')}
    </div>
  `;
}

/**
 * Renders the list of tags.
 * Matches TagsListView tagsList with TagRow for each tag.
 */
function renderTagsList(tags) {
  return `
    <div class="tags-list">
      ${tags.map(tag => renderTagRow(tag)).join('')}
    </div>
    <div style="height: var(--spacing-lg)"></div>
  `;
}

/**
 * Renders a single tag row.
 * Matches TagRow struct with:
 * - Icon container with tag color (15% opacity background)
 * - Name with body font
 * - Description with caption font
 * - Item count
 * - Chevron
 */
function renderTagRow(tag) {
  const count = countTagUsage(tag);
  const color = getTagColor(tag.color);
  const iconName = tag.icon || 'tag.fill';

  // Format count text matching TagStrings
  const countText = count === 1 ? '1 item' : `${count} items`;

  return `
    <div class="tag-list-row" onclick="pushView(() => renderTagDetail('${tag.id}'))">
      <div class="tag-list-icon" style="background: color-mix(in srgb, ${color} 15%, transparent); color: ${color};">
        ${icon(iconName, 20)}
      </div>
      <div class="tag-list-content">
        <div class="tag-list-name">${tag.name}</div>
        ${tag.description ? `<div class="tag-list-desc">${tag.description}</div>` : ''}
      </div>
      <span class="tag-list-count">${countText}</span>
      <span class="tag-list-chevron">${icon('chevron.right', 16)}</span>
    </div>
  `;
}

/**
 * Counts how many documents and events use a tag.
 * Matches DataStore.usageCount(forTag:).
 */
function countTagUsage(tag) {
  const docAssignments = Object.values(DATA.tagAssignments.documents).flat();
  const eventAssignments = Object.values(DATA.tagAssignments.events).flat();
  return [...docAssignments, ...eventAssignments].filter(id => id === tag.id).length;
}

/**
 * Gets tags sorted according to current sort option.
 * Matches TagSortOption.sort implementation.
 */
function getSortedTags() {
  const tags = [...DATA.tags];

  switch (state.tagSortOption) {
    case 'nameAZ':
      return tags.sort((a, b) => a.name.localeCompare(b.name));
    case 'nameZA':
      return tags.sort((a, b) => b.name.localeCompare(a.name));
    case 'mostUsed':
      return tags.sort((a, b) => countTagUsage(b) - countTagUsage(a));
    case 'leastUsed':
      return tags.sort((a, b) => countTagUsage(a) - countTagUsage(b));
    default:
      return tags;
  }
}

/**
 * Sets the tag sort option and re-renders.
 */
function setTagSort(option) {
  state.tagSortOption = option;
  render();
}

/**
 * Shows the new tag sheet.
 * Matches TagEditSheet(mode: .create).
 */
function showNewTagSheet() {
  showSheet(() => `
    <div class="sheet-header">
      <span class="sheet-title">New Tag</span>
      <button class="sheet-close" onclick="dismissSheet()">${icon('xmark', 14)}</button>
    </div>
    <div class="sheet-body">
      <div class="form-field">
        <label class="form-label">Name</label>
        <input class="form-input" type="text" placeholder="Tag name" value="">
      </div>
      <div class="form-field">
        <label class="form-label">Description</label>
        <input class="form-input" type="text" placeholder="Optional description" value="">
      </div>
      <div class="form-field">
        <label class="form-label">Color</label>
        <div class="color-picker">
          ${['blue', 'green', 'orange', 'red', 'purple', 'mint'].map(color => `
            <div class="color-option" style="background: ${getTagColor(color)};" onclick="selectTagColor('${color}')"></div>
          `).join('')}
        </div>
      </div>
      <div class="form-field">
        <label class="form-label">Icon</label>
        <div class="icon-picker">
          ${['tag', 'star', 'heart', 'bolt.heart', 'exclamationmark.circle', 'arrow.clockwise'].map(iconName => `
            <div class="icon-option" onclick="selectTagIcon('${iconName}')">${icon(iconName, 20)}</div>
          `).join('')}
        </div>
      </div>
    </div>
    <div class="wizard-actions">
      <button class="wizard-btn wizard-btn-secondary" onclick="dismissSheet()">Cancel</button>
      <button class="wizard-btn wizard-btn-primary">Create</button>
    </div>
  `);
}

// Note: renderTagDetail is defined in screens/tag-detail.js
