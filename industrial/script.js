const themeButton = document.querySelector('#theme-button');
const copyEmailButton = document.querySelector('#copy-email');
const toast = document.querySelector('#toast');
const email = 'hello@yourdomain.com';
const themeOrder = ['system', 'dark', 'light'];

function storedTheme() {
  return localStorage.getItem('portfolio-theme') || 'system';
}

function applyTheme(theme) {
  if (theme === 'system') {
    document.documentElement.removeAttribute('data-theme');
  } else {
    document.documentElement.dataset.theme = theme;
  }
  themeButton.textContent = `Theme: ${theme}`;
  localStorage.setItem('portfolio-theme', theme);
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('is-visible');
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove('is-visible'), 1800);
}

applyTheme(storedTheme());

themeButton.addEventListener('click', () => {
  const next = themeOrder[(themeOrder.indexOf(storedTheme()) + 1) % themeOrder.length];
  applyTheme(next);
  showToast(`Theme changed: ${next}`);
});

copyEmailButton.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(email);
    showToast('Email copied');
  } catch {
    showToast(`Email: ${email}`);
  }
});

document.querySelectorAll('.site-preview img').forEach((image) => {
  image.addEventListener('error', () => {
    image.closest('.site-preview').querySelector('span').firstChild.textContent = 'Open live website ';
  }, { once: true });
});

document.querySelector('#year').textContent = new Date().getFullYear();
document.querySelector('#local-time').textContent = new Intl.DateTimeFormat(undefined, {
  hour: 'numeric',
  minute: '2-digit',
  timeZoneName: 'short'
}).format(new Date());
