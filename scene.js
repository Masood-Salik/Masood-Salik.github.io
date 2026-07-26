import * as THREE from "./vendor/three.module.min.js";

const canvas = document.querySelector("[data-webgl-canvas]");
const shell = document.querySelector("[data-webgl-shell]");
const loading = document.querySelector("[data-loading]");
const fallback = document.querySelector("[data-webgl-fallback]");
const sceneCurrent = document.querySelector("[data-scene-current]");
const sections = [...document.querySelectorAll("[data-scene]")];
const navLinks = [...document.querySelectorAll("[data-nav-scene]")];
const projectLinks = [...document.querySelectorAll("[data-project-index]")];
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

let renderer;
try {
  renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: false,
    powerPreference: "high-performance",
  });
} catch (error) {
  canvas.hidden = true;
  loading.hidden = true;
  fallback.hidden = false;
  throw error;
}

renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.08;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100);
camera.position.set(0.2, 4.15, 12.3);

const cream = new THREE.Color(0xf3ead9);
const navy = new THREE.Color(0x061a40);
const projectsCream = new THREE.Color(0xeee2cb);
const currentBackground = cream.clone();
scene.background = currentBackground;
scene.fog = new THREE.Fog(cream, 14, 28);

const world = new THREE.Group();
scene.add(world);

const hemi = new THREE.HemisphereLight(0xfff7e9, 0x7d684d, 2.4);
scene.add(hemi);

const keyLight = new THREE.DirectionalLight(0xffd6ad, 5.2);
keyLight.position.set(-4, 9, 8);
keyLight.castShadow = true;
keyLight.shadow.mapSize.set(1024, 1024);
keyLight.shadow.camera.left = -10;
keyLight.shadow.camera.right = 10;
keyLight.shadow.camera.top = 10;
keyLight.shadow.camera.bottom = -4;
scene.add(keyLight);

const rimLight = new THREE.PointLight(0x42e5ee, 12, 18, 2);
rimLight.position.set(5, 5, -3);
scene.add(rimLight);

const warmLight = new THREE.PointLight(0xff7a18, 8, 15, 2);
warmLight.position.set(1, 3, 5);
scene.add(warmLight);

// Palette and character proportions adapted from the newer, cuter reference build in
// Archive/Character_References/scene.js (masood-lab-cute-interactive-preview.png).
const materials = {
  skin: new THREE.MeshStandardMaterial({ color: 0xb97954, roughness: 0.78 }),
  skinLight: new THREE.MeshStandardMaterial({ color: 0xce9068, roughness: 0.75 }),
  hair: new THREE.MeshStandardMaterial({ color: 0x17130f, roughness: 0.94 }),
  beard: new THREE.MeshStandardMaterial({ color: 0x1b1511, roughness: 1 }),
  lip: new THREE.MeshStandardMaterial({ color: 0x8e4e45, roughness: 0.94 }),
  navy: new THREE.MeshStandardMaterial({ color: 0x293b56, roughness: 0.67 }),
  navyDark: new THREE.MeshStandardMaterial({ color: 0x3c5272, roughness: 0.65 }),
  shirt: new THREE.MeshStandardMaterial({ color: 0xf1eee5, roughness: 0.84 }),
  shoe: new THREE.MeshStandardMaterial({ color: 0x16191d, roughness: 0.34, metalness: 0.08 }),
  silver: new THREE.MeshStandardMaterial({
    color: 0xb7a58b,
    metalness: 0.74,
    roughness: 0.27,
  }),
  lens: new THREE.MeshPhysicalMaterial({
    color: 0xc7e7eb,
    transparent: true,
    opacity: 0.18,
    roughness: 0.08,
    transmission: 0.2,
    side: THREE.DoubleSide,
  }),
  eyeWhite: new THREE.MeshStandardMaterial({ color: 0xf5f1e8, roughness: 0.55 }),
  pupil: new THREE.MeshStandardMaterial({ color: 0x35261f, roughness: 0.5 }),
  catchlight: new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false }),
  blush: new THREE.MeshStandardMaterial({
    color: 0xe89087,
    roughness: 0.72,
    transparent: true,
    opacity: 0.72,
  }),
  desk: new THREE.MeshStandardMaterial({ color: 0xd7c8aa, roughness: 0.76 }),
  deskEdge: new THREE.MeshStandardMaterial({ color: 0x8e7654, roughness: 0.68 }),
  deskMetal: new THREE.MeshStandardMaterial({ color: 0x68757b, roughness: 0.4, metalness: 0.55 }),
  monitor: new THREE.MeshStandardMaterial({ color: 0x252f35, roughness: 0.44, metalness: 0.22 }),
  screen: new THREE.MeshStandardMaterial({
    color: 0x0a1a27,
    emissive: 0x0c4250,
    emissiveIntensity: 1.4,
    roughness: 0.36,
  }),
  board: new THREE.MeshStandardMaterial({ color: 0x1d765c, roughness: 0.62 }),
  chip: new THREE.MeshStandardMaterial({ color: 0x151c20, roughness: 0.44 }),
  copper: new THREE.MeshStandardMaterial({
    color: 0xe39649,
    metalness: 0.62,
    roughness: 0.35,
  }),
  cyan: new THREE.MeshStandardMaterial({
    color: 0x63d4d1,
    emissive: 0x1eb5ca,
    emissiveIntensity: 3,
    roughness: 0.28,
  }),
  orange: new THREE.MeshStandardMaterial({
    color: 0xffb44a,
    emissive: 0xa63200,
    emissiveIntensity: 0.7,
    roughness: 0.56,
  }),
  cable: new THREE.MeshStandardMaterial({ color: 0x33424a, roughness: 0.58 }),
  red: new THREE.MeshStandardMaterial({ color: 0xe86b5c, roughness: 0.5 }),
  green: new THREE.MeshStandardMaterial({
    color: 0x75d69b,
    emissive: 0x75d69b,
    emissiveIntensity: 1.4,
  }),
};

const setShadow = (object, cast = true, receive = true) => {
  object.traverse((child) => {
    if (!child.isMesh) return;
    child.castShadow = cast;
    child.receiveShadow = receive;
  });
  return object;
};

const mesh = (geometry, material, position = [0, 0, 0]) => {
  const result = new THREE.Mesh(geometry, material);
  result.position.set(...position);
  result.castShadow = true;
  result.receiveShadow = true;
  return result;
};

const capsule = (radius, length, material) =>
  mesh(new THREE.CapsuleGeometry(radius, length, 8, 18), material);

// Core-only rounded-box approximation (matches the newer reference build's helper) —
// avoids a second, fragile CDN add-on import for a real rounded-corner geometry.
const roundedBox = (width, height, depth, material, position = [0, 0, 0]) =>
  mesh(new THREE.BoxGeometry(width, height, depth, 3, 3, 3), material, position);

// Tunable face parameters, matching the friendlier, rounder head adopted from
// Archive/Character_References/scene.js. The on-page tuning panel (open with ?tune,
// press T) overrides these live and persists changes to localStorage so adjustments
// survive a reload without touching code.
const defaultCharacterParams = {
  headWidth: 0.8,
  headHeight: 1.15,
  headDepth: 0.82,
  eyeSize: 0.098,
  eyeSpacing: 0.22,
  glassesSize: 0.2,
  beardWidth: 0.78,
  beardHeight: 1.04,
  beardDepth: 0.53,
  beardDrop: -0.49,
  hairCoverage: 0.44,
  hairSweepSize: 0.42,
  hairVolume: 0.79,
  moustacheSize: 0.75,
  earSize: 1.14,
  mouthWidth: 1.28,
  mouthThickness: 1.15,
  neckWidth: 1.16,
  neckHeight: 1.08,
  characterHeight: 1.07,
};

let characterParams = { ...defaultCharacterParams };
try {
  const saved = JSON.parse(localStorage.getItem("masood-character-params") || "null");
  if (saved) characterParams = { ...characterParams, ...saved };
} catch (error) {
  // Ignore malformed saved state and fall back to defaults.
}

// Slider config: [key, label, min, max, step]. Kept separate from the defaults so range
// limits can be generous without affecting the starting likeness.
const tuningFields = [
  ["headWidth", "Head width", 0.7, 1.2, 0.01],
  ["headHeight", "Head height", 0.8, 1.3, 0.01],
  ["headDepth", "Head depth", 0.7, 1.2, 0.01],
  ["eyeSize", "Eye size", 0.06, 0.16, 0.002],
  ["eyeSpacing", "Eye spacing", 0.1, 0.32, 0.005],
  ["glassesSize", "Glasses lens size", 0.14, 0.3, 0.005],
  ["beardWidth", "Beard width", 0.6, 1.2, 0.01],
  ["beardHeight", "Beard height", 0.5, 1.1, 0.01],
  ["beardDepth", "Beard depth", 0.35, 0.85, 0.01],
  ["beardDrop", "Beard drop", -0.8, -0.2, 0.01],
  ["moustacheSize", "Moustache size", 0.45, 1.5, 0.01],
  ["earSize", "Ear size", 0.65, 1.35, 0.01],
  ["mouthWidth", "Mouth width", 0.6, 1.45, 0.01],
  ["mouthThickness", "Mouth thickness", 0.55, 1.5, 0.01],
  ["neckWidth", "Neck width", 0.7, 1.35, 0.01],
  ["neckHeight", "Neck height", 0.7, 1.35, 0.01],
  ["characterHeight", "Character height", 0.85, 1.15, 0.01],
  ["hairCoverage", "Hair coverage", 0.35, 0.75, 0.01],
  ["hairSweepSize", "Hair sweep size", 0.15, 0.5, 0.01],
  ["hairVolume", "Extra head hair", 0.6, 1.45, 0.01],
];

// A small live-tuning panel so face adjustments are drag-a-slider instead of edit-code-
// and-reload. Toggle with the T key or the tab in the bottom-left corner. Pure DOM/CSS,
// no external dependency.
function setupTuningPanel(initialParams, defaults, onChange) {
  // Only ships visibly for whoever is actively tuning the likeness: open the page with
  // ?tune appended. Regular visitors to the finished portfolio never see this control.
  if (!new URLSearchParams(window.location.search).has("tune")) return;

  const panelId = "character-tuning-panel";
  const hintId = "character-tuning-hint";
  const toggle = document.createElement("button");
  toggle.type = "button";
  toggle.textContent = "Tune character (T)";
  toggle.setAttribute("aria-label", "Toggle character tuning panel");
  toggle.setAttribute("aria-controls", panelId);
  toggle.setAttribute("aria-expanded", "false");
  Object.assign(toggle.style, {
    position: "fixed",
    left: "16px",
    bottom: "16px",
    zIndex: 30,
    padding: "8px 12px",
    borderRadius: "999px",
    border: "1px solid rgba(0,0,0,0.18)",
    background: "#f3ead9",
    color: "#171714",
    font: "600 12px var(--sans)",
    cursor: "pointer",
  });

  const panel = document.createElement("section");
  panel.id = panelId;
  panel.hidden = true;
  panel.setAttribute("aria-labelledby", `${panelId}-title`);
  Object.assign(panel.style, {
    position: "fixed",
    left: "16px",
    bottom: "56px",
    zIndex: 30,
    width: "min(300px, calc(100vw - 32px))",
    maxHeight: "76vh",
    overflowY: "auto",
    padding: "16px",
    borderRadius: "14px",
    border: "1px solid rgba(0,0,0,0.18)",
    background: "rgba(243,234,217,0.98)",
    color: "#171714",
    font: "12px var(--sans)",
    boxShadow: "0 10px 30px rgba(6,26,64,0.22)",
  });

  const title = document.createElement("h2");
  title.id = `${panelId}-title`;
  title.textContent = "Character tuning";
  Object.assign(title.style, {
    margin: "0 0 10px",
    font: "700 16px var(--sans)",
  });
  panel.appendChild(title);

  const formatValue = (value, step) => Number(value).toFixed(step < 0.01 ? 3 : 2);

  tuningFields.forEach(([key, label, min, max, step]) => {
    const inputId = `character-tune-${key}`;
    const row = document.createElement("label");
    row.htmlFor = inputId;
    row.dataset.key = key;
    row.style.display = "block";
    row.style.marginBottom = "9px";

    const text = document.createElement("span");
    text.textContent = label;
    text.style.display = "flex";
    text.style.justifyContent = "space-between";
    text.style.gap = "12px";

    const valueEl = document.createElement("output");
    valueEl.setAttribute("for", inputId);
    valueEl.textContent = formatValue(initialParams[key], step);
    valueEl.style.fontFamily = "var(--mono)";
    text.appendChild(valueEl);
    row.appendChild(text);

    const input = document.createElement("input");
    input.id = inputId;
    input.type = "range";
    input.min = String(min);
    input.max = String(max);
    input.step = String(step);
    input.value = String(initialParams[key]);
    input.setAttribute("aria-describedby", hintId);
    input.style.width = "100%";
    input.style.accentColor = "#ff7a18";

    const resetInput = () => {
      input.value = String(defaults[key]);
      input.dispatchEvent(new Event("input"));
    };
    input.addEventListener("input", () => {
      const value = Number(input.value);
      valueEl.textContent = formatValue(value, step);
      onChange({ [key]: value });
    });
    input.addEventListener("dblclick", resetInput);
    input.addEventListener("keydown", (event) => {
      if (event.key !== "Backspace") return;
      event.preventDefault();
      resetInput();
    });

    row.appendChild(input);
    panel.appendChild(row);
  });

  const hint = document.createElement("p");
  hint.id = hintId;
  hint.textContent = "Double-click a slider or press Backspace to reset it. Values save automatically.";
  Object.assign(hint.style, {
    opacity: "0.76",
    margin: "6px 0 0",
    lineHeight: "1.45",
  });
  panel.appendChild(hint);

  const resetAll = document.createElement("button");
  resetAll.type = "button";
  resetAll.textContent = "Reset all controls";
  Object.assign(resetAll.style, {
    marginTop: "10px",
    padding: "7px 11px",
    borderRadius: "8px",
    border: "1px solid rgba(0,0,0,0.2)",
    background: "#fff8ed",
    color: "#171714",
    font: "600 12px var(--sans)",
    cursor: "pointer",
  });
  resetAll.addEventListener("click", () => {
    panel.querySelectorAll("input[type=range]").forEach((input) => {
      const key = input.closest("label").dataset.key;
      input.value = String(defaults[key]);
      input.dispatchEvent(new Event("input"));
    });
  });
  panel.appendChild(resetAll);

  document.body.append(toggle, panel);

  const setOpen = (open, restoreFocus = false) => {
    panel.hidden = !open;
    toggle.setAttribute("aria-expanded", String(open));
    if (!open && restoreFocus) toggle.focus();
  };
  toggle.addEventListener("click", () => setOpen(panel.hidden));
  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !panel.hidden) {
      setOpen(false, true);
      return;
    }
    if (event.key.toLowerCase() !== "t" || event.metaKey || event.ctrlKey || event.altKey || event.repeat) return;
    const active = document.activeElement;
    if (active?.matches("input, textarea, select, button, [contenteditable='true']")) return;
    setOpen(panel.hidden);
  });
}
function createCharacter() {
  const root = new THREE.Group();
  root.name = "MasoodCharacter";

  const body = new THREE.Group();
  root.add(body);

  // The torso extends over the upper legs directly. A separate hip capsule is avoided
  // because its rounded front can protrude through the jacket like a grey patch.
  const torso = roundedBox(1.08, 2.5, 0.6, materials.navy, [0, 3.5, 0]);
  body.add(torso);

  // Chest detail sits directly on the torso box's flat front face.
  const torsoFront = 0.3;

  // Minimal monochrome jacket front with two proper four-hole coat buttons.
  for (const y of [3.68, 3.43]) {
    const jacketButton = mesh(
      new THREE.CylinderGeometry(0.048, 0.048, 0.016, 20),
      materials.shoe,
      [0.12, y, torsoFront + 0.012],
    );
    jacketButton.rotation.x = Math.PI / 2;
    body.add(jacketButton);

    for (const [holeX, holeY] of [
      [-0.014, -0.014],
      [0.014, -0.014],
      [-0.014, 0.014],
      [0.014, 0.014],
    ]) {
      const buttonHole = mesh(
        new THREE.SphereGeometry(0.0065, 8, 6),
        materials.navy,
        [0.12 + holeX, y + holeY, torsoFront + 0.023],
      );
      buttonHole.castShadow = false;
      body.add(buttonHole);
    }
  }

  const makeLeg = (side) => {
    const hip = new THREE.Group();
    hip.position.set(side * 0.3, 2.5, 0);
    const leg = capsule(0.21, 1.45, materials.navyDark);
    leg.position.y = -0.95;
    hip.add(leg);
    const shoe = mesh(new THREE.CapsuleGeometry(0.2, 0.44, 6, 14), materials.shoe, [0, -1.99, 0.16]);
    shoe.rotation.x = Math.PI / 2;
    shoe.scale.set(1, 1, 0.78);
    hip.add(shoe);
    body.add(hip);
    return hip;
  };

  const leftLeg = makeLeg(-1);
  const rightLeg = makeLeg(1);

  const makeArm = (side) => {
    const shoulder = new THREE.Group();
    shoulder.position.set(side * 0.69, 4.35, 0);
    shoulder.rotation.z = side === -1 ? 0.1 : -0.1;

    const upperSleeve = capsule(0.185, 0.55, materials.navy);
    upperSleeve.position.y = -0.4;
    shoulder.add(upperSleeve);

    const elbow = new THREE.Group();
    elbow.position.y = -0.78;
    shoulder.add(elbow);

    const forearmSleeve = capsule(0.152, 0.34, materials.navy);
    forearmSleeve.position.y = -0.34;
    forearmSleeve.scale.set(0.96, 1, 0.92);
    elbow.add(forearmSleeve);


    const wrist = new THREE.Group();
    wrist.position.y = -0.68;
    elbow.add(wrist);

    const hand = mesh(new THREE.SphereGeometry(0.175, 20, 14), materials.skinLight, [0, -0.12, 0.02]);
    hand.scale.set(0.72, 1.08, 0.62);
    wrist.add(hand);

    const thumb = mesh(
      new THREE.SphereGeometry(0.065, 14, 10),
      materials.skin,
      [side * -0.1, -0.1, 0.08],
    );
    thumb.scale.set(0.75, 1.15, 0.7);
    thumb.rotation.z = side * 0.38;
    wrist.add(thumb);

    body.add(shoulder);
    return { shoulder, elbow, wrist, hand };
  };

  const leftArm = makeArm(-1);
  const rightArm = makeArm(1);

  const neck = mesh(new THREE.CylinderGeometry(0.22, 0.25, 0.4, 16), materials.skin, [0, 4.91, 0]);
  neck.scale.set(characterParams.neckWidth, characterParams.neckHeight, characterParams.neckWidth);
  body.add(neck);

  const head = new THREE.Group();
  head.position.set(0, 5.58, 0.02);
  body.add(head);

  const { eyes, pupils } = buildHead(head, characterParams);

  setShadow(root);
  return {
    root,
    body,
    torso,
    neck,
    head,
    eyes,
    pupils,
    leftArm,
    rightArm,
    leftLeg,
    rightLeg,
  };
}

// All head geometry lives here, parameterised so the tuning panel (press T) can rebuild
// it live instead of round-tripping through code edits. `head` is cleared and repopulated
// on every call.
// Head geometry adopted from Archive/Character_References/scene.js — a rounder, more
// toy-like head with bigger eyes, catchlights and blush instead of the earlier
// photoreal-proportioned build. Coordinates are converted from that reference's
// character-local space into this rig's head-local space (head center subtracted).
function buildHead(head, params) {
  while (head.children.length) {
    const child = head.children[head.children.length - 1];
    child.traverse((part) => part.geometry?.dispose());
    head.remove(child);
  }

  const face = mesh(new THREE.SphereGeometry(0.58, 40, 32), materials.skinLight);
  face.scale.set(params.headWidth, params.headHeight, params.headDepth);
  head.add(face);

  for (const side of [-1, 1]) {
    const ear = mesh(new THREE.SphereGeometry(0.125, 20, 14), materials.skinLight, [side * 0.53, 0.01, -0.01]);
    ear.scale.set(0.72 * params.earSize, 1.08 * params.earSize, 0.54 * params.earSize);
    head.add(ear);
  }

  // Fuller side-parted hair: a deeper cap, rear volume, and layered crown locks add
  // density without lowering the front hairline over the forehead or glasses.
  const hairVolume = params.hairVolume;
  const hairVolumeDelta = hairVolume - 1;
  const hairCap = mesh(
    new THREE.SphereGeometry(0.59, 36, 24, 0, Math.PI * 2, 0, Math.PI * params.hairCoverage),
    materials.hair,
    [0, 0.31, -0.04],
  );
  hairCap.scale.set(1 + hairVolumeDelta * 0.2, 0.92 + hairVolumeDelta * 0.16, 0.96 + hairVolumeDelta * 0.14);
  head.add(hairCap);

  const rearHair = mesh(
    new THREE.SphereGeometry(0.44, 30, 22),
    materials.hair,
    [0, 0.32, -0.29],
  );
  rearHair.scale.set(0.98 + hairVolumeDelta * 0.24, 0.84 + hairVolumeDelta * 0.22, 0.58 + hairVolumeDelta * 0.16);
  head.add(rearHair);

  const hairSweep = mesh(
    new THREE.SphereGeometry(params.hairSweepSize * (0.84 + hairVolume * 0.16), 28, 18),
    materials.hair,
    [-0.15, 0.43, 0.18],
  );
  hairSweep.scale.set(1.5, 0.52, 0.64);
  hairSweep.rotation.z = -0.18;
  head.add(hairSweep);

  const crownLocks = [
    [-0.34, 0.42, 0.12, -0.28, 0.96],
    [-0.2, 0.51, 0.16, -0.16, 1.04],
    [0, 0.55, 0.14, -0.02, 1.08],
    [0.2, 0.52, 0.11, 0.14, 1.02],
    [0.36, 0.42, 0.05, 0.26, 0.92],
  ];
  crownLocks.forEach(([x, y, z, rotation, size]) => {
    const lock = mesh(
      new THREE.SphereGeometry(params.hairSweepSize * 0.46 * size * (0.65 + hairVolume * 0.35), 20, 14),
      materials.hair,
      [x, y, z],
    );
    lock.scale.set(1.2, 0.55, 0.68);
    lock.rotation.z = rotation;
    head.add(lock);
  });

  // Full beard, moustache, and brows.
  const beard = mesh(new THREE.SphereGeometry(0.47, 36, 28), materials.beard, [0, params.beardDrop, 0.22]);
  beard.scale.set(params.beardWidth, params.beardHeight, params.beardDepth);
  head.add(beard);

  for (const side of [-1, 1]) {
    const moustache = mesh(new THREE.CapsuleGeometry(0.055, 0.22, 5, 10), materials.beard, [side * 0.11, -0.11, 0.49]);
    moustache.scale.setScalar(params.moustacheSize);
    moustache.rotation.z = Math.PI / 2 + side * 0.18;
    head.add(moustache);

    const brow = mesh(new THREE.CapsuleGeometry(0.026, 0.17, 4, 8), materials.hair, [side * 0.19, 0.11, 0.48]);
    brow.rotation.z = Math.PI / 2 + side * 0.04;
    head.add(brow);
  }

  // Larger eyes, warm cheeks, and tiny catchlights for a friendly, toy-like charm.
  const eyes = [];
  const pupils = [];
  for (const side of [-1, 1]) {
    const eye = mesh(
      new THREE.SphereGeometry(params.eyeSize, 24, 18),
      materials.eyeWhite,
      [side * params.eyeSpacing, 0.09, 0.485],
    );
    eye.scale.set(1, 0.98, 0.38);
    head.add(eye);
    eyes.push(eye);

    const iris = mesh(
      new THREE.SphereGeometry(params.eyeSize * 0.48, 18, 14),
      materials.pupil,
      [side * params.eyeSpacing, 0.082, 0.572],
    );
    head.add(iris);
    pupils.push(iris);

    const catchlight = mesh(new THREE.SphereGeometry(0.014, 12, 8), materials.catchlight, [
      side * 0.185,
      0.112,
      0.618,
    ]);
    catchlight.castShadow = false;
    head.add(catchlight);

    const cheek = mesh(new THREE.SphereGeometry(0.075, 18, 12), materials.blush, [side * 0.38, -0.06, 0.495]);
    cheek.scale.set(1.2, 0.62, 0.24);
    cheek.castShadow = false;
    head.add(cheek);
  }

  // Large thin metal glasses.
  for (const side of [-1, 1]) {
    const lensFrame = mesh(
      new THREE.TorusGeometry(params.glassesSize, 0.015, 10, 40),
      materials.silver,
      [side * params.eyeSpacing, 0.09, 0.59],
    );
    lensFrame.scale.set(1.08, 0.88, 1);
    head.add(lensFrame);

    const temple = roundedBox(0.26, 0.018, 0.018, materials.silver, [side * 0.44, 0.09, 0.48]);
    temple.rotation.y = side * 0.62;
    head.add(temple);
  }

  const bridge = roundedBox(0.11, 0.018, 0.018, materials.silver, [0, 0.09, 0.59]);
  head.add(bridge);

  // Nose and a small visible lower lip.
  const nose = mesh(new THREE.SphereGeometry(0.075, 16, 12), materials.skinLight, [0, 0, 0.55]);
  nose.scale.set(0.74, 1.2, 0.82);
  head.add(nose);

  const lip = roundedBox(0.15, 0.025, 0.018, materials.lip, [0, -0.21, 0.57]);
  lip.scale.set(params.mouthWidth, params.mouthThickness, 1);
  head.add(lip);

  setShadow(head);
  return { eyes, pupils };
}

// Bench, screens, meter, circuit board, cables, and wall backdrop adopted from
// Archive/Character_References/scene.js ("Embedded Systems Lab"). Kept at this scene's
// existing scale (~1.75x the reference's) so it still matches the character's height and
// the day-scene camera framing.
function createCanvasScreen({ width, height, position, rotation = [0, 0, 0], draw, frameMaterial, stand = false }) {
  const group = new THREE.Group();
  group.position.set(...position);
  group.rotation.set(...rotation);

  const frame = mesh(new THREE.BoxGeometry(width, height, 0.2), frameMaterial ?? materials.monitor);
  group.add(frame);

  // A visible stand grounds the screen on the desk instead of it reading as floating
  // in front of the wall.
  if (stand) {
    const standColumn = mesh(new THREE.CylinderGeometry(0.08, 0.1, 0.62, 12), materials.monitor, [0, -height / 2 - 0.31, -0.02]);
    group.add(standColumn);
    const foot = mesh(new THREE.BoxGeometry(0.68, 0.08, 0.42), materials.monitor, [0, -height / 2 - 0.62, 0.08]);
    group.add(foot);
  }

  const screenCanvas = document.createElement("canvas");
  screenCanvas.width = 640;
  screenCanvas.height = 360;
  const context = screenCanvas.getContext("2d");
  const texture = new THREE.CanvasTexture(screenCanvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const displayMaterial = new THREE.MeshBasicMaterial({ map: texture, toneMapped: false });
  const display = mesh(
    new THREE.PlaneGeometry(width - 0.14, height - 0.14),
    displayMaterial,
    [0, 0, 0.101],
  );
  display.castShadow = false;
  display.receiveShadow = false;
  group.add(display);

  const redraw = (timeMs) => {
    draw(context, screenCanvas.width, screenCanvas.height, timeMs);
    texture.needsUpdate = true;
  };
  redraw(0);

  return { group, redraw };
}

function drawScreenGrid(context, width, height) {
  context.strokeStyle = "rgba(99, 212, 209, 0.10)";
  context.lineWidth = 1;
  for (let x = 20; x < width; x += 32) {
    context.beginPath();
    context.moveTo(x, 0);
    context.lineTo(x, height);
    context.stroke();
  }
  for (let y = 20; y < height; y += 32) {
    context.beginPath();
    context.moveTo(0, y);
    context.lineTo(width, y);
    context.stroke();
  }
}

function createCodeScreen(position, rotation) {
  const colors = ["#63d4d1", "#ffb44a", "#75d69b", "#dde8e7", "#e86b5c"];
  return createCanvasScreen({
    width: 2.25,
    height: 1.28,
    position,
    rotation,
    stand: true,
    draw(context, width, height, timeMs) {
      context.fillStyle = "#071116";
      context.fillRect(0, 0, width, height);
      context.fillStyle = "#12242c";
      context.fillRect(0, 0, 96, height);

      context.fillStyle = "#63d4d1";
      context.font = "600 18px ui-monospace, SFMono-Regular, Consolas, monospace";
      context.fillText("LAB / CTRL", 24, 36);

      for (let index = 0; index < 4; index += 1) {
        context.fillStyle = index === 1 ? "#ffb44a" : "#47616d";
        context.fillRect(24, 78 + index * 54, 42, 8);
        context.fillRect(24, 94 + index * 54, 25, 5);
      }

      context.font = "15px ui-monospace, SFMono-Regular, Consolas, monospace";
      const cursorRow = Math.floor(timeMs / 700) % 9;
      for (let row = 0; row < 12; row += 1) {
        const y = 42 + row * 24;
        const indent = 124 + ((row * 29) % 74);
        const lineWidth = 115 + ((row * 53) % 250);
        context.fillStyle = colors[row % colors.length];
        context.globalAlpha = row === cursorRow ? 1 : 0.74;
        context.fillRect(indent, y, lineWidth, 5);
        if (row % 3 === 0) {
          context.fillStyle = "#637680";
          context.fillRect(indent + lineWidth + 12, y, 54, 5);
        }
      }
      context.globalAlpha = 1;
    },
  });
}

function createScopeScreen(position, rotation) {
  return createCanvasScreen({
    width: 1.74,
    height: 1.03,
    position,
    rotation,
    stand: true,
    draw(context, width, height, timeMs) {
      context.fillStyle = "#061217";
      context.fillRect(0, 0, width, height);
      drawScreenGrid(context, width, height);

      context.fillStyle = "#8aa0a8";
      context.font = "15px ui-monospace, SFMono-Regular, Consolas, monospace";
      context.fillText("CH1  PWM", 22, 30);
      context.fillText("25.00 kHz", width - 145, 30);
      context.fillStyle = "#ffb44a";
      context.fillText("DUTY 60%", width - 125, height - 18);

      const highY = height * 0.33;
      const lowY = height * 0.68;
      const period = 116;
      const highWidth = period * 0.6;
      const phase = (timeMs * 0.04) % period;

      context.strokeStyle = "#63d4d1";
      context.shadowColor = "#63d4d1";
      context.shadowBlur = 7;
      context.lineWidth = 4;
      context.lineJoin = "round";
      context.beginPath();
      let x = -period - phase;
      context.moveTo(x, lowY);
      while (x < width + period) {
        context.lineTo(x, lowY);
        context.lineTo(x, highY);
        context.lineTo(x + highWidth, highY);
        context.lineTo(x + highWidth, lowY);
        context.lineTo(x + period, lowY);
        x += period;
      }
      context.stroke();
      context.shadowBlur = 0;

      context.fillStyle = "#75d69b";
      context.font = "13px ui-monospace, SFMono-Regular, Consolas, monospace";
      context.fillText("3.3 V", 20, highY - 12);
      context.fillText("0 V", 20, lowY + 22);
    },
  });
}

function createDigitalMeter(position, rotation = [0, 0, 0]) {
  const group = new THREE.Group();
  group.position.set(...position);
  group.rotation.set(...rotation);

  const body = mesh(new THREE.BoxGeometry(0.96, 1.44, 0.35), materials.orange);
  group.add(body);

  const meterCanvas = document.createElement("canvas");
  meterCanvas.width = 300;
  meterCanvas.height = 160;
  const context = meterCanvas.getContext("2d");
  const texture = new THREE.CanvasTexture(meterCanvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const displayMaterial = new THREE.MeshBasicMaterial({ map: texture, toneMapped: false });
  const display = mesh(new THREE.PlaneGeometry(0.72, 0.37), displayMaterial, [0, 0.32, 0.186]);
  display.castShadow = false;
  group.add(display);

  const redraw = (timeMs) => {
    context.fillStyle = "#bcd3ad";
    context.fillRect(0, 0, meterCanvas.width, meterCanvas.height);
    context.fillStyle = "#23362d";
    context.font = "700 58px ui-monospace, SFMono-Regular, Consolas, monospace";
    const value = 3.28 + Math.sin(timeMs * 0.0013) * 0.03;
    context.fillText(value.toFixed(2), 30, 90);
    context.font = "700 22px ui-monospace, SFMono-Regular, Consolas, monospace";
    context.fillText("V DC", 206, 132);
    texture.needsUpdate = true;
  };
  redraw(0);

  const dial = mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.09, 24), materials.monitor, [0, -0.3, 0.21]);
  dial.rotation.x = Math.PI / 2;
  group.add(dial);

  for (const [x, ledMaterial] of [
    [-0.23, materials.cable],
    [0.23, materials.red],
  ]) {
    const port = mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.07, 16), ledMaterial, [x, -0.56, 0.21]);
    port.rotation.x = Math.PI / 2;
    group.add(port);
  }

  return { group, redraw };
}

function createCable(start, end, cableMaterial) {
  const midpoint = start.clone().lerp(end, 0.5);
  midpoint.y -= 0.52;
  const curve = new THREE.QuadraticBezierCurve3(start, midpoint, end);
  return mesh(new THREE.TubeGeometry(curve, 32, 0.032, 8, false), cableMaterial);
}

function createWorkbench() {
  const group = new THREE.Group();
  group.name = "ElectronicsWorkbench";

  // Dedicated (non-shared) emissive materials for anything that blinks, so animating
  // them doesn't also pulse the static orange/cyan trim used elsewhere on the desk.
  const leds = [];
  const makeLed = (baseColor, emissiveColor, speed, phase) => {
    const material = new THREE.MeshStandardMaterial({
      color: baseColor,
      emissive: emissiveColor,
      emissiveIntensity: 1,
      roughness: 0.3,
    });
    leds.push({ material, speed, phase });
    return material;
  };

  const originX = 1.9;

  const top = mesh(new THREE.BoxGeometry(5.6, 0.28, 1.65), materials.desk, [originX, 2.62, -1.35]);
  group.add(top);

  const backRail = mesh(new THREE.BoxGeometry(5.6, 0.24, 0.2), materials.deskEdge, [originX, 2.98, -2.13]);
  group.add(backRail);

  for (const x of [-0.65, 4.45]) {
    for (const z of [-1.86, -0.82]) {
      const leg = mesh(new THREE.CylinderGeometry(0.12, 0.15, 2.65, 12), materials.deskMetal, [x, 1.28, z]);
      group.add(leg);
    }
  }

  const shelf = mesh(new THREE.BoxGeometry(5.25, 0.16, 0.72), materials.deskEdge, [originX, 1.16, -1.72]);
  group.add(shelf);

  // Compact desktop controls for the left workstation.
  const keyboardX = originX - 1.75;
  const keyboardZ = -0.72;
  const keyboard = mesh(
    new THREE.BoxGeometry(1.2, 0.055, 0.38),
    materials.monitor,
    [keyboardX, 2.79, keyboardZ]
  );
  group.add(keyboard);

  const keyGeometry = new THREE.BoxGeometry(0.15, 0.025, 0.072);
  for (let row = 0; row < 3; row += 1) {
    for (let column = 0; column < 5; column += 1) {
      const key = mesh(
        keyGeometry,
        materials.deskMetal,
        [
          keyboardX + (column - 2) * 0.19,
          2.83,
          keyboardZ - 0.1 + row * 0.1,
        ]
      );
      group.add(key);
    }
  }

  const spacebar = mesh(
    new THREE.BoxGeometry(0.46, 0.025, 0.06),
    materials.deskMetal,
    [keyboardX, 2.83, keyboardZ + 0.145]
  );
  group.add(spacebar);

  const mouseX = originX - 0.95;
  const mouseZ = -0.66;
  const mouse = mesh(
    new THREE.SphereGeometry(0.13, 20, 14),
    materials.monitor,
    [mouseX, 2.81, mouseZ]
  );
  mouse.scale.set(0.78, 0.34, 1.12);
  group.add(mouse);

  const mouseWheel = mesh(
    new THREE.CylinderGeometry(0.018, 0.018, 0.05, 12),
    materials.deskMetal,
    [mouseX, 2.858, mouseZ - 0.045]
  );
  mouseWheel.rotation.z = Math.PI / 2;
  group.add(mouseWheel);
  // Small, purposeful bench details replace the oversized PCB: a parts tray with loose
  // resistors and capacitors, a compact soldering station, iron, and solder spool.
  const partsTray = mesh(
    new THREE.BoxGeometry(0.76, 0.055, 0.42),
    materials.deskEdge,
    [originX - 0.65, 2.79, -1.05],
  );
  group.add(partsTray);

  for (let index = 0; index < 5; index += 1) {
    const resistor = mesh(
      new THREE.CylinderGeometry(0.022, 0.022, 0.16, 10),
      index % 2 ? materials.orange : materials.cyan,
      [originX - 0.9 + index * 0.12, 2.845, -1.12 + (index % 2) * 0.13],
    );
    resistor.rotation.z = Math.PI / 2;
    group.add(resistor);
  }

  for (let index = 0; index < 3; index += 1) {
    group.add(
      mesh(
        new THREE.CylinderGeometry(0.035, 0.035, 0.1, 12),
        index === 1 ? materials.orange : materials.cyan,
        [originX - 0.48 + index * 0.1, 2.87, -1.0],
      ),
    );
  }

  const solderStation = mesh(
    new THREE.BoxGeometry(0.42, 0.28, 0.34),
    materials.monitor,
    [originX + 0.2, 2.9, -1.08],
  );
  group.add(solderStation);

  const stationKnob = mesh(
    new THREE.CylinderGeometry(0.07, 0.07, 0.04, 18),
    materials.deskMetal,
    [originX + 0.12, 2.89, -0.895],
  );
  stationKnob.rotation.x = Math.PI / 2;
  group.add(stationKnob);
  group.add(
    mesh(
      new THREE.SphereGeometry(0.035, 12, 8),
      makeLed(0x75d69b, 0x75d69b, 1.25, 0.5),
      [originX + 0.31, 2.96, -0.895],
    ),
  );

  const ironGrip = capsule(0.045, 0.32, materials.orange);
  ironGrip.position.set(originX + 0.66, 2.84, -0.99);
  ironGrip.rotation.z = Math.PI / 2;
  group.add(ironGrip);
  const ironTip = mesh(
    new THREE.CylinderGeometry(0.016, 0.028, 0.22, 12),
    materials.silver,
    [originX + 0.97, 2.84, -0.99],
  );
  ironTip.rotation.z = Math.PI / 2;
  group.add(ironTip);

  const solderSpool = mesh(
    new THREE.TorusGeometry(0.11, 0.025, 8, 24),
    materials.silver,
    [originX + 0.78, 2.82, -1.31],
  );
  solderSpool.rotation.x = Math.PI / 2;
  group.add(solderSpool);

  const codeScreen = createCodeScreen([originX - 1.55, 4.05, -1.85], [0, 0.16, 0]);
  const scopeScreen = createScopeScreen([originX + 1.95, 4.02, -1.85], [0, -0.16, 0]);
  group.add(codeScreen.group, scopeScreen.group);

  const meter = createDigitalMeter([originX + 2.58, 3.26, -1.15], [0.02, -0.2, 0]);
  meter.group.scale.setScalar(0.72);
  group.add(meter.group);

  const plantPot = mesh(new THREE.CylinderGeometry(0.24, 0.19, 0.36, 16), materials.shirt, [originX + 2, 1.42, -1.7]);
  group.add(plantPot);
  for (let leaf = 0; leaf < 5; leaf += 1) {
    const leafMesh = mesh(
      new THREE.SphereGeometry(0.18, 12, 8),
      materials.board,
      [originX + 2 + Math.sin(leaf) * 0.2, 1.76 + (leaf % 2) * 0.16, -1.7],
    );
    leafMesh.scale.set(0.55, 1.25, 0.42);
    leafMesh.rotation.z = leaf * 0.55;
    group.add(leafMesh);
  }

  group.userData.leds = leds;
  group.userData.animatedScreens = [codeScreen, scopeScreen, meter];

  setShadow(group);
  return group;
}

function createScanner() {
  const group = new THREE.Group();
  group.name = "SystemsScanner";
  group.scale.setScalar(0.001);

  const ringMaterial = new THREE.MeshStandardMaterial({
    color: 0x42e5ee,
    emissive: 0x1fb6d4,
    emissiveIntensity: 5,
    transparent: true,
    opacity: 0.9,
    roughness: 0.28,
  });

  for (let ring = 0; ring < 5; ring += 1) {
    const ringMesh = mesh(new THREE.TorusGeometry(1.25 + ring * 0.14, 0.055, 10, 48), ringMaterial, [1.65, 0.18 - ring * 0.04, 0]);
    ringMesh.rotation.x = Math.PI / 2;
    group.add(ringMesh);
  }

  const beamMaterial = new THREE.MeshBasicMaterial({
    color: 0x42e5ee,
    transparent: true,
    opacity: 0.1,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const beam = mesh(new THREE.CylinderGeometry(1.45, 0.9, 6.4, 32, 1, true), beamMaterial, [1.65, 3.1, 0]);
  group.add(beam);

  const scanLine = mesh(new THREE.TorusGeometry(1.2, 0.025, 8, 48), ringMaterial, [1.65, 1, 0]);
  scanLine.rotation.x = Math.PI / 2;
  group.add(scanLine);

  return { group, rings: group.children.filter((child) => child.geometry?.type === "TorusGeometry"), scanLine };
}

function makeLabelTexture(title, subtitle, accent) {
  const labelCanvas = document.createElement("canvas");
  labelCanvas.width = 512;
  labelCanvas.height = 256;
  const context = labelCanvas.getContext("2d");
  context.fillStyle = "#101a2d";
  context.fillRect(0, 0, 512, 256);
  context.strokeStyle = accent;
  context.lineWidth = 8;
  context.strokeRect(12, 12, 488, 232);
  context.fillStyle = accent;
  context.font = "700 34px monospace";
  context.fillText(title, 36, 84);
  context.fillStyle = "#eaf8f8";
  context.font = "24px sans-serif";
  context.fillText(subtitle, 36, 142);
  context.fillStyle = "#7891ad";
  context.font = "18px monospace";
  context.fillText("SELECTED SYSTEM / MS", 36, 204);
  const texture = new THREE.CanvasTexture(labelCanvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function createProjectModules() {
  const group = new THREE.Group();
  group.name = "ProjectModules";
  group.scale.setScalar(0.001);
  const data = [
    ["TIA / 25 Gbps", "TSMC 65 nm", "#42e5ee"],
    ["BIOMED / IoT", "Sensors + alerts", "#ff7a18"],
    ["FPGA / ZYNQ", "Bring-up + test", "#f0dd65"],
  ];

  const modules = data.map(([title, subtitle, accent], index) => {
    const moduleGroup = new THREE.Group();
    const moduleMaterial = new THREE.MeshStandardMaterial({
      color: index === 1 ? 0x9a3e12 : 0x0d2b59,
      metalness: 0.18,
      roughness: 0.52,
    });
    const body = mesh(new THREE.BoxGeometry(2.0, 1.05, 0.28), moduleMaterial);
    moduleGroup.add(body);
    const labelMaterial = new THREE.MeshBasicMaterial({
      map: makeLabelTexture(title, subtitle, accent),
    });
    moduleGroup.add(mesh(new THREE.PlaneGeometry(1.82, 0.88), labelMaterial, [0, 0, 0.15]));
    moduleGroup.position.set(0.2 + index * 2.15, 3.3 + (index % 2) * 1.35, -0.6 - index * 0.3);
    moduleGroup.userData.basePosition = moduleGroup.position.clone();
    group.add(moduleGroup);
    return moduleGroup;
  });

  return { group, modules };
}

const character = createCharacter();

// Applies both head and body tuning in place without disturbing the arm rig or animation
// state. The saved values are restored automatically when the page reloads.
function applyCharacterTuning(nextParams) {
  characterParams = { ...characterParams, ...nextParams };
  character.neck.scale.set(characterParams.neckWidth, characterParams.neckHeight, characterParams.neckWidth);

  const { eyes, pupils } = buildHead(character.head, characterParams);
  character.eyes.length = 0;
  character.eyes.push(...eyes);
  character.pupils.length = 0;
  character.pupils.push(...pupils);
  localStorage.setItem("masood-character-params", JSON.stringify(characterParams));
}

setupTuningPanel(characterParams, defaultCharacterParams, applyCharacterTuning);

const workbench = createWorkbench();
const scanner = createScanner();
const projectModules = createProjectModules();
world.add(character.root, workbench, scanner.group, projectModules.group);

const floor = mesh(new THREE.PlaneGeometry(64, 64), new THREE.MeshStandardMaterial({ color: 0xdecfb7, roughness: 0.94 }), [0, -0.08, -2]);
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
world.add(floor);

const grid = new THREE.GridHelper(56, 56, 0x9a856b, 0xcdbfa9);
grid.position.set(0, -0.025, -2);
grid.material.transparent = true;
grid.material.opacity = 0.28;
world.add(grid);

const pointer = new THREE.Vector2();
const pointerTarget = new THREE.Vector2();
let dragYaw = 0;
let dragPitch = 0;
let dragging = false;
let pointerDownX = 0;
let pointerDownY = 0;
let previousPointerX = 0;
let previousPointerY = 0;
let waveStartedAt = -100;
let targetScene = 0;
let sceneBlend = 0;
let activeProject = -1;
let animationRunning = false;
let sceneInView = true;
const clock = new THREE.Clock();

const damp = (current, target, smoothing = 0.08) => current + (target - current) * smoothing;
const clamp = THREE.MathUtils.clamp;
const smoothstep = (min, max, value) => {
  const x = clamp((value - min) / (max - min), 0, 1);
  return x * x * (3 - 2 * x);
};

function updateCharacter(time) {
  const stateOne = smoothstep(0.2, 1, sceneBlend);
  const stateTwo = smoothstep(1.15, 2, sceneBlend);
  const idle = reducedMotion ? 0 : Math.sin(time * 1.8);
  const walk = reducedMotion ? 0 : Math.sin(time * 2.1) * 0.035;

  const characterScale = THREE.MathUtils.lerp(0.82, 0.88, stateOne) * characterParams.characterHeight;
  character.root.scale.setScalar(characterScale);
  character.root.position.x = THREE.MathUtils.lerp(2.72, 1.65, stateOne);
  character.root.position.x = THREE.MathUtils.lerp(character.root.position.x, 2.25, stateTwo);
  // The shoe sole is 0.31 local units above the rig origin. Compensating for the
  // animated character scale keeps both feet seated on the floor in every scene.
  character.root.position.y = -0.08 - 0.31 * characterScale;
  character.root.rotation.y = THREE.MathUtils.lerp(-0.1, 0.08, stateOne) + stateTwo * 0.16;

  character.torso.scale.y = 1 + idle * 0.012;
  character.leftLeg.rotation.x = walk;
  character.rightLeg.rotation.x = -walk;
  // Asymmetric relaxed pose: the left hand sits slightly inward, the right hangs naturally.
  character.leftArm.shoulder.rotation.x = damp(character.leftArm.shoulder.rotation.x, -walk * 0.55, 0.1);
  character.leftArm.shoulder.rotation.z = damp(character.leftArm.shoulder.rotation.z, 0.13 + idle * 0.012, 0.1);
  character.leftArm.elbow.rotation.z = damp(character.leftArm.elbow.rotation.z, -0.2, 0.1);
  character.leftArm.wrist.rotation.z = damp(character.leftArm.wrist.rotation.z, 0.08, 0.1);

  const waveAge = time - waveStartedAt;
  const waving = waveAge >= 0 && waveAge < 2.45;
  const waveIn = waving ? smoothstep(0, 0.34, waveAge) : 0;
  const waveOut = waving ? 1 - smoothstep(1.82, 2.45, waveAge) : 0;
  const waveEnvelope = waveIn * waveOut;
  const wristWave = waving ? Math.sin((waveAge - 0.24) * 13.5) * 0.42 * waveEnvelope : 0;

  character.rightArm.shoulder.rotation.z = damp(
    character.rightArm.shoulder.rotation.z,
    THREE.MathUtils.lerp(-0.1, 2.05, waveEnvelope),
    0.13,
  );
  character.rightArm.shoulder.rotation.x = damp(
    character.rightArm.shoulder.rotation.x,
    THREE.MathUtils.lerp(walk * 0.45, -0.18, waveEnvelope),
    0.12,
  );
  character.rightArm.elbow.rotation.z = damp(
    character.rightArm.elbow.rotation.z,
    THREE.MathUtils.lerp(0.12, 1.02, waveEnvelope),
    0.15,
  );
  character.rightArm.elbow.rotation.x = damp(
    character.rightArm.elbow.rotation.x,
    -0.12 * waveEnvelope,
    0.12,
  );
  character.rightArm.wrist.rotation.z = damp(
    character.rightArm.wrist.rotation.z,
    -0.08 + wristWave,
    0.2,
  );
  character.rightArm.wrist.rotation.y = damp(
    character.rightArm.wrist.rotation.y,
    Math.sin(waveAge * 6.5) * 0.12 * waveEnvelope,
    0.16,
  );

  const headYaw = pointer.x * 0.24;
  const headPitch = -pointer.y * 0.14;
  character.head.rotation.y = damp(character.head.rotation.y, headYaw, 0.12);
  character.head.rotation.x = damp(character.head.rotation.x, headPitch, 0.12);

  const blinkPhase = reducedMotion ? 0 : time % 4.7;
  const blink = blinkPhase > 4.54 ? Math.max(0.08, Math.abs(Math.sin((blinkPhase - 4.54) * 20))) : 1;
  character.eyes.forEach((eye) => {
    eye.scale.y = 0.98 * blink;
  });
  character.pupils.forEach((pupil, index) => {
    const side = index === 0 ? -1 : 1;
    pupil.position.x = side * characterParams.eyeSpacing + pointer.x * 0.028;
    pupil.position.y = 0.082 + pointer.y * 0.02;
    pupil.scale.y = blink;
  });
}

// Drives the workbench's small live elements: blinking circuit LEDs, a sweeping meter
// readout and a scrolling PWM square-wave trace. Kept static under
// prefers-reduced-motion, matching the rest of the scene's motion policy.
let lastScreenUpdate = -Infinity;

function updateWorkbenchDynamics(time) {
  if (reducedMotion) return;
  const timeMs = time * 1000;

  (workbench.userData.leds || []).forEach(({ material, speed, phase }) => {
    material.emissiveIntensity = 1.4 + Math.sin(time * speed + phase) * 1.1;
  });

  // Canvas textures do not need to redraw at monitor refresh rate.
  if (timeMs - lastScreenUpdate > 100) {
    (workbench.userData.animatedScreens || []).forEach((screen) => screen.redraw(timeMs));
    lastScreenUpdate = timeMs;
  }
}

function updateEnvironment(time) {
  const stateOne = smoothstep(0.16, 1, sceneBlend);
  const stateTwo = smoothstep(1.15, 2, sceneBlend);
  const scannerFocus = 1 - Math.min(1, Math.abs(sceneBlend - 1));

  workbench.position.x = -stateOne * 12;
  workbench.rotation.y = stateOne * -0.24;
  workbench.scale.setScalar(1 - stateOne * 0.18);
  updateWorkbenchDynamics(time);

  const scannerScale = Math.max(0.001, scannerFocus);
  scanner.group.scale.setScalar(scannerScale);
  scanner.scanLine.position.y = 0.85 + ((time * 1.25) % 4.9);
  scanner.rings.forEach((ring, index) => {
    ring.rotation.z = reducedMotion ? 0 : time * (index % 2 ? 0.18 : -0.14);
  });

  projectModules.group.scale.setScalar(Math.max(0.001, stateTwo));
  projectModules.group.position.x = 0.4;
  projectModules.modules.forEach((module, index) => {
    const base = module.userData.basePosition;
    const hover = activeProject === index ? 0.35 : 0;
    module.position.y = base.y + (reducedMotion ? 0 : Math.sin(time * 1.3 + index * 1.8) * 0.16) + hover;
    module.rotation.y = -0.3 + (reducedMotion ? 0 : Math.sin(time * 0.7 + index) * 0.08);
    module.scale.setScalar(damp(module.scale.x, activeProject === index ? 1.12 : 1, 0.12));
  });

  currentBackground.lerpColors(cream, navy, stateOne);
  currentBackground.lerp(projectsCream, stateTwo);
  scene.background.copy(currentBackground);
  scene.fog.color.copy(currentBackground);

  floor.material.color.lerpColors(new THREE.Color(0xdecfb7), new THREE.Color(0x06204d), stateOne);
  floor.material.color.lerp(new THREE.Color(0xd9c8aa), stateTwo);
  grid.material.color.set(stateOne > 0.45 && stateTwo < 0.45 ? 0x42e5ee : 0x9a856b);
  grid.material.opacity = THREE.MathUtils.lerp(0.28, 0.55, scannerFocus);

  rimLight.intensity = THREE.MathUtils.lerp(12, 32, scannerFocus);
  warmLight.intensity = THREE.MathUtils.lerp(8, 3, scannerFocus);
  keyLight.intensity = THREE.MathUtils.lerp(5.2, 2.8, scannerFocus);
  hemi.intensity = THREE.MathUtils.lerp(2.4, 1.2, scannerFocus);
}

const orbitTarget = new THREE.Vector3();
const orbitSpherical = new THREE.Spherical();
const orbitOffset = new THREE.Vector3();

// Drag orbits the camera rather than spinning the character. The character, floor,
// grid and directional light stay in a fixed relationship, so cast shadows no longer
// slide across the ground as the view is rotated.
function updateCamera() {
  const mobile = window.innerWidth < 700;
  orbitTarget.set(mobile ? 1.1 : 1.35, 3.0, -0.35);

  const radius = mobile ? 16.6 : 13.75;
  const baseAzimuth = mobile ? 0.042 : -0.084;
  const baseElevation = mobile ? 0.04 : 0.084;

  orbitSpherical.radius = radius;
  orbitSpherical.theta = baseAzimuth - dragYaw + pointer.x * 0.032;
  orbitSpherical.phi = clamp(
    Math.PI / 2 - baseElevation - dragPitch - pointer.y * 0.016,
    0.42,
    Math.PI / 2 + 0.12,
  );

  orbitOffset.setFromSpherical(orbitSpherical).add(orbitTarget);
  camera.position.x = damp(camera.position.x, orbitOffset.x, 0.08);
  camera.position.y = damp(camera.position.y, orbitOffset.y, 0.08);
  camera.position.z = damp(camera.position.z, orbitOffset.z, 0.08);
  camera.lookAt(orbitTarget);
}

function renderFrame(time = 0) {
  if (!reducedMotion) {
    pointer.x = damp(pointer.x, pointerTarget.x, 0.1);
    pointer.y = damp(pointer.y, pointerTarget.y, 0.1);
    sceneBlend = damp(sceneBlend, targetScene, 0.045);
  } else {
    pointer.copy(pointerTarget);
    sceneBlend = targetScene;
  }

  updateCharacter(time);
  updateEnvironment(time);
  updateCamera();
  renderer.render(scene, camera);
}

function animate() {
  renderFrame(clock.getElapsedTime());
}

function startAnimation() {
  if (animationRunning || !sceneInView || document.hidden) return;
  animationRunning = true;
  if (reducedMotion) {
    renderFrame(0);
  } else {
    renderer.setAnimationLoop(animate);
  }
}

function stopAnimation() {
  if (!animationRunning) return;
  animationRunning = false;
  renderer.setAnimationLoop(null);
}

function resize() {
  const width = shell.clientWidth;
  const height = shell.clientHeight;
  renderer.setSize(width, height, false);
  camera.aspect = width / Math.max(height, 1);
  camera.updateProjectionMatrix();
  renderFrame(clock.getElapsedTime());
}

const resizeObserver = new ResizeObserver(resize);
resizeObserver.observe(shell);

const updatePointer = (event) => {
  const bounds = canvas.getBoundingClientRect();
  pointerTarget.x = clamp(((event.clientX - bounds.left) / bounds.width) * 2 - 1, -1, 1);
  pointerTarget.y = clamp(-(((event.clientY - bounds.top) / bounds.height) * 2 - 1), -1, 1);
  if (reducedMotion) renderFrame(0);
};

canvas.addEventListener("pointerdown", (event) => {
  dragging = true;
  pointerDownX = event.clientX;
  pointerDownY = event.clientY;
  previousPointerX = event.clientX;
  previousPointerY = event.clientY;
  canvas.setPointerCapture(event.pointerId);
});

canvas.addEventListener("pointermove", (event) => {
  updatePointer(event);
  if (!dragging) return;
  const deltaX = event.clientX - previousPointerX;
  const deltaY = event.clientY - previousPointerY;
  dragYaw += deltaX * 0.006;
  dragPitch = clamp(dragPitch + deltaY * 0.003, -0.4, 0.4);
  previousPointerX = event.clientX;
  previousPointerY = event.clientY;
});

canvas.addEventListener("pointerup", (event) => {
  const distance = Math.hypot(event.clientX - pointerDownX, event.clientY - pointerDownY);
  dragging = false;
  if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
  if (distance < 7) {
    waveStartedAt = clock.getElapsedTime();
    if (reducedMotion) renderFrame(0);
  }
});

canvas.addEventListener("pointercancel", () => {
  dragging = false;
});

const sceneObserver = new IntersectionObserver(
  (entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!visible) return;

    targetScene = Number(visible.target.dataset.scene);
    sceneCurrent.textContent = String(targetScene + 1).padStart(2, "0");
    navLinks.forEach((link) => {
      const current = Number(link.dataset.navScene) === targetScene;
      if (current) link.setAttribute("aria-current", "true");
      else link.removeAttribute("aria-current");
    });

    const lightHeader = targetScene === 1;
    document.querySelector(".site-header").style.color = lightHeader ? "#ffffff" : "#171714";
    document.querySelector(".brand small").style.color = lightHeader ? "#9eb8df" : "#736b60";
    document.querySelector(".site-header nav").style.background = lightHeader
      ? "rgba(6, 26, 64, .78)"
      : "rgba(243, 234, 217, .84)";
    document.querySelector(".header-contact").style.color = "#171714";

    if (reducedMotion) renderFrame(0);
  },
  { threshold: [0.28, 0.5, 0.72] },
);
sections.forEach((section) => sceneObserver.observe(section));

const visibleSceneSections = new Set();
const sceneVisibilityObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) visibleSceneSections.add(entry.target);
      else visibleSceneSections.delete(entry.target);
    });
    sceneInView = visibleSceneSections.size > 0;
    if (sceneInView) startAnimation();
    else stopAnimation();
  },
  { rootMargin: "20% 0px" },
);
sections.forEach((section) => sceneVisibilityObserver.observe(section));

projectLinks.forEach((link) => {
  const index = Number(link.dataset.projectIndex);
  link.addEventListener("pointerenter", () => {
    activeProject = index;
  });
  link.addEventListener("pointerleave", () => {
    activeProject = -1;
  });
  link.addEventListener("focus", () => {
    activeProject = index;
  });
  link.addEventListener("blur", () => {
    activeProject = -1;
  });
});

document.addEventListener("visibilitychange", () => {
  if (document.hidden) stopAnimation();
  else startAnimation();
});

resize();
renderFrame(0);
requestAnimationFrame(() => {
  loading.classList.add("is-complete");
  window.setTimeout(() => {
    loading.hidden = true;
  }, 520);
});
startAnimation();
