'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Suspense, useRef } from 'react';
import * as THREE from 'three';
import Organism from './Organism';
import Effects from './Effects';
import CameraController from './CameraController';
import { COLORS } from '@/lib/constants';
import { computeLayout, layoutBounds } from '@/lib/layout';
import { fractalNoise } from '@/lib/noise';
import FluidBackground from './FluidBackground';
import { ZoomState } from '@/app/page';

function FovBreath({ isZoomed }: { isZoomed: boolean }) {
  const camRef = useRef<THREE.PerspectiveCamera>(null);

  useFrame(({ camera, clock }) => {
    if (!camRef.current && (camera as THREE.PerspectiveCamera).isPerspectiveCamera) {
      camRef.current = camera as THREE.PerspectiveCamera;
    }
    if (!camRef.current) return;
    const t = clock.getElapsedTime();
    const base = isZoomed ? 50 : 55;
    const breath = base + Math.sin(t * 0.3) * (isZoomed ? 0.3 : 0.8) + fractalNoise(t * 0.12, 2) * 0.5;
    camRef.current.fov = THREE.MathUtils.lerp(camRef.current.fov, breath, 0.03);
    camRef.current.updateProjectionMatrix();
  });

  return null;
}

interface Props {
  zoom: ZoomState;
  onZoomIn: (nodeId: string, position: [number, number, number]) => void;
  onZoomOut: () => void;
}

function LoadingFallback() {
  return (
    <mesh>
      <sphereGeometry args={[0.5, 16, 16]} />
      <meshBasicMaterial color={COLORS.cyan} wireframe transparent opacity={0.3} />
    </mesh>
  );
}

const FOV = 55;
const { radius } = layoutBounds(computeLayout());
const CAM_DIST = (radius * 1.75) / Math.tan((FOV / 2) * (Math.PI / 180));
const OVERVIEW_POS: [number, number, number] = [CAM_DIST * 0.08, CAM_DIST * 0.05, CAM_DIST];

export default function Scene({ zoom, onZoomIn, onZoomOut }: Props) {
  const isZoomed = !!zoom.nodeId;

  return (
    <Canvas
      camera={{
        position: OVERVIEW_POS,
        fov: FOV,
        near: 0.1,
        far: 100,
      }}
      gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
      style={{ background: '#020408' }}
      dpr={[1, 1.5]}
      frameloop="always"
      onPointerMissed={() => { if (isZoomed) onZoomOut(); }}
    >
      <color attach="background" args={['#020408']} />

      <ambientLight intensity={0.15} />
      <hemisphereLight args={['#1a2a3a', '#0a0a0f', 0.6]} />
      <pointLight position={[10, 10, 10]} intensity={1.6} color={COLORS.cyan} distance={30} />
      <pointLight position={[-10, -5, 5]} intensity={1.0} color={COLORS.purple} distance={25} />
      <pointLight position={[5, -10, 8]} intensity={0.8} color={COLORS.magenta} distance={20} />
      <pointLight position={[0, 0, 8]} intensity={0.5} color={COLORS.white} distance={18} />

      <FluidBackground />

      <Suspense fallback={<LoadingFallback />}>
        <Organism
          zoom={zoom}
          onZoomIn={onZoomIn}
          onZoomOut={onZoomOut}
        />
        <Effects />
      </Suspense>

      <FovBreath isZoomed={isZoomed} />
      <CameraController
        zoomTarget={zoom.position}
        overviewPosition={OVERVIEW_POS}
      />

      {!isZoomed && (
        <OrbitControls
          target={[0, 0, 0]}
          enableZoom={true}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.12}
          dampingFactor={0.06}
          enableDamping
          maxPolarAngle={Math.PI * 0.75}
          minPolarAngle={Math.PI * 0.25}
        />
      )}
    </Canvas>
  );
}
