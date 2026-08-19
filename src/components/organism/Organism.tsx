'use client';

import { useMemo, useCallback, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { computeLayout } from '@/lib/layout';
import { getConnections } from '@/data/projects';
import { CATEGORY_COLORS, COLORS } from '@/lib/constants';
import { fractalNoise } from '@/lib/noise';
import { ZoomState } from '@/app/page';
import OrganismNode from './OrganismNode';
import OrganismConnection from './OrganismConnection';
import ClickRipple from './ClickRipple';
import OrbitalRing from './OrbitalRing';

interface Props {
  zoom: ZoomState;
  onZoomIn: (nodeId: string, position: [number, number, number]) => void;
  onZoomOut: () => void;
}

export default function Organism({ zoom, onZoomIn, onZoomOut }: Props) {
  const bodyRef = useRef<THREE.Group>(null);
  const hoveredRef = useRef<string | null>(null);

  const layout = useMemo(() => computeLayout(), []);
  const connections = useMemo(() => getConnections(), []);

  const [exploredOverride, setExploredOverride] = useState<Set<string>>(new Set());

  const maxZ = useMemo(() => {
    let m = 0;
    for (const n of layout) m = Math.max(m, Math.abs(n.position.z));
    return m;
  }, [layout]);

  const depthFactors = useMemo(() => {
    const map = new Map<string, number>();
    for (const n of layout) {
      const norm = maxZ === 0 ? 0 : Math.abs(n.position.z) / maxZ;
      map.set(n.id, 0.5 + (1 - norm) * 0.5);
    }
    return map;
  }, [layout, maxZ]);

  const positionMap = useMemo(() => {
    const map = new Map<string, [number, number, number]>();
    for (const node of layout) map.set(node.id, [node.position.x, node.position.y, node.position.z]);
    return map;
  }, [layout]);

  const nodeMap = useMemo(() => {
    const map = new Map<string, (typeof layout)[number]>();
    for (const node of layout) map.set(node.id, node);
    return map;
  }, [layout]);

  const handleNodeClick = useCallback(
    (nodeId: string) => {
      const node = nodeMap.get(nodeId);
      if (!node) return;

      setExploredOverride((prev) => new Set(prev).add(nodeId));

      if (zoom.nodeId === nodeId) {
        onZoomOut();
        return;
      }

      if (zoom.nodeId) {
        onZoomOut();
        setTimeout(() => {
          const pos = positionMap.get(nodeId);
          if (pos) onZoomIn(nodeId, pos);
        }, 600);
        return;
      }

      const pos = positionMap.get(nodeId);
      if (pos) onZoomIn(nodeId, pos);
    },
    [nodeMap, zoom.nodeId, positionMap, onZoomIn, onZoomOut]
  );

  const handleNodeHover = useCallback((nodeId: string, hovered: boolean) => {
    hoveredRef.current = hovered ? nodeId : null;
  }, []);

  const isNodeActive = useCallback(
    (nodeId: string) => zoom.nodeId === nodeId || exploredOverride.has(nodeId),
    [zoom.nodeId, exploredOverride]
  );

  const isNodeExplored = useCallback(
    (nodeId: string) => exploredOverride.has(nodeId),
    [exploredOverride]
  );

  const zoomedNode = zoom.nodeId ? nodeMap.get(zoom.nodeId) : null;
  const zoomColor = zoomedNode
    ? (CATEGORY_COLORS[zoomedNode.category || ''] || COLORS.white)
    : COLORS.white;

  useFrame(({ clock, pointer }, delta) => {
    if (!bodyRef.current) return;
    const t = clock.getElapsedTime();
    const breath = 1 + Math.sin(t * 0.28) * 0.015 + fractalNoise(t * 0.1, 2) * 0.006;
    bodyRef.current.scale.setScalar(breath);

    if (!zoom.nodeId) {
      bodyRef.current.rotation.x = THREE.MathUtils.lerp(bodyRef.current.rotation.x, -pointer.y * 0.06, delta * 1.5);
      bodyRef.current.rotation.y = THREE.MathUtils.lerp(bodyRef.current.rotation.y, pointer.x * 0.08, delta * 1.5);
    } else {
      bodyRef.current.rotation.x = THREE.MathUtils.lerp(bodyRef.current.rotation.x, 0, delta * 2);
      bodyRef.current.rotation.y = THREE.MathUtils.lerp(bodyRef.current.rotation.y, 0, delta * 2);
    }
  });

  const overviewOpacity = zoom.nodeId ? 0.08 : 1;

  return (
    <group ref={bodyRef}>
      {layout.map((node) => {
        const nodeColor = CATEGORY_COLORS[node.category || ''] || COLORS.white;
        const isZoomCenter = zoom.nodeId === node.id;
        return (
          <group key={node.id}>
            <OrganismNode
              id={node.id}
              label={node.label}
              position={[node.position.x, node.position.y, node.position.z]}
              type={node.type}
              category={node.category}
              isActive={isNodeActive(node.id)}
              isExplored={isNodeExplored(node.id)}
              depthFactor={depthFactors.get(node.id) || 1}
              overviewOpacity={isZoomCenter ? 1 : overviewOpacity}
              onClick={() => handleNodeClick(node.id)}
              onHover={(h) => handleNodeHover(node.id, h)}
              isZoomCenter={isZoomCenter}
            />
            <ClickRipple
              position={[node.position.x, node.position.y, node.position.z]}
              color={nodeColor}
              active={isNodeActive(node.id)}
              opacity={overviewOpacity}
            />
          </group>
        );
      })}

      {connections.map((conn) => {
        const fromPos = positionMap.get(conn.from);
        const toPos = positionMap.get(conn.to);
        if (!fromPos || !toPos) return null;
        const toNode = nodeMap.get(conn.to);
        const color = CATEGORY_COLORS[toNode?.category || ''] || COLORS.cyan;
        const connActive = isNodeActive(conn.from) || isNodeActive(conn.to);
        const connExplored = isNodeExplored(conn.from) && isNodeExplored(conn.to);
        const avgDepth = ((depthFactors.get(conn.from) || 1) + (depthFactors.get(conn.to) || 1)) / 2;
        return (
          <OrganismConnection
            key={`${conn.from}-${conn.to}`}
            id={`${conn.from}-${conn.to}`}
            from={fromPos}
            to={toPos}
            color={color}
            isActive={connActive}
            isExplored={connExplored}
            depthFactor={avgDepth}
            fade={overviewOpacity}
          />
        );
      })}

      {zoom.nodeId && zoom.position && (
        <OrbitalRing
          centerNodeId={zoom.nodeId}
          centerPosition={zoom.position}
          centerColor={zoomColor}
          isActive={(id) => isNodeActive(id)}
          isExplored={(id) => isNodeExplored(id)}
          onNodeClick={(id) => {
            const pos = positionMap.get(id);
            if (pos) {
              onZoomOut();
              setTimeout(() => onZoomIn(id, pos), 600);
            }
          }}
          onNodeHover={(id, h) => handleNodeHover(id, h)}
        />
      )}
    </group>
  );
}
