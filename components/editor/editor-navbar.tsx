"use client";

import {
  PanelLeftOpen,
  PanelLeftClose,
  Share2,
  BrainCircuit,
  LayoutTemplate,
  Check,
  Loader2,
  AlertCircle,
  Save,
} from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import type { SaveStatus } from "@/hooks/use-canvas-autosave";

interface EditorNavbarProps {
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  sidebarId?: string;
  projectName?: string;
  onShare?: () => void;
  isAIOpen?: boolean;
  onToggleAI?: () => void;
  onOpenTemplates?: () => void;
  saveStatus?: SaveStatus;
  onSave?: () => void;
}

export function EditorNavbar({
  isSidebarOpen,
  onToggleSidebar,
  sidebarId = "project-sidebar",
  projectName,
  onShare,
  isAIOpen,
  onToggleAI,
  onOpenTemplates,
  saveStatus,
  onSave,
}: EditorNavbarProps) {
  return (
    <header className="relative h-14 flex items-center px-4 glass-panel-deep border-b border-surface-border shrink-0 z-50">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleSidebar}
          aria-expanded={isSidebarOpen}
          aria-controls={sidebarId}
          aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
          className="h-9 w-9 text-copy-muted hover:text-copy-primary hover:bg-elevated transition-colors"
        >
          {isSidebarOpen ? (
            <PanelLeftClose className="h-5 w-5" />
          ) : (
            <PanelLeftOpen className="h-5 w-5" />
          )}
        </Button>

        <div className="h-4 w-px bg-surface-border mx-1" />

        {projectName ? (
          <span className="text-sm font-medium text-copy-primary truncate max-w-xs tracking-tight">
            {projectName}
          </span>
        ) : (
          <span className="text-sm font-medium text-copy-primary tracking-tight flex items-center gap-2">
            <span
              className="h-1.5 w-1.5 rounded-full bg-brand glow-celestial"
              aria-hidden="true"
            />
            Ghost AI
          </span>
        )}
      </div>

      <div className="flex-1" />

      <div className="flex items-center gap-2">
        {onSave && (
          <Button
            variant="ghost"
            size="sm"
            onClick={saveStatus === "idle" || saveStatus === "error" ? onSave : undefined}
            disabled={saveStatus === "saving"}
            className={[
              "h-8 gap-1.5 text-xs font-medium transition-colors",
              saveStatus === "saved"
                ? "text-copy-muted cursor-default pointer-events-none"
                : saveStatus === "error"
                  ? "text-red-400 hover:text-red-300"
                  : "text-copy-muted hover:text-copy-primary",
            ].join(" ")}
          >
            {saveStatus === "saving" && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {saveStatus === "saved" && <Check className="h-3.5 w-3.5" />}
            {saveStatus === "error" && <AlertCircle className="h-3.5 w-3.5" />}
            {(!saveStatus || saveStatus === "idle") && <Save className="h-3.5 w-3.5" />}
            {saveStatus === "saving" ? "Saving…" : saveStatus === "saved" ? "Saved" : saveStatus === "error" ? "Save failed" : "Save"}
          </Button>
        )}
        {onOpenTemplates && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onOpenTemplates}
            className="h-8 gap-1.5 text-copy-muted hover:text-copy-primary text-xs font-medium"
          >
            <LayoutTemplate className="h-3.5 w-3.5" />
            Templates
          </Button>
        )}
        {onShare && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onShare}
            className="h-8 gap-1.5 text-copy-muted hover:text-copy-primary text-xs font-medium"
          >
            <Share2 className="h-3.5 w-3.5" />
            Share
          </Button>
        )}
        {onToggleAI && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleAI}
            aria-pressed={isAIOpen}
            aria-label={isAIOpen ? "Close AI sidebar" : "Open AI sidebar"}
            className={[
              "h-9 w-9 transition-all duration-300",
              isAIOpen
                ? "text-ai-text bg-ai/10 glow-celestial border border-ai/20"
                : "text-copy-muted hover:text-copy-primary hover:bg-elevated",
            ].join(" ")}
          >
            <BrainCircuit className="h-5 w-5" />
          </Button>
        )}
        <div className="h-4 w-px bg-surface-border mx-2" />
        <div className="flex items-center justify-center">
          <UserButton
            appearance={{
              elements: {
                userButtonAvatarBox: "h-7 w-7",
              },
            }}
          />
        </div>
      </div>
    </header>
  );
}
