"use client";

import { useReactFlow } from "@xyflow/react";
import { ZoomIn, ZoomOut, Maximize2, Undo2, Redo2 } from "lucide-react";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";

interface CanvasControlsProps {
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

export function CanvasControls({
  undo,
  redo,
  canUndo,
  canRedo,
}: CanvasControlsProps) {
  const instance = useReactFlow();

  useKeyboardShortcuts(instance, undo, redo);

  const btn =
    "flex items-center justify-center w-7 h-7 rounded-lg transition-colors hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer";

  return (
    <div
      className="flex items-center gap-0.5 px-1.5 py-1 rounded-xl"
      style={{
        background: "#18181c",
        border: "1px solid #2a2a30",
        boxShadow: "0 4px 16px rgba(0,0,0,0.4)",
      }}
    >
      <button
        className={btn}
        onClick={() => instance.zoomOut({ duration: 200 })}
        title="Zoom out (-)"
        aria-label="Zoom out"
      >
        <ZoomOut className="w-3.5 h-3.5 text-[#a0a0b8]" />
      </button>
      <button
        className={btn}
        onClick={() => instance.fitView({ duration: 300 })}
        title="Fit view"
        aria-label="Fit view"
      >
        <Maximize2 className="w-3.5 h-3.5 text-[#a0a0b8]" />
      </button>
      <button
        className={btn}
        onClick={() => instance.zoomIn({ duration: 200 })}
        title="Zoom in (+)"
        aria-label="Zoom in"
      >
        <ZoomIn className="w-3.5 h-3.5 text-[#a0a0b8]" />
      </button>

      <div
        className="w-px h-4 mx-1 shrink-0"
        style={{ background: "#2a2a30" }}
      />

      <button
        className={btn}
        onClick={undo}
        disabled={!canUndo}
        title="Undo (Cmd+Z)"
        aria-label="Undo"
      >
        <Undo2 className="w-3.5 h-3.5 text-[#a0a0b8]" />
      </button>
      <button
        className={btn}
        onClick={redo}
        disabled={!canRedo}
        title="Redo (Cmd+Shift+Z)"
        aria-label="Redo"
      >
        <Redo2 className="w-3.5 h-3.5 text-[#a0a0b8]" />
      </button>
    </div>
  );
}
