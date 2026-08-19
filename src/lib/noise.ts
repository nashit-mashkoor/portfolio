export function seeded(s: number) {
  const x = Math.sin(s * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

export function smoothNoise(x: number) {
  const i = Math.floor(x);
  const f = x - i;
  const u = f * f * (3 - 2 * f);
  return seeded(i) * (1 - u) + seeded(i + 1) * u;
}

export function fractalNoise(x: number, octaves = 3) {
  let value = 0;
  let amp = 1;
  let freq = 1;
  let total = 0;
  for (let o = 0; o < octaves; o++) {
    value += smoothNoise(x * freq) * amp;
    total += amp;
    amp *= 0.5;
    freq *= 2.1;
  }
  return value / total;
}

export function clamp01(v: number) {
  return Math.max(0, Math.min(1, v));
}