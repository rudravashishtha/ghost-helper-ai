"use client";

import { useRef, useState } from "react";
import { BrainCircuit } from "lucide-react";
import { EditorNavbar } from "@/components/editor/editor-navbar";
import { ProjectSidebar } from "@/components/editor/project-sidebar";
import {
  ShareDialog,
  type ShareDialogHandle,
} from "@/components/editor/share-dialog";
import { CreateProjectDialog } from "@/components/editor/dialogs/create-project-dialog";
import { RenameProjectDialog } from "@/components/editor/dialogs/rename-project-dialog";
import { DeleteProjectDialog } from "@/components/editor/dialogs/delete-project-dialog";
import { useProjectActions } from "@/hooks/use-project-actions";
import { CanvasWrapper } from "@/components/editor/canvas/canvas-wrapper";
import { StarterTemplatesModal } from "@/components/editor/starter-templates-modal";
import type { CanvasTemplate } from "@/components/editor/starter-templates";
import type { Project } from "@/lib/types";

interface WorkspaceShellProps {
  project: Project;
  ownedProjects: Project[];
  sharedProjects: Project[];
  isOwner: boolean;
}

export function WorkspaceShell({
  project,
  ownedProjects,
  sharedProjects,
  isOwner,
}: WorkspaceShellProps) {
  const shareDialogRef = useRef<ShareDialogHandle>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [shareLoadError, setShareLoadError] = useState<string | null>(null);
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [templateToImport, setTemplateToImport] = useState<CanvasTemplate | null>(null);

  const {
    dialog,
    activeProject,
    formName,
    setFormName,
    loading,
    previewRoomId,
    openCreate,
    openRename,
    openDelete,
    closeDialog,
    handleCreate,
    handleRename,
    handleDelete,
  } = useProjectActions();

  function handleShareOpen() {
    setShareOpen(true);
    setShareLoadError(null);
    shareDialogRef.current?.loadCollaborators().catch((error) => {
      console.error("Failed to load collaborators", { error });
      setShareLoadError("Failed to load collaborators");
    });
  }

  return (
    <div className="flex flex-col h-screen bg-base">
      <EditorNavbar
        isSidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen((v) => !v)}
        projectName={project.name}
        onOpenTemplates={() => setTemplatesOpen(true)}
        onShare={handleShareOpen}
        isAIOpen={aiOpen}
        onToggleAI={() => setAiOpen((v) => !v)}
      />

      <div className="flex flex-1 overflow-hidden">
        <ProjectSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          ownedProjects={ownedProjects}
          sharedProjects={sharedProjects}
          currentRoomId={project.id}
          onNewProject={openCreate}
          onRenameProject={openRename}
          onDeleteProject={openDelete}
        />

        <main className="flex-1 overflow-hidden relative bg-base">
          <CanvasWrapper
            roomId={project.id}
            templateToImport={templateToImport}
            onTemplateImported={() => setTemplateToImport(null)}
          />
        </main>
      </div>

      {aiOpen && (
        <aside className="fixed z-40 flex flex-col top-16 right-2 h-[calc(100vh-3.5rem-16px)] w-80 bg-elevated/95 backdrop-blur-2xl border border-surface-border/60 rounded-2xl overflow-hidden shadow-[0_8px_40px_-4px_rgba(0,0,0,0.8),0_2px_12px_-2px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.04)]">
          <div className="flex items-center justify-between h-14 px-5 border-b border-surface-border shrink-0 bg-surface/30">
            <div className="flex items-center gap-2">
              <BrainCircuit className="h-4 w-4 text-ai-text" />
              <span className="text-sm font-semibold tracking-wide text-copy-primary">
                AI Assistant
              </span>
            </div>
            <div className="flex gap-1.5">
              <div className="h-1 w-1 rounded-full bg-ai/40" />
              <div className="h-1 w-1 rounded-full bg-ai/40" />
            </div>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center gap-6 relative">
            <div className="absolute inset-0 bg-linear-to-b from-ai/5 to-transparent pointer-events-none" />

            <div className="relative h-20 w-20 rounded-full glass-panel-deep border border-ai/20 flex items-center justify-center glow-celestial mb-2">
              <BrainCircuit className="h-8 w-8 text-ai-text opacity-50" />
            </div>

            <div className="relative z-10 space-y-2">
              <p className="text-sm text-copy-muted max-w-50 leading-relaxed">
                System Offline
              </p>
              <p className="text-sm text-copy-muted max-w-50 leading-relaxed">
                The neural generation features are currently in standby mode.
              </p>
            </div>
          </div>
        </aside>
      )}

      <StarterTemplatesModal
        open={templatesOpen}
        onOpenChange={setTemplatesOpen}
        onImport={setTemplateToImport}
      />

      <ShareDialog
        ref={shareDialogRef}
        open={shareOpen}
        onOpenChange={setShareOpen}
        projectId={project.id}
        projectName={project.name}
        isOwner={isOwner}
        loadErrorMessage={shareLoadError}
      />

      <CreateProjectDialog
        open={dialog === "create"}
        onOpenChange={(open) => {
          if (!open) closeDialog();
        }}
        name={formName}
        onNameChange={setFormName}
        onCreate={handleCreate}
        loading={loading}
        previewRoomId={previewRoomId}
      />

      <RenameProjectDialog
        open={dialog === "rename"}
        onOpenChange={(open) => {
          if (!open) closeDialog();
        }}
        project={activeProject}
        name={formName}
        onNameChange={setFormName}
        onRename={handleRename}
        loading={loading}
      />

      <DeleteProjectDialog
        open={dialog === "delete"}
        onOpenChange={(open) => {
          if (!open) closeDialog();
        }}
        project={activeProject}
        onDelete={handleDelete}
        loading={loading}
      />
    </div>
  );
}
