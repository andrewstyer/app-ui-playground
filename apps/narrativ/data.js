// Sample data embedded from sarah-chen-data.json

const DATA = {
  persona: 'Sarah Chen',

  tags: [
    { id: 'tag-1', name: 'Insurance', description: 'Documents and events related to insurance claims', color: 'blue', icon: 'doc.text.fill' },
    { id: 'tag-2', name: 'Follow-up', description: 'Items requiring follow-up action', color: 'orange', icon: 'arrow.clockwise' },
    { id: 'tag-3', name: 'Annual', description: 'Yearly checkups and screenings', color: 'green', icon: 'calendar' },
    { id: 'tag-4', name: 'Important', description: 'High-priority items to review', color: 'red', icon: 'exclamationmark.circle' },
    { id: 'tag-5', name: 'ME/CFS', description: 'Related to chronic fatigue syndrome diagnosis and treatment', color: 'purple', icon: 'bolt.heart' },
    { id: 'tag-6', name: 'Knee', description: 'Related to ACL injury and knee osteoarthritis', color: 'mint', icon: 'figure.walk' },
  ],

  tagAssignments: {
    documents: {
      'sample-doc-012': ['tag-5'],
      'sample-doc-017': ['tag-5', 'tag-4'],
      'sample-doc-018': ['tag-5', 'tag-2'],
      'sample-doc-015': ['tag-4'],
      'sample-doc-019': ['tag-6'],
      'sample-doc-020': ['tag-6'],
      'sample-doc-021': ['tag-6'],
      'sample-doc-022': ['tag-6'],
      'sample-doc-023': ['tag-6'],
      'sample-doc-024': ['tag-6', 'tag-2'],
    },
    events: {
      'sample-event-015': ['tag-5'],
      'sample-event-016': ['tag-5'],
      'sample-event-021': ['tag-5', 'tag-4'],
      'sample-event-022': ['tag-5', 'tag-4'],
      'sample-event-023': ['tag-5'],
      'sample-event-026': ['tag-5'],
      'sample-event-028': ['tag-5', 'tag-2'],
      'sample-event-001': ['tag-4'],
      'sample-event-029': ['tag-6', 'tag-4'],
      'sample-event-030': ['tag-6'],
      'sample-event-031': ['tag-6'],
      'sample-event-032': ['tag-6'],
      'sample-event-033': ['tag-6'],
      'sample-event-034': ['tag-6', 'tag-2'],
    }
  },

  events: [
    { id: 'sample-event-001', title: 'COVID-19 Diagnosis', description: 'Tested positive for COVID-19, moderate symptoms requiring 2 weeks isolation', date: '2020-03-15', category: 'diagnosis', type: 'health_event', linkedDocuments: ['sample-doc-001'] },
    { id: 'sample-event-002', title: 'First PCP Visit for Fatigue', description: 'Persistent fatigue after COVID recovery, basic labs ordered', date: '2020-10-05', category: 'appointment', type: 'health_event', linkedDocuments: ['sample-doc-002', 'sample-doc-003'] },
    { id: 'sample-event-003', title: 'Relationship Ended', description: 'Long-term relationship ended due to stress from pandemic and health changes', date: '2021-06-10', category: 'major_life_event', type: 'life_event', linkedDocuments: [] },
    { id: 'sample-event-004', title: 'Moved to Portland', description: 'Relocated from San Francisco to Portland for new remote job and lower cost of living', date: '2021-07-20', category: 'major_life_event', type: 'life_event', linkedDocuments: [] },
    { id: 'sample-event-005', title: 'Started New Remote Job', description: 'Began full-time remote software engineering position', date: '2021-08-01', category: 'major_life_event', type: 'life_event', linkedDocuments: [] },
    { id: 'sample-event-006', title: 'Neurologist Consultation', description: 'Brain fog and cognitive symptoms evaluation, MRI ordered', date: '2022-01-15', category: 'appointment', type: 'health_event', linkedDocuments: ['sample-doc-004'] },
    { id: 'sample-event-007', title: 'Brain MRI', description: 'Brain MRI performed to evaluate cognitive symptoms', date: '2022-01-28', category: 'surgery', type: 'health_event', linkedDocuments: ['sample-doc-005'] },
    { id: 'sample-event-008', title: 'Cardiology Consultation', description: 'Heart palpitations evaluation, echo and Holter monitor ordered', date: '2022-04-10', category: 'appointment', type: 'health_event', linkedDocuments: ['sample-doc-006'] },
    { id: 'sample-event-009', title: 'Echocardiogram', description: 'Cardiac ultrasound to evaluate heart structure and function', date: '2022-04-18', category: 'surgery', type: 'health_event', linkedDocuments: ['sample-doc-007'] },
    { id: 'sample-event-010', title: '24-Hour Holter Monitor', description: 'Continuous heart monitoring for palpitations', date: '2022-04-25', category: 'surgery', type: 'health_event', linkedDocuments: ['sample-doc-008'] },
    { id: 'sample-event-011', title: 'Endocrinology Consultation', description: 'Thyroid and hormone evaluation for fatigue symptoms', date: '2022-08-05', category: 'appointment', type: 'health_event', linkedDocuments: ['sample-doc-009'] },
    { id: 'sample-event-012', title: 'Thyroid Panel', description: 'Comprehensive thyroid function testing', date: '2022-08-12', category: 'other', type: 'health_event', linkedDocuments: ['sample-doc-010'] },
    { id: 'sample-event-013', title: 'Autoimmune Panel', description: 'Testing for autoimmune conditions (ANA, RF, CRP)', date: '2022-10-20', category: 'other', type: 'health_event', linkedDocuments: ['sample-doc-011'] },
    { id: 'sample-event-014', title: "Friend's Wedding", description: 'Attended friend\'s wedding out of town - travel and social activities', date: '2023-05-13', category: 'major_life_event', type: 'life_event', linkedDocuments: [] },
    { id: 'sample-event-015', title: 'Severe Post-Exertional Malaise Episode', description: 'Severe crash after wedding - bedridden for 3 weeks, turning point in seeking ME/CFS specialist', startDate: '2023-05-16', endDate: '2023-06-06', category: 'symptom', type: 'health_event', linkedDocuments: [] },
    { id: 'sample-event-016', title: 'ME/CFS Specialist Consultation', description: 'Initial evaluation with physician familiar with post-viral conditions', date: '2023-07-22', category: 'appointment', type: 'health_event', linkedDocuments: ['sample-doc-012'] },
    { id: 'sample-event-017', title: 'Lyme Disease Testing', description: 'Rule out Lyme disease as cause of symptoms', date: '2023-08-10', category: 'other', type: 'health_event', linkedDocuments: ['sample-doc-013'] },
    { id: 'sample-event-018', title: 'Vitamin D Level Check', description: 'Testing for vitamin deficiencies', date: '2023-08-10', category: 'other', type: 'health_event', linkedDocuments: ['sample-doc-014'] },
    { id: 'sample-event-019', title: 'Tilt Table Test', description: 'Testing for orthostatic intolerance and POTS', date: '2023-09-15', category: 'surgery', type: 'health_event', linkedDocuments: ['sample-doc-015'] },
    { id: 'sample-event-020', title: 'Sleep Study', description: 'Overnight polysomnography to evaluate sleep quality', date: '2023-10-05', category: 'surgery', type: 'health_event', linkedDocuments: ['sample-doc-016'] },
    { id: 'sample-event-021', title: 'ME/CFS Diagnosis', description: 'Official diagnosis of Myalgic Encephalomyelitis/Chronic Fatigue Syndrome', date: '2024-01-18', category: 'diagnosis', type: 'health_event', linkedDocuments: ['sample-doc-017'] },
    { id: 'sample-event-022', title: 'POTS Diagnosis', description: 'Secondary diagnosis of Postural Orthostatic Tachycardia Syndrome', date: '2024-01-18', category: 'diagnosis', type: 'health_event', linkedDocuments: ['sample-doc-017'] },
    { id: 'sample-event-023', title: 'Started Pacing Therapy', description: 'Began energy envelope management and pacing strategies', date: '2024-02-01', category: 'prescription_change', type: 'health_event', linkedDocuments: [] },
    { id: 'sample-event-024', title: 'Quit Full-Time Job', description: 'Made difficult decision to leave full-time employment due to health limitations', date: '2024-04-15', category: 'major_life_event', type: 'life_event', linkedDocuments: [] },
    { id: 'sample-event-025', title: 'Started Part-Time Consulting', description: 'Began part-time consulting work (20 hrs/week) to accommodate health needs', startDate: '2024-05-01', ongoing: true, category: 'major_life_event', type: 'life_event', linkedDocuments: [] },
    { id: 'sample-event-026', title: 'Joined ME/CFS Support Group', description: 'Connected with local chronic illness support community', date: '2024-06-10', category: 'major_life_event', type: 'life_event', linkedDocuments: [] },
    { id: 'sample-event-027', title: 'Symptom Flare After Family Visit', description: 'Post-exertional malaise after hosting family for weekend', date: '2024-09-20', category: 'symptom', type: 'health_event', linkedDocuments: [] },
    { id: 'sample-event-028', title: 'Follow-up with ME/CFS Specialist', description: 'Regular check-in, adjusting pacing strategies and symptom management', date: '2025-01-15', category: 'appointment', type: 'health_event', linkedDocuments: ['sample-doc-018'] },
    { id: 'sample-event-029', title: 'ACL Tear - Soccer Injury', description: 'Torn ACL during college soccer game, non-contact pivot injury.', date: '2010-09-18', category: 'diagnosis', type: 'health_event', linkedDocuments: ['sample-doc-019'] },
    { id: 'sample-event-030', title: 'ACL Reconstruction Surgery', description: 'ACL reconstruction with patellar tendon autograft at Stanford Medical Center', date: '2010-10-05', category: 'surgery', type: 'health_event', linkedDocuments: ['sample-doc-020'] },
    { id: 'sample-event-031', title: 'Physical Therapy - Post-ACL', description: '6 months of physical therapy following ACL reconstruction.', startDate: '2010-10-20', endDate: '2011-04-15', category: 'prescription_change', type: 'health_event', linkedDocuments: ['sample-doc-021'] },
    { id: 'sample-event-032', title: 'Orthopedic Consultation - Knee Pain', description: 'Right knee pain and stiffness worsening. X-ray shows early osteoarthritis.', date: '2024-03-22', category: 'appointment', type: 'health_event', linkedDocuments: ['sample-doc-022', 'sample-doc-023'] },
    { id: 'sample-event-033', title: 'Knee Flare-up', description: 'Bad knee week - swelling and stiffness.', startDate: '2024-08-12', endDate: '2024-08-19', category: 'symptom', type: 'health_event', linkedDocuments: [] },
    { id: 'sample-event-034', title: 'Orthopedic Follow-up', description: 'Discussed cortisone injection option. Decided to hold off.', date: '2024-12-10', category: 'appointment', type: 'health_event', linkedDocuments: ['sample-doc-024'] },
  ],

  documents: [
    { id: 'sample-doc-001', title: 'COVID-19 Test Results', category: 'lab_result', date: '2020-03-15', provider: 'Portland Medical Center', needsReview: false },
    { id: 'sample-doc-002', title: 'PCP Visit Note - Fatigue Complaint', category: 'medical_record', date: '2020-10-05', provider: 'Dr. Maria Rodriguez', needsReview: false },
    { id: 'sample-doc-003', title: 'CBC and CMP Panel', category: 'lab_result', date: '2020-10-08', provider: 'Quest Diagnostics', needsReview: false },
    { id: 'sample-doc-004', title: 'Neurology Consultation Note', category: 'medical_record', date: '2022-01-15', provider: 'Dr. James Kim', needsReview: false },
    { id: 'sample-doc-005', title: 'Brain MRI Report', category: 'imaging', date: '2022-01-28', provider: 'Portland Imaging Center', needsReview: false },
    { id: 'sample-doc-006', title: 'Cardiology Consultation Note', category: 'medical_record', date: '2022-04-10', provider: 'Dr. Susan Lee', needsReview: false },
    { id: 'sample-doc-007', title: 'Echocardiogram Report', category: 'imaging', date: '2022-04-18', provider: 'Oregon Heart Institute', needsReview: false },
    { id: 'sample-doc-008', title: '24-Hour Holter Monitor Results', category: 'lab_result', date: '2022-04-26', provider: 'Oregon Heart Institute', needsReview: false },
    { id: 'sample-doc-009', title: 'Endocrinology Consultation Note', category: 'medical_record', date: '2022-08-05', provider: 'Dr. Patricia Chen', needsReview: false },
    { id: 'sample-doc-010', title: 'Thyroid Panel Results', category: 'lab_result', date: '2022-08-12', provider: 'Quest Diagnostics', needsReview: false },
    { id: 'sample-doc-011', title: 'Autoimmune Panel Results', category: 'lab_result', date: '2022-10-20', provider: 'Quest Diagnostics', needsReview: false },
    { id: 'sample-doc-012', title: 'ME/CFS Specialist Initial Consultation', category: 'medical_record', date: '2023-07-22', provider: 'Dr. Rachel Wong', needsReview: false },
    { id: 'sample-doc-013', title: 'Lyme Disease Test Results', category: 'lab_result', date: '2023-08-10', provider: 'Quest Diagnostics', needsReview: false },
    { id: 'sample-doc-014', title: 'Vitamin D Level Results', category: 'lab_result', date: '2023-08-10', provider: 'Quest Diagnostics', needsReview: false },
    { id: 'sample-doc-015', title: 'Tilt Table Test Report', category: 'lab_result', date: '2023-09-15', provider: 'Portland Cardiology Clinic', needsReview: false },
    { id: 'sample-doc-016', title: 'Sleep Study Report', category: 'lab_result', date: '2023-10-06', provider: 'Oregon Sleep Center', needsReview: false },
    { id: 'sample-doc-017', title: 'ME/CFS and POTS Diagnosis Letter', category: 'medical_record', date: '2024-01-18', provider: 'Dr. Rachel Wong', needsReview: false },
    { id: 'sample-doc-018', title: 'ME/CFS Follow-up Visit Note', category: 'medical_record', date: '2025-01-15', provider: 'Dr. Rachel Wong', needsReview: false },
    { id: 'sample-doc-019', title: 'Knee MRI Report - ACL Tear', category: 'imaging', date: '2010-09-20', provider: 'Stanford Medical Center', needsReview: false },
    { id: 'sample-doc-020', title: 'ACL Reconstruction Operative Report', category: 'medical_record', date: '2010-10-05', provider: 'Dr. Michael Torres', needsReview: false },
    { id: 'sample-doc-021', title: 'Physical Therapy Discharge Summary', category: 'medical_record', date: '2011-04-15', provider: 'Stanford Sports Medicine PT', needsReview: false },
    { id: 'sample-doc-022', title: 'Orthopedic Consultation Note - Knee Pain', category: 'medical_record', date: '2024-03-22', provider: 'Dr. Jennifer Park', needsReview: false },
    { id: 'sample-doc-023', title: 'Right Knee X-Ray Report', category: 'imaging', date: '2024-03-22', provider: 'Portland Imaging Center', needsReview: false },
    { id: 'sample-doc-024', title: 'Orthopedic Follow-up Note', category: 'medical_record', date: '2024-12-10', provider: 'Dr. Jennifer Park', needsReview: false },
  ],

  narrative: {
    id: 'narrative-1',
    preferredReadingView: 'book',
    chapters: [
      {
        id: 'ch-1',
        conditionName: 'ME/CFS',
        approach: 'timeline',
        order: 0,
        sections: [
          { id: 'sec-1-1', title: 'How it started', order: 0, content: "March 2020. COVID. Two weeks of fever and coughing, then back to work. That was supposed to be it.\n\nBut then this tiredness that wouldn't lift. Ten hours of sleep and still exhausted. Couldn't do my morning runs anymore. Had to stop halfway through and just... stand there. What was happening to me?\n\nI kept thinking it was stress. The pandemic. Everyone was tired, right? Everyone was struggling.\n\nBut this was different. This heavy, bone-deep thing. Like my body had forgotten how to make energy." },
          { id: 'sec-1-2', title: 'Getting answers', order: 1, content: "Three years of specialists. Three years of tests. Three years of \"normal.\"\n\nNeurologist - MRI normal.\nCardiologist - echo normal.\nEndocrinologist - hormones fine.\nAutoimmune, Lyme, sleep study. Normal. Negative. Unremarkable.\n\nHow can everything be normal when I can barely function?\n\nThen Megan's wedding, May 2023. The travel, the dancing, the staying up late. I paid for it. Two days later: couldn't get out of bed. For three weeks.\n\nThat crash finally got me in to see Dr. Wong. She listened to the whole story. Four years of it. And then she said: \"This sounds like ME/CFS.\"\n\nJanuary 2024 - official diagnosis. Finally a name for the thing that's been eating my life." },
          { id: 'sec-1-3', title: 'Treatment & management', order: 2, content: "No cure. No pill. No fix.\n\nWhat does exist is pacing. Don't do more than your body can handle. \"Energy envelope.\" Stay inside it.\n\nFor someone who used to run half-marathons... learning to operate at 30% is learning to be someone else entirely.\n\nApril 2024 - quit my job. Now I do part-time consulting. 20 hours a week on good weeks. Sometimes less.\n\nSlowly I'm stabilizing. Fewer crashes. More predictable days. Small victories." },
          { id: 'sec-1-4', title: 'Where I am now', order: 3, content: "Early 2025. Still here. Different than I imagined, but here.\n\nTypical day: work from the apartment. Rest breaks. Energy management. Video calls sitting down.\n\nJanuary follow-up with Dr. Wong. Baseline is stable. Pacing is working. She said \"sustainable.\"\n\nNot the life I would have chosen. But it's mine." },
        ],
      },
      {
        id: 'ch-2',
        conditionName: 'POTS',
        approach: 'perspective',
        order: 1,
        sections: [
          { id: 'sec-2-1', title: 'What happened', order: 0, content: "Standing up = heart goes crazy. Sitting: 70 bpm. Standing: 130. Sometimes higher. Black spots.\n\nOctober 2023. Dr. Wong ordered a tilt table test. HR spiked 42 bpm within 8 minutes. \"Classic POTS response.\"\n\nPostural Orthostatic Tachycardia Syndrome. Heart rate increase of 30+ bpm within 10 minutes of standing. Often post-viral. Often with ME/CFS.\n\nJanuary 2024 - both diagnoses same day." },
          { id: 'sec-2-2', title: 'How I experienced it', order: 1, content: "Here's the thing about POTS: I look fine. Completely fine.\n\nMeanwhile: grocery store checkout line = calculating if I'll faint. Shower = need the stool now. Cooking dinner = leaning on counter the whole time.\n\nWhat actually helps: compression stockings, salt tablets, standing up slowly, sitting whenever possible.\n\nNot fixed. Just... managed. On good days." },
        ],
      },
      {
        id: 'ch-3',
        conditionName: 'Right Knee (ACL/Arthritis)',
        approach: 'freeform',
        order: 2,
        sections: [
          { id: 'sec-3-1', title: 'The injury', order: 0, content: "September 2010. Soccer game, senior year. Planted my foot to pivot and felt that horrible pop.\n\nComplete ACL tear. Patellar tendon autograft. Six months of PT. By spring I was cleared. By fall I was running half-marathons again.\n\nI mostly forgot about it for fifteen years." },
          { id: 'sec-3-2', title: 'Years later', order: 1, content: "Early 2024, the knee started complaining. The March X-ray said osteoarthritis. Early, but there. Probably accelerated by the surgery.\n\nSo the running I used to do may have damaged the knee. And now the not-running is making it worse." },
          { id: 'sec-3-3', title: 'Where I am now', order: 2, content: "Two bodies now. The ME/CFS body that crashes if I do too much. The arthritic knee that gets worse if I do too little.\n\nDecember follow-up with Dr. Park. She offered a cortisone shot. I said no. For now.\n\nShe gave me PT exercises I can do lying down. I do them most days. Not all days." },
        ],
      },
    ],
  },

  // Settings sections
  settingsSections: [
    {
      title: 'Data',
      items: [
        { icon: 'square.and.arrow.up', title: 'Import & Export', subtitle: 'Backup or transfer your data' },
        { icon: 'doc.on.doc', title: 'Documents', subtitle: 'Manage document storage' },
        { icon: 'trash', title: 'Clear Data', subtitle: 'Delete all local data' },
      ]
    },
    {
      title: 'Preferences',
      items: [
        { icon: 'sun.max', title: 'Appearance', subtitle: 'Theme, colors, display' },
        { icon: 'list.bullet', title: 'Default Views', subtitle: 'Timeline, documents, narrative' },
        { icon: 'calendar', title: 'Date Format', subtitle: 'How dates are displayed' },
      ]
    },
    {
      title: 'Customization',
      items: [
        { icon: 'paintbrush', title: 'Theme', subtitle: 'Customize colors and style' },
        { icon: 'tag', title: 'Tags', subtitle: 'Manage custom tags' },
        { icon: 'slider.horizontal.3', title: 'Filters', subtitle: 'Default filter preferences' },
      ]
    },
    {
      title: 'Extraction',
      items: [
        { icon: 'cpu', title: 'AI Processing', subtitle: 'Metadata extraction settings' },
        { icon: 'sparkles', title: 'Suggestions', subtitle: 'AI-powered event suggestions' },
      ]
    },
    {
      title: 'Health',
      items: [
        { icon: 'heart', title: 'Health Records', subtitle: 'Import from Apple Health' },
      ]
    },
  ],
};

// Utility functions for data lookups

function getEventDate(event) {
  return event.date || event.startDate;
}

function getCategoryColor(category) {
  const map = {
    diagnosis: 'var(--color-category-diagnosis)',
    appointment: 'var(--color-category-appointment)',
    symptom: 'var(--color-category-symptom)',
    surgery: 'var(--color-category-surgery)',
    procedure: 'var(--color-category-procedure)',
    lab_result: 'var(--color-category-lab-result)',
    immunization: 'var(--color-category-immunization)',
    vital_sign: 'var(--color-category-vital-sign)',
    medication: 'var(--color-category-medication)',
    major_life_event: 'var(--color-category-life-event)',
    prescription_change: 'var(--color-category-prescription-change)',
    other: 'var(--color-category-other)',
  };
  return map[category] || map.other;
}

function getCategoryLabel(category) {
  const map = {
    diagnosis: 'Diagnosis',
    appointment: 'Appointment',
    symptom: 'Symptom',
    surgery: 'Procedure',
    procedure: 'Procedure',
    lab_result: 'Lab Result',
    immunization: 'Immunization',
    vital_sign: 'Vital Sign',
    medication: 'Medication',
    major_life_event: 'Life Event',
    prescription_change: 'Treatment',
    other: 'Other',
  };
  return map[category] || 'Other';
}

function getCategoryIcon(category) {
  const map = {
    diagnosis: 'stethoscope',
    appointment: 'calendar',
    symptom: 'waveform.path',
    surgery: 'cross.case',
    procedure: 'cross.case',
    lab_result: 'testtube.2',
    immunization: 'syringe',
    vital_sign: 'heart.text.square',
    medication: 'pills',
    major_life_event: 'star',
    prescription_change: 'pills',
    other: 'circle',
  };
  return map[category] || 'circle';
}

function getDocCategoryLabel(category) {
  const map = {
    lab_result: 'Lab Result',
    medical_record: 'Medical Record',
    imaging: 'Imaging',
    insurance: 'Insurance',
    other: 'Other',
  };
  return map[category] || 'Other';
}

function getDocCategoryIcon(category) {
  const map = {
    lab_result: 'testtube.2',
    medical_record: 'doc.text',
    imaging: 'photo',
    insurance: 'doc.text.fill',
    other: 'doc.text',
  };
  return map[category] || 'doc.text';
}

function getTagsForItem(type, id) {
  const assignments = DATA.tagAssignments[type === 'event' ? 'events' : 'documents'];
  const tagIds = assignments[id] || [];
  return tagIds.map(tid => DATA.tags.find(t => t.id === tid)).filter(Boolean);
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function getMonthYear(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

function getTagColor(colorName) {
  const map = {
    blue: 'var(--color-accent)',
    orange: 'var(--color-warning)',
    green: 'var(--color-success)',
    red: 'var(--color-destructive)',
    purple: 'var(--color-category-surgery)',
    mint: 'var(--color-category-immunization)',
  };
  return map[colorName] || 'var(--color-category-other)';
}
