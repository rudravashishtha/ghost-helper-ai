"use client";

import { LiveblocksProvider, RoomProvider, ClientSideSuspense } from "@liveblocks/react/suspense";
import { ErrorBoundary } from "react-error-boundary";
import { Canvas } from "./canvas";
import type { CanvasTemplate } from "@/components/editor/starter-templates";

interface CanvasWrapperProps {
  roomId: string;
  templateToImport?: CanvasTemplate | null;
  onTemplateImported?: () => void;
}

export function CanvasWrapper({ roomId, templateToImport, onTemplateImported }: CanvasWrapperProps) {
  return (
    <LiveblocksProvider authEndpoint="/api/liveblocks-auth">
      <RoomProvider id={roomId} initialPresence={{ cursor: null, isThinking: false }}>
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
              templateToImport={templateToImport}
              onTemplateImported={onTemplateImported}
            />
          </ClientSideSuspense>
        </ErrorBoundary>
      </RoomProvider>
    </LiveblocksProvider>
  );
}
