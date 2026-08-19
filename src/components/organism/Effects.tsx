'use client';

import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';

export default function Effects() {
  return (
    <EffectComposer>
      <Bloom
        intensity={2}
        luminanceThreshold={0.05}
        luminanceSmoothing={0.9}
        mipmapBlur
        radius={0.8}
      />
      <Vignette eskil={false} offset={0.15} darkness={0.8} />
    </EffectComposer>
  );
}
