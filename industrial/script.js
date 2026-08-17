const email = 'zakai@kaimaz.com';
const themeToggle = document.querySelector('#theme-toggle');
const toast = document.querySelector('#toast');
const previewDialog = document.querySelector('#preview-dialog');
const previewTitle = document.querySelector('#preview-title');
const previewImage = document.querySelector('#preview-image');
const previewLink = document.querySelector('#preview-link');

function initializeCalBooking() {
  (function loadCalEmbed(global, source, initCommand) {
    const enqueue = (api, args) => api.q.push(args);
    const documentRef = global.document;
    global.Cal = global.Cal || function calEmbed() {
      const cal = global.Cal;
      const args = arguments;
      if (!cal.loaded) {
        cal.ns = {};
        cal.q = cal.q || [];
        documentRef.head.appendChild(documentRef.createElement('script')).src = source;
        cal.loaded = true;
      }
      if (args[0] === initCommand) {
        const namespace = args[1];
        const api = function namespacedCalEmbed() { enqueue(api, arguments); };
        api.q = api.q || [];
        if (typeof namespace === 'string') {
          cal.ns[namespace] = api;
          enqueue(api, args);
        } else enqueue(cal, args);
        return;
      }
      enqueue(cal, args);
    };
  })(window, 'https://app.cal.com/embed/embed.js', 'init');

  window.Cal('init', 'kaimaz-booking', { origin: 'https://cal.com' });
  window.Cal.ns['kaimaz-booking']('ui', { layout: 'month_view' });
  window.Cal.ns['kaimaz-booking']('preload', { calLink: 'kaimaz/30min' });
}

initializeCalBooking();

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
