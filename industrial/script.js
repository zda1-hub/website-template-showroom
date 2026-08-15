const body = document.body;
const loader = document.querySelector("#loader");
const loadSteps = [...document.querySelectorAll("[data-load-step]")];

function finishLoader() {
  loader.classList.add("done");
  body.classList.remove("is-loading");
}

if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  finishLoader();
} else {
  loadSteps.forEach((step, index) => {
    setTimeout(() => {
      loadSteps.forEach((item, itemIndex) => {
        item.classList.toggle("active", itemIndex === index);
        item.classList.toggle("complete", itemIndex < index);
      });
    }, 300 + index * 520);
  });
  setTimeout(() => loadSteps.forEach((step) => step.classList.add("complete")), 1760);
  setTimeout(finishLoader, 2300);
}

document.querySelector("#skip-loader").addEventListener("click", finishLoader);

const rooms = [...document.querySelectorAll("[data-room]")];
const chambers = [...document.querySelectorAll("[data-chamber]")];
const search = document.querySelector("#search");
const roomCount = document.querySelector("#room-count");
const noResults = document.querySelector("#no-results");

function filterRooms() {
  const query = search.value.trim().toLowerCase();
  let visible = 0;
  rooms.forEach((room) => {
    const matches = !query || room.dataset.search.includes(query);
    room.hidden = !matches;
    if (matches) visible += 1;
  });
  chambers.forEach((chamber) => {
    chamber.hidden = !chamber.querySelector("[data-room]:not([hidden])");
  });
  roomCount.textContent = `${String(visible).padStart(2, "0")} SURFACE${visible === 1 ? "" : "S"}`;
  noResults.classList.toggle("show", visible === 0);
  sizeDisplays();
}

search.addEventListener("input", filterRooms);
document.querySelector("#clear-search").addEventListener("click", () => {
  search.value = "";
  filterRooms();
  search.focus();
});

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => entry.target.classList.toggle("in-view", entry.isIntersecting));
}, { threshold: 0.34 });
chambers.forEach((chamber) => observer.observe(chamber));

function sizeDisplays() {
  document.querySelectorAll(".surface-screen").forEach((screen) => {
    screen.style.setProperty("--surface-scale", screen.clientWidth / 1440);
  });
}
addEventListener("resize", sizeDisplays);
sizeDisplays();

const progress = document.querySelector("#scroll-progress");
function updateProgress() {
  const max = document.documentElement.scrollHeight - innerHeight;
  progress.style.height = `${max > 0 ? Math.min(100, scrollY / max * 100) : 0}%`;
}
addEventListener("scroll", updateProgress, { passive: true });
updateProgress();

const preview = document.querySelector("#preview");
const previewFrame = document.querySelector("#preview-frame");
const previewTitle = document.querySelector("#preview-title");
const externalLink = document.querySelector("#external-link");

document.querySelectorAll("[data-open]").forEach((button) => button.addEventListener("click", () => {
  previewTitle.textContent = button.dataset.title;
  previewFrame.src = button.dataset.url;
  externalLink.href = button.dataset.url;
  preview.showModal();
}));

function closePreview() {
  preview.close();
  previewFrame.src = "about:blank";
}
document.querySelector("#close-preview").addEventListener("click", closePreview);
preview.addEventListener("click", (event) => { if (event.target === preview) closePreview(); });

const themes = [
  { id: "concrete", name: "Concrete" },
  { id: "oxide", name: "Oxide" },
  { id: "cobalt", name: "Cobalt" },
  { id: "moss", name: "Moss" },
];
const themeName = document.querySelector("#theme-name");
const toast = document.querySelector("#theme-toast");
const toastTheme = document.querySelector("#toast-theme");
let themeIndex = Math.max(0, themes.findIndex((theme) => theme.id === localStorage.getItem("industrial-theme")));
let toastTimer;

function applyTheme(showConfirmation = true) {
  const theme = themes[themeIndex];
  body.dataset.theme = theme.id;
  themeName.textContent = theme.name.toUpperCase();
  toastTheme.textContent = theme.name;
  localStorage.setItem("industrial-theme", theme.id);
  if (showConfirmation) {
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 3600);
  }
}

function nextTheme() {
  themeIndex = (themeIndex + 1) % themes.length;
  applyTheme();
}

document.querySelector("#theme-next").addEventListener("click", nextTheme);
document.querySelector("#toast-next").addEventListener("click", nextTheme);
applyTheme(false);

document.querySelector("#copy-brief").addEventListener("click", async () => {
  const message = "Hi — I explored your website template showroom and would like a custom website preview for my business. My business type is: ____. The main action I want customers to take is: ____.";
  await navigator.clipboard.writeText(message);
  document.querySelector("#copy-note").textContent = "Project request copied — paste it into an email or DM.";
});
