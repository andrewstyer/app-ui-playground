// Dashboard screen renderer - matches DashboardView.swift layout exactly

/**
 * Renders the Dashboard/Home screen matching the iOS DashboardView.swift layout.
 *
 * Layout structure:
 * - VStack(alignment: .leading, spacing: lg)
 *   - Greeting (displayLarge)
 *   - Stats section ("At a Glance")
 *   - Review card (conditional)
 *   - Navigation section ("Navigate To")
 *   - Quick Actions section
 * - All wrapped with padding(md)
 */
function renderDashboard() {
  const greeting = getTimeBasedGreeting();
  const docsNeedingReview = DATA.documents.filter(d => d.needsReview).length;

  return `
    <div class="dashboard">
      ${renderGreeting(greeting)}
      ${renderStatsSection()}
      ${docsNeedingReview > 0 ? renderReviewCard(docsNeedingReview) : ''}
      ${renderNavigationSection()}
      ${renderQuickActionsSection()}
    </div>
  `;
}

/**
 * Returns time-based greeting matching DashboardStrings.Greeting behavior
 */
function getTimeBasedGreeting() {
  // In the Swift app, this uses a random greeting from multiple languages
  // For the playground, we keep it simple with time-based English greetings
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

/**
 * Greeting section
 * Swift: Text("\(greeting), \(userName)")
 *        .font(theme.typography.displayLarge)
 *        .foregroundStyle(theme.colors.foreground)
 *        .padding(.bottom, theme.spacing.sm)
 */
function renderGreeting(greeting) {
  return `
    <div class="dashboard-greeting">
      <span class="dashboard-greeting-text">${greeting}, Sarah</span>
    </div>
  `;
}

/**
 * Stats section matching statsSection computed property
 * Swift layout:
 * - VStack(alignment: .leading, spacing: md)
 *   - Text("At a Glance").font(headline)
 *   - LazyVGrid(3 columns, spacing: sm)
 *     - StatCard(Documents, accent, compact)
 *     - StatCard(Events, success, compact)
 *     - StatCard(Chapters, warning, compact)
 *   .padding(md)
 *   .overlay(RoundedRectangle.stroke(border, 1px))
 */
function renderStatsSection() {
  return `
    <div class="dashboard-section">
      <div class="dashboard-section-header">At a Glance</div>
      <div class="dashboard-stats-container">
        <div class="dashboard-stats-grid">
          ${renderStatCard('Documents', DATA.documents.length, 'doc.text.fill', 'var(--color-accent)')}
          ${renderStatCard('Events', DATA.events.length, 'calendar', 'var(--color-success)')}
          ${renderStatCard('Chapters', DATA.narrative.chapters.length, 'book.pages', 'var(--color-warning)')}
        </div>
      </div>
    </div>
  `;
}

/**
 * StatCard (compact mode) matching StatCard.swift
 * Swift layout (compact=true):
 * - VStack(alignment: .center, spacing: xs)
 *   - Image(icon).font(body).foregroundStyle(color)
 *   - Text(count).font(title).fontWeight(.bold)
 *   - Text(title).font(caption).foregroundStyle(foregroundSecondary)
 * - .frame(maxWidth: .infinity)
 * - .padding(sm)
 */
function renderStatCard(title, count, iconName, color) {
  return `
    <div class="dashboard-stat-card">
      <span class="dashboard-stat-icon" style="color: ${color};">${icon(iconName, 17)}</span>
      <span class="dashboard-stat-value">${count}</span>
      <span class="dashboard-stat-label">${title}</span>
    </div>
  `;
}

/**
 * Review card matching reviewCard computed property
 * Swift layout:
 * - NavigationLink { BulkTagReviewView() } label: {
 *   - HStack
 *     - Image("tag.square").font(titleMedium).foregroundStyle(accent)
 *     - VStack(alignment: .leading, spacing: xs)
 *       - Text(documentsNeedReview).font(body).foregroundStyle(foreground)
 *       - Text(reviewSuggestedTags).font(caption).foregroundStyle(foregroundSecondary)
 *     - Spacer()
 *     - Image("chevron.right").foregroundStyle(foregroundTertiary)
 *   }
 *   .padding(md)
 *   .background(backgroundSecondary)
 *   .clipShape(RoundedRectangle(cornerRadius: medium))
 */
function renderReviewCard(count) {
  const docText = count === 1 ? 'document needs' : 'documents need';
  return `
    <div class="dashboard-review-card" onclick="switchTab('documents')">
      <span class="dashboard-review-icon">${icon('tag', 22)}</span>
      <div class="dashboard-review-content">
        <span class="dashboard-review-title">${count} ${docText} review</span>
        <span class="dashboard-review-subtitle">Review suggested tags</span>
      </div>
      <span class="dashboard-review-chevron">${icon('chevron.right', 16)}</span>
    </div>
  `;
}

/**
 * Navigation section matching navigationSection computed property
 * Swift layout:
 * - VStack(alignment: .leading, spacing: md)
 *   - Text("Navigate To").font(headline)
 *   - LazyVGrid(2 columns, spacing: md)
 *     - NavigationCard(Documents, doc.text.fill, accent)
 *     - NavigationCard(Timeline, calendar, success)
 *     - NavigationCard(Tags, tag.fill, warning)
 *     - NavigationCard(Story, book.pages, foregroundSecondary)
 */
function renderNavigationSection() {
  return `
    <div class="dashboard-section">
      <div class="dashboard-section-header">Navigate To</div>
      <div class="dashboard-nav-grid">
        ${renderNavCard('Documents', 'doc.text.fill', 'var(--color-accent)', 'documents')}
        ${renderNavCard('Timeline', 'calendar', 'var(--color-success)', 'timeline')}
        ${renderNavCard('Tags', 'tag', 'var(--color-warning)', 'tags')}
        ${renderNavCard('Story', 'book.pages', 'var(--color-foreground-secondary)', 'story')}
      </div>
    </div>
  `;
}

/**
 * NavigationCard matching NavigationCard.swift
 * Swift layout:
 * - NavigationLink { destination } label: {
 *   - VStack(spacing: md)
 *     - Image(icon).font(title).foregroundStyle(color)
 *     - Text(title).font(bodySecondary).fontWeight(.medium)
 *   }
 *   .frame(maxWidth: .infinity)
 *   .padding(.vertical, lg)
 *   .background(backgroundSecondary)
 *   .clipShape(RoundedRectangle(cornerRadius: medium))
 *   .shadow(subtle)
 */
function renderNavCard(title, iconName, color, tabId) {
  return `
    <div class="dashboard-nav-card" onclick="switchTab('${tabId}')">
      <span class="dashboard-nav-icon" style="color: ${color};">${icon(iconName, 28)}</span>
      <span class="dashboard-nav-title">${title}</span>
    </div>
  `;
}

/**
 * Quick Actions section matching quickActionsSection computed property
 * Swift layout:
 * - VStack(alignment: .leading, spacing: md)
 *   - Text("Quick Actions").font(headline)
 *   - NavigationLink (Import Health Records)
 *     - HStack
 *       - Image("heart.text.square").font(titleMedium).foregroundStyle(sourceHealthKit)
 *       - VStack(alignment: .leading, spacing: xs)
 *         - Text("Import Health Records").font(body)
 *         - Text("Connect to Apple Health").font(caption)
 *       - Spacer()
 *       - Image("chevron.right").foregroundStyle(foregroundTertiary)
 *     .padding(md)
 *     .background(backgroundSecondary)
 *     .clipShape(RoundedRectangle(cornerRadius: medium))
 *   - ReplayWelcomeCard()
 */
function renderQuickActionsSection() {
  return `
    <div class="dashboard-section">
      <div class="dashboard-section-header">Quick Actions</div>
      ${renderQuickActionRow('heart.text.square', 'var(--color-source-healthkit)', 'Import Health Records', 'Connect to Apple Health', 'settings')}
      ${renderQuickActionRow('play', 'var(--color-accent)', 'Replay Welcome', 'Watch the introduction again', null)}
    </div>
  `;
}

/**
 * Quick action row matching the HStack layout in quickActionsSection
 */
function renderQuickActionRow(iconName, iconColor, title, subtitle, tabId) {
  const onclick = tabId ? `onclick="switchTab('${tabId}')"` : '';
  return `
    <div class="dashboard-quick-action" ${onclick}>
      <span class="dashboard-quick-action-icon" style="color: ${iconColor};">${icon(iconName, 22)}</span>
      <div class="dashboard-quick-action-content">
        <span class="dashboard-quick-action-title">${title}</span>
        <span class="dashboard-quick-action-subtitle">${subtitle}</span>
      </div>
      <span class="dashboard-quick-action-chevron">${icon('chevron.right', 16)}</span>
    </div>
  `;
}
