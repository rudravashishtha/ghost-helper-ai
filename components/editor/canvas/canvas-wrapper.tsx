"use client";

import { LiveblocksProvider, RoomProvider, ClientSideSuspense } from "@liveblocks/react/suspense";
import { ErrorBoundary } from "react-error-boundary";
import { Canvas } from "./canvas";
import type { CanvasTemplate } from "@/components/editor/starter-templates";
import type { SaveStatus } from "@/hooks/use-canvas-autosave";

interface CanvasWrapperProps {
  roomId: string;
  templateToImport?: CanvasTemplate | null;
  onTemplateImported?: () => void;
  onSaveStatusChange?: (status: SaveStatus) => void;
  onSaveReady?: (saveFn: () => void) => void;
}

export function CanvasWrapper({ roomId, templateToImport, onTemplateImported, onSaveStatusChange, onSaveReady }: CanvasWrapperProps) {
  return (
    <LiveblocksProvider authEndpoint="/api/liveblocks-auth">
      <RoomProvider id={roomId} initialPresence={{ cursor: null, thinking: false }}>
        <ErrorBoundary fallback={
          <div className="flex h-full w-full items-center justify-center text-copy-muted text-sm">
            Connection error — unable to join canvas.
          </div>
        }>
          <ClientSideSuspense fallback={
            <div className="flex h-full w-full items-center justify-center text-copy-muted text-sm">
              Connecting…
            </div>
          }>
            <Canvas
              projectId={roomId}
              templateToImport={templateToImport}
              onTemplateImported={onTemplateImported}
              onSaveStatusChange={onSaveStatusChange}
              onSaveReady={onSaveReady}
            />
          </ClientSideSuspense>
        </ErrorBoundary>
      </RoomProvider>
    </LiveblocksProvider>
  );
}
