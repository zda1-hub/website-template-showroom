const toast = document.querySelector("#toast");
const themeToggle = document.querySelector("#theme-toggle");
const themeLabel = document.querySelector("#theme-label");
let toastTimer;

function announce(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 1800);
}

function setTheme(theme) {
  document.body.dataset.theme = theme;
  themeLabel.textContent = theme === "light" ? "Light" : "Dark";
  themeToggle.setAttribute("aria-label", `Switch to ${theme === "light" ? "dark" : "light"} theme`);
  localStorage.setItem("portfolio-theme", theme);
}

setTheme(localStorage.getItem("portfolio-theme") || "dark");
themeToggle.addEventListener("click", () => {
  const next = document.body.dataset.theme === "light" ? "dark" : "light";
  setTheme(next);
  announce(`${next === "light" ? "Light" : "Dark"} theme enabled`);
});

document.querySelector("#avatar-toggle").addEventListener("click", (event) => event.currentTarget.classList.toggle("is-open"));

document.querySelectorAll(".preview-button").forEach((button) => {
  button.addEventListener("click", () => {
    const panel = document.querySelector(`#preview-${button.dataset.project}`);
    const opening = panel.hidden;
    document.querySelectorAll(".preview-card").forEach((card) => { if (card !== panel) card.hidden = true; });
    document.querySelectorAll(".preview-button").forEach((item) => { if (item !== button) item.setAttribute("aria-expanded", "false"); });
    panel.hidden = !opening;
    button.setAttribute("aria-expanded", String(opening));
    button.innerHTML = opening ? "Close <b>×</b>" : "Preview <b>↗</b>";
    document.querySelectorAll(".preview-button").forEach((item) => { if (item !== button) item.innerHTML = "Preview <b>↗</b>"; });
  });
});

document.querySelector("#copy-email").addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText("hello@yourdomain.com");
    announce("Placeholder email copied");
  } catch (_) {
    announce("Email: hello@yourdomain.com");
  }
});

function updateLocalTime() {
  const current = new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" }).format(new Date());
  document.querySelector("#local-time").textContent = `${current} local time`;
}
updateLocalTime();
setInterval(updateLocalTime, 30000);
