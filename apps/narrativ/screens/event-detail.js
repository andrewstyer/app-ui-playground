// Event Detail Screen - Displays full event information with linked documents

/**
 * Renders the event detail view
 * @param {string} eventId - The ID of the event to display
 */
function renderEventDetail(eventId) {
  const event = DATA.events.find(e => e.id === eventId);
  if (!event) {
    return `
      <div class="empty-state">
        <span class="empty-state-title">Event not found</span>
      </div>
    `;
  }

  const tags = getTagsForItem('event', event.id);
  const linkedDocs = (event.linkedDocuments || [])
    .map(dId => DATA.documents.find(d => d.id === dId))
    .filter(Boolean);

  const categoryColor = getCategoryColor(event.category);
  const dateStr = getEventDate(event);
  const endDateStr = event.endDate ? formatDate(event.endDate) : null;

  return `
    ${renderNavBar(event.title, { back: true })}

    <div class="detail-hero">
      ${renderBadge(getCategoryLabel(event.category), categoryColor)}
      <div class="detail-hero-title">${event.title}</div>
      <div class="detail-hero-date">
        ${formatDate(dateStr)}${endDateStr ? ' - ' + endDateStr : ''}
      </div>
    </div>

    ${event.description ? `
    <div class="detail-section">
      <div class="detail-section-title">Description</div>
      <p class="detail-description">${event.description}</p>
    </div>
    ` : ''}

    <div class="detail-section">
      <div class="detail-section-title">Details</div>
      <div class="detail-meta-row">
        <span class="detail-meta-label">Category</span>
        <span class="detail-meta-value">${getCategoryLabel(event.category)}</span>
      </div>
      <div class="detail-meta-row">
        <span class="detail-meta-label">Type</span>
        <span class="detail-meta-value">${event.type === 'health_event' ? 'Health Event' : 'Life Event'}</span>
      </div>
      <div class="detail-meta-row">
        <span class="detail-meta-label">Date</span>
        <span class="detail-meta-value">${formatDate(dateStr)}</span>
      </div>
    </div>

    ${tags.length ? `
    <div class="detail-section">
      <div class="detail-section-title">Tags</div>
      <div class="flow-layout">${tags.map(renderTagChip).join('')}</div>
    </div>
    ` : ''}

    ${linkedDocs.length ? `
    <div class="detail-section">
      <div class="detail-section-title">Linked Documents</div>
      ${linkedDocs.map(doc => `
        <div class="doc-row" onclick="pushView(() => renderDocumentViewer('${doc.id}'))">
          <div class="doc-thumbnail">${icon(getDocCategoryIcon(doc.category), 20)}</div>
          <div class="doc-row-content">
            <div class="doc-row-title">${doc.title}</div>
            <div class="doc-row-meta">${formatDate(doc.date)} - ${doc.provider}</div>
          </div>
          ${icon('chevron.right', 16)}
        </div>
      `).join('')}
    </div>
    ` : ''}

    <div style="height: var(--spacing-lg)"></div>
  `;
}
