"use client";

import { useOthers } from "@liveblocks/react";

const MAX_VISIBLE = 5;

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function PresenceAvatars() {
  const others = useOthers();
  const visible = others.slice(0, MAX_VISIBLE);
  const overflow = others.length - MAX_VISIBLE;

  if (others.length === 0) return null;

  return (
    <div className="flex items-center gap-2 px-2 py-1.5">
      <div className="flex items-center">
        {visible.map((other, i) => {
          const info = other.info;
          const label = info?.name ?? "Collaborator";
          return (
            <div
              key={other.connectionId}
              className="group relative h-7 w-7 rounded-full overflow-visible border-2 border-base ring-1 ring-white/10 flex items-center justify-center shrink-0"
              style={{
                backgroundColor: info?.color ?? "#3a3a46",
                marginLeft: i === 0 ? 0 : "-0.5rem",
                zIndex: MAX_VISIBLE - i,
              }}
            >
              <div className="h-full w-full rounded-full overflow-hidden flex items-center justify-center">
                {info?.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={info.avatar}
                    alt={label}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-[10px] font-semibold text-white leading-none">
                    {info?.name ? getInitials(info.name) : "?"}
                  </span>
                )}
              </div>
              <div className="pointer-events-none absolute top-full right-0 mt-2 z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                <div className="bg-elevated border border-surface-border text-copy-primary text-xs font-medium px-2 py-1 rounded-md whitespace-nowrap shadow-lg">
                  {label}
                </div>
              </div>
            </div>
          );
        })}
        {overflow > 0 && (
          <div
            className="h-7 w-7 rounded-full bg-elevated border-2 border-base ring-1 ring-white/10 flex items-center justify-center shrink-0 text-[10px] font-semibold text-copy-muted"
            style={{
              marginLeft: "-0.5rem",
              position: "relative",
              zIndex: 0,
            }}
          >
            +{overflow}
          </div>
        )}
      </div>
    </div>
  );
}
