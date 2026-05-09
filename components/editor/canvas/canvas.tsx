"use client";

import { useCallback, useRef, type ComponentType } from "react";
import {
  ReactFlow,
  MiniMap,
  Background,
  BackgroundVariant,
  useReactFlow,
  type NodeChange,
  type NodeProps,
} from "@xyflow/react";
import { useLiveblocksFlow, Cursors } from "@liveblocks/react-flow";
import "@xyflow/react/dist/style.css";
import "@liveblocks/react-ui/styles.css";
import "@liveblocks/react-flow/styles.css";
import { CanvasNode } from "./canvas-node";
import { ShapePanel } from "./shape-panel";
import type { CanvasNode as CanvasNodeType, NodeShape } from "@/types/canvas";
import { DEFAULT_NODE_COLOR } from "@/types/canvas";

const nodeTypes: Record<string, ComponentType<NodeProps>> = {
  canvasNode: CanvasNode as unknown as ComponentType<NodeProps>,
};

let nodeCounter = 0;

interface ShapeDragPayload {
  shape: NodeShape;
  width: number;
  height: number;
}

function FlowPositionCapture({
  capture,
}: {
  capture: (fn: (point: { x: number; y: number }) => { x: number; y: number }) => void;
}) {
  const { screenToFlowPosition } = useReactFlow();
  capture(screenToFlowPosition);
  return null;
}

export function Canvas() {
  const screenToFlowPositionRef = useRef<
    ((point: { x: number; y: number }) => { x: number; y: number }) | null
  >(null);

  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, onDelete } =
    useLiveblocksFlow<CanvasNodeType>({
      suspense: true,
      nodes: { initial: [] },
      edges: { initial: [] },
    });

  const handleDragOver = useCallback((e: React.DragEvent) => {
    if (e.dataTransfer.types.includes("application/ghost-shape")) {
      e.preventDefault();
      e.dataTransfer.dropEffect = "copy";
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const raw = e.dataTransfer.getData("application/ghost-shape");
      if (!raw || !screenToFlowPositionRef.current) return;

      let payload: ShapeDragPayload;
      try {
        payload = JSON.parse(raw) as ShapeDragPayload;
      } catch {
        return;
      }

      const position = screenToFlowPositionRef.current({
        x: e.clientX,
        y: e.clientY,
      });

      const id = `${payload.shape}-${Date.now()}-${++nodeCounter}`;

      const newNode: CanvasNodeType = {
        id,
        type: "canvasNode",
        position: {
          x: position.x - payload.width / 2,
          y: position.y - payload.height / 2,
        },
        data: {
          label: "",
          color: DEFAULT_NODE_COLOR.fill,
          textColor: DEFAULT_NODE_COLOR.text,
          shape: payload.shape,
        },
        style: {
          width: payload.width,
          height: payload.height,
        },
      };

      const change: NodeChange<CanvasNodeType> = { type: "add", item: newNode };
      onNodesChange([change]);
    },
    [onNodesChange]
  );

  return (
    <div className="w-full h-full relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDelete={onDelete}
        nodeTypes={nodeTypes}
        connectOnClick={false}
        fitView
        proOptions={{ hideAttribution: true }}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <FlowPositionCapture
          capture={(fn) => {
            screenToFlowPositionRef.current = fn;
          }}
        />
        <Cursors />
        <MiniMap />
        <Background variant={BackgroundVariant.Dots} gap={28} size={1.5} />
      </ReactFlow>
      <ShapePanel />
    </div>
  );
}
