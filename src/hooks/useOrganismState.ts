'use client';

import { useState, useCallback } from 'react';

export interface OrganismState {
  activeNode: string | null;
  zoomNode: string | null;
  zoomPosition: [number, number, number] | null;
  exploredNodes: Set<string>;
  exploredCategories: Set<string>;
}

export function useOrganismState() {
  const [state, setState] = useState<OrganismState>({
    activeNode: null,
    zoomNode: null,
    zoomPosition: null,
    exploredNodes: new Set(),
    exploredCategories: new Set(),
  });

  const activateNode = useCallback((nodeId: string, category: string) => {
    setState((prev) => {
      const next = new Set(prev.exploredNodes);
      next.add(nodeId);
      const cats = new Set(prev.exploredCategories);
      cats.add(category);
      return {
        ...prev,
        activeNode: nodeId,
        exploredNodes: next,
        exploredCategories: cats,
      };
    });
  }, []);

  const zoomIn = useCallback((nodeId: string, position: [number, number, number]) => {
    setState((prev) => {
      const next = new Set(prev.exploredNodes);
      next.add(nodeId);
      return {
        ...prev,
        zoomNode: nodeId,
        zoomPosition: position,
        activeNode: nodeId,
        exploredNodes: next,
      };
    });
  }, []);

  const zoomOut = useCallback(() => {
    setState((prev) => ({
      ...prev,
      zoomNode: null,
      zoomPosition: null,
      activeNode: null,
    }));
  }, []);

  const isActive = useCallback(
    (nodeId: string) => state.activeNode === nodeId,
    [state.activeNode]
  );

  const isExplored = useCallback(
    (nodeId: string) => state.exploredNodes.has(nodeId),
    [state.exploredNodes]
  );

  return {
    state,
    activateNode,
    zoomIn,
    zoomOut,
    isActive,
    isExplored,
    totalExplored: state.exploredNodes.size,
  };
}
