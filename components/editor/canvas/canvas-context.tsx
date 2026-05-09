"use client";

import { createContext, useContext } from "react";
import type { NodeChange, EdgeChange } from "@xyflow/react";
import type { CanvasNode, CanvasEdge } from "@/types/canvas";

interface CanvasContextValue {
  onNodesChange: (changes: NodeChange<CanvasNode>[]) => void;
  onEdgesChange: (changes: EdgeChange<CanvasEdge>[]) => void;
}

export const CanvasContext = createContext<CanvasContextValue | null>(null);

export function useCanvas(): CanvasContextValue {
  const ctx = useContext(CanvasContext);
  if (!ctx) throw new Error("useCanvas must be used within CanvasContext.Provider");
  return ctx;
}
