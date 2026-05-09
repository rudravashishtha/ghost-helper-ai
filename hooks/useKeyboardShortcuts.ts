"use client";

import { useEffect } from "react";
import type { ReactFlowInstance } from "@xyflow/react";

function isEditableTarget(e: KeyboardEvent): boolean {
  const target = e.target as HTMLElement;
  return (
    target.tagName === "INPUT" ||
    target.tagName === "TEXTAREA" ||
    target.isContentEditable
  );
}

export function useKeyboardShortcuts(
  instance: ReactFlowInstance,
  undo: () => void,
  redo: () => void,
) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (isEditableTarget(e)) return;

      const meta = e.metaKey || e.ctrlKey;

      if (e.key === "+" || e.key === "=") {
        e.preventDefault();
        instance.zoomIn({ duration: 200 });
      } else if (e.key === "-") {
        e.preventDefault();
        instance.zoomOut({ duration: 200 });
      } else if (meta && e.shiftKey && e.key.toLowerCase() === "z") {
        e.preventDefault();
        redo();
      } else if (meta && e.key.toLowerCase() === "y") {
        e.preventDefault();
        redo();
      } else if (meta && e.key.toLowerCase() === "z") {
        e.preventDefault();
        undo();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [instance, undo, redo]);
}
