// Loading Screen - Document processing progress indicator

/**
 * Renders the loading/processing view
 * @param {Object} options - Optional configuration
 * @param {number} options.current - Current document being processed (1-indexed)
 * @param {number} options.total - Total documents to process
 * @param {string} options.status - Status text to display
 */
function renderLoading(options = {}) {
  const {
    current = 3,
    total = 12,
    status = 'Analyzing documents...',
  } = options;

  const progressPercent = total > 0 ? (current / total) * 100 : 0;

  return `
    <div class="loading-container">
      <div class="loading-content">
        <div class="loading-icon">
          ${icon('doc.text.magnifyingglass', 64)}
        </div>
        <div class="loading-status">${status}</div>
        <div class="loading-progress-text">${current} of ${total} documents</div>
        <div class="loading-progress-bar">
          <div class="loading-progress-fill" style="width: ${progressPercent}%"></div>
        </div>
      </div>
    </div>
  `;
}

// Add the magnifying glass doc icon if not present
if (typeof ICONS !== 'undefined') {
  ICONS['doc.text.magnifyingglass'] = ICONS['doc.text.magnifyingglass'] ||
    '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>' +
    '<polyline points="14 2 14 8 20 8"/>' +
    '<circle cx="11" cy="14" r="3"/>' +
    '<line x1="13" y1="16" x2="16" y2="19"/>';
}
