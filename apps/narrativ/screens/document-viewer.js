// Document Viewer Screen - Displays document details with preview and linked events

/**
 * Renders the document viewer/detail view
 * @param {string} docId - The ID of the document to display
 */
function renderDocumentViewer(docId) {
  const doc = DATA.documents.find(d => d.id === docId);
  if (!doc) {
    return `
      <div class="empty-state">
        <span class="empty-state-title">Document not found</span>
      </div>
    `;
  }

  const tags = getTagsForItem('document', doc.id);
  const linkedEvents = DATA.events.filter(
    e => e.linkedDocuments && e.linkedDocuments.includes(doc.id)
  );

  const categoryColor = getCategoryColor(
    doc.category === 'lab_result' ? 'lab_result' : 'appointment'
  );

  return `
    ${renderNavBar('Document', { back: true })}

    <div class="document-preview-area">
      ${icon(getDocCategoryIcon(doc.category), 48)}
      <span class="document-preview-label">Document Preview</span>
    </div>

    <div class="detail-hero">
      ${renderBadge(getDocCategoryLabel(doc.category), categoryColor)}
      <div class="detail-hero-title">${doc.title}</div>
      <div class="detail-hero-provider">${doc.provider}</div>
    </div>

    <div class="detail-section">
      <div class="detail-section-title">Metadata</div>
      <div class="detail-meta-row">
        <span class="detail-meta-label">Date</span>
        <span class="detail-meta-value">${formatDate(doc.date)}</span>
      </div>
      <div class="detail-meta-row">
        <span class="detail-meta-label">Category</span>
        <span class="detail-meta-value">${getDocCategoryLabel(doc.category)}</span>
      </div>
      <div class="detail-meta-row">
        <span class="detail-meta-label">Provider</span>
        <span class="detail-meta-value">${doc.provider}</span>
      </div>
    </div>

    ${tags.length ? `
    <div class="detail-section">
      <div class="detail-section-title">Tags</div>
      <div class="flow-layout">${tags.map(renderTagChip).join('')}</div>
    </div>
    ` : ''}

    ${linkedEvents.length ? `
    <div class="detail-section">
      <div class="detail-section-title">Linked Events</div>
      ${linkedEvents.map(event => `
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

    <div style="height: var(--spacing-lg)"></div>
  `;
}

// Alias for backward compatibility with existing app.js
function renderDocDetail(docId) {
  return renderDocumentViewer(docId);
}
