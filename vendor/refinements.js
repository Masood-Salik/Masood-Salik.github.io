const refinementSheet = document.createElement("link");
refinementSheet.rel = "stylesheet";
refinementSheet.href = "./refinements.css";
document.head.append(refinementSheet);

const themeSections = [...document.querySelectorAll("[data-scene]")];
const themeObserver = new IntersectionObserver(
  (entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (visible) document.body.dataset.activeScene = visible.target.dataset.scene;
  },
  { threshold: [0.3, 0.55, 0.75] },
);
themeSections.forEach((section) => themeObserver.observe(section));
