"use client";

import { memo, useState, useRef, useCallback, useEffect } from "react";
import {
  getSmoothStepPath,
  EdgeLabelRenderer,
  Position,
  useReactFlow,
  type EdgeProps,
} from "@xyflow/react";
import type { CanvasEdge as CanvasEdgeType, CanvasEdgeData } from "@/types/canvas";
import { useCanvas } from "./canvas-context";

type CanvasEdgeProps = EdgeProps<CanvasEdgeType>;

const ARROW = 7;

function arrowPoints(tx: number, ty: number, pos: Position): string {
  switch (pos) {
    case Position.Top:
      return `${tx},${ty} ${tx - ARROW / 2},${ty + ARROW} ${tx + ARROW / 2},${ty + ARROW}`;
    case Position.Bottom:
      return `${tx},${ty} ${tx - ARROW / 2},${ty - ARROW} ${tx + ARROW / 2},${ty - ARROW}`;
    case Position.Left:
      return `${tx},${ty} ${tx + ARROW},${ty - ARROW / 2} ${tx + ARROW},${ty + ARROW / 2}`;
    case Position.Right:
      return `${tx},${ty} ${tx - ARROW},${ty - ARROW / 2} ${tx - ARROW},${ty + ARROW / 2}`;
  }
}

function CanvasEdgeComponent({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  selected,
  data,
}: CanvasEdgeProps) {
  const [hovered, setHovered] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const spanRef = useRef<HTMLSpanElement>(null);
  const [inputWidth, setInputWidth] = useState(80);
  const { getEdge } = useReactFlow();
  const { onEdgesChange } = useCanvas();

  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const label = data?.label ?? "";
  const active = selected || hovered;
  const strokeColor = selected ? "#00c8d4" : hovered ? "#c0c0d8" : "#9090b8";
  const strokeOpacity = active ? 1 : 0.75;

  useEffect(() => {
    if (spanRef.current) {
      setInputWidth(Math.max(80, spanRef.current.offsetWidth + 16));
    }
  }, [draft]);

  const startEditing = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setDraft(label);
      setEditing(true);
      setTimeout(() => inputRef.current?.focus(), 0);
    },
    [label],
  );

  const commitEdit = useCallback(() => {
    const edge = getEdge(id) as CanvasEdgeType | undefined;
    if (edge) {
      const newData: CanvasEdgeData = { ...edge.data, label: draft };
      onEdgesChange([
        {
          id,
          type: "replace",
          item: { ...edge, data: newData },
        },
      ]);
    }
    setEditing(false);
  }, [id, draft, getEdge, onEdgesChange]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      e.stopPropagation();
      if (e.key === "Enter") {
        e.preventDefault();
        commitEdit();
      }
      if (e.key === "Escape") {
        setEditing(false);
      }
    },
    [commitEdit],
  );

  return (
    <>
      <path
        d={edgePath}
        strokeWidth={20}
        stroke="transparent"
        fill="none"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onDoubleClick={startEditing}
        style={{ cursor: "pointer" }}
      />
      <path
        d={edgePath}
        fill="none"
        stroke={strokeColor}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeOpacity={strokeOpacity}
        style={{ transition: "stroke 0.15s ease, stroke-opacity 0.15s ease", pointerEvents: "none" }}
      />
      <polygon
        points={arrowPoints(targetX, targetY, targetPosition)}
        fill={strokeColor}
        fillOpacity={strokeOpacity}
        style={{ transition: "fill 0.15s ease, fill-opacity 0.15s ease", pointerEvents: "none" }}
      />
      <EdgeLabelRenderer>
        <div
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: "all",
          }}
          className="nodrag nopan"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          onDoubleClick={startEditing}
        >
          {editing ? (
            <>
              <span
                ref={spanRef}
                className="absolute invisible whitespace-pre text-xs font-medium"
                aria-hidden
              >
                {draft || " "}
              </span>
              <input
                ref={inputRef}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onBlur={commitEdit}
                onKeyDown={handleKeyDown}
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                className="nodrag nopan text-xs font-medium outline-none rounded-full px-2 py-0.5 text-center"
                style={{
                  width: inputWidth,
                  background: "#18181c",
                  border: "1px solid #00c8d4",
                  color: "#ededed",
                }}
              />
            </>
          ) : label ? (
            <span
              className="text-xs font-medium px-2 py-0.5 rounded-full select-none whitespace-nowrap"
              style={{
                background: "#18181c",
                border: "1px solid #2a2a30",
                color: "#a0a0c0",
              }}
            >
              {label}
            </span>
          ) : active ? (
            <span
              className="text-xs px-2 py-0.5 rounded-full select-none"
              style={{ color: "#6b6b8a", opacity: 0.6 }}
            >
              label
            </span>
          ) : null}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}

export const CanvasEdgeRenderer = memo(CanvasEdgeComponent);
