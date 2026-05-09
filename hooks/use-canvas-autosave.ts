"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { CanvasNode, CanvasEdge } from "@/types/canvas";

export type SaveStatus = "idle" | "saving" | "saved" | "error";

const DEBOUNCE_MS = 10000;

export function useCanvasAutosave(
  projectId: string,
  nodes: CanvasNode[],
  edges: CanvasEdge[],
): { status: SaveStatus; save: () => Promise<void> } {
  const [status, setStatus] = useState<SaveStatus>("idle");
  const hasContentRef = useRef(false);
  const nodesRef = useRef(nodes);
  const edgesRef = useRef(edges);

  useEffect(() => {
    nodesRef.current = nodes;
  }, [nodes]);
  useEffect(() => {
    edgesRef.current = edges;
  }, [edges]);

  const save = useCallback(async () => {
    const n = nodesRef.current;
    const e = edgesRef.current;
    if (n.length === 0 && e.length === 0) return;
    setStatus("saving");
    try {
      const res = await fetch(`/api/projects/${projectId}/canvas`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nodes: n, edges: e }),
      });
      if (!res.ok) throw new Error("Save failed");
      setStatus("saved");
    } catch (err) {
      console.log({ err });
      setStatus("error");
    }
  }, [projectId]);

  useEffect(() => {
    if (nodes.length > 0 || edges.length > 0) {
      hasContentRef.current = true;
    }
    if (!hasContentRef.current) return;

    const timer = setTimeout(save, DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [nodes, edges, save]);

  return { status, save };
}
