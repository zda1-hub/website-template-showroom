const email = 'hello@yourdomain.com';
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
  document.documentElement.toggleAttribute('data-theme', theme !== 'system');
  if (theme !== 'system') document.documentElement.dataset.theme = theme;
  themeToggle.textContent = `Theme: ${theme}`;
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

const portrait = document.querySelector('#portrait-toggle');
portrait.addEventListener('click', () => {
  const expanded = portrait.getAttribute('aria-expanded') === 'true';
  portrait.setAttribute('aria-expanded', String(!expanded));
  portrait.setAttribute('aria-label', expanded ? 'Show profile artwork' : 'Hide profile artwork');
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

document.querySelector('#local-time').textContent = new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit', timeZoneName: 'short' }).format(new Date());
