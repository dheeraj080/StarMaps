import * as THREE from "three";
import { useEffect, useMemo, useRef } from "react"; // Removed 'React'
import { useFrame, useThree } from "@react-three/fiber";
import CameraControls from "camera-controls";

CameraControls.install({ THREE });

type Props = {
  radius: number; // globe radius in scene units
};

function intersectSphere(origin: THREE.Vector3, dir: THREE.Vector3, r: number) {
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
  // Removed 'size' as it was causing TS6133
  const { camera, gl } = useThree();
  const controlsRef = useRef<CameraControls | null>(null);

  const raycaster = useMemo(() => new THREE.Raycaster(), []);
  const ndc = useMemo(() => new THREE.Vector2(), []);

  useEffect(() => {
    const controls = new CameraControls(camera, gl.domElement);
    controlsRef.current = controls;

    controls.dollyToCursor = true;
    controls.dragToOffset = true;
    controls.minDistance = radius * 1.05;
    controls.maxDistance = radius * 200;
    controls.smoothTime = 0.15;

    controls.mouseButtons.left = CameraControls.ACTION.ROTATE;
    controls.mouseButtons.middle = CameraControls.ACTION.DOLLY;
    controls.mouseButtons.right = CameraControls.ACTION.TRUCK;

    controls.touches.one = CameraControls.ACTION.TOUCH_ROTATE;
    // FIX: TOUCH_TRUCK_DOLLY -> TOUCH_ZOOM_TRUCK (Standard CameraControls API)
    controls.touches.two = CameraControls.ACTION.TOUCH_ZOOM_TRUCK;

    controls.setLookAt(0, 0, radius * 3, 0, 0, 0, false);

    // FIX: .destroy() -> .dispose()
    return () => controls.dispose();
  }, [camera, gl.domElement, radius]);

  useFrame((_, delta) => {
    const controls = controlsRef.current;
    if (!controls) return;

    controls.update(delta);

    const target = controls.getTarget(new THREE.Vector3());
    const len = target.length();
    if (len > 0.0001) {
      target.setLength(radius);
      controls.setTarget(target.x, target.y, target.z, false);
    }
  });

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

      const dir = hit.clone().normalize();
      const newCam = dir.clone().multiplyScalar(radius * 2.5);

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
