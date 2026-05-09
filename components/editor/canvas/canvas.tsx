"use client";

import { useCallback, useEffect, useRef, type ComponentType } from "react";
import {
  ReactFlow,
  Panel,
  MiniMap,
  Background,
  BackgroundVariant,
  ConnectionMode,
  useReactFlow,
  type NodeChange,
  type NodeProps,
  type EdgeTypes,
  type OnEdgesChange,
} from "@xyflow/react";
import { useLiveblocksFlow, Cursors } from "@liveblocks/react-flow";
import { useUndo, useRedo, useCanUndo, useCanRedo, useUpdateMyPresence } from "@liveblocks/react";
import "@xyflow/react/dist/style.css";
import "@liveblocks/react-ui/styles.css";
import "@liveblocks/react-flow/styles.css";
import { CanvasNode } from "./canvas-node";
import { CanvasEdgeRenderer } from "./canvas-edge";
import { CanvasControls } from "./canvas-controls";
import { ShapePanel } from "./shape-panel";
import { CanvasContext, useCanvas } from "./canvas-context";
import { CanvasCursor } from "./canvas-cursor";
import { PresenceAvatars } from "./presence-avatars";
import type {
  CanvasNode as CanvasNodeType,
  CanvasEdge,
  NodeShape,
} from "@/types/canvas";
import type { EdgeChange } from "@xyflow/react";
import { DEFAULT_NODE_COLOR } from "@/types/canvas";
import type { CanvasTemplate } from "@/components/editor/starter-templates";
import { useCanvasAutosave, type SaveStatus } from "@/hooks/use-canvas-autosave";

const nodeTypes: Record<string, ComponentType<NodeProps>> = {
  canvasNode: CanvasNode as unknown as ComponentType<NodeProps>,
};

const edgeTypes = {
  canvasEdge: CanvasEdgeRenderer,
} as EdgeTypes;

const defaultEdgeOptions = {
  type: "canvasEdge",
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
  capture: (
    fn: (point: { x: number; y: number }) => { x: number; y: number },
  ) => void;
}) {
  const { screenToFlowPosition } = useReactFlow();
  capture(screenToFlowPosition);
  return null;
}

function TemplateImporter({
  templateToImport,
  onTemplateImported,
}: {
  templateToImport: CanvasTemplate | null;
  onTemplateImported: () => void;
}) {
  const { fitView, getNodes, getEdges } = useReactFlow();
  const { onNodesChange, onEdgesChange } = useCanvas();

  useEffect(() => {
    if (!templateToImport) return;

    const removeNodes = getNodes().map((nd) => ({
      type: "remove" as const,
      id: nd.id,
    }));
    const addNodes = templateToImport.nodes.map((nd) => ({
      type: "add" as const,
      item: nd as CanvasNodeType,
    }));
    onNodesChange([...removeNodes, ...addNodes]);

    const removeEdges = getEdges().map((eg) => ({
      type: "remove" as const,
      id: eg.id,
    }));
    const addEdges = templateToImport.edges.map((eg) => ({
      type: "add" as const,
      item: eg as CanvasEdge,
    }));
    onEdgesChange([...removeEdges, ...addEdges] as EdgeChange<CanvasEdge>[]);

    onTemplateImported();
    setTimeout(() => fitView({ padding: 0.15, duration: 500 }), 100);
  }, [
    templateToImport,
    onTemplateImported,
    onNodesChange,
    onEdgesChange,
    getNodes,
    getEdges,
    fitView,
  ]);

  return null;
}

function CanvasStateLoader({ projectId }: { projectId: string }) {
  const { fitView, getNodes, getEdges } = useReactFlow();
  const { onNodesChange, onEdgesChange } = useCanvas();
  const loadAttempted = useRef(false);

  useEffect(() => {
    if (loadAttempted.current) return;
    loadAttempted.current = true;

    const existingNodes = getNodes();
    const existingEdges = getEdges();
    if (existingNodes.length > 0 || existingEdges.length > 0) return;

    fetch(`/api/projects/${projectId}/canvas`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data) return;
        const addNodes = (data.nodes ?? []).map((nd: CanvasNodeType) => ({
          type: "add" as const,
          item: nd,
        }));
        const addEdges = (data.edges ?? []).map((eg: CanvasEdge) => ({
          type: "add" as const,
          item: eg,
        }));
        if (addNodes.length) onNodesChange(addNodes);
        if (addEdges.length) onEdgesChange(addEdges as EdgeChange<CanvasEdge>[]);
        if (addNodes.length || addEdges.length) {
          setTimeout(() => fitView({ padding: 0.15, duration: 500 }), 100);
        }
      })
      .catch(() => {});
  }, [projectId, fitView, getNodes, getEdges, onNodesChange, onEdgesChange]);

  return null;
}

interface CanvasProps {
  projectId: string;
  templateToImport?: CanvasTemplate | null;
  onTemplateImported?: () => void;
  onSaveStatusChange?: (status: SaveStatus) => void;
  onSaveReady?: (saveFn: () => void) => void;
}

export function Canvas({
  projectId,
  templateToImport = null,
  onTemplateImported = () => {},
  onSaveStatusChange,
  onSaveReady,
}: CanvasProps) {
  const screenToFlowPositionRef = useRef<
    ((point: { x: number; y: number }) => { x: number; y: number }) | null
  >(null);

  const undo = useUndo();
  const redo = useRedo();
  const canUndo = useCanUndo();
  const canRedo = useCanRedo();
  const updateMyPresence = useUpdateMyPresence();

  const handleMouseLeave = useCallback(() => {
    updateMyPresence({ cursor: null });
  }, [updateMyPresence]);

  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, onDelete } =
    useLiveblocksFlow<CanvasNodeType>({
      suspense: true,
      nodes: { initial: [] },
      edges: { initial: [] },
    });

  const onEdgesChangeTyped = useCallback(
    (changes: EdgeChange[]) => {
      return (onEdgesChange as OnEdgesChange)(changes);
    },
    [onEdgesChange],
  );

  const { status: saveStatus, save } = useCanvasAutosave(
    projectId,
    nodes as CanvasNodeType[],
    edges as CanvasEdge[],
  );

  useEffect(() => {
    onSaveStatusChange?.(saveStatus);
  }, [saveStatus, onSaveStatusChange]);

  useEffect(() => {
    onSaveReady?.(save);
  }, [save, onSaveReady]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        save();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [save]);

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
    [onNodesChange],
  );

  return (
    <div className="w-full h-full relative">
      <CanvasContext.Provider
        value={{
          onNodesChange,
          onEdgesChange: onEdgesChangeTyped,
        }}
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChangeTyped}
          onConnect={onConnect}
          onDelete={onDelete}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          defaultEdgeOptions={defaultEdgeOptions}
          connectionMode={ConnectionMode.Loose}
          connectOnClick={false}
          fitView
          proOptions={{ hideAttribution: true }}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onMouseLeave={handleMouseLeave}
        >
          <FlowPositionCapture
            capture={(fn) => {
              screenToFlowPositionRef.current = fn;
            }}
          />
          <CanvasStateLoader projectId={projectId} />
          <TemplateImporter
            templateToImport={templateToImport}
            onTemplateImported={onTemplateImported}
          />
          <Panel position="bottom-left">
            <CanvasControls
              undo={undo}
              redo={redo}
              canUndo={canUndo}
              canRedo={canRedo}
            />
          </Panel>
          <Cursors components={{ Cursor: CanvasCursor }} />
          <Panel position="top-right">
            <PresenceAvatars />
          </Panel>
          <MiniMap
            nodeColor={(node) =>
              (node.data as { color?: string }).color ?? "#2a2a38"
            }
            nodeStrokeColor="#3a3a50"
            maskColor="rgba(8,8,9,0.7)"
          />
          <Background variant={BackgroundVariant.Dots} gap={28} size={1.5} />
        </ReactFlow>
      </CanvasContext.Provider>
      <ShapePanel />
    </div>
  );
}
