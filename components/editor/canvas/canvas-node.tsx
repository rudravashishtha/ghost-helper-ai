"use client";

import { memo, useState, useRef, useCallback } from "react";
import { Handle, Position, NodeResizer, useReactFlow } from "@xyflow/react";
import type { CanvasNodeData, NodeShape } from "@/types/canvas";
import { NODE_COLORS } from "@/types/canvas";
import { useCanvas } from "./canvas-context";
import type { KeyboardEvent, MouseEvent } from "react";

interface CanvasNodeProps {
  id: string;
  data: CanvasNodeData;
  selected?: boolean;
}

const STROKE_WIDTH = 2;
const MIN_WIDTH = 60;
const MIN_HEIGHT = 40;

function getBorderColor(selected?: boolean): string {
  return selected ? "#00c8d4" : "#525265";
}

function CSSShape({
  shape,
  fill,
  stroke,
  children,
}: {
  shape: "rectangle" | "pill" | "circle";
  fill: string;
  stroke: string;
  children: React.ReactNode;
}) {
  const borderRadius =
    shape === "circle" ? "50%" : shape === "pill" ? "9999px" : "6px";

  return (
    <div
      className="w-full h-full flex items-center justify-center px-3 py-2 text-sm font-medium overflow-hidden"
      style={{
        background: fill,
        border: `${STROKE_WIDTH}px solid ${stroke}`,
        borderRadius,
      }}
    >
      {children}
    </div>
  );
}

function DiamondShape({
  fill,
  stroke,
  children,
}: {
  fill: string;
  stroke: string;
  children: React.ReactNode;
}) {
  return (
    <div className="w-full h-full relative">
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="absolute inset-0"
      >
        <polygon
          points="50,2 98,50 50,98 2,50"
          fill={fill}
          stroke={stroke}
          strokeWidth={STROKE_WIDTH + 1}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-sm font-medium pointer-events-none">
        {children}
      </div>
    </div>
  );
}

function HexagonShape({
  fill,
  stroke,
  children,
}: {
  fill: string;
  stroke: string;
  children: React.ReactNode;
}) {
  return (
    <div className="w-full h-full relative">
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="absolute inset-0"
      >
        <polygon
          points="25,4 75,4 98,50 75,96 25,96 2,50"
          fill={fill}
          stroke={stroke}
          strokeWidth={STROKE_WIDTH + 1}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-sm font-medium pointer-events-none">
        {children}
      </div>
    </div>
  );
}

function CylinderShape({
  fill,
  stroke,
  children,
}: {
  fill: string;
  stroke: string;
  children: React.ReactNode;
}) {
  return (
    <div className="w-full h-full relative">
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="absolute inset-0"
      >
        {/* bottom cap drawn first (painter's order) */}
        <ellipse
          cx="50"
          cy="82"
          rx="40"
          ry="12"
          fill={fill}
          stroke={stroke}
          strokeWidth={STROKE_WIDTH + 1}
        />
        {/* body — covers bottom half of bottom cap, exposes top half of top cap */}
        <rect x="10" y="20" width="80" height="62" fill={fill} />
        <line
          x1="10"
          y1="20"
          x2="10"
          y2="82"
          stroke={stroke}
          strokeWidth={STROKE_WIDTH + 1}
        />
        <line
          x1="90"
          y1="20"
          x2="90"
          y2="82"
          stroke={stroke}
          strokeWidth={STROKE_WIDTH + 1}
        />
        {/* top cap last — fully intact, top point at y=8 (clear of Handle at y=0) */}
        <ellipse
          cx="50"
          cy="20"
          rx="40"
          ry="12"
          fill={fill}
          stroke={stroke}
          strokeWidth={STROKE_WIDTH + 1}
        />
      </svg>
      <div
        className="absolute inset-0 flex items-center justify-center text-sm font-medium pointer-events-none"
        style={{ paddingTop: "22%" }}
      >
        {children}
      </div>
    </div>
  );
}

function renderShape(
  shape: NodeShape,
  fill: string,
  stroke: string,
  textColor: string,
  label: string | null,
) {
  const text =
    label === null ? null : label ? (
      <span style={{ color: textColor }}>{label}</span>
    ) : (
      <span style={{ color: textColor, opacity: 0.3 }}>Label...</span>
    );

  switch (shape) {
    case "rectangle":
    case "pill":
    case "circle":
      return (
        <CSSShape shape={shape} fill={fill} stroke={stroke}>
          {text}
        </CSSShape>
      );
    case "diamond":
      return (
        <DiamondShape fill={fill} stroke={stroke}>
          {text}
        </DiamondShape>
      );
    case "hexagon":
      return (
        <HexagonShape fill={fill} stroke={stroke}>
          {text}
        </HexagonShape>
      );
    case "cylinder":
      return (
        <CylinderShape fill={fill} stroke={stroke}>
          {text}
        </CylinderShape>
      );
  }
}

function ColorSwatch({
  fill,
  text,
  active,
  onSelect,
}: {
  fill: string;
  text: string;
  active: boolean;
  onSelect: () => void;
}) {
  const [hovered, setHovered] = useState(false);

  const handleMouseDown = useCallback(
    (e: MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      onSelect();
    },
    [onSelect],
  );

  return (
    <div
      onMouseDown={handleMouseDown}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="nodrag nopan cursor-pointer rounded-full shrink-0"
      style={{
        width: 18,
        height: 18,
        background: fill,
        border: active ? `2px solid #00c8d4` : `2px solid transparent`,
        boxShadow: hovered
          ? `0 0 6px 1px ${text}55`
          : active
            ? `0 0 4px 0px ${text}44`
            : "none",
        transition: "box-shadow 0.15s ease, border-color 0.15s ease",
      }}
    />
  );
}

function ColorToolbar({
  activeFill,
  activeText,
  onColorSelect,
}: {
  activeFill: string;
  activeText: string;
  onColorSelect: (fill: string, text: string) => void;
}) {
  const stopPropagation = useCallback((e: MouseEvent) => {
    e.stopPropagation();
  }, []);

  return (
    <div
      className="nodrag nopan absolute left-1/2 flex items-center gap-1.5 px-2 py-1.5 rounded-xl"
      style={{
        transform: "translateX(-50%)",
        bottom: "calc(100% + 10px)",
        background: "#18181c",
        border: "1px solid #2a2a30",
        boxShadow: "0 4px 16px rgba(0,0,0,0.5)",
        zIndex: 10,
        pointerEvents: "all",
      }}
      onMouseDown={stopPropagation}
      onClick={stopPropagation}
    >
      {NODE_COLORS.map((pair) => (
        <ColorSwatch
          key={pair.fill}
          fill={pair.fill}
          text={pair.text}
          active={activeFill === pair.fill && activeText === pair.text}
          onSelect={() => onColorSelect(pair.fill, pair.text)}
        />
      ))}
    </div>
  );
}

function CanvasNodeComponent({ id, data, selected }: CanvasNodeProps) {
  const [editing, setEditing] = useState(false);
  const editDivRef = useRef<HTMLDivElement>(null);
  const { getNode } = useReactFlow<import("@/types/canvas").CanvasNode>();
  const { onNodesChange } = useCanvas();

  const startEditing = useCallback(() => {
    setEditing(true);
    setTimeout(() => {
      const el = editDivRef.current;
      if (!el) return;
      el.textContent = data.label;
      el.focus();
      const range = document.createRange();
      const sel = window.getSelection();
      range.selectNodeContents(el);
      range.collapse(false);
      sel?.removeAllRanges();
      sel?.addRange(range);
    }, 0);
  }, [data.label]);

  const commitEdit = useCallback(() => {
    const node = getNode(id);
    const newLabel = editDivRef.current?.textContent ?? "";
    if (node) {
      onNodesChange([
        {
          id,
          type: "replace",
          item: { ...node, data: { ...node.data, label: newLabel } },
        },
      ]);
    }
    setEditing(false);
  }, [id, getNode, onNodesChange]);

  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (e.key === "Escape") {
      setEditing(false);
    }
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      e.currentTarget.blur();
    }
  }, []);

  const fill = data.color ?? "#1F1F1F";
  const textColor = data.textColor ?? "#EDEDED";
  const stroke = getBorderColor(selected);
  const shape = data.shape ?? "rectangle";

  const handleColorSelect = useCallback(
    (newFill: string, newText: string) => {
      const node = getNode(id);
      if (!node) return;
      onNodesChange([
        {
          id,
          type: "replace",
          item: {
            ...node,
            data: { ...node.data, color: newFill, textColor: newText },
          },
        },
      ]);
    },
    [id, getNode, onNodesChange],
  );

  return (
    <>
      <NodeResizer
        isVisible={!!selected}
        minWidth={MIN_WIDTH}
        minHeight={MIN_HEIGHT}
        handleStyle={{
          background: "#12121a",
          border: "2px solid #00c8d4",
          width: 8,
          height: 8,
          borderRadius: 2,
        }}
        lineStyle={{ border: "1px dashed #00c8d4", opacity: 0.5 }}
      />
      <div
        className="w-full h-full relative group"
        onDoubleClick={!editing ? startEditing : undefined}
      >
        {selected && !editing && (
          <ColorToolbar
            activeFill={fill}
            activeText={textColor}
            onColorSelect={handleColorSelect}
          />
        )}
        {renderShape(
          shape,
          fill,
          stroke,
          textColor,
          editing ? null : data.label,
        )}
        {editing && (
          <div
            ref={editDivRef}
            contentEditable
            suppressContentEditableWarning
            onBlur={commitEdit}
            onKeyDown={handleKeyDown}
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            className="nodrag nopan absolute inset-0 w-full h-full flex items-center justify-center text-center text-sm font-medium outline-none z-10"
            style={{
              color: textColor,
              background: "transparent",
              padding: "8px",
              lineHeight: "1.4",
              wordBreak: "break-word",
            }}
          />
        )}
      </div>
      <Handle
        id="top"
        type="source"
        position={Position.Top}
        className="w-2.5! h-2.5! bg-white! border-2! border-[#1a1a2e]! rounded-full! opacity-0! group-hover:opacity-100! transition-opacity! duration-200!"
      />
      <Handle
        id="right"
        type="source"
        position={Position.Right}
        className="w-2.5! h-2.5! bg-white! border-2! border-[#1a1a2e]! rounded-full! opacity-0! group-hover:opacity-100! transition-opacity! duration-200!"
      />
      <Handle
        id="bottom"
        type="source"
        position={Position.Bottom}
        className="w-2.5! h-2.5! bg-white! border-2! border-[#1a1a2e]! rounded-full! opacity-0! group-hover:opacity-100! transition-opacity! duration-200!"
      />
      <Handle
        id="left"
        type="source"
        position={Position.Left}
        className="w-2.5! h-2.5! bg-white! border-2! border-[#1a1a2e]! rounded-full! opacity-0! group-hover:opacity-100! transition-opacity! duration-200!"
      />
    </>
  );
}

export const CanvasNode = memo(CanvasNodeComponent);
