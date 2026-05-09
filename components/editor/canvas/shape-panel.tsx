"use client";

import {
  Square,
  Diamond,
  Circle,
  Pill,
  Cylinder,
  Hexagon,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { NodeShape } from "@/types/canvas";

interface ShapeConfig {
  shape: NodeShape;
  icon: LucideIcon;
  label: string;
  width: number;
  height: number;
}

const SHAPES: ShapeConfig[] = [
  { shape: "rectangle", icon: Square, label: "Rectangle", width: 160, height: 80 },
  { shape: "diamond", icon: Diamond, label: "Diamond", width: 160, height: 160 },
  { shape: "circle", icon: Circle, label: "Circle", width: 80, height: 80 },
  { shape: "pill", icon: Pill, label: "Pill", width: 160, height: 60 },
  { shape: "cylinder", icon: Cylinder, label: "Cylinder", width: 100, height: 100 },
  { shape: "hexagon", icon: Hexagon, label: "Hexagon", width: 100, height: 100 },
];

function handleDragStart(e: React.DragEvent, config: ShapeConfig) {
  e.dataTransfer.setData(
    "application/ghost-shape",
    JSON.stringify({ shape: config.shape, width: config.width, height: config.height })
  );
  e.dataTransfer.effectAllowed = "copy";
}

export function ShapePanel() {
  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1 px-3 py-2 rounded-full bg-elevated border border-surface-border shadow-lg">
      {SHAPES.map((config) => (
        <button
          key={config.shape}
          draggable
          onDragStart={(e) => handleDragStart(e, config)}
          title={config.label}
          className="h-9 w-9 flex items-center justify-center rounded-full text-copy-secondary hover:text-brand hover:bg-accent-dim transition-colors cursor-grab active:cursor-grabbing"
        >
          <config.icon className="h-4 w-4" />
        </button>
      ))}
    </div>
  );
}
