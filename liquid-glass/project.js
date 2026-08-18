const projects = {
  "blue-hour": ["Blue hour", "Horizon", "Photography", "2025", "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=90"],
  "quiet-geometry": ["Quiet geometry", "Structure", "Architecture", "2024", "https://images.unsplash.com/photo-1511818966892-d7d671e672a2?auto=format&fit=crop&w=1600&q=90"],
  "soft-focus": ["Soft focus", "Fashion", "Editorial", "2026", "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1600&q=90"],
  "afterglow": ["Afterglow", "Desert", "Photography", "2025", "https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=1600&q=90"],
  "green-room": ["Green room", "Botanical", "Still life", "2024", "https://images.unsplash.com/photo-1497250681960-ef046c08a56e?auto=format&fit=crop&w=1600&q=90"],
  "midnight": ["Midnight", "Nightscape", "City light", "2026", "https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=1600&q=90"],
  "first-light": ["First light", "Ritual", "Still life", "2025", "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1600&q=90"],
  "low-tide": ["Low tide", "Coast", "Photography", "2026", "https://images.unsplash.com/photo-1473116763249-2faaef81ccda?auto=format&fit=crop&w=1600&q=90"],
  "open-form": ["Open form", "Space", "Interior", "2025", "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1600&q=90"],
  "slow-bloom": ["Slow bloom", "Garden", "Botanical", "2024", "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?auto=format&fit=crop&w=1600&q=90"],
  "silver-screen": ["Silver screen", "Motion", "Cinema", "2026", "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=1600&q=90"],
  "new-ritual": ["New ritual", "Material", "Object study", "2025", "https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&w=1600&q=90"]
};
const data = projects[new URLSearchParams(location.search).get("project")] || projects["blue-hour"];
document.title = `${data[0]} — Z/Archive`;
document.querySelector("#project-image").src = data[4];
document.querySelector("#project-image").alt = data[0];
document.querySelector("#project-tag").textContent = data[1];
document.querySelector("#project-title").textContent = data[0];
document.querySelector("#project-meta").textContent = `${data[2]}  ·  ${data[3]}`;
