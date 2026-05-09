"use client";

import { useState } from "react";
import { LayoutTemplate } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CANVAS_TEMPLATES, type CanvasTemplate } from "./starter-templates";
import type { CanvasNode } from "@/types/canvas";

interface StarterTemplatesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (template: CanvasTemplate) => void;
}

// ── Preview renderer ──────────────────────────────────────────────────────────

const PREVIEW_W = 280;
const PREVIEW_H = 150;
const PREVIEW_PAD = 12;

function getBounds(nodes: CanvasNode[]) {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const node of nodes) {
    const w = (node.style?.width as number) ?? 120;
    const h = (node.style?.height as number) ?? 44;
    if (node.position.x < minX) minX = node.position.x;
    if (node.position.y < minY) minY = node.position.y;
    if (node.position.x + w > maxX) maxX = node.position.x + w;
    if (node.position.y + h > maxY) maxY = node.position.y + h;
  }
  return { minX, minY, maxX, maxY };
}

function TemplatePreview({ template }: { template: CanvasTemplate }) {
  const { nodes, edges } = template;
  if (nodes.length === 0) return null;

  const { minX, minY, maxX, maxY } = getBounds(nodes);
  const contentW = maxX - minX;
  const contentH = maxY - minY;
  const availW = PREVIEW_W - PREVIEW_PAD * 2;
  const availH = PREVIEW_H - PREVIEW_PAD * 2;
  const scale = Math.min(availW / contentW, availH / contentH, 1);
  const scaledW = contentW * scale;
  const scaledH = contentH * scale;
  const offsetX = PREVIEW_PAD + (availW - scaledW) / 2;
  const offsetY = PREVIEW_PAD + (availH - scaledH) / 2;

  function tx(x: number) { return offsetX + (x - minX) * scale; }
  function ty(y: number) { return offsetY + (y - minY) * scale; }

  const nodeMap = new Map(nodes.map((nd) => [nd.id, nd]));

  function nodeCenterX(nd: CanvasNode) {
    const w = (nd.style?.width as number) ?? 120;
    return tx(nd.position.x + w / 2);
  }
  function nodeCenterY(nd: CanvasNode) {
    const h = (nd.style?.height as number) ?? 44;
    return ty(nd.position.y + h / 2);
  }

  return (
    <svg
      width={PREVIEW_W}
      height={PREVIEW_H}
      viewBox={`0 0 ${PREVIEW_W} ${PREVIEW_H}`}
      className="w-full"
    >
      {/* Edges */}
      {edges.map((edge) => {
        const src = nodeMap.get(edge.source);
        const tgt = nodeMap.get(edge.target);
        if (!src || !tgt) return null;
        return (
          <line
            key={edge.id}
            x1={nodeCenterX(src)}
            y1={nodeCenterY(src)}
            x2={nodeCenterX(tgt)}
            y2={nodeCenterY(tgt)}
            stroke="#3a3a46"
            strokeWidth={1}
          />
        );
      })}

      {/* Nodes */}
      {nodes.map((nd) => {
        const w = ((nd.style?.width as number) ?? 120) * scale;
        const h = ((nd.style?.height as number) ?? 44) * scale;
        const x = tx(nd.position.x);
        const y = ty(nd.position.y);
        const fill = nd.data.color ?? "#1F1F1F";
        const shape = nd.data.shape ?? "rectangle";

        return (
          <g key={nd.id}>
            <NodeShape x={x} y={y} w={w} h={h} fill={fill} shape={shape} />
          </g>
        );
      })}
    </svg>
  );
}

function NodeShape({
  x, y, w, h, fill, shape,
}: {
  x: number; y: number; w: number; h: number; fill: string; shape: CanvasNode["data"]["shape"];
}) {
  const stroke = "#3a3a46";
  const sw = 0.8;

  if (shape === "circle") {
    const cx = x + w / 2;
    const cy = y + h / 2;
    const r = Math.min(w, h) / 2;
    return <ellipse cx={cx} cy={cy} rx={r} ry={r} fill={fill} stroke={stroke} strokeWidth={sw} />;
  }

  if (shape === "pill") {
    const rx = Math.min(w, h) / 2;
    return <rect x={x} y={y} width={w} height={h} rx={rx} ry={rx} fill={fill} stroke={stroke} strokeWidth={sw} />;
  }

  if (shape === "diamond") {
    const cx = x + w / 2;
    const cy = y + h / 2;
    const pts = `${cx},${y} ${x + w},${cy} ${cx},${y + h} ${x},${cy}`;
    return <polygon points={pts} fill={fill} stroke={stroke} strokeWidth={sw} />;
  }

  if (shape === "hexagon") {
    const cx = x + w / 2;
    const cy = y + h / 2;
    const rx = w / 2;
    const ry = h / 2;
    const pts = [
      [cx - rx, cy],
      [cx - rx / 2, cy - ry],
      [cx + rx / 2, cy - ry],
      [cx + rx, cy],
      [cx + rx / 2, cy + ry],
      [cx - rx / 2, cy + ry],
    ].map((p) => p.join(",")).join(" ");
    return <polygon points={pts} fill={fill} stroke={stroke} strokeWidth={sw} />;
  }

  if (shape === "cylinder") {
    const rx = w / 2;
    const ry = Math.min(h * 0.2, 8);
    return (
      <>
        <rect x={x} y={y + ry} width={w} height={h - ry * 2} fill={fill} stroke="none" />
        <ellipse cx={x + rx} cy={y + ry} rx={rx} ry={ry} fill={fill} stroke={stroke} strokeWidth={sw} />
        <rect x={x} y={y + ry} width={w} height={h - ry * 2} fill="none" stroke={stroke} strokeWidth={sw} />
        <ellipse cx={x + rx} cy={y + h - ry} rx={rx} ry={ry} fill={fill} stroke={stroke} strokeWidth={sw} />
      </>
    );
  }

  // default: rectangle
  return <rect x={x} y={y} width={w} height={h} rx={3} ry={3} fill={fill} stroke={stroke} strokeWidth={sw} />;
}

// ── Card ──────────────────────────────────────────────────────────────────────

function TemplateCard({
  template,
  onImport,
}: {
  template: CanvasTemplate;
  onImport: () => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className={[
        "flex flex-col rounded-2xl border overflow-hidden transition-all duration-200",
        hovered ? "border-brand/40 shadow-[0_0_16px_-4px_rgba(0,200,212,0.2)]" : "border-surface-border",
        "bg-elevated",
      ].join(" ")}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="bg-surface/60 border-b border-surface-border flex items-center justify-center p-3">
        <TemplatePreview template={template} />
      </div>

      <div className="flex items-start justify-between gap-3 p-4">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-copy-primary leading-tight">{template.name}</p>
          <p className="text-xs text-copy-muted mt-1 leading-relaxed line-clamp-2">{template.description}</p>
        </div>
        <Button
          size="sm"
          onClick={onImport}
          className="shrink-0 h-7 px-3 text-xs bg-brand/10 text-brand hover:bg-brand/20 border border-brand/20 hover:border-brand/40 transition-all"
        >
          Import
        </Button>
      </div>
    </div>
  );
}

// ── Modal ─────────────────────────────────────────────────────────────────────

export function StarterTemplatesModal({
  open,
  onOpenChange,
  onImport,
}: StarterTemplatesModalProps) {
  function handleImport(template: CanvasTemplate) {
    onImport(template);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl bg-elevated border-surface-border rounded-3xl p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-surface-border">
          <div className="flex items-center gap-2">
            <LayoutTemplate className="h-4 w-4 text-brand" />
            <DialogTitle className="font-semibold text-copy-primary">
              Starter Templates
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-copy-muted mt-1">
            Start from a pre-built diagram. Importing replaces the current canvas.
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[70vh] p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {CANVAS_TEMPLATES.map((tpl) => (
              <TemplateCard
                key={tpl.id}
                template={tpl}
                onImport={() => handleImport(tpl)}
              />
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
