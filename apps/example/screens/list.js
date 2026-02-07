/**
 * List Screen
 */

function renderList() {
  const items = DATA.items;

  return `
    <div class="screen-header">
      <div class="screen-title">Items</div>
    </div>

    <div class="list-section" style="margin: var(--spacing-md);">
      ${items.map(item => `
        <div class="list-row" onclick="Navigation.push(() => renderItemDetail('${item.id}'))">
          <div class="list-row-icon" style="background: rgba(var(--color-accent-rgb), 0.1);">
            ${icon(item.icon, 20)}
          </div>
          <div class="list-row-content">
            <div class="list-row-title">${item.title}</div>
            <div class="list-row-subtitle">${item.subtitle}</div>
          </div>
          <div class="list-row-chevron">${icon('chevron.right', 14)}</div>
        </div>
      `).join('')}
    </div>
  `;
}

function renderItemDetail(id) {
  const item = DATA.items.find(i => i.id === id);

  if (!item) {
    return `
      <div class="empty-state">
        <span class="empty-state-title">Item not found</span>
      </div>
    `;
  }

  return `
    ${renderNavBar(item.title, { back: true })}

    <div class="detail-section" style="margin: var(--spacing-md);">
      <div class="card">
        <div class="card-body" style="text-align: center; padding: var(--spacing-xl);">
          <div style="
            width: 80px;
            height: 80px;
            border-radius: 50%;
            background: rgba(var(--color-accent-rgb), 0.1);
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto var(--spacing-md);
          ">
            ${icon(item.icon, 40)}
          </div>
          <h2 style="margin: 0 0 var(--spacing-xs); font: var(--font-title-medium);">${item.title}</h2>
          <p style="margin: 0; color: var(--color-foreground-secondary);">${item.subtitle}</p>
        </div>
      </div>
    </div>

    <div class="list-section" style="margin: var(--spacing-md);">
      <div class="list-section-header">Details</div>
      <div class="list-row">
        <div class="list-row-content">
          <div class="list-row-title">ID</div>
        </div>
        <div class="list-row-value">${item.id}</div>
      </div>
      <div class="list-row">
        <div class="list-row-content">
          <div class="list-row-title">Icon</div>
        </div>
        <div class="list-row-value">${item.icon}</div>
      </div>
    </div>
  `;
}
