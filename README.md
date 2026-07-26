# Masood Salik — Interactive 3D Character Lab

This prototype is intentionally separate from the portfolio. Its purpose is to approve the actual 3D character and interaction system before the rest of the website is built around it.

## Run locally

Double-click `PREVIEW-CHARACTER.cmd`, then open:

`http://127.0.0.1:4180`

## Interactions

- Move the cursor: Masood’s head, pupils, and camera follow it.
- Drag: rotate the complete 3D scene.
- Click: trigger a wave.
- Scroll: transition from the electronics workbench into the systems scanner and project-module states.
- Hover project rows: the corresponding 3D project module reacts.

## Character decisions encoded in the model

- Small eye proportions.
- Full but controlled dark beard.
- Silver aviator glasses.
- Full short dark hair.
- Narrower and longer face profile with a visible mouth.
- Deep-navy two-piece suit, open white collar, and no tie.
- Smaller scale relative to the engineering desk.
- Stylised, approachable proportions matching the supplied WebGL reference.
- Workbench monitors show circuit traces and a meter.

## Architecture

The character and environment are real Three.js geometry. No rendered character image is used in the WebGL scene. `scene.js` constructs the mesh, materials, rig pivots, workbench, scanner, and floating project modules.

Three.js is vendored locally in `vendor/three.module.min.js`, so the finished site does not depend on a CDN.
