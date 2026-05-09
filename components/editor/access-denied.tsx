import { Lock } from "lucide-react";
import Link from "next/link";

export function AccessDenied() {
  return (
    <div className="flex h-screen items-center justify-center bg-base">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-elevated border border-surface-border">
          <Lock className="h-6 w-6 text-copy-muted" aria-hidden="true" />
        </div>
        <div className="flex flex-col gap-1">
          <h1 className="font-semibold text-copy-primary">
            Access denied
          </h1>
          <p className="text-sm text-copy-muted max-w-xs">
            This project doesn&apos;t exist or you don&apos;t have permission to
            view it.
          </p>
        </div>
        <Link
          href="/editor"
          className="text-sm text-brand hover:underline underline-offset-4"
        >
          Back to editor
        </Link>
      </div>
    </div>
  );
}
