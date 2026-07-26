/**
 * Masood's browser-native 3D electronics lab.
 *
 * Usage:
 *   <div id="masood-lab"></div>
 *   <script type="module">
 *     import { createMasoodLabScene } from "./scene.js";
 *     const lab = createMasoodLabScene({
 *       container: document.querySelector("#masood-lab")
 *     });
 *     // Later, if the view is removed:
 *     // lab.dispose();
 *   </script>
 *
 * The scene is procedural: no GLB, textures, or local font files are required.
 * Three.js is pinned to a known browser-compatible release.
 */

import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.172.0/build/three.module.js";

const PALETTE = Object.freeze({
  background: 0x0b1117,
  floor: 0x172129,
  wall: 0x1d2931,
  wallInset: 0x131d24,
  bench: 0xd7c8aa,
  benchEdge: 0x8e7654,
  metal: 0x68757b,
  darkMetal: 0x252f35,
  suit: 0x293b56,
  suitLight: 0x3c5272,
  shirt: 0xf1eee5,
  skin: 0xb97954,
  skinLight: 0xce9068,
  hair: 0x17130f,
  beard: 0x1b1511,
  glasses: 0xb7a58b,
  shoe: 0x16191d,
  cyan: 0x63d4d1,
  amber: 0xffb44a,
  red: 0xe86b5c,
  blush: 0xe89087,
  green: 0x75d69b,
  cable: 0x33424a,
});

const SHADOW_MAP_SIZE = 1024;

function material(color, options = {}) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: options.roughness ?? 0.72,
    metalness: options.metalness ?? 0.04,
    emissive: options.emissive ?? 0x000000,
    emissiveIntensity: options.emissiveIntensity ?? 0,
    transparent: options.transparent ?? false,
    opacity: options.opacity ?? 1,
    side: options.side ?? THREE.FrontSide,
  });
}

function roundedBox(width, height, depth, radius, mat) {
  // Core-only geometry avoids a fragile second CDN add-on import.
  const geometry = new THREE.BoxGeometry(width, height, depth, 3, 3, 3);
  const mesh = new THREE.Mesh(geometry, mat);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

function mesh(geometry, mat, position = [0, 0, 0]) {
  const item = new THREE.Mesh(geometry, mat);
  item.position.set(...position);
  item.castShadow = true;
  item.receiveShadow = true;
  return item;
}

function makeLabelTexture({
  width = 512,
  height = 256,
  draw,
  colorSpace = THREE.SRGBColorSpace,
}) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = colorSpace;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;

  const redraw = (time = 0) => {
    context.clearRect(0, 0, width, height);
    draw(context, width, height, time);
    texture.needsUpdate = true;
  };

  redraw(0);
  return { canvas, context, texture, redraw };
}

function drawGrid(context, width, height, color = "rgba(99, 212, 209, 0.10)") {
  context.strokeStyle = color;
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

function createScreen({
  width,
  height,
  position,
  rotation = [0, 0, 0],
  draw,
  frameColor = PALETTE.darkMetal,
}) {
  const group = new THREE.Group();
  group.position.set(...position);
  group.rotation.set(...rotation);

  const frameMat = material(frameColor, { roughness: 0.4, metalness: 0.22 });
  const frame = roundedBox(width, height, 0.12, 0.08, frameMat);
  group.add(frame);

  const textureSource = makeLabelTexture({ width: 640, height: 360, draw });
  const displayMat = new THREE.MeshBasicMaterial({
    map: textureSource.texture,
    toneMapped: false,
  });
  const display = mesh(
    new THREE.PlaneGeometry(width - 0.14, height - 0.14),
    displayMat,
    [0, 0, 0.066],
  );
  display.castShadow = false;
  display.receiveShadow = false;
  group.add(display);

  const ledMat = material(PALETTE.green, {
    emissive: PALETTE.green,
    emissiveIntensity: 1.4,
  });
  const led = mesh(new THREE.SphereGeometry(0.025, 12, 8), ledMat, [
    width * 0.42,
    -height * 0.4,
    0.085,
  ]);
  group.add(led);

  return {
    group,
    update: textureSource.redraw,
    dispose() {
      textureSource.texture.dispose();
      displayMat.dispose();
    },
  };
}

function createCodeScreen(position, rotation) {
  const colors = ["#63d4d1", "#ffb44a", "#75d69b", "#dde8e7", "#e86b5c"];
  return createScreen({
    width: 2.25,
    height: 1.28,
    position,
    rotation,
    draw(context, width, height, time) {
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
      const cursorRow = Math.floor(time / 700) % 9;
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
  return createScreen({
    width: 1.74,
    height: 1.03,
    position,
    rotation,
    draw(context, width, height, time) {
      context.fillStyle = "#061217";
      context.fillRect(0, 0, width, height);
      drawGrid(context, width, height);

      context.fillStyle = "#8aa0a8";
      context.font = "15px ui-monospace, SFMono-Regular, Consolas, monospace";
      context.fillText("CH1  1.00V", 22, 30);
      context.fillText("25.00 kHz", width - 145, 30);

      context.strokeStyle = "#63d4d1";
      context.shadowColor = "#63d4d1";
      context.shadowBlur = 7;
      context.lineWidth = 4;
      context.beginPath();
      const phase = time * 0.002;
      for (let x = 0; x <= width; x += 3) {
        const burst = Math.sin(x * 0.095 + phase) * Math.exp(
          -Math.pow(((x % 180) - 90) / 68, 2),
        );
        const y = height * 0.52 + burst * 70;
        if (x === 0) context.moveTo(x, y);
        else context.lineTo(x, y);
      }
      context.stroke();
      context.shadowBlur = 0;

      context.fillStyle = "#ffb44a";
      context.fillRect(20, height - 30, 110, 5);
    },
  });
}

function createMeter(position, rotation = [0, 0, 0]) {
  const group = new THREE.Group();
  group.position.set(...position);
  group.rotation.set(...rotation);

  const bodyMat = material(PALETTE.amber, { roughness: 0.54 });
  const darkMat = material(PALETTE.darkMetal, { roughness: 0.48 });
  const body = roundedBox(0.55, 0.82, 0.2, 0.08, bodyMat);
  group.add(body);

  const displaySource = makeLabelTexture({
    width: 300,
    height: 160,
    draw(context, width, height, time) {
      context.fillStyle = "#bcd3ad";
      context.fillRect(0, 0, width, height);
      context.fillStyle = "#23362d";
      context.font = "700 58px ui-monospace, SFMono-Regular, Consolas, monospace";
      const value = 3.28 + Math.sin(time * 0.0013) * 0.03;
      context.fillText(value.toFixed(2), 30, 90);
      context.font = "700 22px ui-monospace, SFMono-Regular, Consolas, monospace";
      context.fillText("V DC", 206, 132);
    },
  });
  const displayMat = new THREE.MeshBasicMaterial({
    map: displaySource.texture,
    toneMapped: false,
  });
  const display = mesh(
    new THREE.PlaneGeometry(0.41, 0.21),
    displayMat,
    [0, 0.18, 0.106],
  );
  display.castShadow = false;
  group.add(display);

  const dial = mesh(new THREE.CylinderGeometry(0.115, 0.115, 0.05, 24), darkMat, [
    0,
    -0.17,
    0.12,
  ]);
  dial.rotation.x = Math.PI / 2;
  group.add(dial);

  for (const [x, color] of [
    [-0.13, PALETTE.cable],
    [0.13, PALETTE.red],
  ]) {
    const port = mesh(
      new THREE.CylinderGeometry(0.035, 0.035, 0.04, 16),
      material(color),
      [x, -0.32, 0.12],
    );
    port.rotation.x = Math.PI / 2;
    group.add(port);
  }

  return {
    group,
    update: displaySource.redraw,
    dispose() {
      displaySource.texture.dispose();
      displayMat.dispose();
    },
  };
}

function createBench() {
  const group = new THREE.Group();
  const topMat = material(PALETTE.bench, { roughness: 0.76 });
  const edgeMat = material(PALETTE.benchEdge, { roughness: 0.68 });
  const metalMat = material(PALETTE.metal, { roughness: 0.4, metalness: 0.55 });

  const top = roundedBox(5.7, 0.22, 1.48, 0.08, topMat);
  top.position.set(-0.35, 1.52, -1.5);
  group.add(top);

  const backRail = roundedBox(5.7, 0.2, 0.18, 0.05, edgeMat);
  backRail.position.set(-0.35, 1.72, -2.13);
  group.add(backRail);

  for (const x of [-2.75, 2.05]) {
    const leg = roundedBox(0.18, 1.55, 0.18, 0.045, metalMat);
    leg.position.set(x, 0.77, -1.55);
    group.add(leg);
  }

  const shelf = roundedBox(5.35, 0.12, 0.62, 0.05, edgeMat);
  shelf.position.set(-0.35, 0.66, -1.72);
  group.add(shelf);

  return group;
}

function createCircuitBoard() {
  const group = new THREE.Group();
  group.position.set(-1.45, 1.69, -1.25);
  group.rotation.x = -0.07;

  const boardMat = material(0x1d765c, { roughness: 0.62 });
  const traceMat = material(PALETTE.amber, {
    emissive: PALETTE.amber,
    emissiveIntensity: 0.14,
  });
  const chipMat = material(0x151c20, { roughness: 0.44 });
  const board = roundedBox(1.15, 0.055, 0.54, 0.035, boardMat);
  group.add(board);

  for (let index = 0; index < 4; index += 1) {
    const trace = roundedBox(0.18 + index * 0.07, 0.008, 0.012, 0.003, traceMat);
    trace.position.set(-0.35 + index * 0.22, 0.036, -0.13 + (index % 2) * 0.24);
    group.add(trace);
  }

  for (const x of [-0.31, 0.25]) {
    const chip = roundedBox(0.27, 0.075, 0.2, 0.02, chipMat);
    chip.position.set(x, 0.066, 0);
    group.add(chip);
  }

  for (let index = 0; index < 8; index += 1) {
    const component = mesh(
      new THREE.CylinderGeometry(0.025, 0.025, 0.08, 10),
      material(index % 2 ? PALETTE.amber : PALETTE.cyan),
      [-0.5 + index * 0.14, 0.075, index % 2 ? 0.19 : -0.19],
    );
    group.add(component);
  }

  return group;
}

function createWallLab() {
  const group = new THREE.Group();
  const wallMat = material(PALETTE.wall, { roughness: 0.86 });
  const insetMat = material(PALETTE.wallInset, { roughness: 0.78 });
  const metalMat = material(PALETTE.metal, { metalness: 0.45, roughness: 0.46 });

  const wall = roundedBox(7.1, 4.8, 0.22, 0.06, wallMat);
  wall.position.set(0, 2.35, -2.67);
  group.add(wall);

  const inset = roundedBox(5.9, 1.15, 0.13, 0.08, insetMat);
  inset.position.set(-0.25, 3.8, -2.52);
  group.add(inset);

  for (let index = 0; index < 5; index += 1) {
    const rail = roundedBox(0.04, 0.82, 0.035, 0.012, metalMat);
    rail.position.set(-2.55 + index * 1.25, 3.8, -2.43);
    group.add(rail);
  }

  for (const [x, color] of [
    [-2.25, PALETTE.green],
    [-1.96, PALETTE.amber],
    [-1.67, PALETTE.red],
  ]) {
    const lampMat = material(color, {
      emissive: color,
      emissiveIntensity: 1.35,
    });
    const lamp = mesh(new THREE.SphereGeometry(0.07, 16, 10), lampMat, [
      x,
      4.08,
      -2.42,
    ]);
    group.add(lamp);
  }

  const titleSource = makeLabelTexture({
    width: 640,
    height: 120,
    draw(context, width, height) {
      context.fillStyle = "#0d181e";
      context.fillRect(0, 0, width, height);
      context.fillStyle = "#63d4d1";
      context.font = "700 36px ui-monospace, SFMono-Regular, Consolas, monospace";
      context.fillText("EMBEDDED SYSTEMS LAB", 34, 55);
      context.fillStyle = "#6e8088";
      context.font = "18px ui-monospace, SFMono-Regular, Consolas, monospace";
      context.fillText("HARDWARE  /  FIRMWARE  /  NETWORKS", 35, 88);
    },
  });
  const titleMat = new THREE.MeshBasicMaterial({
    map: titleSource.texture,
    toneMapped: false,
  });
  const title = mesh(new THREE.PlaneGeometry(2.85, 0.54), titleMat, [
    0.78,
    3.85,
    -2.42,
  ]);
  title.castShadow = false;
  group.add(title);

  group.userData.dispose = () => {
    titleSource.texture.dispose();
    titleMat.dispose();
  };
  return group;
}

function createCharacter() {
  const character = new THREE.Group();
  character.name = "MasoodCharacter";
  character.position.set(1.2, 0, 0.08);
  character.rotation.y = -0.14;

  const suitMat = material(PALETTE.suit, { roughness: 0.67 });
  const suitLightMat = material(PALETTE.suitLight, { roughness: 0.65 });
  const shirtMat = material(PALETTE.shirt, { roughness: 0.84 });
  const skinMat = material(PALETTE.skin, { roughness: 0.78 });
  const skinLightMat = material(PALETTE.skinLight, { roughness: 0.75 });
  const hairMat = material(PALETTE.hair, { roughness: 0.94 });
  const beardMat = material(PALETTE.beard, { roughness: 1 });
  const shoeMat = material(PALETTE.shoe, { roughness: 0.34, metalness: 0.08 });
  const glassesMat = material(PALETTE.glasses, {
    roughness: 0.27,
    metalness: 0.74,
  });

  // Shoes and trouser legs.
  for (const side of [-1, 1]) {
    const shoe = roundedBox(0.43, 0.24, 0.68, 0.13, shoeMat);
    shoe.position.set(side * 0.27, 0.16, 0.12);
    shoe.rotation.y = side * -0.025;
    character.add(shoe);

    const leg = roundedBox(0.38, 1.05, 0.43, 0.13, suitMat);
    leg.position.set(side * 0.25, 0.75, -0.02);
    character.add(leg);
  }

  // Jacket body, open shirt, lapels, and buttons. Deliberately no tie.
  const torso = roundedBox(1.12, 1.42, 0.56, 0.2, suitMat);
  torso.position.set(0, 1.76, 0);
  torso.scale.set(1.03, 1, 0.98);
  character.add(torso);

  const shirt = roundedBox(0.36, 0.73, 0.035, 0.045, shirtMat);
  shirt.position.set(0, 2.11, 0.299);
  character.add(shirt);

  for (const side of [-1, 1]) {
    const lapelShape = new THREE.Shape();
    lapelShape.moveTo(0, 0.55);
    lapelShape.lineTo(side * 0.31, 0.17);
    lapelShape.lineTo(side * 0.13, -0.28);
    lapelShape.lineTo(0, 0.12);
    lapelShape.closePath();
    const lapel = mesh(
      new THREE.ShapeGeometry(lapelShape),
      suitLightMat,
      [0, 2.11, 0.326],
    );
    character.add(lapel);

    const collarShape = new THREE.Shape();
    collarShape.moveTo(0, 0.2);
    collarShape.lineTo(side * 0.17, 0.02);
    collarShape.lineTo(side * 0.03, -0.15);
    collarShape.closePath();
    const collar = mesh(
      new THREE.ShapeGeometry(collarShape),
      shirtMat,
      [0, 2.42, 0.338],
    );
    character.add(collar);
  }

  for (const y of [1.65, 1.43]) {
    const button = mesh(
      new THREE.SphereGeometry(0.025, 12, 8),
      glassesMat,
      [0.16, y, 0.31],
    );
    character.add(button);
  }

  // Arms and hands in a relaxed, confident pose.
  const leftArmPivot = new THREE.Group();
  leftArmPivot.position.set(-0.67, 2.21, 0);
  leftArmPivot.rotation.z = -0.08;
  character.add(leftArmPivot);
  const leftArm = roundedBox(0.36, 1.15, 0.4, 0.16, suitMat);
  leftArm.position.y = -0.48;
  leftArmPivot.add(leftArm);
  const leftHand = mesh(
    new THREE.CapsuleGeometry(0.16, 0.18, 5, 12),
    skinMat,
    [0, -1.03, 0.02],
  );
  leftArmPivot.add(leftHand);

  const rightArmPivot = new THREE.Group();
  rightArmPivot.position.set(0.68, 2.2, 0.01);
  rightArmPivot.rotation.set(0.18, 0, 0.31);
  character.add(rightArmPivot);
  const rightArm = roundedBox(0.36, 0.98, 0.4, 0.16, suitMat);
  rightArm.position.y = -0.38;
  rightArmPivot.add(rightArm);
  const rightHand = mesh(
    new THREE.CapsuleGeometry(0.16, 0.18, 5, 12),
    skinMat,
    [0, -0.9, 0.02],
  );
  rightArmPivot.add(rightHand);

  // Head and ears.
  const head = mesh(
    new THREE.SphereGeometry(0.58, 40, 32),
    skinMat,
    [0, 2.99, 0.02],
  );
  head.scale.set(0.96, 1.05, 0.92);
  character.add(head);

  for (const side of [-1, 1]) {
    const ear = mesh(
      new THREE.SphereGeometry(0.125, 20, 14),
      skinLightMat,
      [side * 0.53, 3, 0.01],
    );
    ear.scale.set(0.72, 1.08, 0.54);
    character.add(ear);
  }

  // Side-parted layered hair.
  const hairCap = mesh(
    new THREE.SphereGeometry(0.57, 36, 24, 0, Math.PI * 2, 0, Math.PI * 0.55),
    hairMat,
    [0, 3.29, -0.015],
  );
  hairCap.scale.set(0.96, 0.84, 0.92);
  character.add(hairCap);

  const hairSweep = mesh(
    new THREE.SphereGeometry(0.32, 28, 18),
    hairMat,
    [-0.15, 3.4, 0.19],
  );
  hairSweep.scale.set(1.38, 0.45, 0.58);
  hairSweep.rotation.z = -0.18;
  character.add(hairSweep);

  // Full beard, moustache, and brows.
  const beard = mesh(
    new THREE.SphereGeometry(0.47, 36, 28),
    beardMat,
    [0, 2.49, 0.24],
  );
  beard.scale.set(0.98, 0.84, 0.59);
  character.add(beard);


  for (const side of [-1, 1]) {
    const moustache = mesh(
      new THREE.CapsuleGeometry(0.055, 0.22, 5, 10),
      beardMat,
      [side * 0.11, 2.88, 0.51],
    );
    moustache.rotation.z = Math.PI / 2 + side * 0.18;
    character.add(moustache);

    const brow = mesh(
      new THREE.CapsuleGeometry(0.026, 0.17, 4, 8),
      hairMat,
      [side * 0.19, 3.1, 0.5],
    );
    brow.rotation.z = Math.PI / 2 + side * 0.04;
    character.add(brow);
  }

  // Larger eyes, warm cheeks, and tiny catchlights add a friendly toy-like charm.
  const eyeWhiteMat = material(0xf5f1e8, { roughness: 0.55 });
  const irisMat = material(0x35261f, { roughness: 0.5 });
  const catchlightMat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    toneMapped: false,
  });
  const blushMat = material(PALETTE.blush, {
    roughness: 0.72,
    transparent: true,
    opacity: 0.72,
  });
  for (const side of [-1, 1]) {
    const eye = mesh(
      new THREE.SphereGeometry(0.108, 24, 18),
      eyeWhiteMat,
      [side * 0.2, 3.08, 0.505],
    );
    eye.scale.set(1, 0.98, 0.38);
    character.add(eye);

    const iris = mesh(
      new THREE.SphereGeometry(0.052, 18, 14),
      irisMat,
      [side * 0.2, 3.072, 0.592],
    );
    character.add(iris);

    const catchlight = mesh(
      new THREE.SphereGeometry(0.014, 12, 8),
      catchlightMat,
      [side * 0.185, 3.102, 0.638],
    );
    catchlight.castShadow = false;
    character.add(catchlight);

    const cheek = mesh(
      new THREE.SphereGeometry(0.075, 18, 12),
      blushMat,
      [side * 0.38, 2.93, 0.515],
    );
    cheek.scale.set(1.2, 0.62, 0.24);
    cheek.castShadow = false;
    character.add(cheek);
  }

  // Large thin metal glasses.
  for (const side of [-1, 1]) {
    const lensFrame = mesh(
      new THREE.TorusGeometry(0.205, 0.015, 10, 40),
      glassesMat,
      [side * 0.22, 3.08, 0.59],
    );
    lensFrame.scale.set(1.08, 0.88, 1);
    character.add(lensFrame);

    const temple = roundedBox(0.26, 0.018, 0.018, 0.008, glassesMat);
    temple.position.set(side * 0.44, 3.08, 0.48);
    temple.rotation.y = side * 0.62;
    character.add(temple);
  }

  const bridge = roundedBox(0.11, 0.018, 0.018, 0.008, glassesMat);
  bridge.position.set(0, 3.08, 0.59);
  character.add(bridge);

  // Nose and a small visible lower lip.
  const nose = mesh(
    new THREE.SphereGeometry(0.075, 16, 12),
    skinLightMat,
    [0, 2.99, 0.57],
  );
  nose.scale.set(0.74, 1.2, 0.82);
  character.add(nose);

  const lip = roundedBox(0.15, 0.025, 0.018, 0.01, material(0x8e4e45));
  lip.position.set(0, 2.78, 0.59);
  character.add(lip);

  character.userData.rightArmPivot = rightArmPivot;
  character.userData.baseY = character.position.y;
  character.userData.waveStartedAt = -Infinity;
  return character;
}

function createCable(start, end, color = PALETTE.cable) {
  const midpoint = start.clone().lerp(end, 0.5);
  midpoint.y -= 0.3;
  const curve = new THREE.QuadraticBezierCurve3(start, midpoint, end);
  const cable = mesh(
    new THREE.TubeGeometry(curve, 32, 0.018, 8, false),
    material(color, { roughness: 0.58 }),
  );
  return cable;
}

function disposeObject(object) {
  object.traverse((child) => {
    if (child.geometry) child.geometry.dispose();
    if (child.material) {
      const materials = Array.isArray(child.material)
        ? child.material
        : [child.material];
      for (const item of materials) {
        if (item.map) item.map.dispose();
        item.dispose();
      }
    }
  });
}

export function createMasoodLabScene({
  container,
  canvas,
  pixelRatio = Math.min(window.devicePixelRatio || 1, 2),
  interactive = true,
  autoRotateCharacter = true,
  autoStart = true,
} = {}) {
  if (!container && !canvas) {
    throw new Error(
      "createMasoodLabScene requires a container element or an existing canvas.",
    );
  }

  const host = container ?? canvas.parentElement;
  const renderCanvas = canvas ?? document.createElement("canvas");
  if (!canvas) {
    renderCanvas.style.width = "100%";
    renderCanvas.style.height = "100%";
    renderCanvas.style.display = "block";
    renderCanvas.style.touchAction = "pan-y";
    host.appendChild(renderCanvas);
  }
  renderCanvas.setAttribute(
    "aria-label",
    "Interactive 3D engineer. Drag left or right to rotate, press arrow keys to turn, or press Enter to wave.",
  );
  renderCanvas.setAttribute("role", interactive ? "application" : "img");
  renderCanvas.tabIndex = interactive ? 0 : -1;
  renderCanvas.style.cursor = interactive ? "grab" : "default";

  const renderer = new THREE.WebGLRenderer({
    canvas: renderCanvas,
    antialias: true,
    alpha: true,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(pixelRatio);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(PALETTE.background);
  scene.fog = new THREE.Fog(PALETTE.background, 8, 16);

  const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 30);
  camera.position.set(5.7, 3.35, 7.8);
  const cameraTarget = new THREE.Vector3(0.05, 2.05, -0.68);
  camera.lookAt(cameraTarget);

  const root = new THREE.Group();
  root.name = "MasoodElectronicsLab";
  scene.add(root);

  const floorMat = material(PALETTE.floor, { roughness: 0.89 });
  const floor = mesh(new THREE.PlaneGeometry(18, 18), floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  floor.castShadow = false;
  root.add(floor);

  // A subtle inlaid floor grid makes the lab feel designed without looking futuristic.
  const grid = new THREE.GridHelper(12, 24, 0x2d5159, 0x21363d);
  grid.position.y = 0.006;
  grid.material.transparent = true;
  grid.material.opacity = 0.28;
  root.add(grid);

  const wallLab = createWallLab();
  root.add(wallLab);
  root.add(createBench());
  root.add(createCircuitBoard());

  const codeScreen = createCodeScreen([-1.35, 2.46, -1.92], [0, 0.08, 0]);
  const scopeScreen = createScopeScreen([0.85, 2.47, -1.94], [0, -0.08, 0]);
  root.add(codeScreen.group, scopeScreen.group);

  const meter = createMeter([2.07, 1.98, -1.35], [0.02, -0.2, 0]);
  root.add(meter.group);

  const cableA = createCable(
    new THREE.Vector3(1.94, 1.7, -1.25),
    new THREE.Vector3(0.7, 1.62, -1.16),
    PALETTE.red,
  );
  const cableB = createCable(
    new THREE.Vector3(2.2, 1.7, -1.28),
    new THREE.Vector3(-0.9, 1.6, -1.18),
    PALETTE.cable,
  );
  root.add(cableA, cableB);

  const character = createCharacter();
  root.add(character);

  const ambient = new THREE.HemisphereLight(0xbde4e2, 0x213039, 1.8);
  scene.add(ambient);

  const key = new THREE.DirectionalLight(0xffe1ba, 3.2);
  key.position.set(4.5, 7.5, 5);
  key.castShadow = true;
  key.shadow.mapSize.set(SHADOW_MAP_SIZE, SHADOW_MAP_SIZE);
  key.shadow.camera.left = -5;
  key.shadow.camera.right = 5;
  key.shadow.camera.top = 6;
  key.shadow.camera.bottom = -1;
  key.shadow.bias = -0.0004;
  scene.add(key);

  // Frontal fill keeps the dark suit and beard readable against the lab.
  const characterFill = new THREE.DirectionalLight(0xd8f5f3, 1.65);
  characterFill.position.set(2.5, 4.8, 5.5);
  scene.add(characterFill);

  const screenLight = new THREE.PointLight(PALETTE.cyan, 2.7, 6.5, 2);
  screenLight.position.set(-1.1, 2.55, -0.75);
  scene.add(screenLight);

  const warmPractical = new THREE.PointLight(PALETTE.amber, 1.6, 4.5, 2);
  warmPractical.position.set(2.45, 3.75, -1.2);
  scene.add(warmPractical);

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  );
  const pointer = new THREE.Vector2();
  const pointerTarget = new THREE.Vector2();
  const clock = new THREE.Clock();
  const animatedDisplays = [codeScreen, scopeScreen, meter];
  let animationFrame = 0;
  let running = false;
  let visible = true;
  let lastScreenUpdate = -Infinity;
  let disposed = false;
  let dragging = false;
  let dragMoved = false;
  let lastPointerX = 0;
  let characterRotationTarget = character.rotation.y;
  let autoRotateEnabled =
    autoRotateCharacter && !prefersReducedMotion.matches;

  function resize() {
    const rect = host.getBoundingClientRect();
    const width = Math.max(1, Math.round(rect.width));
    const height = Math.max(1, Math.round(rect.height));
    renderer.setSize(width, height, false);
    camera.aspect = width / height;

    // Pull back slightly on portrait layouts so the full figure remains visible.
    const portraitOffset = THREE.MathUtils.clamp(1.15 - camera.aspect, 0, 0.7);
    camera.fov = 36 + portraitOffset * 12;
    camera.updateProjectionMatrix();
  }

  function onPointerMove(event) {
    if (!interactive) return;
    if (dragging) {
      const movement = event.clientX - lastPointerX;
      lastPointerX = event.clientX;
      if (Math.abs(movement) > 0.5) dragMoved = true;
      characterRotationTarget += movement * 0.012;
      autoRotateEnabled = false;
      return;
    }
    if (prefersReducedMotion.matches) return;
    const rect = renderCanvas.getBoundingClientRect();
    pointerTarget.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointerTarget.y = -(((event.clientY - rect.top) / rect.height) * 2 - 1);
  }

  function onPointerDown(event) {
    if (!interactive) return;
    dragging = true;
    dragMoved = false;
    lastPointerX = event.clientX;
    renderCanvas.style.cursor = "grabbing";
    renderCanvas.setPointerCapture?.(event.pointerId);
    renderCanvas.focus({ preventScroll: true });
  }

  function onPointerUp(event) {
    if (!interactive || !dragging) return;
    dragging = false;
    renderCanvas.style.cursor = "grab";
    if (renderCanvas.hasPointerCapture?.(event.pointerId)) {
      renderCanvas.releasePointerCapture(event.pointerId);
    }
    if (!dragMoved) wave();
  }

  function onPointerLeave() {
    if (dragging) return;
    pointerTarget.set(0, 0);
  }

  function onKeyDown(event) {
    if (!interactive) return;
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
      rotateBy(event.key === "ArrowLeft" ? -Math.PI / 8 : Math.PI / 8);
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      wave();
    }
  }

  function rotateBy(radians = Math.PI / 2) {
    autoRotateEnabled = false;
    characterRotationTarget += radians;
  }

  function setAutoRotate(enabled) {
    autoRotateEnabled = Boolean(enabled) && !prefersReducedMotion.matches;
  }

  function wave() {
    character.userData.waveStartedAt = clock.elapsedTime;
  }

  function renderFrame() {
    if (!running || disposed) return;
    animationFrame = requestAnimationFrame(renderFrame);
    if (!visible) return;

    const delta = Math.min(clock.getDelta(), 0.05);
    const elapsed = clock.elapsedTime;
    const timeMs = elapsed * 1000;
    pointer.lerp(pointerTarget, 0.055);

    if (autoRotateEnabled) {
      characterRotationTarget += delta * 0.24;
    }
    character.rotation.y = THREE.MathUtils.damp(
      character.rotation.y,
      characterRotationTarget,
      9,
      delta,
    );

    if (!prefersReducedMotion.matches) {
      character.position.y =
        character.userData.baseY +
        Math.sin(elapsed * 2.25) * 0.022 +
        Math.sin(elapsed * 4.5) * 0.006;
      const waveAge = elapsed - character.userData.waveStartedAt;
      const waveEnvelope =
        waveAge >= 0 && waveAge < 1.35
          ? Math.sin((waveAge / 1.35) * Math.PI)
          : 0;
      const waveMotion =
        Math.sin(waveAge * Math.PI * 5.5) * waveEnvelope * 0.42;
      character.userData.rightArmPivot.rotation.z =
        0.31 + Math.sin(elapsed * 1.1) * 0.025 + waveMotion;
      character.userData.rightArmPivot.rotation.x =
        0.18 - Math.abs(waveMotion) * 0.35;

      camera.position.x = 5.7 + pointer.x * 0.23;
      camera.position.y = 3.35 + pointer.y * 0.14;
      camera.lookAt(cameraTarget);
    }

    // Canvas textures do not need to redraw at monitor refresh rate.
    if (timeMs - lastScreenUpdate > 100) {
      for (const display of animatedDisplays) display.update(timeMs);
      lastScreenUpdate = timeMs;
    }

    renderer.render(scene, camera);
  }

  function start() {
    if (running || disposed) return;
    running = true;
    clock.start();
    renderFrame();
  }

  function stop() {
    running = false;
    cancelAnimationFrame(animationFrame);
    clock.stop();
  }

  function setVisible(entryOrBoolean) {
    visible =
      typeof entryOrBoolean === "boolean"
        ? entryOrBoolean
        : entryOrBoolean.isIntersecting;
  }

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(host);

  const intersectionObserver = new IntersectionObserver(
    (entries) => setVisible(entries[0]),
    { threshold: 0.02 },
  );
  intersectionObserver.observe(renderCanvas);

  renderCanvas.addEventListener("pointerdown", onPointerDown);
  renderCanvas.addEventListener("pointermove", onPointerMove, {
    passive: true,
  });
  renderCanvas.addEventListener("pointerup", onPointerUp);
  renderCanvas.addEventListener("pointercancel", onPointerUp);
  renderCanvas.addEventListener("pointerleave", onPointerLeave, {
    passive: true,
  });
  renderCanvas.addEventListener("keydown", onKeyDown);

  resize();
  renderer.render(scene, camera);
  if (autoStart) start();

  function dispose() {
    if (disposed) return;
    stop();
    disposed = true;
    resizeObserver.disconnect();
    intersectionObserver.disconnect();
    renderCanvas.removeEventListener("pointerdown", onPointerDown);
    renderCanvas.removeEventListener("pointermove", onPointerMove);
    renderCanvas.removeEventListener("pointerup", onPointerUp);
    renderCanvas.removeEventListener("pointercancel", onPointerUp);
    renderCanvas.removeEventListener("pointerleave", onPointerLeave);
    renderCanvas.removeEventListener("keydown", onKeyDown);

    codeScreen.dispose();
    scopeScreen.dispose();
    meter.dispose();
    wallLab.userData.dispose?.();
    disposeObject(root);
    renderer.dispose();
    renderer.forceContextLoss();
    if (!canvas && renderCanvas.parentElement === host) {
      host.removeChild(renderCanvas);
    }
  }

  return {
    scene,
    camera,
    renderer,
    character,
    root,
    start,
    stop,
    resize,
    rotateBy,
    setAutoRotate,
    wave,
    dispose,
  };
}

export default createMasoodLabScene;
