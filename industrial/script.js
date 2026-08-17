const email = 'zakai@kaimaz.com';
const themeToggle = document.querySelector('#theme-toggle');
const toast = document.querySelector('#toast');
const previewDialog = document.querySelector('#preview-dialog');
const previewTitle = document.querySelector('#preview-title');
const previewImage = document.querySelector('#preview-image');
const previewLink = document.querySelector('#preview-link');
const bookingDialog = document.querySelector('#booking-dialog');
const bookingDays = document.querySelector('#booking-days');
const bookingTimes = [...document.querySelectorAll('.booking-times button')];
const bookingSelection = document.querySelector('#booking-selection');
const calendarLink = document.querySelector('#calendar-link');

const previews = {
  chiara: {
    title: 'Chiara Elaine',
    url: 'https://chiaraelaine.com/',
    image: 'https://chiaraelaine.com/ct-logos/ct-share.png'
  },
  beverly: {
    title: 'Beverly Corpuz',
    url: 'https://www.beverlycorpuz.com/',
    image: 'https://image.thum.io/get/width/1200/crop/800/https://www.beverlycorpuz.com/'
  }
};

function getTheme() { return localStorage.getItem('portfolio-theme') || 'system'; }
function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  themeToggle.setAttribute('aria-label', `Theme: ${theme}`);
  themeToggle.dataset.themeChoice = theme;
  themeToggle.querySelectorAll('.theme-icon').forEach((icon) => icon.classList.toggle('theme-icon--active', icon.classList.contains(`theme-icon--${theme === 'system' ? 'monitor' : theme}`)));
  localStorage.setItem('portfolio-theme', theme);
}
function announce(message) {
  toast.textContent = message;
  toast.classList.add('is-visible');
  window.clearTimeout(announce.timer);
  announce.timer = window.setTimeout(() => toast.classList.remove('is-visible'), 1700);
}

applyTheme(getTheme());
themeToggle.addEventListener('click', () => {
  const themes = ['system', 'light', 'dark'];
  const next = themes[(themes.indexOf(getTheme()) + 1) % themes.length];
  applyTheme(next);
  themeToggle.classList.remove('is-switching');
  void themeToggle.offsetWidth;
  themeToggle.classList.add('is-switching');
  announce(`Theme: ${next}`);
});

document.querySelector('#copy-email').addEventListener('click', async () => {
  try { await navigator.clipboard.writeText(email); announce('Email copied'); }
  catch { announce(email); }
});

const tucsonDateFormat = new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric', timeZone: 'America/Phoenix' });
const tucsonDateParts = new Intl.DateTimeFormat('en-US', { year: 'numeric', month: '2-digit', day: '2-digit', weekday: 'short', timeZone: 'America/Phoenix' });
let selectedDay;
let selectedHour;

function getWeekdays() {
  const days = [];
  for (let offset = 1; days.length < 5; offset += 1) {
    const date = new Date(Date.now() + offset * 86400000);
    const parts = Object.fromEntries(tucsonDateParts.formatToParts(date).filter(({ type }) => type !== 'literal').map(({ type, value }) => [type, value]));
    if (!['Sat', 'Sun'].includes(parts.weekday)) days.push({ date, parts, key: `${parts.year}${parts.month}${parts.day}` });
  }
  return days;
}
function updateBookingLink() {
  if (!selectedDay || !selectedHour) return;
  const start = `${selectedDay.key}T${String(selectedHour).padStart(2, '0')}0000`;
  const end = `${selectedDay.key}T${String(selectedHour + 1).padStart(2, '0')}0000`;
  const time = selectedHour === 18 ? '6:00 PM' : '7:00 PM';
  bookingSelection.textContent = `${tucsonDateFormat.format(selectedDay.date)} at ${time} Tucson time`;
  calendarLink.href = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent('Kaimaz project call')}&details=${encodeURIComponent('Google Meet project call request with Kaimaz.')}&dates=${start}/${end}&ctz=America/Phoenix`;
  calendarLink.hidden = false;
}
function renderBookingDays() {
  const days = getWeekdays();
  selectedDay ??= days[0];
  bookingDays.replaceChildren(...days.map((day) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.dataset.day = day.key;
    button.setAttribute('aria-pressed', String(day.key === selectedDay.key));
    button.innerHTML = `<span>${day.parts.weekday}</span><strong>${day.parts.month}/${day.parts.day}</strong>`;
    button.addEventListener('click', () => { selectedDay = day; renderBookingDays(); updateBookingLink(); });
    return button;
  }));
}
document.querySelector('#open-booking').addEventListener('click', () => { renderBookingDays(); bookingDialog.showModal(); });
document.querySelector('#close-booking').addEventListener('click', () => bookingDialog.close());
bookingDialog.addEventListener('click', (event) => { if (event.target === bookingDialog) bookingDialog.close(); });
bookingTimes.forEach((button) => button.addEventListener('click', () => {
  selectedHour = Number(button.dataset.hour);
  bookingTimes.forEach((timeButton) => timeButton.setAttribute('aria-pressed', String(timeButton === button)));
  updateBookingLink();
}));

document.querySelectorAll('.preview-trigger').forEach((button) => button.addEventListener('click', () => {
  const preview = previews[button.dataset.preview];
  previewTitle.textContent = preview.title;
  previewLink.href = preview.url;
  previewImage.src = preview.image;
  previewImage.alt = `Preview of ${preview.title}'s website`;
  previewDialog.showModal();
}));
document.querySelector('#close-preview').addEventListener('click', () => previewDialog.close());
previewDialog.addEventListener('click', (event) => { if (event.target === previewDialog) previewDialog.close(); });

document.querySelector('#back-to-top').addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
const sections = [...document.querySelectorAll('main section[id]')];
const navLinks = [...document.querySelectorAll('.dock-pill a')];
const observer = new IntersectionObserver((entries) => {
  const active = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
  if (!active) return;
  navLinks.forEach((link) => link.classList.toggle('is-active', link.getAttribute('href') === `#${active.target.id}`));
}, { threshold: .2 });
sections.forEach((section) => observer.observe(section));

const localTime = document.querySelector('#local-time');
const workStatus = document.querySelector('#work-status');
function updateLocalTime() {
  const now = new Date();
  const parts = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', timeZone: 'America/Phoenix' }).format(now).toLowerCase();
  const hour = Number(new Intl.DateTimeFormat('en-US', { hour: 'numeric', hourCycle: 'h23', timeZone: 'America/Phoenix' }).format(now));
  const working = hour >= 8 && hour < 18;
  localTime.textContent = `${parts} in Tucson, Arizona`;
  workStatus.classList.toggle('is-working', working);
  workStatus.classList.toggle('is-sleeping', !working);
  workStatus.setAttribute('aria-label', working ? 'Working' : 'Sleeping');
}
updateLocalTime();
window.setInterval(updateLocalTime, 60000);

let audioContext;
function playClick() {
  try {
    audioContext ||= new AudioContext();
    const now = audioContext.currentTime;
    const tick = audioContext.createOscillator();
    const body = audioContext.createOscillator();
    const gain = audioContext.createGain();
    tick.type = 'triangle';
    tick.frequency.setValueAtTime(720, now);
    tick.frequency.exponentialRampToValueAtTime(410, now + .018);
    body.type = 'sine';
    body.frequency.setValueAtTime(185, now);
    body.frequency.exponentialRampToValueAtTime(120, now + .03);
    gain.gain.setValueAtTime(.0001, now);
    gain.gain.exponentialRampToValueAtTime(.018, now + .003);
    gain.gain.exponentialRampToValueAtTime(.0001, now + .035);
    tick.connect(gain);
    body.connect(gain);
    gain.connect(audioContext.destination);
    tick.start(now);
    body.start(now);
    tick.stop(now + .03);
    body.stop(now + .04);
  } catch { /* Audio is optional when a browser blocks it. */ }
}
document.addEventListener('pointerdown', (event) => {
  if (event.target.closest('a, button')) playClick();
});
