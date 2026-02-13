import * as THREE from "three";
import React, { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import CameraControls from "camera-controls";

CameraControls.install({ THREE });

type Props = {
  radius: number; // globe radius in scene units
};

function intersectSphere(origin: THREE.Vector3, dir: THREE.Vector3, r: number) {
  // Solve |o + t d|^2 = r^2
  const a = dir.dot(dir);
  const b = 2 * origin.dot(dir);
  const c = origin.dot(origin) - r * r;
  const disc = b * b - 4 * a * c;
  if (disc <= 0) return null;
  const t = (-b - Math.sqrt(disc)) / (2 * a);
  if (t <= 0) return null;
  return origin.clone().add(dir.clone().multiplyScalar(t));
}

export function GlobeControls({ radius }: Props) {
  const { camera, gl, size } = useThree();
  const controlsRef = useRef<CameraControls | null>(null);

  // A shared raycaster for “zoom to cursor”
  const raycaster = useMemo(() => new THREE.Raycaster(), []);
  const ndc = useMemo(() => new THREE.Vector2(), []);

  useEffect(() => {
    const controls = new CameraControls(camera, gl.domElement);
    controlsRef.current = controls;

    // Cesium-ish defaults
    controls.dollyToCursor = true; // BIG one: zoom towards mouse
    controls.dragToOffset = true; // pan moves target
    controls.minDistance = radius * 1.05; // don’t go inside Earth
    controls.maxDistance = radius * 200; // far zoom
    controls.smoothTime = 0.15; // inertia feel
    controls.mouseButtons.left = CameraControls.ACTION.ROTATE;
    controls.mouseButtons.middle = CameraControls.ACTION.DOLLY;
    controls.mouseButtons.right = CameraControls.ACTION.TRUCK; // pan
    controls.touches.one = CameraControls.ACTION.TOUCH_ROTATE;
    controls.touches.two = CameraControls.ACTION.TOUCH_TRUCK_DOLLY;

    // Initial view
    controls.setLookAt(0, 0, radius * 3, 0, 0, 0, false);

    return () => controls.destroy();
  }, [camera, gl.domElement, radius]);

  // OPTIONAL: keep target on/near the globe when panning
  // (Cesium pans across the surface)
  useFrame((_, delta) => {
    const controls = controlsRef.current;
    if (!controls) return;

    // Update controls
    controls.update(delta);

    // Clamp target to globe surface if it drifts away
    const target = controls.getTarget(new THREE.Vector3());
    const len = target.length();
    if (len > 0.0001) {
      // Keep target near surface
      target.setLength(radius);
      controls.setTarget(target.x, target.y, target.z, false);
    }
  });

  // Cesium-like: double click flies to the clicked surface point
  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls) return;

    const onDblClick = (ev: MouseEvent) => {
      const rect = gl.domElement.getBoundingClientRect();
      const x = ((ev.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((ev.clientY - rect.top) / rect.height) * 2 - 1);
      ndc.set(x, y);

      raycaster.setFromCamera(ndc, camera);
      const hit = intersectSphere(
        raycaster.ray.origin,
        raycaster.ray.direction,
        radius,
      );
      if (!hit) return;

      // Fly close-ish to that point
      const camPos = camera.position.clone();
      const dir = hit.clone().normalize();
      const newCam = dir.clone().multiplyScalar(radius * 2.5); // tune

      controls.setLookAt(
        newCam.x,
        newCam.y,
        newCam.z,
        hit.x,
        hit.y,
        hit.z,
        true,
      );
    };

    gl.domElement.addEventListener("dblclick", onDblClick);
    return () => gl.domElement.removeEventListener("dblclick", onDblClick);
  }, [camera, gl.domElement, ndc, radius, raycaster]);

  return null;
}
