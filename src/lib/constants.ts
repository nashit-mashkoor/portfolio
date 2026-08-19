export const COLORS = {
  bg: '#0a0a0f',
  cyan: '#00f5d4',
  purple: '#9b5de5',
  magenta: '#f15bb5',
  yellow: '#fee440',
  blue: '#00bbf9',
  white: '#ededed',
  dim: '#2a2a3a',
} as const;

export const CATEGORY_COLORS: Record<string, string> = {
  'computer-vision': COLORS.cyan,
  'edge-ai': COLORS.magenta,
  mlops: COLORS.purple,
  cloud: COLORS.blue,
  genai: COLORS.yellow,
};

export const NODE_SIZES = {
  root: 0.6,
  category: 0.35,
  project: 0.22,
} as const;

export const LAYOUT = {
  categoryRadius: 4.5,
  projectRadius: 8,
  spreadAngle: 0.6,
} as const;
