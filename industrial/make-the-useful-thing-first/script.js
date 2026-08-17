const themeToggle = document.querySelector('#theme-toggle');

function getTheme() { return localStorage.getItem('portfolio-theme') || 'system'; }
function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  themeToggle.dataset.themeChoice = theme;
  themeToggle.setAttribute('aria-label', `Theme: ${theme}`);
  themeToggle.querySelectorAll('.theme-icon').forEach((icon) => icon.classList.toggle('theme-icon--active', icon.classList.contains(`theme-icon--${theme === 'system' ? 'monitor' : theme}`)));
}
applyTheme(getTheme());

themeToggle.addEventListener('click', () => {
  const themes = ['system', 'light', 'dark'];
  const next = themes[(themes.indexOf(getTheme()) + 1) % themes.length];
  localStorage.setItem('portfolio-theme', next);
  applyTheme(next);
  themeToggle.classList.remove('is-switching');
  void themeToggle.offsetWidth;
  themeToggle.classList.add('is-switching');
});
