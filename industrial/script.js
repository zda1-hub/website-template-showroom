const walls = [...document.querySelectorAll("[data-wall]")];
const navButtons = [...document.querySelectorAll("[data-wall-nav]")];
const selectedTitle = document.querySelector("#selected-title");
const roomPosition = document.querySelector("#room-position");
const roomName = document.querySelector("#room-name");
const schemeName = document.querySelector("#scheme-name");
const toast = document.querySelector("#scheme-toast");
const toastCopy = document.querySelector("#toast-copy");
const searchInput = document.querySelector("#template-search");
const searchCount = document.querySelector("#search-count");
const schemeState = walls.map(() => 0);
const fallbackFilters = ["none", "hue-rotate(28deg) saturate(1.18)", "hue-rotate(185deg) saturate(.92) contrast(1.08)", "sepia(.42) hue-rotate(345deg) saturate(1.25)"];
let selected = 0;
let toastTimer;
let searchMatches = walls.map((_, index) => index);

function finishLoader() {
  document.querySelector("#loader").classList.add("done");
  document.body.classList.remove("is-loading");
}

if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
  finishLoader();
} else {
  let count = 1;
  const counter = setInterval(() => {
    count += 1;
    document.querySelector("#loader-count").textContent = String(Math.min(8, count)).padStart(2, "0");
    if (count >= 8) {
      clearInterval(counter);
      setTimeout(finishLoader, 220);
    }
  }, 105);
}
document.querySelector("#skip-loader").addEventListener("click", finishLoader);

function selectWall(index, instant = false) {
  const normalized = (index + walls.length) % walls.length;
  selected = normalized;

  walls.forEach((wall, wallIndex) => {
    wall.classList.toggle("is-active", wallIndex === selected);
  });
  navButtons.forEach((button, buttonIndex) => button.classList.toggle("active", buttonIndex === selected));

  const wall = walls[selected];
  const count = Number(wall.dataset.schemeCount || 3);
  selectedTitle.textContent = wall.dataset.title;
  roomName.textContent = wall.dataset.short;
  roomPosition.textContent = `WALL ${String(selected + 1).padStart(2, "0")} / 08`;
  schemeName.textContent = `COLOR SCHEME ${String(schemeState[selected] + 1).padStart(2, "0")} / ${String(count).padStart(2, "0")}`;
  sizeWalls();
}

function sizeWalls() {
  walls.forEach((wall) => {
    const iframe = wall.querySelector("iframe");
    const scale = Math.max(wall.clientWidth / 1440, wall.clientHeight / 900);
    iframe.style.setProperty("--wall-scale", scale);
    wall.style.setProperty("--wall-scale", scale);
  });
}
addEventListener("resize", sizeWalls);
sizeWalls();

function childSchemeButtons(frame, wall) {
  try {
    const doc = frame.contentDocument;
    if (!doc) return [];
    if (wall.dataset.customColors || wall.dataset.roomColors) return [];
    const selectors = [
      ".direction-options button",
      ".theme-options button",
      ".direction-tabs button",
      ".demo-bar .direction-tabs button",
    ];
    for (const selector of selectors) {
      const buttons = [...doc.querySelectorAll(selector)];
      if (buttons.length > 1) return buttons;
    }
  } catch (_) {
    return [];
  }
  return [];
}

function applySchemeToFrame(frame, wall, schemeIndex) {
  const buttons = childSchemeButtons(frame, wall);
  if (buttons[schemeIndex]) {
    buttons[schemeIndex].click();
    return true;
  }
  return false;
}

function nextScheme(showToast = true) {
  const wall = walls[selected];
  const count = Number(wall.dataset.schemeCount || 3);
  schemeState[selected] = (schemeState[selected] + 1) % count;
  const frame = wall.querySelector("iframe");
  const changedInsideWebsite = applySchemeToFrame(frame, wall, schemeState[selected]);
  wall.dataset.fallbackScheme = changedInsideWebsite ? "0" : String(schemeState[selected]);
  schemeName.textContent = `COLOR SCHEME ${String(schemeState[selected] + 1).padStart(2, "0")} / ${String(count).padStart(2, "0")}`;
  if (document.querySelector("#preview").open) {
    const previewFrame = document.querySelector("#preview-frame");
    if (!applySchemeToFrame(previewFrame, wall, schemeState[selected])) previewFrame.style.filter = fallbackFilters[schemeState[selected]] || "none";
  }
  if (showToast) {
    toastCopy.textContent = `${wall.dataset.title} changed to color scheme ${String(schemeState[selected] + 1).padStart(2, "0")}`;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 2500);
  }
}

function filterWalls(query) {
  const normalized = query.trim().toLowerCase();
  searchMatches = [];
  walls.forEach((wall, index) => {
    const searchable = `${wall.dataset.title} ${wall.dataset.short} ${wall.querySelector(".wall-label span").textContent}`.toLowerCase();
    const matches = !normalized || searchable.includes(normalized);
    wall.classList.toggle("is-search-miss", !matches);
    wall.querySelector(".wall-hit").disabled = !matches;
    navButtons[index].classList.toggle("is-search-miss", !matches);
    navButtons[index].disabled = !matches;
    if (matches) searchMatches.push(index);
  });
  searchCount.textContent = `${String(searchMatches.length).padStart(2, "0")} / 08`;
  if (normalized && searchMatches.length) selectWall(searchMatches[0]);
}

searchInput.addEventListener("input", () => filterWalls(searchInput.value));
searchInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && searchMatches.length) {
    event.preventDefault();
    event.stopPropagation();
    selectWall(searchMatches[0]);
    openWebsite();
  }
  if (event.key === "Escape") {
    searchInput.value = "";
    filterWalls("");
    searchInput.blur();
  }
});

walls.forEach((wall, index) => {
  wall.querySelector(".wall-hit").addEventListener("click", () => {
    selectWall(index);
    openWebsite();
  });
  wall.addEventListener("pointerenter", () => selectWall(index));
  wall.addEventListener("focusin", () => selectWall(index));
  wall.querySelector("iframe").addEventListener("load", () => {
    applySchemeToFrame(wall.querySelector("iframe"), wall, schemeState[index]);
    sizeWalls();
  });
});
navButtons.forEach((button, index) => button.addEventListener("click", () => selectWall(index)));
document.querySelector("#next-scheme").addEventListener("click", () => nextScheme());

addEventListener("keydown", (event) => {
  if (event.key === "ArrowLeft") selectWall(selected - 1);
  if (event.key === "ArrowRight") selectWall(selected + 1);
  if (event.key === "Enter" && !preview.open) openWebsite();
});

const preview = document.querySelector("#preview");
const previewFrame = document.querySelector("#preview-frame");
const previewTitle = document.querySelector("#preview-title");
const externalLink = document.querySelector("#external-link");

function openWebsite() {
  const wall = walls[selected];
  previewTitle.textContent = wall.dataset.title;
  externalLink.href = wall.dataset.url;
  previewFrame.src = wall.dataset.url;
  previewFrame.onload = () => {
    const changedInsideWebsite = applySchemeToFrame(previewFrame, wall, schemeState[selected]);
    previewFrame.style.filter = changedInsideWebsite ? "none" : fallbackFilters[schemeState[selected]] || "none";
  };
  if (typeof preview.showModal === "function") preview.showModal();
  else preview.setAttribute("open", "");
}

function closeWebsite() {
  if (typeof preview.close === "function") preview.close();
  else preview.removeAttribute("open");
  previewFrame.src = "about:blank";
}
document.querySelector("#view-website").addEventListener("click", openWebsite);
document.querySelector("#preview-scheme").addEventListener("click", () => nextScheme());
document.querySelector("#close-preview").addEventListener("click", closeWebsite);
preview.addEventListener("click", (event) => { if (event.target === preview) closeWebsite(); });

selectWall(0, true);
