const toggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav');
if (toggle && nav) {
  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
  });
  nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    nav.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
  }));
}
document.getElementById('year').textContent = new Date().getFullYear();

// Prepare enquiries locally; the applicant sends the email from their own app.
const enquiryForm = document.getElementById('study-enquiry-form');
if (enquiryForm) {
  const selection = enquiryForm.elements.namedItem('School selection');
  const schools = document.getElementById('school-details');
  const schoolHelp = document.getElementById('school-help');
  const review = document.getElementById('enquiry-review');
  const summary = document.getElementById('enquiry-summary');
  const emailLink = document.getElementById('enquiry-email');
  const status = document.getElementById('enquiry-status');
  function updateSchools() {
    const needsSchools = selection.value.startsWith('Yes') || selection.value.startsWith('I have');
    schools.hidden = !needsSchools;
    schools.disabled = !needsSchools;
    schoolHelp.hidden = !selection.value.startsWith('No');
  }
  selection.addEventListener('change', updateSchools);
  enquiryForm.addEventListener('submit', event => {
    event.preventDefault();
    if (!enquiryForm.reportValidity()) return;
    const data = new FormData(enquiryForm);
    const lines = ['STUDY ABROAD ENQUIRY', ''];
    for (const name of new Set(data.keys())) {
      const values = data.getAll(name).map(value => String(value).trim()).filter(Boolean);
      if (values.length) lines.push(`${name}: ${values.join('; ')}`);
    }
    summary.value = lines.join('\n\n');
    const subject = `Study Abroad Enquiry — ${String(data.get('Full name')).replace(/[\r\n]/g, ' ')}`;
    const draft = `mailto:info@syfroedge.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(summary.value)}`;
    // Long mailto URLs can be truncated by email clients; preserve the full copyable summary.
    emailLink.href = draft.length <= 7000 ? draft : `mailto:info@syfroedge.com?subject=${encodeURIComponent(subject)}`;
    status.textContent = draft.length > 7000 ? 'Please copy your enquiry and paste it into the email before sending; your details are too long to prefill reliably.' : '';
    enquiryForm.hidden = true;
    review.hidden = false;
    document.getElementById('enquiry-review-title').focus();
  });
  document.getElementById('enquiry-edit').addEventListener('click', () => {
    review.hidden = true;
    enquiryForm.hidden = false;
    selection.focus();
  });
  document.getElementById('enquiry-copy').addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(summary.value);
      status.textContent = 'Enquiry copied. Paste it into an email to info@syfroedge.com and send it.';
    } catch {
      summary.focus();
      summary.select();
      status.textContent = 'Select and copy the enquiry above, then paste it into an email to info@syfroedge.com.';
    }
  });
  updateSchools();
  enquiryForm.hidden = false;
}
