// Documents Screen - Matches iOS DocumentLibraryView.swift exactly
// Components: DocumentRow, DocumentTile, FilterBar with PickerChip and FilterChip

// ============================================================
// State
// ============================================================

const documentsState = {
  viewMode: 'list', // 'list' | 'grid'
  sortOption: 'newest', // 'newest' | 'oldest' | 'az' | 'za'
  selectedCategories: new Set(),
  searchText: '',
  isLoading: false,
};

// ============================================================
// Sort Options
// ============================================================

const DOCUMENT_SORT_OPTIONS = [
  { id: 'newest', label: 'Newest' },
  { id: 'oldest', label: 'Oldest' },
  { id: 'az', label: 'A-Z' },
  { id: 'za', label: 'Z-A' },
];

// ============================================================
// Document Categories (from DocumentCategory enum in Swift)
// ============================================================

const DOCUMENT_CATEGORIES = [
  { id: 'lab_result', label: 'Lab Result', color: 'var(--color-category-lab-result)' },
  { id: 'medical_record', label: 'Medical Record', color: 'var(--color-category-appointment)' },
  { id: 'imaging', label: 'Imaging', color: 'var(--color-category-procedure)' },
  { id: 'insurance', label: 'Insurance', color: 'var(--color-category-other)' },
  { id: 'other', label: 'Other', color: 'var(--color-category-other)' },
];

// ============================================================
// Sorting & Filtering
// ============================================================

function getFilteredDocuments() {
  let docs = [...DATA.documents];

  // Filter by search text
  if (documentsState.searchText) {
    const search = documentsState.searchText.toLowerCase();
    docs = docs.filter(doc =>
      doc.title.toLowerCase().includes(search) ||
      doc.provider.toLowerCase().includes(search)
    );
  }

  // Filter by categories
  if (documentsState.selectedCategories.size > 0) {
    docs = docs.filter(doc => documentsState.selectedCategories.has(doc.category));
  }

  // Sort
  switch (documentsState.sortOption) {
    case 'newest':
      docs.sort((a, b) => b.date.localeCompare(a.date));
      break;
    case 'oldest':
      docs.sort((a, b) => a.date.localeCompare(b.date));
      break;
    case 'az':
      docs.sort((a, b) => a.title.localeCompare(b.title));
      break;
    case 'za':
      docs.sort((a, b) => b.title.localeCompare(a.title));
      break;
  }

  return docs;
}

// ============================================================
// Actions
// ============================================================

function setDocumentsViewMode(mode) {
  documentsState.viewMode = mode;
  render();
}

function setDocumentsSortOption(optionId) {
  documentsState.sortOption = optionId;
  render();
}

function toggleDocumentCategory(categoryId) {
  if (documentsState.selectedCategories.has(categoryId)) {
    documentsState.selectedCategories.delete(categoryId);
  } else {
    documentsState.selectedCategories.add(categoryId);
  }
  render();
}

function clearDocumentFilters() {
  documentsState.selectedCategories.clear();
  render();
}

// ============================================================
// Component: PickerChip (Sort dropdown)
// Matches PickerChip.swift - capsule with accent color, chevron.down
// ============================================================

function renderPickerChip(label, value, options, currentId, onClickFn) {
  return `
    <div class="picker-chip" onclick="event.stopPropagation(); togglePickerMenu(this)">
      <span class="picker-chip-text">${label}: ${value}</span>
      ${icon('chevron.down', 10)}
      <div class="picker-menu">
        ${options.map(opt => `
          <div class="picker-menu-item ${opt.id === currentId ? 'selected' : ''}"
               onclick="event.stopPropagation(); ${onClickFn}('${opt.id}'); closePickerMenus()">
            ${opt.id === currentId ? icon('checkmark', 14) : '<span style="width:14px;display:inline-block"></span>'}
            <span>${opt.label}</span>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function togglePickerMenu(element) {
  const menu = element.querySelector('.picker-menu');
  const isOpen = menu.classList.contains('open');
  closePickerMenus();
  if (!isOpen) {
    menu.classList.add('open');
  }
}

function closePickerMenus() {
  document.querySelectorAll('.picker-menu.open').forEach(m => m.classList.remove('open'));
}

// Close menus on outside click
document.addEventListener('click', closePickerMenus);

// ============================================================
// Component: FilterChip (Category toggle)
// Matches FilterChip.swift - capsule with color-coded selection
// ============================================================

function renderFilterChip(label, isSelected, color, onClick) {
  const bgOpacity = isSelected ? 0.2 : 0.08;
  const borderOpacity = isSelected ? 0.4 : 0.15;
  const textColor = isSelected ? color : 'var(--color-foreground-secondary)';
  const bgColor = isSelected
    ? `color-mix(in srgb, ${color} ${bgOpacity * 100}%, transparent)`
    : `color-mix(in srgb, var(--color-background-secondary) ${bgOpacity * 100}%, transparent)`;
  const borderColor = isSelected
    ? `color-mix(in srgb, ${color} ${borderOpacity * 100}%, transparent)`
    : 'var(--color-border-subtle)';

  return `
    <button class="filter-chip ${isSelected ? 'selected' : ''}"
            onclick="${onClick}"
            style="color: ${textColor}; background: ${bgColor}; border-color: ${borderColor};">
      ${label}
    </button>
  `;
}

// ============================================================
// Component: FilterBar
// Matches FilterBar.swift - horizontal scroll, sort picker + category chips
// ============================================================

function renderDocumentsFilterBar() {
  const currentSort = DOCUMENT_SORT_OPTIONS.find(o => o.id === documentsState.sortOption);
  const hasActiveFilters = documentsState.selectedCategories.size > 0;

  return `
    <div class="documents-filter-bar">
      ${renderPickerChip('Sort', currentSort.label, DOCUMENT_SORT_OPTIONS, documentsState.sortOption, 'setDocumentsSortOption')}

      <div class="filter-bar-divider"></div>

      ${renderFilterChip('All', !hasActiveFilters, 'var(--color-accent)', 'clearDocumentFilters()')}

      ${DOCUMENT_CATEGORIES.map(cat =>
        renderFilterChip(
          cat.label,
          documentsState.selectedCategories.has(cat.id),
          cat.color,
          `toggleDocumentCategory('${cat.id}')`
        )
      ).join('')}
    </div>
    <div class="filter-bar-separator"></div>
  `;
}

// ============================================================
// Component: DocumentRow
// Matches DocumentRow.swift exactly:
// - Thumbnail: 44x56, small radius, category icon placeholder
// - Review indicator: 8px dot with accent color, offset to top-right
// - Title: body font, single line
// - Meta: category (accent) · date (secondary) · provider (secondary)
// - Tags: up to 2 shown in capsules, +N for overflow
// - Chevron: tertiary color
// ============================================================

function renderDocumentRow(doc) {
  const tags = getTagsForItem('document', doc.id);
  const categoryLabel = getDocCategoryLabel(doc.category);

  return `
    <div class="document-row" onclick="pushView(() => renderDocDetail('${doc.id}'))">
      <div class="document-row-thumbnail">
        ${icon(getDocCategoryIcon(doc.category), 20)}
        ${doc.needsReview ? '<div class="document-row-review-dot"></div>' : ''}
      </div>

      <div class="document-row-content">
        <div class="document-row-title">${doc.title}</div>
        <div class="document-row-meta">
          <span class="document-row-category">${categoryLabel}</span>
          <span class="document-row-separator">·</span>
          <span class="document-row-date">${formatDate(doc.date)}</span>
          ${doc.provider ? `
            <span class="document-row-separator">·</span>
            <span class="document-row-provider">${doc.provider}</span>
          ` : ''}
        </div>
        ${tags.length > 0 ? `
          <div class="document-row-tags">
            ${tags.slice(0, 2).map(tag => {
              const color = getTagColor(tag.color);
              return `<span class="document-row-tag" style="background: color-mix(in srgb, ${color} 15%, transparent);">${tag.name}</span>`;
            }).join('')}
            ${tags.length > 2 ? `<span class="document-row-tag-overflow">+${tags.length - 2}</span>` : ''}
          </div>
        ` : ''}
      </div>

      <div class="document-row-chevron">
        ${icon('chevron.right', 14)}
      </div>
    </div>
  `;
}

// ============================================================
// Component: DocumentTile
// Matches DocumentTile.swift exactly:
// - Card: backgroundSecondary, medium radius (8px), sm padding (8px)
// - Preview: aspect ratio 8.5/11 (letter paper), backgroundTertiary, medium radius
// - Review indicator: 10px dot, offset from top-right
// - Title: bodySecondary font, 2 lines max
// - Category: caption, foregroundSecondary
// ============================================================

function renderDocumentTile(doc) {
  return `
    <div class="document-tile" onclick="pushView(() => renderDocDetail('${doc.id}'))">
      <div class="document-tile-preview">
        ${icon(getDocCategoryIcon(doc.category), 32)}
        ${doc.needsReview ? '<div class="document-tile-review-dot"></div>' : ''}
      </div>
      <div class="document-tile-info">
        <div class="document-tile-title">${doc.title}</div>
        <div class="document-tile-category">${getDocCategoryLabel(doc.category)}</div>
      </div>
    </div>
  `;
}

// ============================================================
// Component: Loading State (Skeleton)
// Matches DocumentLibraryView.swift loadingState
// ============================================================

function renderDocumentsLoading() {
  const skeletonRows = Array(5).fill(null).map(() => `
    <div class="document-row skeleton">
      <div class="document-row-thumbnail skeleton-pulse"></div>
      <div class="document-row-content">
        <div class="skeleton-text skeleton-title skeleton-pulse"></div>
        <div class="skeleton-text skeleton-meta skeleton-pulse"></div>
      </div>
    </div>
  `).join('');

  return `<div class="documents-list">${skeletonRows}</div>`;
}

// ============================================================
// Component: Empty State - No Documents
// Matches EmptyState component from DocumentLibraryView
// ============================================================

function renderDocumentsEmptyNoDocuments() {
  return `
    <div class="documents-empty-state">
      <div class="documents-empty-icon">${icon('doc.text', 64)}</div>
      <div class="documents-empty-title">No Documents</div>
      <div class="documents-empty-desc">Add your first document to get started.</div>
      <button class="documents-empty-btn" onclick="showSheet(renderDocumentUploadSheet)">Add Document</button>
    </div>
  `;
}

// ============================================================
// Component: Empty State - No Search Results
// Matches ContentUnavailableView.search style
// ============================================================

function renderDocumentsEmptyNoResults() {
  return `
    <div class="documents-empty-state">
      <div class="documents-empty-icon">${icon('magnifyingglass', 64)}</div>
      <div class="documents-empty-title">No Results</div>
      <div class="documents-empty-desc">No documents match your search or filters.</div>
    </div>
  `;
}

// ============================================================
// Component: Document Upload Sheet (placeholder)
// ============================================================

function renderDocumentUploadSheet() {
  return `
    <div class="sheet-header">
      <span class="sheet-title">Add Document</span>
      <button class="sheet-close" onclick="dismissSheet()">${icon('xmark', 14)}</button>
    </div>
    <div class="sheet-body">
      <div class="upload-option" onclick="dismissSheet()">
        ${icon('doc.badge.plus', 24)}
        <span>Upload Document</span>
      </div>
      <div class="upload-option" onclick="dismissSheet()">
        ${icon('doc.viewfinder', 24)}
        <span>Scan Document</span>
      </div>
      <div class="upload-option" onclick="dismissSheet()">
        ${icon('camera', 24)}
        <span>Take Photo</span>
      </div>
    </div>
  `;
}

// ============================================================
// Main Screen: Documents Library
// Matches DocumentLibraryView.swift structure exactly
// ============================================================

function renderDocumentsScreen() {
  const filteredDocs = getFilteredDocuments();
  const isEmpty = DATA.documents.length === 0;
  const noResults = filteredDocs.length === 0 && !isEmpty;

  // Determine content
  let content;
  if (documentsState.isLoading) {
    content = renderDocumentsLoading();
  } else if (isEmpty) {
    content = renderDocumentsEmptyNoDocuments();
  } else if (noResults) {
    content = renderDocumentsEmptyNoResults();
  } else if (documentsState.viewMode === 'grid') {
    content = renderDocumentsGrid(filteredDocs);
  } else {
    content = renderDocumentsList(filteredDocs);
  }

  return `
    <div class="documents-screen">
      ${renderDocumentsHeader()}
      ${renderDocumentsSearchBar()}
      ${!isEmpty ? renderDocumentsToolbar() : ''}
      ${!isEmpty ? renderDocumentsFilterBar() : ''}
      ${content}
    </div>
  `;
}

// ============================================================
// Header (Navigation Title)
// ============================================================

function renderDocumentsHeader() {
  return `
    <div class="screen-header">
      <div class="screen-title">Documents</div>
    </div>
  `;
}

// ============================================================
// Search Bar (navigationBarDrawer, always visible)
// ============================================================

function renderDocumentsSearchBar() {
  return `
    <div class="documents-search-bar">
      ${icon('magnifyingglass', 16)}
      <input type="text"
             placeholder="Search documents"
             value="${documentsState.searchText}"
             oninput="documentsState.searchText = this.value; render()">
    </div>
  `;
}

// ============================================================
// Toolbar (view toggle + add menu)
// ============================================================

function renderDocumentsToolbar() {
  return `
    <div class="documents-toolbar">
      <div class="documents-view-toggle">
        <button class="view-toggle-btn ${documentsState.viewMode === 'list' ? 'active' : ''}"
                onclick="setDocumentsViewMode('list')"
                aria-label="List view">
          ${icon('list.bullet', 18)}
        </button>
        <button class="view-toggle-btn ${documentsState.viewMode === 'grid' ? 'active' : ''}"
                onclick="setDocumentsViewMode('grid')"
                aria-label="Grid view">
          ${icon('square.grid.2x2', 18)}
        </button>
      </div>
      <button class="documents-add-btn" onclick="showSheet(renderDocumentUploadSheet)">
        ${icon('plus', 20)}
      </button>
    </div>
  `;
}

// ============================================================
// List View
// ============================================================

function renderDocumentsList(docs) {
  return `
    <div class="documents-list">
      ${docs.map(renderDocumentRow).join('')}
    </div>
  `;
}

// ============================================================
// Grid View
// Matches DocumentLibraryView gridView - 2 columns compact, 4 regular
// Using CSS to handle responsive columns
// ============================================================

function renderDocumentsGrid(docs) {
  return `
    <div class="documents-grid">
      ${docs.map(renderDocumentTile).join('')}
    </div>
  `;
}
