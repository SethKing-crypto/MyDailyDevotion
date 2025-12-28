// script.js
(async () => {
  const devotionsUrl = './devotions.json'; // put your content here
  let data = {};
  try {
    const res = await fetch(devotionsUrl);
    if (!res.ok) throw new Error('devotions.json not found');
    data = await res.json();
  } catch (err) {
    console.warn('Could not load devotions.json:', err);
    // data stays empty
  }

  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const datePicker = document.getElementById('datePicker');
  const dateLabel = document.getElementById('dateLabel');
  const devotionTitle = document.getElementById('devotionTitle');
  const scriptureEl = document.getElementById('scripture');
  const contentEl = document.getElementById('content');

  function pad(n){ return n.toString().padStart(2,'0'); }
  function toYYYYMMDD(d){
    return d.getFullYear() + '-' + pad(d.getMonth()+1) + '-' + pad(d.getDate());
  }
  function prettyDate(d){
    return d.toLocaleDateString(undefined, {weekday:'long', year:'numeric', month:'long', day:'numeric'});
  }

  let currentDate = new Date();
  datePicker.value = toYYYYMMDD(currentDate);

  function renderTextToHtml(text){
    const escaped = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    const paragraphs = escaped.split(/\n{2,}/).map(p => p.replace(/\n/g, '<br>'));
    return paragraphs.map(p => `<p>${p}</p>`).join('');
  }

  function findDevotionForDate(d){
    const ymd = toYYYYMMDD(d);
    // YEAR-SPECIFIC ONLY
    if (data[ymd]) return data[ymd];
    return null;
  }

  function displayForDate(d){
    currentDate = new Date(d.getFullYear(), d.getMonth(), d.getDate()); // normalize
    datePicker.value = toYYYYMMDD(currentDate);
    dateLabel.textContent = prettyDate(currentDate);

    const devotion = findDevotionForDate(currentDate);
    if (!devotion) {
      devotionTitle.textContent = 'No devotion found for this date';
      scriptureEl.textContent = '';
      contentEl.innerHTML = '<p>No devotion is available for this exact date yet. Add an entry to devotions.json using the key "YYYY-MM-DD".</p>';
      return;
    }

    devotionTitle.textContent = devotion.title || 'Daily Devotion';
    scriptureEl.textContent = devotion.scripture || '';
    const raw = devotion.content || devotion.text || '';
    contentEl.innerHTML = renderTextToHtml(raw);
  }

  // Navigation
  prevBtn.addEventListener('click', () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() - 1);
    displayForDate(d);
  });
  nextBtn.addEventListener('click', () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + 1);
    displayForDate(d);
  });

  datePicker.addEventListener('change', (e) => {
    const d = new Date(e.target.value + 'T00:00:00');
    if (isNaN(d)) return;
    displayForDate(d);
  });

  // Start with today's date
  displayForDate(currentDate);
})();
