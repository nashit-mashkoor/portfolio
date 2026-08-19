'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { seeded } from '@/lib/noise';

interface Props {
  position: [number, number, number];
  color: string;
  active: boolean;
  opacity?: number;
}

const RINGS = [
  { size: 0.7, speed: 1.6 },
  { size: 1.1, speed: 1.1 },
  { size: 1.6, speed: 0.75 },
];

export default function ClickRipple({ position, color, active, opacity = 1 }: Props) {
  const groupRef = useRef<THREE.Group>(null);
  const ringRefs = useRef<(THREE.Mesh | null)[]>([]);
  const time = useRef(0);
  const lastActive = useRef(false);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    if (active && !lastActive.current) time.current = 0;
    lastActive.current = active;

    if (!active) {
      time.current = Math.max(time.current - delta * 1.2, 0);
    } else {
      time.current = Math.min(time.current + delta * 0.55, 1);
    }

    const groupScale = 1 + time.current * 0.15;
    groupRef.current.scale.setScalar(groupScale);

    ringRefs.current.forEach((ring, i) => {
      if (!ring) return;
      const cfg = RINGS[i % RINGS.length];
      const seed = seeded(i * 7.3 + position[0] * 3);
      const delay = seed * 0.35;
      const t = Math.max(0, time.current - delay);
      const eased = 1 - Math.pow(1 - t, 3);
      const scale = 1 + eased * 3.2 * cfg.speed;
      ring.scale.set(scale, scale, 1);
      const m = ring.material as THREE.MeshBasicMaterial;
      m.opacity = Math.pow(Math.max(0, 1 - t), 1.6) * 0.45 * opacity;
    });
  });

  if (opacity < 0.01) return null;

  return (
    <group ref={groupRef} position={position}>
      {RINGS.map((_, i) => (
        <mesh
          key={i}
          ref={(el) => { ringRefs.current[i] = el; }}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <ringGeometry args={[RINGS[i].size, RINGS[i].size + 0.045, 64]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={0}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
}
