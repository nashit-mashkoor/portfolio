'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line, Html } from '@react-three/drei';
import * as THREE from 'three';
import { seeded, fractalNoise } from '@/lib/noise';
import { CATEGORY_COLORS, COLORS, NODE_SIZES } from '@/lib/constants';
import { projects, categories } from '@/data/projects';

interface Props {
  centerNodeId: string;
  centerPosition: [number, number, number];
  centerColor: string;
  isActive: (id: string) => boolean;
  isExplored: (id: string) => boolean;
  onNodeClick: (nodeId: string) => void;
  onNodeHover: (nodeId: string, hovered: boolean) => void;
}

export default function OrbitalRing({
  centerNodeId,
  centerPosition,
  centerColor,
  isActive,
  isExplored,
  onNodeClick,
  onNodeHover,
}: Props) {
  const groupRef = useRef<THREE.Group>(null);
  const ringRefs = useRef<THREE.Mesh[]>([]);

  const children = useMemo(() => {
    const isCategory = categories.some((c) => c.id === centerNodeId);
    if (isCategory) {
      return projects.filter((p) => p.category === centerNodeId);
    }
    return categories;
  }, [centerNodeId]);

  const orbitRadius = 2.5;
  const childData = useMemo(() => {
    return children.map((child, i) => {
      const angle = (Math.PI * 2 * i) / children.length - Math.PI / 2;
      const seed = seeded(child.id.length * 11.3);
      const bobSpeed = 0.4 + seed * 0.6;
      const bobAmp = 0.08 + seed * 0.1;
      const color = categories.some((c) => c.id === child.id)
        ? CATEGORY_COLORS[child.id] || COLORS.cyan
        : CATEGORY_COLORS[centerNodeId] || COLORS.cyan;
      const size = categories.some((c) => c.id === child.id)
        ? NODE_SIZES.category
        : NODE_SIZES.project;
      return { child, angle, seed, bobSpeed, bobAmp, color, size };
    });
  }, [children, centerNodeId]);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();
    groupRef.current.rotation.z = t * 0.15;

    ringRefs.current.forEach((ring, i) => {
      if (!ring) return;
      const d = childData[i];
      const pulse = 0.8 + fractalNoise(t * 1.5 + d.seed * 5, 2) * 0.4;
      ring.scale.setScalar(pulse);
    });
  });

  const centerLines = useMemo(() => {
    return childData.map((d) => {
      const x = Math.cos(d.angle) * orbitRadius;
      const y = Math.sin(d.angle) * orbitRadius;
      return {
        points: [
          [0, 0, 0] as [number, number, number],
          [x, y, 0] as [number, number, number],
        ] as [number, number, number][],
        color: d.color,
      };
    });
  }, [childData, orbitRadius]);

  return (
    <group ref={groupRef} position={centerPosition}>
      {centerLines.map((line, i) => (
        <Line
          key={`line-${i}`}
          points={line.points}
          color={line.color}
          transparent
          opacity={0.4}
          lineWidth={1}
        />
      ))}

      <mesh>
        <ringGeometry args={[orbitRadius - 0.02, orbitRadius + 0.02, 64]} />
        <meshBasicMaterial
          color={centerColor}
          transparent
          opacity={0.15}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {childData.map((d, i) => {
        const x = Math.cos(d.angle) * orbitRadius;
        const y = Math.sin(d.angle) * orbitRadius;
        const active = isActive(d.child.id);
        const explored = isExplored(d.child.id);
        const opacity = active ? 1 : explored ? 0.8 : 0.5;
        const emissive = active ? 4 : explored ? 2.5 : 1.2;

        return (
          <group key={d.child.id}>
            <mesh
              ref={(el) => { if (el) ringRefs.current[i] = el; }}
              position={[x, y, 0]}
              onClick={(e) => { e.stopPropagation(); onNodeClick(d.child.id); }}
              onPointerOver={() => onNodeHover(d.child.id, true)}
              onPointerOut={() => onNodeHover(d.child.id, false)}
            >
              <sphereGeometry args={[d.size, 24, 24]} />
              <meshPhysicalMaterial
                color={d.color}
                emissive={d.color}
                emissiveIntensity={emissive}
                roughness={0.2}
                metalness={0.3}
                clearcoat={1}
                clearcoatRoughness={0.2}
                transparent
                opacity={opacity}
              />
            </mesh>

            <mesh position={[x, y, 0]}>
              <sphereGeometry args={[d.size * 2.5, 12, 12]} />
              <meshBasicMaterial
                color={d.color}
                transparent
                opacity={active ? 0.18 : 0.06}
                depthWrite={false}
              />
            </mesh>

            <Html
              center
              position={[x, y, 0]}
              distanceFactor={6}
              style={{ pointerEvents: 'none', userSelect: 'none' }}
            >
              <div style={{
                color: d.color,
                fontSize: '10px',
                fontWeight: 500,
                fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
                textShadow: `0 0 15px ${d.color}88`,
                whiteSpace: 'nowrap',
                opacity: opacity * 0.9,
              }}>
                {d.child.label}
              </div>
            </Html>
          </group>
        );
      })}
    </group>
  );
}
