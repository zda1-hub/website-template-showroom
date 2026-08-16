const email = 'zakai@kaimaz.com';
const themeToggle = document.querySelector('#theme-toggle');
const toast = document.querySelector('#toast');
const previewDialog = document.querySelector('#preview-dialog');
const previewTitle = document.querySelector('#preview-title');
const previewImage = document.querySelector('#preview-image');
const previewLink = document.querySelector('#preview-link');

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
  themeToggle.textContent = `Theme: ${theme}`;
  themeToggle.setAttribute('aria-label', `Theme: ${theme}`);
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
  announce(`Theme: ${next}`);
});

document.querySelector('#copy-email').addEventListener('click', async () => {
  try { await navigator.clipboard.writeText(email); announce('Email copied'); }
  catch { announce(email); }
});

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
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(520, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(250, audioContext.currentTime + .035);
    gain.gain.setValueAtTime(.028, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(.001, audioContext.currentTime + .04);
    oscillator.connect(gain).connect(audioContext.destination);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + .045);
  } catch { /* Audio is optional when a browser blocks it. */ }
}
document.addEventListener('pointerdown', (event) => {
  if (event.target.closest('a, button')) playClick();
});
