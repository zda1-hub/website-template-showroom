const loader = document.querySelector("#loader");
const loaderPercent = document.querySelector("#loader-percent");
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

if (reduceMotion) {
  loader.classList.add("done");
} else {
  let percent = 0;
  const loading = setInterval(() => {
    percent = Math.min(100, percent + Math.ceil(Math.random() * 15));
    loaderPercent.textContent = String(percent).padStart(2, "0");
    if (percent === 100) {
      clearInterval(loading);
      setTimeout(() => loader.classList.add("done"), 260);
    }
  }, 95);
}

const stage = document.querySelector("#carousel-stage");
const cards = [...document.querySelectorAll("[data-card]")];
const search = document.querySelector("#search");
const resultCount = document.querySelector("#result-count");
const empty = document.querySelector("#empty");
let activeCards = [...cards];
let offset = 0;
let dragging = false;
let moved = false;
let lastX = 0;
let velocity = 0;
let lastTime = performance.now();

function cardSpacing() {
  return Math.min(520, Math.max(320, innerWidth * 0.34));
}

function render() {
  const count = activeCards.length;
  if (!count) return;
  const spacing = cardSpacing();
  const loop = spacing * count;
  activeCards.forEach((card, index) => {
    let x = index * spacing - offset;
    x = ((x + loop / 2) % loop + loop) % loop - loop / 2;
    const distance = Math.abs(x);
    const normalized = Math.min(1, distance / (spacing * 2.2));
    card.style.setProperty("--x", `${x}px`);
    card.style.setProperty("--y", `${distance * .055}px`);
    card.style.setProperty("--z", `${-distance * .56}px`);
    card.style.setProperty("--rot", `${x * -.045}deg`);
    card.style.setProperty("--stack", String(1000 - Math.round(distance)));
    card.style.opacity = String(Math.max(.18, 1 - normalized * .72));
    card.classList.toggle("is-center", distance < spacing * .38);
    card.setAttribute("aria-current", distance < spacing * .38 ? "true" : "false");
    const screen = card.querySelector(".card-screen");
    const scale = screen.clientWidth / 1440;
    card.querySelector("iframe").style.transform = `scale(${scale})`;
  });
}

function animate(time) {
  const elapsed = Math.min(32, time - lastTime);
  lastTime = time;
  if (!dragging && !reduceMotion && !search.matches(":focus")) offset += elapsed * .012;
  if (!dragging && Math.abs(velocity) > .01) {
    offset -= velocity;
    velocity *= .92;
  }
  render();
  requestAnimationFrame(animate);
}
requestAnimationFrame(animate);

stage.addEventListener("wheel", (event) => {
  event.preventDefault();
  offset += (Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY) * .55;
  velocity = 0;
}, { passive: false });

stage.addEventListener("pointerdown", (event) => {
  dragging = true;
  moved = false;
  lastX = event.clientX;
  velocity = 0;
  stage.classList.add("dragging");
  stage.setPointerCapture(event.pointerId);
});
stage.addEventListener("pointermove", (event) => {
  if (!dragging) return;
  const delta = event.clientX - lastX;
  if (Math.abs(delta) > 2) moved = true;
  offset -= delta;
  velocity = delta;
  lastX = event.clientX;
});
stage.addEventListener("pointerup", () => {
  dragging = false;
  stage.classList.remove("dragging");
});
stage.addEventListener("pointercancel", () => {
  dragging = false;
  stage.classList.remove("dragging");
});

document.querySelector("#previous").addEventListener("click", () => { offset -= cardSpacing(); velocity = 0; });
document.querySelector("#next").addEventListener("click", () => { offset += cardSpacing(); velocity = 0; });

function filterCards() {
  const query = search.value.trim().toLowerCase();
  cards.forEach((card) => { card.hidden = Boolean(query) && !card.dataset.search.includes(query); });
  activeCards = cards.filter((card) => !card.hidden);
  offset = 0;
  resultCount.textContent = `${String(activeCards.length).padStart(2, "0")} / 07`;
  empty.classList.toggle("show", activeCards.length === 0);
  render();
}
search.addEventListener("input", filterCards);
document.querySelector("#reset-search").addEventListener("click", () => {
  search.value = "";
  filterCards();
  search.focus();
});
addEventListener("resize", render);

const preview = document.querySelector("#preview");
const previewFrame = document.querySelector("#preview-frame");
const previewTitle = document.querySelector("#preview-title");
const externalLink = document.querySelector("#external-link");

cards.forEach((card) => card.querySelector("[data-open]").addEventListener("click", (event) => {
  if (moved) { event.preventDefault(); moved = false; return; }
  previewTitle.textContent = card.dataset.title;
  previewFrame.src = card.dataset.url;
  externalLink.href = card.dataset.url;
  preview.showModal();
}));

function closePreview() {
  preview.close();
  previewFrame.src = "about:blank";
}
document.querySelector("#close-preview").addEventListener("click", closePreview);
preview.addEventListener("click", (event) => { if (event.target === preview) closePreview(); });
