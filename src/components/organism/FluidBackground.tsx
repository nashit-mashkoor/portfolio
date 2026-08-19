'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const vertexShader = `
varying vec3 vWorldPosition;
varying vec2 vUv;

void main() {
  vec4 worldPos = modelMatrix * vec4(position, 1.0);
  vWorldPosition = worldPos.xyz;
  vUv = uv;
  gl_Position = projectionMatrix * viewMatrix * worldPos;
}
`;

const fragmentShader = `
uniform float uTime;
varying vec3 vWorldPosition;
varying vec2 vUv;

float hash(vec3 p) {
  p = fract(p * 0.3183099 + vec3(0.1, 0.1, 0.1));
  p *= 17.0;
  return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
}

float noise3D(vec3 x) {
  vec3 i = floor(x);
  vec3 f = fract(x);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(mix(hash(i), hash(i + vec3(1,0,0)), f.x),
        mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
    mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x),
        mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y),
    f.z
  );
}

float fbm(vec3 p) {
  float v = 0.0;
  float a = 0.5;
  vec3 shift = vec3(100.0, 200.0, 50.0);
  for (int i = 0; i < 5; i++) {
    v += a * noise3D(p);
    p = p * 2.03 + shift;
    a *= 0.5;
  }
  return v;
}

void main() {
  vec3 dir = normalize(vWorldPosition);
  float t = uTime * 0.06;

  float n1 = fbm(dir * 2.0 + vec3(t * 0.1, t * 0.07, t * 0.05));
  float n2 = fbm(dir * 3.5 + vec3(-t * 0.08, t * 0.12, -t * 0.06) + n1 * 0.6);
  float n3 = fbm(dir * 5.0 + vec3(t * 0.05, -t * 0.09, t * 0.11) + n2 * 0.4);

  vec3 deepBlue = vec3(0.02, 0.04, 0.10);
  vec3 darkTeal = vec3(0.02, 0.06, 0.08);
  vec3 nebula   = vec3(0.06, 0.02, 0.12);
  vec3 abyss    = vec3(0.01, 0.02, 0.05);

  vec3 col = deepBlue;
  col = mix(col, darkTeal, smoothstep(0.3, 0.7, n1));
  col = mix(col, nebula, smoothstep(0.5, 0.8, n2) * 0.5);
  col = mix(col, abyss, smoothstep(0.6, 0.95, n3) * 0.4);

  float pulse = 0.5 + 0.5 * sin(t * 1.5 + n1 * 4.0);
  col += vec3(0.0, 0.015, 0.025) * pulse * n2;

  float aurora = smoothstep(0.45, 0.55, n2) * smoothstep(0.7, 0.3, abs(dir.y));
  col += vec3(0.0, 0.03, 0.04) * aurora * (0.5 + 0.5 * sin(t * 2.0 + dir.x * 5.0));

  col *= 1.0 + 0.15 * n3;

  float edgeFade = 1.0 - smoothstep(0.0, 0.3, abs(dir.y));
  col *= mix(0.6, 1.0, edgeFade);

  gl_FragColor = vec4(col, 1.0);
}
`;

export default function FluidBackground() {
  const matRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
  }), []);

  useFrame(({ clock }) => {
    if (matRef.current) {
      matRef.current.uniforms.uTime.value = clock.getElapsedTime();
    }
  });

  return (
    <mesh>
      <sphereGeometry args={[45, 32, 32]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        side={THREE.BackSide}
        depthWrite={false}
      />
    </mesh>
  );
}
