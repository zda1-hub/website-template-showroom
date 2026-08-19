const projects = [
  { title: "Blue hour", category: "Photography", year: "2025", tag: "Horizon", image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=88" },
  { title: "Quiet geometry", category: "Architecture", year: "2024", tag: "Structure", image: "https://images.unsplash.com/photo-1511818966892-d7d671e672a2?auto=format&fit=crop&w=1200&q=88" },
  { title: "Soft focus", category: "Editorial", year: "2026", tag: "Fashion", image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=88" },
  { title: "Afterglow", category: "Photography", year: "2025", tag: "Desert", image: "https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=1200&q=88" },
  { title: "Green room", category: "Still life", year: "2024", tag: "Botanical", image: "https://images.unsplash.com/photo-1497250681960-ef046c08a56e?auto=format&fit=crop&w=1200&q=88" },
  { title: "Midnight", category: "City light", year: "2026", tag: "Nightscape", image: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=1200&q=88" },
  { title: "First light", category: "Still life", year: "2025", tag: "Ritual", image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=88" },
  { title: "Low tide", category: "Photography", year: "2026", tag: "Coast", image: "https://images.unsplash.com/photo-1473116763249-2faaef81ccda?auto=format&fit=crop&w=1200&q=88" },
  { title: "Open form", category: "Interior", year: "2025", tag: "Space", image: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=88" },
  { title: "Slow bloom", category: "Botanical", year: "2024", tag: "Garden", image: "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?auto=format&fit=crop&w=1200&q=88" },
  { title: "Silver screen", category: "Cinema", year: "2026", tag: "Motion", image: "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=1200&q=88" },
  { title: "New ritual", category: "Object study", year: "2025", tag: "Material", image: "https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&w=1200&q=88" },
];
const $ = (selector) => document.querySelector(selector);
const stage = $("#project-stage");
let index = 0, target = 0, dragging = false, startY = 0, startTarget = 0, wheelTravel = 0;
const loader = $("#loader"), loaderPercent = $("#loader-percent");
let progress = 0;
const loaderTimer = setInterval(() => { progress = Math.min(100, progress + Math.ceil(Math.random() * 17)); loaderPercent.textContent = String(progress).padStart(2, "0"); if (progress === 100) { clearInterval(loaderTimer); setTimeout(() => loader.classList.add("done"), 220); } }, 90);

function mod(value, length) { return ((value % length) + length) % length; }
function updateBubble(event) {
  if (dragging) return;
  const tile = stage.querySelector(".tile-0");
  if (!tile) return;
  const rect = tile.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const up = Math.max(0, 1 - Math.abs(event.clientY - (rect.top - 90)) / 150);
  const down = Math.max(0, 1 - Math.abs(event.clientY - (rect.bottom + 90)) / 150);
  const bubbleX = (x / rect.width - .5) * 42;
  tile.classList.toggle("is-hovered", up > .08 || down > .08 || (event.clientY >= rect.top && event.clientY <= rect.bottom));
  const reachingUp = stage.querySelector(".up-1");
  const reachingDown = stage.querySelector(".down-1");
  [reachingUp, reachingDown].forEach((targetTile) => {
    if (!targetTile) return;
    targetTile.classList.remove("is-reaching");
    targetTile.style.setProperty("--reach", "0");
    targetTile.style.setProperty("--reach-x", "0px");
    targetTile.style.setProperty("--reach-y", "0px");
  });
  if (reachingUp && up > .08) {
    reachingUp.classList.add("is-reaching");
    reachingUp.style.setProperty("--reach", up.toFixed(3));
    reachingUp.style.setProperty("--reach-x", `${bubbleX * .45}px`);
    reachingUp.style.setProperty("--reach-y", `${up * 18}px`);
  }
  if (reachingDown && down > .08) {
    reachingDown.classList.add("is-reaching");
    reachingDown.style.setProperty("--reach", down.toFixed(3));
    reachingDown.style.setProperty("--reach-x", `${bubbleX * .45}px`);
    reachingDown.style.setProperty("--reach-y", `${down * -18}px`);
  }
  tile.style.setProperty("--bubble-x", `${bubbleX}px`);
  tile.style.setProperty("--bubble-up-width", `${4 + up * 20}px`);
  tile.style.setProperty("--bubble-down-width", `${4 + down * 20}px`);
  tile.style.setProperty("--bubble-up-strength", up.toFixed(3));
  tile.style.setProperty("--bubble-down-strength", down.toFixed(3));
  tile.style.setProperty("--bubble-up-height", `${34 + up * 56}px`);
  tile.style.setProperty("--bubble-down-height", `${34 + down * 56}px`);
}
function render() {
  index = mod(Math.round(target), projects.length);
  const active = projects[index];
  if (!stage.children.length) projects.forEach((project) => {
    const tile = document.createElement("button");
    tile.type = "button";
    tile.innerHTML = `<img src="${project.image}" alt="${project.title}" /><i class="edge edge-up" aria-hidden="true"></i><i class="edge edge-down" aria-hidden="true"></i><i class="bridge bridge-up" aria-hidden="true"></i><i class="bridge bridge-down" aria-hidden="true"></i><span>${project.tag}</span><b class="hover-view">View ↗</b>`;
    tile.addEventListener("click", (event) => { const offset = Number(tile.dataset.offset); if (offset === 0) { if (event.pointerType === "touch" && tile.dataset.touchArmed === "1") { tile.dataset.touchArmed = "0"; return; } openPreview(projects[mod(index, projects.length)]); } else step(offset); });
    tile.addEventListener("pointerdown", (event) => { if (event.pointerType === "touch" && tile.dataset.offset === "0") { if (tile.dataset.touchArmed === "1") tile.dataset.touchArmed = "0"; else { tile.dataset.touchArmed = "1"; tile.classList.add("is-hovered"); } } });
    tile.addEventListener("pointermove", (event) => { if (tile.dataset.offset !== "0") return; const rect = tile.getBoundingClientRect(); const x = event.clientX - rect.left; const y = event.clientY - rect.top; tile.classList.add("is-hovered"); tile.style.setProperty("--hover-x", `${x}px`); tile.style.setProperty("--hover-y", `${y}px`); tile.style.setProperty("--tilt-x", `${(x / rect.width - .5) * 8}deg`); tile.style.setProperty("--tilt-y", `${(y / rect.height - .5) * -8}deg`); });
    tile.addEventListener("pointerleave", () => { if (tile.dataset.touchArmed !== "1") tile.classList.remove("is-hovered"); tile.style.setProperty("--hover-x", "50%"); tile.style.setProperty("--hover-y", "50%"); tile.style.setProperty("--tilt-x", "0deg"); tile.style.setProperty("--tilt-y", "0deg"); });
    stage.append(tile);
  });
  const tileGap = Math.min(250, Math.max(120, window.innerWidth * .32));
  projects.forEach((project, i) => {
    let offset = i - target;
    if (offset > projects.length / 2) offset -= projects.length;
    if (offset < -projects.length / 2) offset += projects.length;
    const tile = stage.children[i];
    const nearest = Math.round(offset);
    tile.className = "tile " + (nearest === 0 ? "tile-0" : nearest < 0 ? "up-" + Math.abs(nearest) : "down-" + nearest);
    const distance = Math.abs(offset);
    tile.style.transform = "translate(-50%,-50%) translateY(calc(" + (offset * tileGap) + "px + var(--reach-y, 0px))) translateX(var(--reach-x, 0px)) rotate(" + (offset * -5) + "deg) scale(" + (distance < .5 ? 1.08 : Math.max(.76, 1 - distance * .08)) + ")";
    tile.style.opacity = distance > 3.2 ? "0" : String(Math.max(.12, 1 - distance * .22));
   tile.style.zIndex = String(100 - Math.round(distance * 10));
    tile.style.setProperty("--tile-image", "url(\"" + project.image + "\")");
    tile.style.setProperty("--bridge-up-image", "url(\"" + projects[mod(i - 1, projects.length)].image + "\")");
   tile.style.setProperty("--bridge-down-image", "url(\"" + projects[mod(i + 1, projects.length)].image + "\")");
    tile.querySelector(".bridge-up").style.backgroundImage = "url(" + projects[mod(i - 1, projects.length)].image + ")";
    tile.querySelector(".bridge-down").style.backgroundImage = "url(" + projects[mod(i + 1, projects.length)].image + ")";
   tile.dataset.offset = offset;
    tile.style.setProperty("--offset", offset);
    tile.setAttribute("aria-label", `Open ${project.title}`);
  });
  $("#project-index").textContent = String(mod(index, projects.length) + 1).padStart(2, "0");
  $("#project-title").textContent = active.title;
  $("#project-category").textContent = active.category;
  $("#project-year").textContent = active.year;
  $("#category-rail").innerHTML = projects.map((project, i) => `<span class="${i === mod(index, projects.length) ? "selected" : ""}">${project.tag}</span>`).join("");
}
function step(amount) { target = mod(Math.round(target) + amount, projects.length); render(); }
function openPreview(project) { $("#preview-image").src = project.image; $("#preview-image").alt = project.title; $("#preview").showModal(); }
function closePreview() { $("#preview").close(); $("#preview-image").src = ""; }
function openProjectSite(project) { const slug = project.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); window.location.href = `./project.html?project=${slug}`; }
render();
setTimeout(() => $("#archive").classList.remove("is-opening"), 3300);
$("#next").addEventListener("click", () => step(1)); $("#previous").addEventListener("click", () => step(-1)); $("#project-view").addEventListener("click", () => openProjectSite(projects[mod(index, projects.length)])); $("#close-preview").addEventListener("click", closePreview);
$("#preview").addEventListener("click", (event) => { if (event.target === $("#preview")) closePreview(); });
$("#archive").addEventListener("wheel", (event) => { event.preventDefault(); wheelTravel += event.deltaY * .4; if (Math.abs(wheelTravel) >= 120) { step(wheelTravel > 0 ? 1 : -1); wheelTravel = 0; } }, { passive: false });
$("#archive").addEventListener("pointerdown", (event) => { dragging = true; startY = event.clientY; startTarget = target; $("#archive").setPointerCapture(event.pointerId); });
$("#archive").addEventListener("pointermove", (event) => { updateBubble(event); if (!dragging) return; const delta = event.clientY - startY; target = startTarget - delta / 275; render(); });
$("#archive").addEventListener("pointerup", () => { dragging = false; target = mod(Math.round(target), projects.length); render(); });
$("#archive").addEventListener("pointerleave", () => { const tile = stage.querySelector(".tile-0"); if (tile && tile.dataset.touchArmed !== "1") tile.classList.remove("is-hovered"); stage.querySelectorAll(".is-reaching").forEach((targetTile) => { targetTile.classList.remove("is-reaching"); targetTile.style.setProperty("--reach", "0"); targetTile.style.setProperty("--reach-x", "0px"); targetTile.style.setProperty("--reach-y", "0px"); }); });
const search = $("#search"); search.addEventListener("input", () => { const query = search.value.toLowerCase().trim(); const matches = projects.filter((project) => `${project.title} ${project.category} ${project.tag}`.toLowerCase().includes(query)); $("#result-count").textContent = `${String(matches.length).padStart(2, "0")} / ${String(projects.length).padStart(2, "0")}`; if (matches.length) { target = projects.indexOf(matches[0]); render(); } });
function restart() { if ($("#preview").open) closePreview(); search.value = ""; target = 0; $("#result-count").textContent = `${String(projects.length).padStart(2, "0")} / ${String(projects.length).padStart(2, "0")}`; render(); $("#archive").classList.add("is-opening"); const opening = $("#opening-sequence"); opening.replaceWith(opening.cloneNode(true)); setTimeout(() => $("#archive").classList.remove("is-opening"), 3300); }
$("#restart-home").addEventListener("click", restart); $("#restart-footer").addEventListener("click", restart);
