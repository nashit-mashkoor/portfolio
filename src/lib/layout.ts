import * as THREE from 'three';
import { projects, categories } from '@/data/projects';
import { LAYOUT } from './constants';
import { seeded } from './noise';

export interface NodePosition {
  id: string;
  label: string;
  position: THREE.Vector3;
  type: 'root' | 'category' | 'project';
  category?: string;
}

export function computeLayout(): NodePosition[] {
  const nodes: NodePosition[] = [];
  const catCount = categories.length;
  const angleStep = (Math.PI * 2) / catCount;

  nodes.push({
    id: 'root',
    label: 'NASHIT',
    position: new THREE.Vector3(0, 0, 0),
    type: 'root',
  });

  categories.forEach((cat, i) => {
    const angle = angleStep * i - Math.PI / 2;
    const x = Math.cos(angle) * LAYOUT.categoryRadius;
    const y = Math.sin(angle) * LAYOUT.categoryRadius;
    const z = (seeded(i * 3.1) - 0.5) * 2.5;

    nodes.push({
      id: cat.id,
      label: cat.label,
      position: new THREE.Vector3(x, y, z),
      type: 'category',
      category: cat.id,
    });

    const catProjects = projects.filter((p) => p.category === cat.id);
    const totalSpread = Math.min(LAYOUT.spreadAngle, angleStep * 0.7);
    const step = catProjects.length > 1 ? totalSpread / (catProjects.length - 1) : 0;
    const startAngle = angle - totalSpread / 2;

    catProjects.forEach((proj, j) => {
      const projAngle = catProjects.length === 1 ? angle : startAngle + step * j;
      const px = Math.cos(projAngle) * LAYOUT.projectRadius;
      const py = Math.sin(projAngle) * LAYOUT.projectRadius;
      const pz = z + (seeded(j * 7.7 + i * 3.1) - 0.5) * 2.0;

      nodes.push({
        id: proj.id,
        label: proj.label,
        position: new THREE.Vector3(px, py, pz),
        type: 'project',
        category: cat.id,
      });
    });
  });

  const center = new THREE.Vector3();
  for (const node of nodes) center.add(node.position);
  center.divideScalar(nodes.length);
  for (const node of nodes) node.position.sub(center);

  return nodes;
}

export function layoutBounds(nodes: NodePosition[]): { radius: number } {
  let radius = 0;
  for (const node of nodes) {
    radius = Math.max(radius, node.position.length());
  }
  return { radius };
}