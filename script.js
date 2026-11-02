const toggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav');
function closeMenu(returnFocus = false) {
  if (!nav || !toggle) return;
  nav.classList.remove('open');
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-label', 'Open menu');
  if (returnFocus) toggle.focus();
}
if (toggle && nav) {
  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  });
  nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => closeMenu()));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && nav.classList.contains('open')) closeMenu(true);
  });
  document.addEventListener('click', event => {
    if (!event.target.closest('.nav-wrap')) closeMenu();
  });
  window.addEventListener('resize', () => { if (window.innerWidth > 900) closeMenu(); });
  const updateCurrent = () => {
    const id = location.hash || '#top';
    nav.querySelectorAll('a').forEach(a => {
      if (a.getAttribute('href') === id || (id === '#study-abroad-enquiry' && a.getAttribute('href') === '#study-abroad')) a.setAttribute('aria-current', 'location');
      else a.removeAttribute('aria-current');
    });
  };
  window.addEventListener('hashchange', updateCurrent);
  updateCurrent();
}
const year = document.getElementById('year');
if (year) year.textContent = new Date().getFullYear();

const serviceToolbar = document.querySelector('.service-toolbar');
if (serviceToolbar) {
  const filters = [...serviceToolbar.querySelectorAll('[data-filter]')];
  const cards = [...document.querySelectorAll('.service-card[data-category]')];
  filters.forEach(button => button.addEventListener('click', () => {
    filters.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    let count = 0;
    cards.forEach(card => {
      card.hidden = button.dataset.filter !== 'all' && card.dataset.category !== button.dataset.filter;
      if (!card.hidden) count++;
    });
    document.getElementById('service-count').textContent = `${count} ${count === 1 ? 'service' : 'services'}`;
  }));
  serviceToolbar.hidden = false;
}

// All enquiry preparation happens in this page. The applicant sends the final email.
const enquiryForm = document.getElementById('study-enquiry-form');
if (enquiryForm) {
  const selection = enquiryForm.elements.namedItem('School selection');
  const schools = document.getElementById('school-details');
  const schoolHelp = document.getElementById('school-help');
  const review = document.getElementById('enquiry-review');
  const summary = document.getElementById('enquiry-summary');
  const emailLink = document.getElementById('enquiry-email');
  const status = document.getElementById('enquiry-status');
  const progress = document.querySelector('.enquiry-progress');
  const next = document.getElementById('enquiry-next');
  const back = document.getElementById('enquiry-back');
  const submit = document.getElementById('enquiry-submit');
  const panels = [...enquiryForm.querySelectorAll('[data-step]')];
  const titles = ['About you', 'Academic background', 'Your study plans', 'Funding & preparation', 'Review & consent'];
  let currentStep = 1;
  function updateSchools() {
    const selected = selection.value;
    const needsSchools = selected.startsWith('Yes') || selected.startsWith('I have');
    schools.hidden = currentStep !== 3 || !needsSchools;
    schools.disabled = !needsSchools;
    schoolHelp.hidden = currentStep !== 3 || !selected.startsWith('No');
  }
  function showStep(step, focus = true) {
    currentStep = step;
    panels.forEach(panel => { panel.hidden = Number(panel.dataset.step) !== step; });
    updateSchools();
    next.hidden = step === 5;
    back.hidden = step === 1;
    submit.hidden = step !== 5;
    progress.hidden = false;
    document.getElementById('enquiry-step-label').textContent = `Step ${step} of 5 · ${titles[step - 1]}`;
    document.getElementById('enquiry-step-percent').textContent = `${step * 20}%`;
    const bar = progress.querySelector('[role="progressbar"]');
    bar.setAttribute('aria-valuenow', String(step * 20));
    bar.querySelector('span').style.width = `${step * 20}%`;
    if (focus) {
      const legend = enquiryForm.querySelector(`[data-step="${step}"] legend`);
      if (legend) { legend.setAttribute('tabindex', '-1'); legend.focus(); }
    }
  }
  function validateStep(step) {
    const fields = [...enquiryForm.elements].filter(field => field.closest('[data-step]')?.dataset.step === String(step));
    for (const field of fields) {
      if (field.willValidate && !field.checkValidity()) { field.reportValidity(); return false; }
    }
    return true;
  }
  selection.addEventListener('change', updateSchools);
  next.addEventListener('click', () => { if (validateStep(currentStep)) showStep(currentStep + 1); });
  back.addEventListener('click', () => showStep(currentStep - 1));
  enquiryForm.addEventListener('submit', event => {
    event.preventDefault();
    if (currentStep < 5) { if (validateStep(currentStep)) showStep(currentStep + 1); return; }
    for (const field of enquiryForm.elements) {
      if (field.willValidate && !field.checkValidity()) {
        const step = Number(field.closest('[data-step]')?.dataset.step || 5);
        showStep(step, false);
        field.reportValidity();
        return;
      }
    }
    const data = new FormData(enquiryForm);
    const lines = ['STUDY ABROAD ENQUIRY'];
    for (const name of new Set(data.keys())) {
      const values = data.getAll(name).map(value => String(value).trim()).filter(Boolean);
      if (values.length) lines.push(`${name}: ${values.join('; ')}`);
    }
    summary.value = lines.join('\n\n');
    const subject = `Study Abroad Enquiry — ${String(data.get('Full name')).replace(/[\r\n]/g, ' ')}`;
    const draft = `mailto:info@syfroedge.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(summary.value)}`;
    emailLink.href = draft.length <= 7000 ? draft : `mailto:info@syfroedge.com?subject=${encodeURIComponent(subject)}`;
    status.textContent = draft.length > 7000 ? 'Please copy your enquiry into the email before sending. The full details are too long to prefill reliably.' : '';
    enquiryForm.hidden = true;
    progress.hidden = true;
    review.hidden = false;
    document.getElementById('enquiry-review-title').focus();
  });
  document.getElementById('enquiry-edit').addEventListener('click', () => {
    review.hidden = true;
    enquiryForm.hidden = false;
    showStep(1);
  });
  document.getElementById('enquiry-copy').addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(summary.value);
      status.textContent = 'Enquiry copied. Paste it into an email to info@syfroedge.com and send it.';
    } catch {
      summary.focus(); summary.select();
      status.textContent = 'Select and copy the enquiry above, then paste it into an email to info@syfroedge.com.';
    }
  });
  enquiryForm.noValidate = true;
  enquiryForm.hidden = false;
  showStep(1, false);
}
