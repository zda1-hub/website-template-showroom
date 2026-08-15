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

const workStage = document.querySelector("#work-stage");
const coverflowTrack = document.querySelector("#coverflow-track");
let pointerStartX = 0;
let pointerDelta = 0;
let isDraggingFlow = false;
let suppressFlowClick = false;

function circularOffset(index) {
  let offset = index - activeTemplate;
  if (offset > templates.length / 2) offset -= templates.length;
  if (offset < -templates.length / 2) offset += templates.length;
  return offset;
}

function createCoverflowCards() {
  templates.forEach((template, index) => {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "cover-card";
    card.dataset.template = String(index);
    card.dataset.label = template.name.toUpperCase();
    card.style.backgroundImage = template.art;
    card.setAttribute("aria-label", `View ${template.name}`);
    card.addEventListener("click", () => {
      if (suppressFlowClick) return;
      if (index === activeTemplate) openCase(index);
      else selectTemplate(index);
    });
    coverflowTrack.append(card);
  });
}

function updateWorkStage() {
  [...coverflowTrack.children].forEach((card, index) => {
    const offset = circularOffset(index);
    card.dataset.offset = String(offset);
    card.setAttribute("aria-hidden", String(Math.abs(offset) > 2));
    card.tabIndex = Math.abs(offset) > 2 ? -1 : 0;
  });
  document.querySelector("#work-count").textContent = `${String(activeTemplate + 1).padStart(2, "0")} / 07`;
  document.querySelector("#work-category").textContent = templates[activeTemplate].category;
  document.querySelector("#work-name").textContent = templates[activeTemplate].name;
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
workStage.addEventListener("pointerdown", (event) => {
  if (event.pointerType === "mouse" && event.button !== 0) return;
  pointerStartX = event.clientX;
  pointerDelta = 0;
  isDraggingFlow = true;
  workStage.classList.add("is-dragging");
  workStage.setPointerCapture(event.pointerId);
});
workStage.addEventListener("pointermove", (event) => {
  if (!isDraggingFlow) return;
  pointerDelta = Math.max(-150, Math.min(150, event.clientX - pointerStartX));
  workStage.style.setProperty("--drag", `${pointerDelta}px`);
});
function finishFlowSwipe(event) {
  if (!isDraggingFlow) return;
  isDraggingFlow = false;
  if (workStage.hasPointerCapture(event.pointerId)) workStage.releasePointerCapture(event.pointerId);
  const moved = Math.abs(pointerDelta) > 12;
  suppressFlowClick = moved;
  if (pointerDelta < -34) selectTemplate(activeTemplate + 1);
  if (pointerDelta > 34) selectTemplate(activeTemplate - 1);
  workStage.classList.remove("is-dragging");
  requestAnimationFrame(() => workStage.style.setProperty("--drag", "0px"));
  setTimeout(() => { suppressFlowClick = false; }, 40);
}
workStage.addEventListener("pointerup", finishFlowSwipe);
workStage.addEventListener("pointercancel", finishFlowSwipe);
addEventListener("keydown", (event) => {
  if (event.key === "Escape" && caseView.classList.contains("is-open")) closeCase();
  if (!caseView.classList.contains("is-open") && !document.querySelector("#work-screen").hidden) {
    if (event.key === "ArrowLeft") selectTemplate(activeTemplate - 1);
    if (event.key === "ArrowRight") selectTemplate(activeTemplate + 1);
  }
});

createCoverflowCards();
updateWorkStage();
