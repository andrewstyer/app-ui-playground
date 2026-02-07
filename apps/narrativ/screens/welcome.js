// Welcome/Onboarding Screen - 5 swipeable pages with page indicators

// WelcomeStrings from Swift source
const WelcomeStrings = {
  ValueProp: {
    headline: 'Own Your Health Story',
    body: "Your health records are scattered. Your history lives in fragments. Narrativ brings it all together - so you can see your story clearly and share it with confidence.",
  },
  Capabilities: {
    headline: 'How Narrativ works',
    intro: 'Three connected tools work together:',
    documentsTitle: 'Documents',
    documentsDescription: 'Upload records, lab results, and reports. We extract key details automatically.',
    timelineTitle: 'Timeline',
    timelineDescription: 'See your health events together. Spot patterns, track what led to what.',
    narrativeTitle: 'Narrative',
    narrativeDescription: 'Tell your story in your own words, with documents and events as evidence.',
    outro: 'Each piece connects to the others. You build the picture that makes sense to you.',
  },
  GettingStarted: {
    headline: 'Where to begin',
    intro: 'Two approaches work well:',
    documentsFirstTitle: 'Start with documents',
    documentsFirstDescription: "Upload what you have. We'll organize it into events and connections.",
    storyFirstTitle: 'Start with your story',
    storyFirstDescription: 'Write your experience first. Add documents as supporting evidence.',
    outro: 'Either works. Switch between them anytime.',
  },
  SampleMode: {
    headline: 'See it in action',
    body: `We've included sample data from a fictional patient. Explore their timeline, documents, and narrative to see how everything connects.

Use sample mode to:
- Get familiar with how the app works
- See how documents, events, and narrative connect
- Experiment freely - nothing touches your real data

Switch between sample mode and your data anytime.`,
  },
  YourData: {
    headline: 'When you\'re ready',
    intro: 'Three ways to start:',
    uploadDocumentsTitle: 'Upload documents',
    uploadDocumentsDescription: 'Import PDFs, photos, or files. We extract key details automatically.',
    connectHealthTitle: 'Connect Apple Health',
    connectHealthDescription: 'Import clinical records from hospitals that support HealthKit.',
    startNarrativeTitle: 'Start your narrative',
    startNarrativeDescription: 'Create your first narrative in the Story tab.',
    closing: "There's no rush. Start when it feels right.",
    getStartedButton: 'Get Started',
  },
  Navigation: {
    skip: 'Skip',
  },
};

// Welcome page state
let welcomeCurrentPage = 0;
const WELCOME_PAGE_COUNT = 5;

/**
 * Renders the welcome/onboarding view with 5 swipeable pages
 */
function renderWelcome() {
  const pages = [
    renderWelcomePage1(),
    renderWelcomePage2(),
    renderWelcomePage3(),
    renderWelcomePage4(),
    renderWelcomePage5(),
  ];

  return `
    <div class="welcome-container">
      <button class="welcome-skip" onclick="dismissWelcome()">
        ${WelcomeStrings.Navigation.skip}
      </button>

      <div class="welcome-pages" id="welcome-pages" data-page="${welcomeCurrentPage}">
        ${pages.map((page, i) => `
          <div class="welcome-page ${i === welcomeCurrentPage ? 'active' : ''}" data-index="${i}">
            ${page}
          </div>
        `).join('')}
      </div>

      <div class="welcome-footer">
        <div class="welcome-dots">
          ${Array.from({ length: WELCOME_PAGE_COUNT }, (_, i) => `
            <div class="welcome-dot ${i === welcomeCurrentPage ? 'active' : ''}" onclick="setWelcomePage(${i})"></div>
          `).join('')}
        </div>

        ${welcomeCurrentPage === WELCOME_PAGE_COUNT - 1 ? `
          <button class="welcome-get-started" onclick="dismissWelcome()">
            ${WelcomeStrings.YourData.getStartedButton}
          </button>
        ` : ''}
      </div>
    </div>
  `;
}

/**
 * Page 1: Value Proposition
 */
function renderWelcomePage1() {
  return `
    <div class="welcome-illustration">
      <div class="welcome-illustration-cohesion">
        <div class="welcome-cohesion-circle"></div>
        ${icon('heart.text.square', 48)}
      </div>
    </div>
    <div class="welcome-content">
      <h1 class="welcome-headline">${WelcomeStrings.ValueProp.headline}</h1>
      <p class="welcome-body">${WelcomeStrings.ValueProp.body}</p>
    </div>
  `;
}

/**
 * Page 2: Capabilities
 */
function renderWelcomePage2() {
  const { Capabilities } = WelcomeStrings;
  return `
    <div class="welcome-illustration">
      <div class="welcome-illustration-capabilities">
        <div class="welcome-capability">
          ${icon('doc.text', 32)}
          <span>Documents</span>
        </div>
        <div class="welcome-capability">
          ${icon('calendar', 32)}
          <span>Timeline</span>
        </div>
        <div class="welcome-capability">
          ${icon('book.pages', 32)}
          <span>Story</span>
        </div>
      </div>
    </div>
    <div class="welcome-content">
      <h1 class="welcome-headline">${Capabilities.headline}</h1>
      <p class="welcome-body">
        ${Capabilities.intro}
        <br><br>
        <strong>${Capabilities.documentsTitle}</strong> ${Capabilities.documentsDescription}
        <br><br>
        <strong>${Capabilities.timelineTitle}</strong> ${Capabilities.timelineDescription}
        <br><br>
        <strong>${Capabilities.narrativeTitle}</strong> ${Capabilities.narrativeDescription}
        <br><br>
        ${Capabilities.outro}
      </p>
    </div>
  `;
}

/**
 * Page 3: Getting Started
 */
function renderWelcomePage3() {
  const { GettingStarted } = WelcomeStrings;
  return `
    <div class="welcome-illustration">
      <div class="welcome-illustration-paths">
        <div class="welcome-path">
          ${icon('arrow.up.doc.fill', 48)}
          <span>Documents<br>First</span>
        </div>
        <span class="welcome-path-or">or</span>
        <div class="welcome-path">
          ${icon('pencil.and.scribble', 48)}
          <span>Story<br>First</span>
        </div>
      </div>
    </div>
    <div class="welcome-content">
      <h1 class="welcome-headline">${GettingStarted.headline}</h1>
      <p class="welcome-body">
        ${GettingStarted.intro}
        <br><br>
        <strong>${GettingStarted.documentsFirstTitle}</strong> ${GettingStarted.documentsFirstDescription}
        <br><br>
        <strong>${GettingStarted.storyFirstTitle}</strong> ${GettingStarted.storyFirstDescription}
        <br><br>
        ${GettingStarted.outro}
      </p>
    </div>
  `;
}

/**
 * Page 4: Sample Mode
 */
function renderWelcomePage4() {
  const { SampleMode } = WelcomeStrings;
  return `
    <div class="welcome-illustration">
      <div class="welcome-illustration-sample">
        <div class="welcome-sample-box">
          ${icon('play.square.fill', 32)}
          <span>Sample Mode</span>
        </div>
      </div>
    </div>
    <div class="welcome-content">
      <h1 class="welcome-headline">${SampleMode.headline}</h1>
      <p class="welcome-body">${SampleMode.body.replace(/\n/g, '<br>')}</p>
    </div>
  `;
}

/**
 * Page 5: Your Data / Actions
 */
function renderWelcomePage5() {
  const { YourData } = WelcomeStrings;
  return `
    <div class="welcome-illustration">
      <div class="welcome-illustration-actions">
        <div class="welcome-actions-row">
          <span class="welcome-action-label">${icon('arrow.up.doc.fill', 20)} Upload</span>
          <span class="welcome-action-label">${icon('heart.text.square', 20)} Connect</span>
        </div>
        <span class="welcome-action-label">${icon('pencil.line', 20)} Write</span>
      </div>
    </div>
    <div class="welcome-content">
      <h1 class="welcome-headline">${YourData.headline}</h1>
      <p class="welcome-body">
        ${YourData.intro}
        <br><br>
        <strong>${YourData.uploadDocumentsTitle}</strong> ${YourData.uploadDocumentsDescription}
        <br><br>
        <strong>${YourData.connectHealthTitle}</strong> ${YourData.connectHealthDescription}
        <br><br>
        <strong>${YourData.startNarrativeTitle}</strong> ${YourData.startNarrativeDescription}
        <br><br>
        ${YourData.closing}
      </p>
    </div>
  `;
}

/**
 * Navigate to a specific welcome page
 */
function setWelcomePage(pageIndex) {
  welcomeCurrentPage = Math.max(0, Math.min(pageIndex, WELCOME_PAGE_COUNT - 1));
  render();
}

/**
 * Move to next welcome page
 */
function nextWelcomePage() {
  if (welcomeCurrentPage < WELCOME_PAGE_COUNT - 1) {
    setWelcomePage(welcomeCurrentPage + 1);
  }
}

/**
 * Move to previous welcome page
 */
function prevWelcomePage() {
  if (welcomeCurrentPage > 0) {
    setWelcomePage(welcomeCurrentPage - 1);
  }
}

/**
 * Dismiss welcome and go to main app
 */
function dismissWelcome() {
  welcomeCurrentPage = 0;
  // In the playground, just switch to home tab
  state.activeTab = 'home';
  render();
}

// Add pencil.line and play.square.fill icons if not present
if (typeof ICONS !== 'undefined') {
  ICONS['pencil.line'] = ICONS['pencil.line'] || '<path d="M12 19l7-7 3 3-7 7H12v-3z"/><path d="M18 13l-1.5-1.5L12 6l3-3 1.5 1.5L21 9l-3 4z"/>';
  ICONS['play.square.fill'] = ICONS['play.square.fill'] || '<rect x="3" y="3" width="18" height="18" rx="2" fill="currentColor"/><polygon points="10 8 16 12 10 16" fill="var(--color-background)"/>';
  ICONS['pencil.and.scribble'] = ICONS['pencil.and.scribble'] || '<path d="M14 4l2.5 2.5L5 18H3v-2L14 4z"/><path d="M17 15c2 0 4 1.5 4 3.5S19 22 17 22s-4-1.5-4-3.5 2-3.5 4-3.5z"/>';
  ICONS['arrow.up.doc.fill'] = ICONS['arrow.up.doc.fill'] || '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" fill="currentColor"/><polyline points="14 2 14 8 20 8"/><polyline points="12 18 12 12"/><polyline points="9 15 12 12 15 15"/>';
}
