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

const materials = {
  skin: new THREE.MeshStandardMaterial({ color: 0x9a5e3d, roughness: 0.72 }),
  skinLight: new THREE.MeshStandardMaterial({ color: 0xb77955, roughness: 0.7 }),
  hair: new THREE.MeshStandardMaterial({ color: 0x17130f, roughness: 0.94 }),
  hairHighlight: new THREE.MeshStandardMaterial({ color: 0x241b16, roughness: 0.96 }),
  beard: new THREE.MeshStandardMaterial({ color: 0x110f0d, roughness: 1 }),
  lip: new THREE.MeshStandardMaterial({ color: 0x3a221e, roughness: 0.94 }),
  navy: new THREE.MeshStandardMaterial({ color: 0x102b57, roughness: 0.78 }),
  navyDark: new THREE.MeshStandardMaterial({ color: 0x071b3b, roughness: 0.78 }),
  shirt: new THREE.MeshStandardMaterial({ color: 0xf5f0e9, roughness: 0.68 }),
  shoe: new THREE.MeshStandardMaterial({ color: 0x171719, roughness: 0.48 }),
  silver: new THREE.MeshStandardMaterial({
    color: 0xb9c2c9,
    metalness: 0.86,
    roughness: 0.22,
  }),
  lens: new THREE.MeshPhysicalMaterial({
    color: 0xc7e7eb,
    transparent: true,
    opacity: 0.18,
    roughness: 0.08,
    transmission: 0.2,
    side: THREE.DoubleSide,
  }),
  eyeWhite: new THREE.MeshStandardMaterial({ color: 0xf8f5ed, roughness: 0.5 }),
  pupil: new THREE.MeshStandardMaterial({ color: 0x1b1714, roughness: 0.75 }),
  desk: new THREE.MeshStandardMaterial({ color: 0xc89b63, roughness: 0.7 }),
  deskEdge: new THREE.MeshStandardMaterial({ color: 0x88613b, roughness: 0.76 }),
  monitor: new THREE.MeshStandardMaterial({ color: 0x252a34, roughness: 0.46 }),
  screen: new THREE.MeshStandardMaterial({
    color: 0x0a1a27,
    emissive: 0x0c4250,
    emissiveIntensity: 1.4,
    roughness: 0.36,
  }),
  board: new THREE.MeshStandardMaterial({ color: 0x1c805d, roughness: 0.66 }),
  copper: new THREE.MeshStandardMaterial({
    color: 0xe39649,
    metalness: 0.62,
    roughness: 0.35,
  }),
  cyan: new THREE.MeshStandardMaterial({
    color: 0x42e5ee,
    emissive: 0x1eb5ca,
    emissiveIntensity: 3,
    roughness: 0.28,
  }),
  orange: new THREE.MeshStandardMaterial({
    color: 0xff7a18,
    emissive: 0xa63200,
    emissiveIntensity: 0.7,
    roughness: 0.56,
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

function createCharacter() {
  const root = new THREE.Group();
  root.name = "MasoodCharacter";

  const body = new THREE.Group();
  root.add(body);

  const hips = mesh(new THREE.CapsuleGeometry(0.62, 0.42, 6, 16), materials.navyDark, [0, 2.65, 0]);
  hips.scale.set(1.15, 0.8, 0.78);
  body.add(hips);

  const torso = capsule(0.72, 1.15, materials.navy);
  torso.position.set(0, 3.75, 0);
  torso.scale.set(1.12, 1, 0.74);
  body.add(torso);

  const shirt = mesh(new THREE.BoxGeometry(0.46, 0.94, 0.07), materials.shirt, [0, 4.0, 0.67]);
  shirt.rotation.x = -0.04;
  body.add(shirt);

  const makeSuitPanel = (side, material, inner = false) => {
    const shape = new THREE.Shape();
    shape.moveTo(side * (inner ? 0.05 : 0.09), inner ? 0.42 : 0.52);
    shape.lineTo(side * (inner ? 0.27 : 0.56), inner ? 0.26 : -0.02);
    shape.lineTo(side * (inner ? 0.12 : 0.22), inner ? -0.05 : -0.66);
    shape.closePath();
    const panel = mesh(new THREE.ShapeGeometry(shape), material, [0, 4.02, inner ? 0.755 : 0.73]);
    body.add(panel);
  };
  makeSuitPanel(-1, materials.navyDark);
  makeSuitPanel(1, materials.navyDark);
  makeSuitPanel(-1, materials.shirt, true);
  makeSuitPanel(1, materials.shirt, true);


  const makeLeg = (side) => {
    const hip = new THREE.Group();
    hip.position.set(side * 0.39, 2.5, 0);
    const leg = capsule(0.3, 1.45, materials.navyDark);
    leg.position.y = -0.95;
    hip.add(leg);
    const shoe = mesh(new THREE.CapsuleGeometry(0.28, 0.5, 6, 14), materials.shoe, [0, -2.01, 0.19]);
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
    shoulder.position.set(side * 0.88, 4.35, 0);
    shoulder.rotation.z = side === -1 ? 0.1 : -0.1;

    const upperSleeve = capsule(0.245, 0.55, materials.navy);
    upperSleeve.position.y = -0.4;
    shoulder.add(upperSleeve);

    const elbow = new THREE.Group();
    elbow.position.y = -0.78;
    shoulder.add(elbow);

    const forearmSleeve = capsule(0.205, 0.34, materials.navy);
    forearmSleeve.position.y = -0.34;
    forearmSleeve.scale.set(0.96, 1, 0.92);
    elbow.add(forearmSleeve);

    const wrist = new THREE.Group();
    wrist.position.y = -0.68;
    elbow.add(wrist);

    const hand = mesh(new THREE.SphereGeometry(0.245, 20, 14), materials.skinLight, [0, -0.12, 0.02]);
    hand.scale.set(0.72, 1.08, 0.62);
    wrist.add(hand);

    const thumb = mesh(
      new THREE.SphereGeometry(0.09, 14, 10),
      materials.skin,
      [side * -0.13, -0.1, 0.08],
    );
    thumb.scale.set(0.75, 1.15, 0.7);
    thumb.rotation.z = side * 0.38;
    wrist.add(thumb);

    body.add(shoulder);
    return { shoulder, elbow, wrist, hand };
  };

  const leftArm = makeArm(-1);
  const rightArm = makeArm(1);

  const neck = mesh(new THREE.CylinderGeometry(0.28, 0.31, 0.4, 16), materials.skin, [0, 4.91, 0]);
  body.add(neck);

  const head = new THREE.Group();
  head.position.set(0, 5.58, 0.02);
  body.add(head);

  // Restore the earlier approved character face; only the hair treatment is expanded.
  const face = mesh(new THREE.SphereGeometry(0.88, 28, 22), materials.skinLight);
  face.scale.set(0.74, 1.2, 0.79);
  head.add(face);

  const leftEar = mesh(new THREE.SphereGeometry(0.19, 16, 10), materials.skin, [-0.65, -0.03, 0]);
  leftEar.scale.set(0.55, 1, 0.55);
  head.add(leftEar);
  const rightEar = leftEar.clone();
  rightEar.position.x = 0.65;
  head.add(rightEar);

  // Procedural wavy texture gives the scalp visible short-hair detail and bump shading.
  const hairTextureCanvas = document.createElement("canvas");
  hairTextureCanvas.width = 256;
  hairTextureCanvas.height = 256;
  const hairTextureContext = hairTextureCanvas.getContext("2d");
  hairTextureContext.fillStyle = "#17130f";
  hairTextureContext.fillRect(0, 0, 256, 256);
  hairTextureContext.lineCap = "round";

  for (let index = 0; index < 180; index += 1) {
    const x = (index * 47) % 268 - 12;
    const y = (index * 83) % 268 - 12;
    const wave = 5 + (index % 4);
    hairTextureContext.beginPath();
    hairTextureContext.moveTo(x, y);
    hairTextureContext.quadraticCurveTo(x + wave, y - 7, x + wave * 2, y);
    hairTextureContext.strokeStyle = index % 3 === 0 ? "#382a21" : "#251c17";
    hairTextureContext.lineWidth = index % 5 === 0 ? 2.2 : 1.35;
    hairTextureContext.stroke();
  }

  const hairTexture = new THREE.CanvasTexture(hairTextureCanvas);
  hairTexture.colorSpace = THREE.SRGBColorSpace;
  hairTexture.wrapS = THREE.RepeatWrapping;
  hairTexture.wrapT = THREE.RepeatWrapping;
  hairTexture.repeat.set(1.8, 1.55);
  hairTexture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());

  const hairScalpMaterial = new THREE.MeshStandardMaterial({
    map: hairTexture,
    bumpMap: hairTexture,
    bumpScale: 0.032,
    roughness: 0.96,
    metalness: 0,
  });

  const hairBaseGeometry = new THREE.SphereGeometry(0.84, 36, 24, 0, Math.PI * 2, 0, Math.PI * 0.66);
  const hairPositions = hairBaseGeometry.attributes.position;
  for (let index = 0; index < hairPositions.count; index += 1) {
    const x = hairPositions.getX(index);
    const y = hairPositions.getY(index);
    const z = hairPositions.getZ(index);
    const surfaceWave =
      y > 0.05
        ? (Math.sin(x * 15) + Math.cos(z * 13) + Math.sin((x + z) * 9)) * 0.012
        : 0;
    hairPositions.setXYZ(
      index,
      x * (1 + surfaceWave),
      y + surfaceWave * 0.72,
      z * (1 + surfaceWave),
    );
  }
  hairBaseGeometry.computeVertexNormals();

  const hairBase = mesh(
    hairBaseGeometry,
    hairScalpMaterial,
    [0, 0.36, -0.015],
  );
  hairBase.scale.set(0.82, 0.82, 0.86);
  head.add(hairBase);

  const backHair = mesh(new THREE.SphereGeometry(0.72, 28, 20), hairScalpMaterial, [0, 0.3, -0.42]);
  backHair.scale.set(0.88, 0.84, 0.56);
  head.add(backHair);

  const sideHairGeometry = new THREE.CapsuleGeometry(0.078, 0.25, 6, 14);
  for (const side of [-1, 1]) {
    const sideHair = mesh(sideHairGeometry, hairScalpMaterial, [side * 0.57, 0.26, -0.02]);
    sideHair.rotation.z = side * -0.1;
    sideHair.scale.set(0.82, 1, 0.68);
    head.add(sideHair);
  }

  // Small overlapping locks break the perfect helmet edge without adding a bulky crown.
  const hairlineLocks = [
    [-0.5, 0.43, 0.65, 0.085, -0.34],
    [-0.35, 0.5, 0.69, 0.09, -0.24],
    [-0.19, 0.54, 0.71, 0.095, -0.14],
    [-0.02, 0.55, 0.72, 0.095, -0.02],
    [0.15, 0.53, 0.71, 0.092, 0.12],
    [0.31, 0.49, 0.69, 0.088, 0.24],
    [0.46, 0.42, 0.64, 0.08, 0.34],
  ];
  hairlineLocks.forEach(([x, y, z, radius, rotation], index) => {
    const lock = mesh(
      new THREE.SphereGeometry(radius, 16, 12),
      index % 3 === 1 ? materials.hairHighlight : materials.hair,
      [x, y, z],
    );
    lock.scale.set(1.28, 0.66, 0.62);
    lock.rotation.z = rotation;
    head.add(lock);
  });


  // One subtle side part follows the direction seen in the supplied reference.
  const sidePartCurve = new THREE.QuadraticBezierCurve3(
    new THREE.Vector3(0.17, 0.79, 0.7),
    new THREE.Vector3(0.27, 0.72, 0.71),
    new THREE.Vector3(0.34, 0.61, 0.69),
  );
  head.add(
    mesh(
      new THREE.TubeGeometry(sidePartCurve, 10, 0.006, 5, false),
      materials.hairHighlight,
    ),
  );
  // A restrained nose bridge and tip match the supplied front and side references.
  const noseBridge = capsule(0.04, 0.14, materials.skin);
  noseBridge.position.set(0, -0.03, 0.73);
  noseBridge.scale.set(0.82, 1, 0.7);
  head.add(noseBridge);

  const noseTip = mesh(new THREE.SphereGeometry(0.09, 18, 12), materials.skin, [0, -0.14, 0.75]);
  noseTip.scale.set(0.92, 0.68, 0.68);
  head.add(noseTip);

  // Broad, slightly squared beard silhouette based on Masood's reference.
  const beardShape = new THREE.Shape();
  beardShape.moveTo(-0.48, 0.48);
  beardShape.quadraticCurveTo(-0.6, 0.46, -0.61, 0.32);
  beardShape.lineTo(-0.58, -0.42);
  beardShape.quadraticCurveTo(-0.56, -0.58, -0.4, -0.66);
  beardShape.quadraticCurveTo(0, -0.76, 0.4, -0.66);
  beardShape.quadraticCurveTo(0.56, -0.58, 0.58, -0.42);
  beardShape.lineTo(0.61, 0.32);
  beardShape.quadraticCurveTo(0.6, 0.46, 0.48, 0.48);
  beardShape.quadraticCurveTo(0, 0.36, -0.48, 0.48);

  // The reference beard frames the lips instead of covering the whole face.
  const mouthOpening = new THREE.Path();
  mouthOpening.absellipse(0, 0.33, 0.16, 0.07, 0, Math.PI * 2, true, 0);
  beardShape.holes.push(mouthOpening);

  const beardGeometry = new THREE.ExtrudeGeometry(beardShape, {
    depth: 0.34,
    steps: 1,
    bevelEnabled: true,
    bevelSegments: 4,
    bevelSize: 0.055,
    bevelThickness: 0.055,
    curveSegments: 16,
  });
  beardGeometry.center();
  const beard = mesh(beardGeometry, materials.beard, [0, -0.72, 0.48]);
  beard.scale.set(0.9, 0.78, 0.88);
  head.add(beard);

  // Sideburns connect the squared beard naturally to the full hair.
  const beardSideGeometry = new THREE.CapsuleGeometry(0.13, 0.38, 6, 14);
  for (const side of [-1, 1]) {
    const beardSide = mesh(beardSideGeometry, materials.beard, [side * 0.54, -0.3, 0.28]);
    beardSide.rotation.z = side * -0.08;
    beardSide.scale.set(0.9, 1, 0.78);
    head.add(beardSide);
  }

  // Smooth moustache curves follow the upper lip without creating an angular mask.
  const moustacheLeftCurve = new THREE.QuadraticBezierCurve3(
    new THREE.Vector3(-0.21, -0.27, 0.75),
    new THREE.Vector3(-0.11, -0.22, 0.78),
    new THREE.Vector3(-0.01, -0.27, 0.78),
  );
  const moustacheRightCurve = new THREE.QuadraticBezierCurve3(
    new THREE.Vector3(0.01, -0.27, 0.78),
    new THREE.Vector3(0.11, -0.22, 0.78),
    new THREE.Vector3(0.21, -0.27, 0.75),
  );
  head.add(mesh(new THREE.TubeGeometry(moustacheLeftCurve, 12, 0.025, 7, false), materials.beard));
  head.add(mesh(new THREE.TubeGeometry(moustacheRightCurve, 12, 0.025, 7, false), materials.beard));

  // The mouth is intentionally restrained: a short line recessed under the moustache.
  const mouth = capsule(0.008, 0.07, materials.lip);
  mouth.position.set(0, -0.38, 0.75);
  mouth.rotation.z = Math.PI / 2;
  mouth.scale.z = 0.62;
  head.add(mouth);

  // Subtle beard texture preserves the squared silhouette without turning it into a round blob.
  const beardTexture = [
    [-0.34, -0.56, 0.7, -0.2],
    [-0.12, -0.62, 0.71, 0.18],
    [0.13, -0.58, 0.71, -0.12],
    [0.35, -0.63, 0.68, 0.24],
    [-0.27, -0.88, 0.68, 0.12],
    [0, -0.94, 0.69, -0.2],
    [0.27, -0.87, 0.67, 0.16],
  ];
  beardTexture.forEach(([x, y, z, rotation], index) => {
    const curl = mesh(
      new THREE.TorusGeometry(0.045, 0.014, 6, 12, Math.PI * 1.5),
      index % 2 ? materials.hairHighlight : materials.beard,
      [x, y, z],
    );
    curl.rotation.z = rotation;
    head.add(curl);
  });
  const eyes = [];
  const pupils = [];
  for (const side of [-1, 1]) {
    const eye = mesh(new THREE.SphereGeometry(0.105, 18, 12), materials.eyeWhite, [side * 0.27, 0.08, 0.75]);
    eye.scale.set(1, 0.7, 0.42);
    head.add(eye);
    eyes.push(eye);

    const pupil = mesh(new THREE.SphereGeometry(0.04, 16, 10), materials.pupil, [side * 0.27, 0.08, 0.85]);
    pupil.scale.z = 0.45;
    head.add(pupil);
    pupils.push(pupil);
  }

  const browGeometry = new THREE.CapsuleGeometry(0.035, 0.24, 4, 10);
  for (const side of [-1, 1]) {
    const brow = mesh(browGeometry, materials.hair, [side * 0.27, 0.28, 0.79]);
    brow.rotation.z = Math.PI / 2 + side * 0.06;
    head.add(brow);
  }

  const glasses = new THREE.Group();
  glasses.position.set(0, 0.08, 0.86);
  head.add(glasses);

  for (const side of [-1, 1]) {
    const frame = mesh(new THREE.TorusGeometry(0.235, 0.022, 8, 28), materials.silver, [side * 0.27, 0, 0]);
    frame.scale.set(1.15, 0.86, 1);
    glasses.add(frame);

    const lens = mesh(new THREE.CircleGeometry(0.222, 28), materials.lens, [side * 0.27, 0, -0.004]);
    lens.scale.set(1.15, 0.86, 1);
    glasses.add(lens);
  }

  const bridge = mesh(new THREE.CapsuleGeometry(0.025, 0.2, 4, 8), materials.silver, [0, 0.02, 0]);
  bridge.rotation.z = Math.PI / 2;
  glasses.add(bridge);

  const leftTemple = mesh(new THREE.CapsuleGeometry(0.018, 0.28, 4, 8), materials.silver, [-0.57, 0.03, -0.12]);
  leftTemple.rotation.set(Math.PI / 2, 0, Math.PI / 2);
  glasses.add(leftTemple);
  const rightTemple = leftTemple.clone();
  rightTemple.position.x = 0.57;
  glasses.add(rightTemple);

  setShadow(root);
  return {
    root,
    body,
    torso,
    head,
    eyes,
    pupils,
    leftArm,
    rightArm,
    leftLeg,
    rightLeg,
  };
}

function createWorkbench() {
  const group = new THREE.Group();
  group.name = "ElectronicsWorkbench";

  const top = mesh(new THREE.BoxGeometry(5.8, 0.28, 1.65), materials.desk, [1.9, 2.62, -1.35]);
  group.add(top);

  for (const x of [-0.65, 4.45]) {
    for (const z of [-1.86, -0.82]) {
      const leg = mesh(new THREE.CylinderGeometry(0.12, 0.15, 2.65, 12), materials.deskEdge, [x, 1.28, z]);
      group.add(leg);
    }
  }

  const makeMonitor = (x, y, z, rotationY = 0, mode = "circuit") => {
    const monitorGroup = new THREE.Group();
    monitorGroup.position.set(x, y, z);
    monitorGroup.rotation.y = rotationY;
    const display = mesh(new THREE.BoxGeometry(1.78, 1.1, 0.16), materials.monitor);
    monitorGroup.add(display);
    const screen = mesh(new THREE.PlaneGeometry(1.56, 0.88), materials.screen, [0, 0, 0.086]);
    monitorGroup.add(screen);
    const stand = mesh(new THREE.CylinderGeometry(0.08, 0.1, 0.62, 12), materials.monitor, [0, -0.84, -0.02]);
    monitorGroup.add(stand);
    const foot = mesh(new THREE.BoxGeometry(0.68, 0.08, 0.42), materials.monitor, [0, -1.14, 0.08]);
    monitorGroup.add(foot);
    group.add(monitorGroup);

    if (mode === "circuit") {
      const traceMaterial = new THREE.LineBasicMaterial({ color: 0x42e5ee });
      const tracePoints = [
        [-0.62, 0.2], [-0.28, 0.2], [-0.28, -0.16], [0.08, -0.16], [0.08, 0.24], [0.68, 0.24],
        [-0.52, -0.34], [-0.08, -0.34], [-0.08, 0.03], [0.37, 0.03], [0.37, -0.3], [0.62, -0.3],
      ].map(([px, py]) => new THREE.Vector3(px, py, 0.105));
      const traces = new THREE.Line(new THREE.BufferGeometry().setFromPoints(tracePoints), traceMaterial);
      monitorGroup.add(traces);
      [[-0.62, 0.2], [0.08, -0.16], [0.68, 0.24], [-0.52, -0.34], [0.37, 0.03]].forEach(([nx, ny], index) => {
        const node = mesh(new THREE.CircleGeometry(index === 1 ? 0.09 : 0.055, 16), index === 1 ? materials.orange : materials.cyan, [nx, ny, 0.112]);
        monitorGroup.add(node);
      });
      for (let pin = 0; pin < 5; pin += 1) {
        monitorGroup.add(mesh(new THREE.BoxGeometry(0.045, 0.13, 0.02), materials.copper, [-0.09 + pin * 0.09, -0.16, 0.12]));
      }
    } else {
      const meterMaterial = new THREE.LineBasicMaterial({ color: 0x42e5ee });
      const wavePoints = [];
      for (let point = 0; point <= 42; point += 1) {
        const px = -0.68 + point * 0.032;
        wavePoints.push(new THREE.Vector3(px, -0.18 + Math.sin(point * 0.62) * 0.12, 0.108));
      }
      monitorGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(wavePoints), meterMaterial));
      const arc = new THREE.EllipseCurve(0, 0.14, 0.46, 0.32, 0, Math.PI, false, 0);
      const arcPoints = arc.getPoints(28).map((point) => new THREE.Vector3(point.x, point.y, 0.108));
      monitorGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(arcPoints), new THREE.LineBasicMaterial({ color: 0xff7a18 })));
      const needlePoints = [new THREE.Vector3(0, 0.14, 0.116), new THREE.Vector3(0.31, 0.35, 0.116)];
      monitorGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(needlePoints), new THREE.LineBasicMaterial({ color: 0xf5f0e9 })));
      monitorGroup.add(mesh(new THREE.CircleGeometry(0.06, 16), materials.orange, [0, 0.14, 0.12]));
    }
  };

  makeMonitor(1.15, 4.08, -1.36, 0.14, "circuit");
  makeMonitor(3.15, 4.02, -1.38, -0.14, "meter");

  const pcb = mesh(new THREE.BoxGeometry(1.35, 0.08, 0.8), materials.board, [2.0, 2.82, -0.7]);
  group.add(pcb);
  for (let index = 0; index < 9; index += 1) {
    const component = mesh(
      new THREE.BoxGeometry(index % 3 === 0 ? 0.2 : 0.1, 0.11, index % 2 ? 0.16 : 0.1),
      index % 3 === 0 ? materials.monitor : materials.copper,
      [1.55 + (index % 5) * 0.22, 2.92, -0.95 + Math.floor(index / 5) * 0.35],
    );
    group.add(component);
  }

  const scope = new THREE.Group();
  scope.position.set(4.25, 3.08, -0.92);
  group.add(scope);
  scope.add(mesh(new THREE.BoxGeometry(0.92, 0.62, 0.55), materials.monitor));
  scope.add(mesh(new THREE.PlaneGeometry(0.56, 0.35), materials.screen, [-0.1, 0.04, 0.286]));
  for (let knob = 0; knob < 3; knob += 1) {
    scope.add(mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.05, 12), materials.orange, [0.32, 0.17 - knob * 0.16, 0.31]));
  }

  const shelf = mesh(new THREE.BoxGeometry(4.8, 0.16, 0.72), materials.desk, [2.0, 5.55, -1.8]);
  group.add(shelf);
  const bookColors = [materials.orange, materials.navy, materials.shirt];
  for (let book = 0; book < 4; book += 1) {
    const bookMesh = mesh(new THREE.BoxGeometry(0.24, 0.8 - book * 0.08, 0.46), bookColors[book % 3], [0.38 + book * 0.26, 6.0, -1.72]);
    bookMesh.rotation.z = book === 3 ? -0.16 : 0;
    group.add(bookMesh);
  }

  const plantPot = mesh(new THREE.CylinderGeometry(0.24, 0.19, 0.36, 16), materials.shirt, [3.9, 5.84, -1.7]);
  group.add(plantPot);
  for (let leaf = 0; leaf < 5; leaf += 1) {
    const leafMesh = mesh(new THREE.SphereGeometry(0.18, 12, 8), materials.board, [3.9 + Math.sin(leaf) * 0.2, 6.18 + (leaf % 2) * 0.16, -1.7]);
    leafMesh.scale.set(0.55, 1.25, 0.42);
    leafMesh.rotation.z = leaf * 0.55;
    group.add(leafMesh);
  }

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
const workbench = createWorkbench();
const scanner = createScanner();
const projectModules = createProjectModules();
world.add(character.root, workbench, scanner.group, projectModules.group);

const floor = mesh(new THREE.PlaneGeometry(34, 24), new THREE.MeshStandardMaterial({ color: 0xdecfb7, roughness: 0.94 }), [0, -0.08, -2]);
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
world.add(floor);

const grid = new THREE.GridHelper(28, 28, 0x9a856b, 0xcdbfa9);
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

  character.root.scale.setScalar(THREE.MathUtils.lerp(0.82, 0.88, stateOne));
  character.root.position.x = THREE.MathUtils.lerp(2.72, 1.65, stateOne);
  character.root.position.x = THREE.MathUtils.lerp(character.root.position.x, 2.25, stateTwo);
  character.root.position.y = -0.05 + Math.abs(idle) * 0.018;
  character.root.rotation.y = dragYaw + THREE.MathUtils.lerp(-0.1, 0.08, stateOne) + stateTwo * 0.16;
  character.root.rotation.x = dragPitch * 0.2;

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
    eye.scale.y = 0.7 * blink;
  });
  character.pupils.forEach((pupil, index) => {
    pupil.position.x = (index === 0 ? -0.27 : 0.27) + pointer.x * 0.035;
    pupil.position.y = 0.08 + pointer.y * 0.026;
    pupil.scale.y = blink;
  });
}

function updateEnvironment(time) {
  const stateOne = smoothstep(0.16, 1, sceneBlend);
  const stateTwo = smoothstep(1.15, 2, sceneBlend);
  const scannerFocus = 1 - Math.min(1, Math.abs(sceneBlend - 1));

  workbench.position.x = -stateOne * 12;
  workbench.rotation.y = stateOne * -0.24;
  workbench.scale.setScalar(1 - stateOne * 0.18);

  const scannerScale = Math.max(0.001, scannerFocus);
  scanner.group.scale.setScalar(scannerScale);
  scanner.group.rotation.y = dragYaw * 0.35;
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

function updateCamera() {
  const mobile = window.innerWidth < 700;
  const targetX = mobile ? 0.9 : 0.2;
  const targetY = mobile ? 3.65 : 4.15;
  const targetZ = mobile ? 16.2 : 13.35;
  camera.position.x = damp(camera.position.x, targetX + pointer.x * 0.42, 0.06);
  camera.position.y = damp(camera.position.y, targetY + pointer.y * 0.2, 0.06);
  camera.position.z = damp(camera.position.z, targetZ, 0.06);
  camera.lookAt(mobile ? 1.1 : 1.35, 3.0, -0.35);
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
