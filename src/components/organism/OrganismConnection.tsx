'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line } from '@react-three/drei';
import * as THREE from 'three';
import { seeded, fractalNoise } from '@/lib/noise';

interface Props {
  id: string;
  from: [number, number, number];
  to: [number, number, number];
  color?: string;
  isActive: boolean;
  isExplored: boolean;
  depthFactor: number;
  fade?: number;
}

export default function OrganismConnection({
  id,
  from,
  to,
  color,
  isActive,
  isExplored,
  depthFactor,
  fade = 1,
}: Props) {
  const particleRefs = useRef<(THREE.Mesh | null)[]>([]);
  const tubeRef = useRef<THREE.Mesh>(null);
  const progress = useRef(0);

  const seed = useMemo(() => seeded(id.length * 7.7 + id.charCodeAt(0)), [id]);
  const flowSpeed = 0.35 + seed * 0.45;

  const { curve, tubeGeometry, linePoints } = useMemo(() => {
    const start = new THREE.Vector3(...from);
    const end = new THREE.Vector3(...to);
    const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
    const dir = new THREE.Vector3().subVectors(end, start).normalize();
    const up = new THREE.Vector3(0, 0, 1);
    const right = new THREE.Vector3().crossVectors(dir, up).normalize();
    if (right.length() < 0.01) right.set(1, 0, 0);
    const dist = start.distanceTo(end);
    const bulge = dist * 0.15;
    mid.add(right.multiplyScalar(bulge * (seeded(id.length * 2.2) - 0.5) * 2));
    mid.z += (seeded(id.length * 5.5) - 0.5) * 0.8;
    const c = new THREE.QuadraticBezierCurve3(start, mid, end);
    const pts = c.getPoints(48).map((p) => [p.x, p.y, p.z] as [number, number, number]);
    const tube = new THREE.TubeGeometry(c, 32, 0.012, 6, false);
    return { curve: c, tubeGeometry: tube, linePoints: pts };
  }, [from, to, id]);

  const lineColor = color || '#00f5d4';
  const baseOpacity = (isActive ? 0.85 : isExplored ? 0.38 : 0.2) * depthFactor * fade;

  const particles = useMemo(() => {
    const count = isActive ? 6 : 3;
    return Array.from({ length: count }, (_, i) => ({
      offset: i / count + seed * 0.13,
      speed: 0.7 + seeded(i * 5 + seed * 31) * 0.5,
      scale: 0.05 + seeded(i * 7 + seed * 17) * 0.04,
    }));
  }, [isActive, seed]);

  useFrame((_, delta) => {
    const flow = (isActive ? 1 : isExplored ? 0.45 : 0) * flowSpeed;
    if (flow > 0) {
      progress.current = (progress.current + delta * flow) % 1;
    }

    if (tubeRef.current) {
      const tm = tubeRef.current.material as THREE.MeshBasicMaterial;
      const targetTube = (isActive ? 0.35 : isExplored ? 0.12 : 0.04) * depthFactor * fade;
      tm.opacity = THREE.MathUtils.lerp(tm.opacity, targetTube, delta * 3);
    }

    particleRefs.current.forEach((mesh, i) => {
      if (!mesh) return;
      const p = particles[i % particles.length];
      const t = (progress.current + p.offset) % 1;
      const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      const point = curve.getPoint(eased);
      mesh.position.copy(point);
      const pulse = fractalNoise(t * 6 + seed * 9, 2);
      const s = p.scale * (isActive ? 1.8 : 1) * (0.7 + pulse * 0.6);
      mesh.scale.setScalar(Math.max(s, 0.01));
      const m = mesh.material as THREE.MeshBasicMaterial;
      const targetOpacity = (isActive || isExplored ? (isActive ? 0.9 : 0.45) : 0) * depthFactor * fade;
      m.opacity = THREE.MathUtils.lerp(m.opacity, targetOpacity * (0.5 + pulse * 0.5), delta * 4);
    });
  });

  return (
    <group>
      <Line
        points={linePoints}
        color={lineColor}
        transparent
        opacity={baseOpacity}
        lineWidth={1.5}
      />

      <mesh ref={tubeRef} geometry={tubeGeometry}>
        <meshBasicMaterial color={lineColor} transparent opacity={0.04} depthWrite={false} />
      </mesh>

      <mesh position={from}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshBasicMaterial color={lineColor} transparent opacity={baseOpacity * 0.7} depthWrite={false} />
      </mesh>
      <mesh position={to}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshBasicMaterial color={lineColor} transparent opacity={baseOpacity * 0.7} depthWrite={false} />
      </mesh>

      {particles.map((p, i) => (
        <mesh
          key={i}
          ref={(el) => { particleRefs.current[i] = el; }}
        >
          <sphereGeometry args={[p.scale, 10, 10]} />
          <meshBasicMaterial color={lineColor} transparent opacity={0} depthWrite={false} />
        </mesh>
      ))}
    </group>
  );
}