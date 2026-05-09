"use client";

import { memo } from "react";
import { Handle, Position } from "@xyflow/react";
import type { CanvasNodeData } from "@/types/canvas";

interface CanvasNodeProps {
  data: CanvasNodeData;
  selected?: boolean;
}

function CanvasNodeComponent({ data, selected }: CanvasNodeProps) {
  return (
    <>
      <Handle type="source" position={Position.Top} />
      <Handle type="source" position={Position.Right} />
      <Handle type="source" position={Position.Bottom} />
      <Handle type="source" position={Position.Left} />
      <div
        className="w-full h-full flex items-center justify-center rounded-xl border-2 px-3 py-2 text-sm font-medium overflow-hidden"
        style={{
          background: data.color ?? "#1F1F1F",
          color: data.textColor ?? "#EDEDED",
          borderColor: selected ? "#00c8d4" : "#2a2a30",
        }}
      >
        {data.label}
      </div>
    </>
  );
}

export const CanvasNode = memo(CanvasNodeComponent);
