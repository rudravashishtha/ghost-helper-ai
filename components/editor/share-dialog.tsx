"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
import {
  Copy,
  Check,
  UserMinus,
  UserPlus,
  Loader2,
  Link2,
  X,
  Search,
} from "lucide-react";
import NextImage from "next/image";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface Person {
  email: string;
  name: string | null;
  imageUrl: string | null;
}

type Collaborator = Person;

function PersonRow({
  person,
  badge,
  badgeClass,
  onRemove,
  removing,
}: {
  person: Person;
  badge: string;
  badgeClass: string;
  onRemove?: () => void;
  removing?: boolean;
}) {
  return (
    <li className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-elevated">
      <div className="h-9 w-9 rounded-full bg-surface-border shrink-0 overflow-hidden flex items-center justify-center">
        {person.imageUrl ? (
          <NextImage
            src={person.imageUrl}
            alt={person.name ?? person.email}
            width={36}
            height={36}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="text-xs font-semibold text-copy-muted uppercase">
            {(person.name ?? person.email).charAt(0)}
          </span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        {person.name && (
          <p className="text-sm font-medium text-copy-primary truncate">
            {person.name}
          </p>
        )}
        <p className="text-xs text-copy-muted truncate">{person.email}</p>
      </div>
      <span
        className={`text-[10px] font-semibold tracking-wider px-2 py-0.5 rounded-md border ${badgeClass}`}
      >
        {badge}
      </span>
      {onRemove && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onRemove}
          disabled={removing}
          className="h-8 w-8 shrink-0 text-copy-faint hover:text-error hover:bg-error/10 rounded-lg"
          aria-label={`Remove ${person.email}`}
        >
          {removing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <UserMinus className="h-4 w-4" />
          )}
        </Button>
      )}
    </li>
  );
}

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  projectName: string;
  isOwner: boolean;
}

export interface ShareDialogHandle {
  loadCollaborators: () => Promise<void>;
}

export const ShareDialog = forwardRef<ShareDialogHandle, ShareDialogProps>(
  function ShareDialog(
    { open, onOpenChange, projectId, projectName, isOwner }: ShareDialogProps,
    ref,
  ) {
    const [owner, setOwner] = useState<Person | null>(null);
    const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [searching, setSearching] = useState(false);
    const [nextCursor, setNextCursor] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState(false);

    const [inviteEmail, setInviteEmail] = useState("");
    const [inviting, setInviting] = useState(false);
    const [inviteError, setInviteError] = useState<string | null>(null);
    const [removingEmail, setRemovingEmail] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    const fetchCollaborators = useCallback(
      async (cursor?: string, query?: string) => {
        const isInitial = !cursor;
        if (isInitial) {
          if (query) setSearching(true);
          else setLoading(true);
        } else {
          setLoadingMore(true);
        }

        try {
          const params = new URLSearchParams();
          if (cursor) params.set("cursor", cursor);
          if (query) params.set("query", query);
          params.set("limit", "25");

          const res = await fetch(
            `/api/projects/${projectId}/collaborators?${params.toString()}`,
          );
          if (res.ok) {
            const data = await res.json();
            if (isInitial) {
              if (data.owner) setOwner(data.owner);
              setCollaborators(data.collaborators);
            } else {
              setCollaborators((prev) => [...prev, ...data.collaborators]);
            }
            setNextCursor(data.nextCursor);
            setHasMore(data.hasMore);
          }
        } finally {
          setLoading(false);
          setLoadingMore(false);
          setSearching(false);
        }
      },
      [projectId],
    );

    useImperativeHandle(
      ref,
      () => ({
        loadCollaborators: () => fetchCollaborators(undefined, searchQuery),
      }),
      [fetchCollaborators, searchQuery],
    );

    // Debounced search
    useEffect(() => {
      if (!open) return;
      const timer = setTimeout(() => {
        void fetchCollaborators(undefined, searchQuery);
      }, 300);
      return () => clearTimeout(timer);
    }, [searchQuery, fetchCollaborators, open]);

    async function handleInvite() {
      const email = inviteEmail.trim().toLowerCase();
      if (!email || !email.includes("@")) {
        setInviteError("Enter a valid email address");
        return;
      }

      setInviting(true);
      setInviteError(null);
      try {
        const res = await fetch(`/api/projects/${projectId}/collaborators`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });

        if (res.ok) {
          setInviteEmail("");
          setSearchQuery(""); // Clear search to show the new collaborator
          await fetchCollaborators();
        } else {
          const data = await res.json().catch(() => ({}));
          setInviteError(
            (data as { error?: string }).error ?? "Failed to invite",
          );
        }
      } finally {
        setInviting(false);
      }
    }

    async function handleRemove(email: string) {
      setRemovingEmail(email);
      try {
        const res = await fetch(
          `/api/projects/${projectId}/collaborators/${encodeURIComponent(email)}`,
          { method: "DELETE" },
        );
        if (res.ok) {
          setCollaborators((prev) => prev.filter((c) => c.email !== email));
        } else {
          // Optionally show error to user
          console.error("Failed to remove collaborator");
        }
      } catch (error) {
        console.error("Network error removing collaborator", { error });
      } finally {
        setRemovingEmail(null);
      }
    }

    function handleCopyLink() {
      const url = `${window.location.origin}/editor/${projectId}`;
      navigator.clipboard.writeText(url).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }

    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          className="glass-panel-deep p-0 gap-0 overflow-hidden sm:max-w-lg rounded-3xl flex flex-col max-h-[90vh]"
          showCloseButton={false}
        >
          <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-surface-border shrink-0">
            <h2 className="text-lg font-semibold text-copy-primary tracking-tight">
              Share &ldquo;{projectName}&rdquo;
            </h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="h-8 w-8 rounded-lg text-copy-muted hover:text-copy-primary hover:bg-elevated"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="p-6 flex flex-col gap-6">
              <div className="flex items-center gap-3">
                <div className="flex-1 flex items-center gap-3 px-4 h-10 rounded-xl border border-surface-border bg-elevated text-sm text-copy-muted font-mono overflow-hidden">
                  <Link2 className="h-4 w-4 shrink-0 text-copy-faint" />
                  <span className="truncate">
                    {typeof window !== "undefined"
                      ? `${window.location.origin}/editor/${projectId}`
                      : `/editor/${projectId}`}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCopyLink}
                  className="h-10 w-10 shrink-0 text-copy-muted hover:text-copy-primary hover:bg-elevated border border-surface-border rounded-xl"
                  aria-label="Copy link"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-success" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>

              {isOwner && (
                <div className="flex flex-col gap-3">
                  <label className="text-sm font-medium text-copy-secondary">
                    Invite by email
                  </label>
                  <div className="flex gap-2">
                    <Input
                      type="email"
                      placeholder="colleague@example.com"
                      value={inviteEmail}
                      onChange={(e) => {
                        setInviteEmail(e.target.value);
                        setInviteError(null);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          void handleInvite();
                        }
                      }}
                      className="flex-1 h-10 text-sm bg-elevated border-surface-border rounded-xl"
                      disabled={inviting}
                    />
                    <Button
                      onClick={() => void handleInvite()}
                      disabled={inviting || !inviteEmail.trim()}
                      className="h-10 px-4 text-sm bg-brand text-black hover:bg-brand/90 font-medium shrink-0 flex items-center gap-2 rounded-xl"
                    >
                      {inviting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <UserPlus className="h-4 w-4" />
                          <span>Invite</span>
                        </>
                      )}
                    </Button>
                  </div>
                  {inviteError && (
                    <p className="text-xs text-error mt-1">{inviteError}</p>
                  )}
                </div>
              )}

              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-copy-secondary">
                    People with access
                  </p>
                </div>

                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-copy-faint" />
                  <Input
                    placeholder="Search collaborators..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 h-10 text-sm bg-elevated border-surface-border rounded-xl"
                  />
                  {searching && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-copy-faint" />
                  )}
                </div>

                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-5 w-5 animate-spin text-copy-muted" />
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <ul className="flex flex-col gap-2">
                      {owner && !searchQuery && (
                        <PersonRow
                          person={owner}
                          badge="OWNER"
                          badgeClass="text-success border-success/30 bg-success/10"
                        />
                      )}
                      {collaborators.map((c) => (
                        <PersonRow
                          key={c.email}
                          person={c}
                          badge="COLLABORATOR"
                          badgeClass="text-copy-muted border-surface-border bg-elevated"
                          onRemove={
                            isOwner
                              ? () => void handleRemove(c.email)
                              : undefined
                          }
                          removing={removingEmail === c.email}
                        />
                      ))}
                    </ul>

                    {collaborators.length === 0 &&
                      !loading &&
                      !owner &&
                      searchQuery && (
                        <p className="text-center py-8 text-sm text-copy-muted">
                          No collaborators found matching &ldquo;{searchQuery}
                          &rdquo;
                        </p>
                      )}

                    {hasMore && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          void fetchCollaborators(
                            nextCursor ?? undefined,
                            searchQuery,
                          )
                        }
                        disabled={loadingMore}
                        className="w-full mt-2 h-10 text-xs text-copy-muted hover:text-copy-primary hover:bg-elevated rounded-xl flex items-center justify-center gap-2 border border-surface-border border-dashed"
                      >
                        {loadingMore ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <span>Load more collaborators</span>
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  },
);
