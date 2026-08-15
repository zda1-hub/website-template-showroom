document.querySelectorAll(".door").forEach((door) => {
  door.addEventListener("pointermove", (event) => {
    const box = door.getBoundingClientRect();
    door.style.setProperty("--mx", `${event.clientX - box.left}px`);
    door.style.setProperty("--my", `${event.clientY - box.top}px`);
  });
});
