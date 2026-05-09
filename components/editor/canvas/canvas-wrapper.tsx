"use client";

import { LiveblocksProvider, RoomProvider, ClientSideSuspense } from "@liveblocks/react/suspense";
import { ErrorBoundary } from "react-error-boundary";
import { Canvas } from "./canvas";

interface CanvasWrapperProps {
  roomId: string;
}

export function CanvasWrapper({ roomId }: CanvasWrapperProps) {
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
            <Canvas />
          </ClientSideSuspense>
        </ErrorBoundary>
      </RoomProvider>
    </LiveblocksProvider>
  );
}
