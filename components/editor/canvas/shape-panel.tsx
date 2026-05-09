"use client";

import { Square, Diamond, Circle, Pill, Cylinder, Hexagon } from "lucide-react";
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
  {
    shape: "rectangle",
    icon: Square,
    label: "Rectangle",
    width: 160,
    height: 80,
  },
  {
    shape: "diamond",
    icon: Diamond,
    label: "Diamond",
    width: 160,
    height: 160,
  },
  { shape: "circle", icon: Circle, label: "Circle", width: 80, height: 80 },
  { shape: "pill", icon: Pill, label: "Pill", width: 160, height: 60 },
  {
    shape: "cylinder",
    icon: Cylinder,
    label: "Cylinder",
    width: 100,
    height: 100,
  },
  {
    shape: "hexagon",
    icon: Hexagon,
    label: "Hexagon",
    width: 100,
    height: 100,
  },
];

const GHOST_FILL = "#1F1F1F";
const GHOST_STROKE = "#3a3a46";
const GHOST_SCALE = 0.5;

function createDragGhost(config: ShapeConfig): HTMLElement {
  const w = Math.round(config.width * GHOST_SCALE);
  const h = Math.round(config.height * GHOST_SCALE);
  const sw = 3;

  const el = document.createElement("div");
  el.style.cssText = `position:fixed;top:-9999px;left:-9999px;width:${w}px;height:${h}px;opacity:0.85;pointer-events:none;`;

  switch (config.shape) {
    case "rectangle":
      el.style.background = GHOST_FILL;
      el.style.border = `2px solid ${GHOST_STROKE}`;
      el.style.borderRadius = "6px";
      break;
    case "pill":
      el.style.background = GHOST_FILL;
      el.style.border = `2px solid ${GHOST_STROKE}`;
      el.style.borderRadius = "9999px";
      break;
    case "circle":
      el.style.background = GHOST_FILL;
      el.style.border = `2px solid ${GHOST_STROKE}`;
      el.style.borderRadius = "50%";
      break;
    case "diamond":
      el.innerHTML = `<svg width="${w}" height="${h}" viewBox="0 0 100 100" preserveAspectRatio="none"><polygon points="50,2 98,50 50,98 2,50" fill="${GHOST_FILL}" stroke="${GHOST_STROKE}" stroke-width="${sw}"/></svg>`;
      break;
    case "hexagon":
      el.innerHTML = `<svg width="${w}" height="${h}" viewBox="0 0 100 100" preserveAspectRatio="none"><polygon points="25,4 75,4 98,50 75,96 25,96 2,50" fill="${GHOST_FILL}" stroke="${GHOST_STROKE}" stroke-width="${sw}"/></svg>`;
      break;
    case "cylinder":
      el.innerHTML = `<svg width="${w}" height="${h}" viewBox="0 0 100 100" preserveAspectRatio="none"><ellipse cx="50" cy="84" rx="40" ry="14" fill="${GHOST_FILL}" stroke="${GHOST_STROKE}" stroke-width="${sw}"/><rect x="10" y="14" width="80" height="70" fill="${GHOST_FILL}"/><line x1="10" y1="14" x2="10" y2="84" stroke="${GHOST_STROKE}" stroke-width="${sw}"/><line x1="90" y1="14" x2="90" y2="84" stroke="${GHOST_STROKE}" stroke-width="${sw}"/><ellipse cx="50" cy="14" rx="40" ry="14" fill="${GHOST_FILL}" stroke="${GHOST_STROKE}" stroke-width="${sw}"/></svg>`;
      break;
  }

  return el;
}

function handleDragStart(e: React.DragEvent, config: ShapeConfig) {
  e.dataTransfer.setData(
    "application/ghost-shape",
    JSON.stringify({
      shape: config.shape,
      width: config.width,
      height: config.height,
    }),
  );
  e.dataTransfer.effectAllowed = "copy";

  const ghost = createDragGhost(config);
  document.body.appendChild(ghost);
  e.dataTransfer.setDragImage(
    ghost,
    Math.round((config.width * GHOST_SCALE) / 2),
    Math.round((config.height * GHOST_SCALE) / 2),
  );
  setTimeout(() => document.body.removeChild(ghost), 0);
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
          aria-label={config.label}
          className="h-9 w-9 flex items-center justify-center rounded-full text-copy-secondary hover:text-brand hover:bg-accent-dim transition-colors cursor-grab active:cursor-grabbing"
        >
          <config.icon className="h-4 w-4" />
        </button>
      ))}
    </div>
  );
}
