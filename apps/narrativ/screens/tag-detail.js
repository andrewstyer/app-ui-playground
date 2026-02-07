// Tag Detail Screen - Shows tag info with associated events and documents

/**
 * Renders the tag detail view
 * @param {string} tagId - The ID of the tag to display
 */
function renderTagDetail(tagId) {
  const tag = DATA.tags.find(t => t.id === tagId);
  if (!tag) {
    return `
      <div class="empty-state">
        <span class="empty-state-title">Tag not found</span>
      </div>
    `;
  }

  const color = getTagColor(tag.color);

  // Find tagged items
  const taggedDocs = Object.entries(DATA.tagAssignments.documents)
    .filter(([, tags]) => tags.includes(tag.id))
    .map(([docId]) => DATA.documents.find(d => d.id === docId))
    .filter(Boolean);

  const taggedEvents = Object.entries(DATA.tagAssignments.events)
    .filter(([, tags]) => tags.includes(tag.id))
    .map(([eventId]) => DATA.events.find(e => e.id === eventId))
    .filter(Boolean);

  return `
    ${renderNavBar(tag.name, { back: true })}

    <div class="detail-hero" style="align-items: center;">
      <div class="tag-detail-icon" style="background: color-mix(in srgb, ${color} 15%, transparent); color: ${color};">
        ${icon(tag.icon, 32)}
      </div>
      <div class="detail-hero-title">${tag.name}</div>
      <div class="tag-detail-description">${tag.description}</div>
    </div>

    ${taggedEvents.length ? `
    <div class="detail-section">
      <div class="detail-section-title">Events (${taggedEvents.length})</div>
      ${taggedEvents.map(event => `
        <div class="event-row" onclick="pushView(() => renderEventDetail('${event.id}'))">
          <div class="event-dot" style="background: ${getCategoryColor(event.category)}"></div>
          <div class="event-row-content">
            <div class="event-row-title">${event.title}</div>
            <div class="event-row-date">${formatDate(getEventDate(event))}</div>
          </div>
          ${icon('chevron.right', 16)}
        </div>
      `).join('')}
    </div>
    ` : ''}

    ${taggedDocs.length ? `
    <div class="detail-section">
      <div class="detail-section-title">Documents (${taggedDocs.length})</div>
      ${taggedDocs.map(doc => `
        <div class="doc-row" onclick="pushView(() => renderDocumentViewer('${doc.id}'))">
          <div class="doc-thumbnail">${icon(getDocCategoryIcon(doc.category), 20)}</div>
          <div class="doc-row-content">
            <div class="doc-row-title">${doc.title}</div>
            <div class="doc-row-meta">${formatDate(doc.date)}</div>
          </div>
          ${icon('chevron.right', 16)}
        </div>
      `).join('')}
    </div>
    ` : ''}

    ${!taggedEvents.length && !taggedDocs.length ? `
    <div class="detail-section">
      <div class="empty-section-text">No documents or events with this tag</div>
    </div>
    ` : ''}

    <div style="height: var(--spacing-lg)"></div>
  `;
}
