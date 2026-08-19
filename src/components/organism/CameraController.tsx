'use client';

import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

interface Props {
  zoomTarget: [number, number, number] | null;
  overviewPosition: [number, number, number];
}

export default function CameraController({ zoomTarget, overviewPosition }: Props) {
  const { camera } = useThree();
  const currentTarget = useRef(new THREE.Vector3(0, 0, 0));
  const currentPos = useRef(new THREE.Vector3(...overviewPosition));
  const isAnimating = useRef(false);

  useEffect(() => {
    currentPos.current.copy(camera.position);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useFrame((_, delta) => {
    if (zoomTarget) {
      isAnimating.current = true;
      const tx = zoomTarget[0];
      const ty = zoomTarget[1];
      const tz = zoomTarget[2];

      currentTarget.current.x = THREE.MathUtils.lerp(currentTarget.current.x, tx, 1 - Math.pow(0.06, delta));
      currentTarget.current.y = THREE.MathUtils.lerp(currentTarget.current.y, ty, 1 - Math.pow(0.06, delta));
      currentTarget.current.z = THREE.MathUtils.lerp(currentTarget.current.z, tz, 1 - Math.pow(0.06, delta));

      const zoomDist = 8;
      const px = tx + zoomDist * 0.3;
      const py = ty + zoomDist * 0.4;
      const pz = tz + zoomDist;

      currentPos.current.x = THREE.MathUtils.lerp(currentPos.current.x, px, 1 - Math.pow(0.06, delta));
      currentPos.current.y = THREE.MathUtils.lerp(currentPos.current.y, py, 1 - Math.pow(0.06, delta));
      currentPos.current.z = THREE.MathUtils.lerp(currentPos.current.z, pz, 1 - Math.pow(0.06, delta));

      camera.position.copy(currentPos.current);
      camera.lookAt(currentTarget.current);
    } else if (isAnimating.current) {
      currentTarget.current.x = THREE.MathUtils.lerp(currentTarget.current.x, 0, 1 - Math.pow(0.04, delta));
      currentTarget.current.y = THREE.MathUtils.lerp(currentTarget.current.y, 0, 1 - Math.pow(0.04, delta));
      currentTarget.current.z = THREE.MathUtils.lerp(currentTarget.current.z, 0, 1 - Math.pow(0.04, delta));

      currentPos.current.x = THREE.MathUtils.lerp(currentPos.current.x, overviewPosition[0], 1 - Math.pow(0.04, delta));
      currentPos.current.y = THREE.MathUtils.lerp(currentPos.current.y, overviewPosition[1], 1 - Math.pow(0.04, delta));
      currentPos.current.z = THREE.MathUtils.lerp(currentPos.current.z, overviewPosition[2], 1 - Math.pow(0.04, delta));

      camera.position.copy(currentPos.current);
      camera.lookAt(currentTarget.current);

      const dist = camera.position.distanceTo(new THREE.Vector3(overviewPosition[0], overviewPosition[1], overviewPosition[2]));
      if (dist < 0.01) {
        isAnimating.current = false;
      }
    }
  });

  return null;
}
