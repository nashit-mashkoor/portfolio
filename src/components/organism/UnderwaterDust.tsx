'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { seeded } from '@/lib/noise';

const COUNT = 120;

export default function UnderwaterDust() {
  const ref = useRef<THREE.Points>(null);

  const { geometry, speeds, phases } = useMemo(() => {
    const pos = new Float32Array(COUNT * 3);
    const spd = new Float32Array(COUNT);
    const ph = new Float32Array(COUNT);
    for (let i = 0; i < COUNT; i++) {
      pos[i * 3] = (seeded(i) - 0.5) * 28;
      pos[i * 3 + 1] = (seeded(i + 100) - 0.5) * 28;
      pos[i * 3 + 2] = (seeded(i + 200) - 0.5) * 8 - 2;
      spd[i] = 0.04 + seeded(i + 300) * 0.15;
      ph[i] = seeded(i + 400);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    return { geometry: geo, speeds: spd, phases: ph };
  }, []);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    const positions = ref.current.geometry.attributes.position;
    const arr = positions.array as Float32Array;
    for (let i = 0; i < COUNT; i++) {
      arr[i * 3] += Math.sin(t * speeds[i] * 0.5 + phases[i] * 8) * 0.002;
      arr[i * 3 + 1] += Math.cos(t * speeds[i] * 0.3 + phases[i] * 5) * 0.003;
      arr[i * 3 + 2] += Math.sin(t * speeds[i] * 0.2 + phases[i] * 3) * 0.001;
    }
    positions.needsUpdate = true;
  });

  return (
    <points ref={ref} geometry={geometry}>
      <pointsMaterial
        color="#1a4a5a"
        size={0.025}
        transparent
        opacity={0.15}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}
