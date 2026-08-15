const templates = [
  { name: "Nail Salon", category: "BEAUTY / APPOINTMENTS", url: "https://zda1-hub.github.io/nail-salon-templates/", art: "linear-gradient(135deg,#e3b9c8 0%,#7c4359 100%)" },
  { name: "Barber Shop", category: "GROOMING / BOOKINGS", url: "https://zda1-hub.github.io/barber-shop-templates/", art: "linear-gradient(135deg,#d8d0c5 0%,#342b29 100%)" },
  { name: "Mechanic", category: "AUTO / REPAIR", url: "https://zda1-hub.github.io/mechanic-templates/", art: "linear-gradient(135deg,#e8a93f 0%,#30343f 100%)" },
  { name: "HVAC", category: "HOME / SERVICE", url: "https://zda1-hub.github.io/hvac-templates/", art: "linear-gradient(135deg,#90c9d3 0%,#174b78 100%)" },
  { name: "Roofing", category: "HOME / CONTRACTOR", url: "https://zda1-hub.github.io/roofing-templates/", art: "linear-gradient(135deg,#e47754 0%,#262b2b 100%)" },
  { name: "Custom Goods", category: "CLOTHING / BAGS / HATS", url: "https://zda1-hub.github.io/clothing-custom-goods-templates/", art: "linear-gradient(135deg,#c4916d 0%,#392419 100%)" },
  { name: "Restaurant", category: "FOOD / RESERVATIONS", url: "https://zda1-hub.github.io/restaurant-templates/", art: "linear-gradient(135deg,#be6548 0%,#3d251b 100%)" }
];

const screens = Object.fromEntries([...document.querySelectorAll(".screen")].map((screen) => [screen.id.replace("-screen", ""), screen]));
const navButtons = [...document.querySelectorAll("[data-screen]")];
const themeButtons = [...document.querySelectorAll("[data-theme]")];
const caseView = document.querySelector("#case-view");
const caseFrame = document.querySelector("#case-frame");
const notice = document.querySelector("#notice");
let activeTemplate = 0;
let activeTheme = 0;
let noticeTimer;

function showScreen(name) {
  Object.entries(screens).forEach(([screenName, screen]) => {
    const isActive = screenName === name;
    screen.hidden = !isActive;
    screen.classList.toggle("is-active", isActive);
  });
  navButtons.forEach((button) => button.classList.toggle("is-active", button.dataset.screen === name));
}

function setFrameFilter() {
  const filters = ["none", "saturate(1.45) contrast(1.04)", "sepia(.16) saturate(.84) hue-rotate(338deg) brightness(1.04)"];
  caseFrame.style.filter = filters[activeTheme];
}

function directionButtons(frame) {
  try {
    const doc = frame.contentDocument;
    const selectors = [".direction-tabs button", ".direction-options button", ".theme-options button", ".demo-bar .direction-tabs button"];
    for (const selector of selectors) {
      const buttons = [...doc.querySelectorAll(selector)];
      if (buttons.length >= 3) return buttons;
    }
  } catch (_) { /* cross-origin previews use the visual fallback until opened on GitHub Pages */ }
  return [];
}

function applyTheme() {
  const buttons = directionButtons(caseFrame);
  const changedLiveTemplate = Boolean(buttons[activeTheme]);
  if (changedLiveTemplate) buttons[activeTheme].click();
  if (changedLiveTemplate) caseFrame.style.filter = "none";
  else setFrameFilter();
  themeButtons.forEach((button) => button.classList.toggle("is-active", Number(button.dataset.theme) === activeTheme));
  document.querySelector("#theme-note").textContent = `THEME ${String(activeTheme + 1).padStart(2, "0")} LOADED`;
}

function showNotice(text) {
  notice.textContent = text;
  notice.classList.add("is-visible");
  clearTimeout(noticeTimer);
  noticeTimer = setTimeout(() => notice.classList.remove("is-visible"), 1900);
}

function updateWorkStage() {
  const current = templates[activeTemplate];
  const previous = templates[(activeTemplate + templates.length - 1) % templates.length];
  const next = templates[(activeTemplate + 1) % templates.length];
  [[document.querySelector(".project-frame-left"), previous], [document.querySelector(".project-frame-main"), current], [document.querySelector(".project-frame-right"), next]].forEach(([frame, item]) => {
    frame.style.backgroundImage = item.art;
    frame.dataset.label = item.name.toUpperCase();
  });
  document.querySelector("#work-count").textContent = `${String(activeTemplate + 1).padStart(2, "0")} / 07`;
  document.querySelector("#work-category").textContent = current.category;
  document.querySelector("#work-name").textContent = current.name;
}

function selectTemplate(index) {
  activeTemplate = (index + templates.length) % templates.length;
  updateWorkStage();
}

function openCase(index = activeTemplate) {
  selectTemplate(index);
  activeTheme = 0;
  const template = templates[activeTemplate];
  document.querySelector("#case-number").textContent = `${String(activeTemplate + 1).padStart(2, "0")} / 07`;
  document.querySelector("#case-title").textContent = template.name;
  document.querySelector("#case-external").href = template.url;
  caseFrame.src = template.url;
  caseFrame.onload = applyTheme;
  caseView.classList.add("is-open");
  caseView.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeCase() {
  caseView.classList.remove("is-open");
  caseView.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
  setTimeout(() => { if (!caseView.classList.contains("is-open")) caseFrame.src = "about:blank"; }, 360);
}

navButtons.forEach((button) => button.addEventListener("click", () => showScreen(button.dataset.screen)));
document.querySelector("#explore-work").addEventListener("click", () => showScreen("work"));
document.querySelector("#open-info").addEventListener("click", () => showScreen("info"));
document.querySelector("#info-to-index").addEventListener("click", () => showScreen("index"));
document.querySelector(".stage-prev").addEventListener("click", () => selectTemplate(activeTemplate - 1));
document.querySelector(".stage-next").addEventListener("click", () => selectTemplate(activeTemplate + 1));
document.querySelector(".project-frame-left").addEventListener("click", () => selectTemplate(activeTemplate - 1));
document.querySelector(".project-frame-right").addEventListener("click", () => selectTemplate(activeTemplate + 1));
document.querySelector("#open-case-from-work").addEventListener("click", () => openCase());
document.querySelector("#work-view").addEventListener("click", () => openCase());
document.querySelectorAll("[data-template]").forEach((button) => button.addEventListener("click", () => openCase(Number(button.dataset.template))));
document.querySelector(".close-case").addEventListener("click", closeCase);
document.querySelector("#case-next").addEventListener("click", () => openCase(activeTemplate + 1));
themeButtons.forEach((button) => button.addEventListener("click", () => { activeTheme = Number(button.dataset.theme); applyTheme(); showNotice(`Theme ${activeTheme + 1} loaded`); }));
document.querySelectorAll("[data-filter]").forEach((button) => button.addEventListener("click", () => {
  const filter = button.dataset.filter;
  document.querySelectorAll("[data-filter]").forEach((item) => item.classList.toggle("is-active", item === button));
  document.querySelectorAll(".template-row").forEach((row) => row.classList.toggle("is-hidden", filter !== "all" && row.dataset.filterGroup !== filter));
}));
addEventListener("keydown", (event) => { if (event.key === "Escape" && caseView.classList.contains("is-open")) closeCase(); });

updateWorkStage();
