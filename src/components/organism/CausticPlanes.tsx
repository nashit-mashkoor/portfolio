'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform float uTime;
  uniform vec3 uColor;
  varying vec2 vUv;
  float caustic(vec2 uv, float t) {
    float c = 0.0;
    for (float i = 1.0; i <= 3.0; i++) {
      vec2 p = uv * i * 2.0;
      c += sin(p.x + sin(p.y + t * 0.5)) * 0.5 + 0.5;
      c += cos(p.y + cos(p.x + t * 0.3)) * 0.5 + 0.5;
    }
    return c / 6.0;
  }
  void main() {
    float c = caustic(vUv, uTime);
    c = pow(c, 3.0);
    gl_FragColor = vec4(uColor, c * 0.06);
  }
`;

export default function CausticPlanes() {
  const matRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uColor: { value: new THREE.Color('#00f5d4') },
  }), []);

  useFrame(({ clock }) => {
    if (matRef.current) {
      matRef.current.uniforms.uTime.value = clock.getElapsedTime();
    }
  });

  return (
    <mesh position={[0, 0, -8]}>
      <planeGeometry args={[40, 40]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
      />
    </mesh>
  );
}
