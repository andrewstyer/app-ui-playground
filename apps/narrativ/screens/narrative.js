// Narrative screen renderer - matches NarrativeView.swift exactly

/**
 * Renders the Narrative/Story screen.
 * On iPhone (compact), shows ChapterListNavigable - a flat list of chapters
 * with linked events/documents indented below each chapter.
 * Tapping a chapter navigates to ChapterReadingView.
 */
function renderNarrative() {
  const chapters = DATA.narrative.chapters;

  // Empty state - matches NarrativeEmptyState.swift
  if (!chapters.length) {
    return `
      <div class="screen-header">
        <div class="screen-title">Chapters</div>
      </div>
      <div class="empty-state">
        <div class="empty-state-icon">${icon('book.pages', 64)}</div>
        <div class="empty-state-title">No Story Yet</div>
        <div class="empty-state-desc">Create your story to organize your health journey into chapters.</div>
        <button class="empty-state-btn" onclick="showSheet(renderWizardSheet)">Create Your Story</button>
      </div>
    `;
  }

  return `
    <div class="narrative-screen">
      ${renderNarrativeHeader()}
      ${renderChapterList(chapters)}
    </div>
  `;
}

/**
 * Renders the navigation header with toolbar.
 * Matches NarrativeView toolbar content.
 */
function renderNarrativeHeader() {
  const isEditing = state.narrativeEditing || false;

  return `
    <div class="narrative-header">
      <div class="screen-header">
        <div class="screen-title">Chapters</div>
      </div>
      <div class="narrative-toolbar">
        ${isEditing ? `
          <button class="toolbar-btn" onclick="toggleNarrativeEventPanel()">
            ${icon('calendar.badge.plus', 20)}
          </button>
        ` : '<div style="width: 44px"></div>'}
        <div class="toolbar-actions">
          <button class="toolbar-btn" onclick="showNarrativeMenu()">
            ${icon('ellipsis.circle', 20)}
          </button>
          <button class="toolbar-btn toolbar-btn-text" onclick="toggleNarrativeEditing()">
            ${isEditing ? 'Done' : 'Edit'}
          </button>
        </div>
      </div>
    </div>
  `;
}

/**
 * Gets linked events for a chapter based on chapter tags/condition.
 * In the real app, chapters have linkedEventIds. Here we match by tag.
 */
function getChapterLinkedEvents(chapter) {
  // Find events that share tags with this chapter's condition
  const conditionName = chapter.conditionName.toLowerCase();
  return DATA.events.filter(event => {
    const eventTags = getTagsForItem('event', event.id);
    return eventTags.some(tag =>
      tag.name.toLowerCase().includes(conditionName.split(' ')[0]) ||
      conditionName.includes(tag.name.toLowerCase())
    );
  });
}

/**
 * Gets linked documents for a chapter based on chapter tags/condition.
 */
function getChapterLinkedDocuments(chapter) {
  const conditionName = chapter.conditionName.toLowerCase();
  return DATA.documents.filter(doc => {
    const docTags = getTagsForItem('document', doc.id);
    return docTags.some(tag =>
      tag.name.toLowerCase().includes(conditionName.split(' ')[0]) ||
      conditionName.includes(tag.name.toLowerCase())
    );
  });
}

/**
 * Renders the chapter list view matching ChapterListNavigable on iPhone.
 * Each chapter is a row with title, approach, and linked items indented below.
 */
function renderChapterList(chapters) {
  return `
    <div class="chapter-list">
      ${chapters.map((chapter, idx) => renderChapterRow(chapter, idx)).join('')}
    </div>
  `;
}

/**
 * Renders a single chapter row with linked events/documents.
 * Matches ChapterRowCompact from BookReadingView.swift.
 */
function renderChapterRow(chapter, idx) {
  const linkedEvents = getChapterLinkedEvents(chapter);
  const linkedDocuments = getChapterLinkedDocuments(chapter);
  const hasLinkedItems = linkedEvents.length > 0 || linkedDocuments.length > 0;
  const approach = chapter.approach || 'timeline';

  return `
    <div class="chapter-row" onclick="pushView(() => renderChapterDetail(${idx}))">
      <div class="chapter-row-content">
        <div class="chapter-row-header">
          <div class="chapter-row-title">${chapter.conditionName}</div>
        </div>
        <div class="chapter-row-approach">
          ${icon(getApproachIcon(approach), 14)}
          <span>${getApproachTitle(approach)}</span>
        </div>
        ${hasLinkedItems ? `
          <div class="chapter-linked-items">
            ${linkedEvents.map(event => `
              <div class="chapter-linked-item">
                ${icon('calendar', 14)}
                <span class="chapter-linked-item-text">${event.title}</span>
              </div>
            `).join('')}
            ${linkedDocuments.map(doc => `
              <div class="chapter-linked-item" style="color: ${getDocCategoryColor(doc.category)}">
                ${icon(getDocCategoryIcon(doc.category), 14)}
                <span class="chapter-linked-item-text">${doc.title}</span>
              </div>
            `).join('')}
          </div>
        ` : ''}
      </div>
      <div class="chapter-row-chevron">
        ${icon('chevron.right', 14)}
      </div>
    </div>
  `;
}

/**
 * Gets document category color.
 */
function getDocCategoryColor(category) {
  const map = {
    lab_result: 'var(--color-category-lab-result)',
    medical_record: 'var(--color-accent)',
    imaging: 'var(--color-category-procedure)',
    insurance: 'var(--color-category-other)',
    other: 'var(--color-category-other)',
  };
  return map[category] || 'var(--color-foreground-secondary)';
}

/**
 * Renders the chapter detail view (pushed view).
 * Matches ChapterReadingView.swift.
 */
function renderChapterDetail(chapterIdx) {
  const chapter = DATA.narrative.chapters[chapterIdx];
  if (!chapter) return '';

  const approach = chapter.approach || 'timeline';

  return `
    ${renderNavBar(chapter.conditionName, { back: true })}
    <div class="chapter-detail-content">
      <div class="chapter-detail-approach">
        ${icon(getApproachIcon(approach), 16)}
        <span>${getApproachTitle(approach)}</span>
      </div>
      ${!chapter.sections || !chapter.sections.length ? `
        <div class="chapter-empty-text">
          This chapter is empty. Tap Edit to start writing.
        </div>
      ` : `
        ${chapter.sections.map(section => `
          <div class="narrative-section">
            <div class="section-title">${section.title}</div>
            <div class="section-text">${section.content}</div>
          </div>
        `).join('')}
      `}
    </div>
  `;
}

/**
 * Renders the chapter content with sections.
 * Matches ChapterReadingView.swift and ChapterContentView.swift.
 */
function renderChapterContent(chapter) {
  if (!chapter.sections || !chapter.sections.length) {
    return `
      <div class="chapter-content">
        <div class="chapter-header">
          ${icon(getApproachIcon(chapter.approach), 16)}
          <span>${getApproachTitle(chapter.approach)}</span>
        </div>
        <div class="chapter-empty-text">
          This chapter is empty. Tap Edit to start writing.
        </div>
      </div>
    `;
  }

  return `
    <div class="chapter-content">
      <div class="chapter-header">
        ${icon(getApproachIcon(chapter.approach), 16)}
        <span>${getApproachTitle(chapter.approach)}</span>
      </div>
      ${chapter.sections.map(section => `
        <div class="narrative-section">
          <div class="section-title">${section.title}</div>
          <div class="section-text">${section.content}</div>
        </div>
      `).join('')}
    </div>
  `;
}

/**
 * Gets the SF Symbol icon for a storytelling approach.
 */
function getApproachIcon(approach) {
  const icons = {
    'timeline': 'calendar.day.timeline.left',
    'perspective': 'person.crop.circle',
    'thematic': 'tag',
    'freeform': 'text.alignleft',
  };
  return icons[approach] || 'text.alignleft';
}

/**
 * Gets the display title for a storytelling approach.
 */
function getApproachTitle(approach) {
  const titles = {
    'timeline': 'Timeline Focused',
    'perspective': 'Perspective Focused',
    'thematic': 'Thematic',
    'freeform': 'Freeform',
  };
  return titles[approach] || 'Freeform';
}

/**
 * Set the current chapter index.
 */
function setNarrativeChapter(idx) {
  state.narrativeChapter = idx;
  render();
}

/**
 * Toggle editing mode for the narrative.
 */
function toggleNarrativeEditing() {
  state.narrativeEditing = !state.narrativeEditing;
  render();
}

/**
 * Show the narrative more menu.
 */
function showNarrativeMenu() {
  showSheet(() => `
    <div class="sheet-header">
      <span class="sheet-title">Options</span>
      <button class="sheet-close" onclick="dismissSheet()">${icon('xmark', 14)}</button>
    </div>
    <div class="sheet-body">
      <div class="menu-item" onclick="toggleNarrativeReferences(); dismissSheet();">
        ${icon(state.narrativeShowReferences ? 'link.circle.fill' : 'link.circle', 20)}
        <span>${state.narrativeShowReferences ? 'Hide References' : 'Show References'}</span>
      </div>
      <div class="menu-item-divider"></div>
      <div class="menu-item" onclick="toggleNarrativeView(); dismissSheet();">
        ${icon(state.narrativeViewMode === 'book' ? 'doc.text' : 'book', 20)}
        <span>${state.narrativeViewMode === 'book' ? 'Switch to Document View' : 'Switch to Book View'}</span>
      </div>
    </div>
  `);
}

/**
 * Toggle showing references in narrative.
 */
function toggleNarrativeReferences() {
  state.narrativeShowReferences = !state.narrativeShowReferences;
  render();
}

/**
 * Toggle between book and document view.
 */
function toggleNarrativeView() {
  state.narrativeViewMode = state.narrativeViewMode === 'book' ? 'document' : 'book';
  render();
}

/**
 * Toggle the event panel for linking events.
 */
function toggleNarrativeEventPanel() {
  showSheet(() => `
    <div class="sheet-header">
      <span class="sheet-title">Link Events</span>
      <button class="sheet-close" onclick="dismissSheet()">${icon('xmark', 14)}</button>
    </div>
    <div class="sheet-body">
      <div class="empty-state" style="min-height: 200px;">
        <div class="empty-state-icon">${icon('calendar.badge.plus', 48)}</div>
        <div class="empty-state-title">Link Your Events</div>
        <div class="empty-state-desc">Connect timeline events to your narrative sections.</div>
      </div>
    </div>
  `);
}

/**
 * Wizard sheet for creating a new story.
 */
function renderWizardSheet() {
  return `
    <div class="sheet-header">
      <span class="sheet-title">Create Your Story</span>
      <button class="sheet-close" onclick="dismissSheet()">${icon('xmark', 14)}</button>
    </div>
    <div class="wizard-progress">
      <div class="wizard-dot active"></div>
      <div class="wizard-dot"></div>
      <div class="wizard-dot"></div>
      <div class="wizard-dot"></div>
    </div>
    <div class="wizard-step">
      <div class="wizard-step-title">Choose a Condition</div>
      <div class="wizard-step-desc">Select the health condition or topic for this chapter of your story.</div>
      <div class="form-field">
        <label class="form-label">Condition Name</label>
        <input class="form-input" type="text" placeholder="e.g., ME/CFS, Diabetes, POTS" value="">
      </div>
    </div>
    <div class="wizard-actions">
      <button class="wizard-btn wizard-btn-secondary" onclick="dismissSheet()">Cancel</button>
      <button class="wizard-btn wizard-btn-primary">Next</button>
    </div>
  `;
}
