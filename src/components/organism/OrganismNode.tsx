'use client';

import { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { NODE_SIZES, COLORS, CATEGORY_COLORS } from '@/lib/constants';
import { seeded, fractalNoise } from '@/lib/noise';

interface Props {
  id: string;
  label: string;
  position: [number, number, number];
  type: 'root' | 'category' | 'project';
  category?: string;
  isActive: boolean;
  isExplored: boolean;
  depthFactor: number;
  overviewOpacity: number;
  isZoomCenter: boolean;
  onClick: () => void;
  onHover?: (hovered: boolean) => void;
}

export default function OrganismNode({
  id,
  label,
  position,
  type,
  category,
  isActive,
  isExplored,
  depthFactor,
  overviewOpacity,
  isZoomCenter,
  onClick,
  onHover,
}: Props) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const burstRef = useRef<THREE.Points>(null);
  const outerGroupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const burstTime = useRef(0);
  const scaleVel = useRef(0);
  const glowVel = useRef(0);

  const seed = useMemo(() => seeded(id.length * 13.37 + id.charCodeAt(0)), [id]);
  const phase = seed * Math.PI * 2;
  const bobSpeed = 0.5 + seeded(id.length) * 0.7;
  const bobAmp = 0.06 + seeded(id.length + 1) * 0.08;
  const flickerSpeed = 1.5 + seeded(id.length + 2) * 2.5;
  const spinSpeed = (seeded(id.length + 3) - 0.5) * 0.4;

  const baseColor = type === 'root' ? COLORS.white : CATEGORY_COLORS[category || ''] || COLORS.cyan;
  const size = type === 'root' ? NODE_SIZES.root : type === 'category' ? NODE_SIZES.category : NODE_SIZES.project;

  const burstGeometry = useMemo(() => {
    const count = 40;
    const pos = new Float32Array(count * 3);
    const vel = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const theta = seeded(i * 3 + seed * 99) * Math.PI * 2;
      const phi = Math.acos(2 * seeded(i * 3 + 1 + seed * 99) - 1);
      const r = 0.4 + seeded(i * 3 + 2) * 0.9;
      vel[i * 3] = Math.sin(phi) * Math.cos(theta) * r;
      vel[i * 3 + 1] = Math.sin(phi) * Math.sin(theta) * r;
      vel[i * 3 + 2] = Math.cos(phi) * r;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    return { geometry: geo, velocity: vel };
  }, [seed]);

  useFrame(({ clock, pointer }, delta) => {
    if (!outerGroupRef.current || !meshRef.current) return;
    const t = clock.getElapsedTime() + phase;

    const bobX = Math.sin(t * bobSpeed * 0.6 + seed * 3) * bobAmp * 0.5;
    const bobY = Math.sin(t * bobSpeed) * bobAmp + fractalNoise(t * 0.4, 2) * 0.03;
    outerGroupRef.current.position.x = position[0] + bobX;
    outerGroupRef.current.position.y = position[1] + bobY;

    meshRef.current.rotation.x = THREE.MathUtils.lerp(
      meshRef.current.rotation.x,
      pointer.x * 0.04,
      delta * 2
    );
    meshRef.current.rotation.z = THREE.MathUtils.lerp(
      meshRef.current.rotation.z,
      pointer.y * 0.03,
      delta * 2
    );
    meshRef.current.rotation.y += delta * spinSpeed;

    const targetScale = isZoomCenter ? 2.2 : isActive ? 1.6 : hovered ? 1.22 : 1;
    const k = 10;
    const force = k * k * 0.25 * (targetScale - meshRef.current.scale.x) - k * 0.7 * scaleVel.current;
    scaleVel.current += force * delta;
    scaleVel.current *= 0.9;
    const s = meshRef.current.scale.x + scaleVel.current * delta;
    meshRef.current.scale.setScalar(s);

    const mat = meshRef.current.material as THREE.MeshPhysicalMaterial;
    const flicker = isActive || type === 'root'
      ? 1
      : 0.75 + fractalNoise(t * flickerSpeed, 2) * 0.35;
    const base = isActive ? 5 : isExplored ? 3 : hovered ? 2.6 : 1.1;
    const targetEmissive = base * flicker * depthFactor;
    const eK = 5;
    const eForce = eK * eK * 0.25 * (targetEmissive - mat.emissiveIntensity) - eK * 0.7 * glowVel.current;
    glowVel.current += eForce * delta;
    glowVel.current *= 0.9;
    mat.emissiveIntensity = Math.max(0.2, mat.emissiveIntensity + glowVel.current * delta);

    const targetOpacity = (isExplored || isActive || type === 'root' ? 1 : 0.45) * depthFactor * overviewOpacity;
    mat.opacity = THREE.MathUtils.lerp(mat.opacity, targetOpacity, delta * 6);

    if (glowRef.current) {
      const gs = s * (isActive ? 4.5 : hovered ? 3 : 2.2);
      glowRef.current.scale.setScalar(gs);
      const glowTarget = (isActive ? 0.25 : hovered ? 0.14 : 0.06 + fractalNoise(t * 1.2, 2) * 0.03) * depthFactor * overviewOpacity;
      const gm = glowRef.current.material as THREE.MeshBasicMaterial;
      gm.opacity = THREE.MathUtils.lerp(gm.opacity, glowTarget, delta * 6);
    }

    if (ringRef.current) {
      const rs = isActive ? s * 2.5 + Math.sin(t * 3) * 0.25 : 0;
      ringRef.current.scale.setScalar(Math.max(rs, 0.001));
      (ringRef.current.material as THREE.MeshBasicMaterial).opacity = isActive
        ? 0.35 + Math.sin(t * 4) * 0.15
        : 0;
      ringRef.current.rotation.x = t * 0.4;
      ringRef.current.rotation.y = t * 0.6;
    }

    if (burstRef.current && isActive) {
      burstTime.current = Math.min(burstTime.current + delta * 1.8, 1);
      const positions = burstRef.current.geometry.attributes.position;
      const vel = burstGeometry.velocity;
      const arr = positions.array as Float32Array;
      const ease = 1 - Math.pow(1 - burstTime.current, 2.2);
      for (let i = 0; i < 40; i++) {
        arr[i * 3] = vel[i * 3] * ease;
        arr[i * 3 + 1] = vel[i * 3 + 1] * ease;
        arr[i * 3 + 2] = vel[i * 3 + 2] * ease;
      }
      positions.needsUpdate = true;
      const pm = burstRef.current.material as THREE.PointsMaterial;
      pm.opacity = Math.pow(1 - burstTime.current, 1.5) * 0.9;
      pm.size = 0.05 + burstTime.current * 0.03;
    } else if (burstRef.current) {
      burstTime.current = 0;
    }
  });

  const labelOpacity = (isActive || isExplored || type === 'root' ? 1 : 0.45) * depthFactor * overviewOpacity;

  return (
    <group ref={outerGroupRef} position={position}>
      <mesh
        ref={meshRef}
        onClick={(e) => { e.stopPropagation(); onClick(); }}
        onPointerOver={() => { setHovered(true); onHover?.(true); document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { setHovered(false); onHover?.(false); document.body.style.cursor = 'default'; }}
      >
        <sphereGeometry args={[size, 32, 32]} />
        <meshPhysicalMaterial
          color={baseColor}
          emissive={baseColor}
          emissiveIntensity={1.1}
          roughness={0.25}
          metalness={0.2}
          clearcoat={1}
          clearcoatRoughness={0.15}
          iridescence={0.6}
          iridescenceIOR={1.3}
          transparent
          opacity={0.45}
        />
      </mesh>

      <mesh ref={glowRef}>
        <sphereGeometry args={[size, 16, 16]} />
        <meshBasicMaterial color={baseColor} transparent opacity={0.06} depthWrite={false} />
      </mesh>

      <mesh ref={ringRef}>
        <torusGeometry args={[size * 1.5, 0.015, 8, 64]} />
        <meshBasicMaterial color={baseColor} transparent opacity={0} depthWrite={false} />
      </mesh>

      <points ref={burstRef} geometry={burstGeometry.geometry}>
        <pointsMaterial
          color={baseColor}
          size={0.05}
          transparent
          opacity={0}
          depthWrite={false}
          sizeAttenuation
        />
      </points>

      {(type === 'root' || type === 'category') && (
        <Html center distanceFactor={13} style={{ pointerEvents: 'none', userSelect: 'none' }}>
          <div style={{
            color: baseColor,
            fontSize: type === 'root' ? '24px' : '13px',
            fontWeight: type === 'root' ? 800 : 600,
            fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
            textShadow: `0 0 30px ${baseColor}aa, 0 0 60px ${baseColor}55`,
            whiteSpace: 'nowrap',
            opacity: labelOpacity,
            transition: 'opacity 0.8s ease',
            letterSpacing: type === 'root' ? '0.15em' : '0.05em',
          }}>
            {type === 'root' ? 'NASHIT' : label}
          </div>
        </Html>
      )}

      {hovered && type === 'project' && (
        <Html center distanceFactor={13} style={{ pointerEvents: 'none' }}>
          <div style={{
            color: COLORS.white,
            fontSize: '11px',
            fontWeight: 500,
            fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
            textShadow: '0 0 15px rgba(0,0,0,0.9)',
            whiteSpace: 'nowrap',
            background: 'rgba(10,10,15,0.9)',
            padding: '6px 14px',
            borderRadius: '8px',
            border: `1px solid ${baseColor}40`,
            backdropFilter: 'blur(10px)',
          }}>
            {label}
          </div>
        </Html>
      )}
    </group>
  );
}
