"use client";

import { useOther } from "@liveblocks/react";
import type { CursorsCursorProps } from "@liveblocks/react-flow";

export function CanvasCursor({ connectionId }: CursorsCursorProps) {
  const info = useOther(connectionId, (other) => other.info);
  const color = info?.color ?? "#00c8d4";
  const name = info?.name ?? "Collaborator";

  return (
    <div className="pointer-events-none select-none" style={{ position: "relative" }}>
      <svg
        width="14"
        height="18"
        viewBox="0 0 14 18"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M0 0L0 14.5L4 10L6.5 16.5L8.5 15.5L6 9H11L0 0Z"
          fill={color}
          stroke="rgba(0,0,0,0.4)"
          strokeWidth="0.5"
        />
      </svg>
      <div
        className="absolute left-3 top-3 px-1.5 py-0.5 rounded-full text-[11px] font-semibold text-white whitespace-nowrap leading-tight"
        style={{ backgroundColor: color }}
      >
        {name}
      </div>
    </div>
  );
}
