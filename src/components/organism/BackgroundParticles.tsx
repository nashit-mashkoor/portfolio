'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { seeded } from '@/lib/noise';

const PARTICLE_COUNT = 300;

export default function BackgroundParticles() {
  const pointsRef = useRef<THREE.Points>(null);

  const { geometry, phases } = useMemo(() => {
    const pos = new Float32Array(PARTICLE_COUNT * 3);
    const ph = new Float32Array(PARTICLE_COUNT);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      pos[i * 3] = (seeded(i * 3) - 0.5) * 50;
      pos[i * 3 + 1] = (seeded(i * 3 + 1) - 0.5) * 50;
      pos[i * 3 + 2] = (seeded(i * 3 + 2) - 0.5) * 20 - 5;
      ph[i] = seeded(i + 500) * Math.PI * 2;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    return { geometry: geo, phases: ph };
  }, []);

  useFrame(({ clock }) => {
    if (!pointsRef.current) return;
    const t = clock.getElapsedTime();
    const positions = pointsRef.current.geometry.attributes.position;
    const arr = positions.array as Float32Array;
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const ph = phases[i];
      arr[i * 3] += Math.sin(t * 0.05 + ph) * 0.003;
      arr[i * 3 + 1] += Math.cos(t * 0.04 + ph * 0.7) * 0.003;
      arr[i * 3 + 2] += Math.sin(t * 0.03 + ph * 1.3) * 0.001;
    }
    positions.needsUpdate = true;
    pointsRef.current.rotation.y = t * 0.008;
  });

  return (
    <points ref={pointsRef} geometry={geometry}>
      <pointsMaterial
        color="#1a3a5a"
        size={0.035}
        transparent
        opacity={0.25}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}
