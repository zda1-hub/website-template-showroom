const filters = document.querySelectorAll("[data-filter]");
const cards = document.querySelectorAll("[data-kind]");

filters.forEach((button) => button.addEventListener("click", () => {
  filters.forEach((item) => item.classList.remove("active"));
  button.classList.add("active");
  const filter = button.dataset.filter;
  cards.forEach((card) => { card.hidden = filter !== "all" && !card.dataset.kind.split(" ").includes(filter); });
}));

document.querySelector("#brief-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  const brief = `Website project brief\nBusiness: ${data.get("business")}\nWebsite type: ${data.get("type")}\nMain customer action: ${data.get("goal")}\nRequested next step: Build a customized preview.`;
  await navigator.clipboard.writeText(brief);
  document.querySelector("#form-note").textContent = "Project brief copied. Reply to the email that brought you here and paste it—we’ll use it to customize your preview.";
  event.currentTarget.querySelector("button").innerHTML = "Brief copied <span>✓</span>";
});
