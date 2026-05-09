"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
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
import { AiSidebar } from "@/components/editor/ai-sidebar";
import type { CanvasTemplate } from "@/components/editor/starter-templates";
import type { Project } from "@/lib/types";
import type { SaveStatus } from "@/hooks/use-canvas-autosave";

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
  const saveFnRef = useRef<(() => void) | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();

  const onNavigate = useCallback(
    (roomId: string) => {
      if (roomId === project.id) {
        setSidebarOpen(false);
        return;
      }
      router.push(`/editor/${roomId}`);
    },
    [router, project.id],
  );

  const [aiOpen, setAiOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
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
        saveStatus={saveStatus}
        onSave={() => saveFnRef.current?.()}
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
          onNavigate={onNavigate}
        />

        <main className="flex-1 overflow-hidden relative bg-base">
          <CanvasWrapper
            roomId={project.id}
            templateToImport={templateToImport}
            onTemplateImported={() => setTemplateToImport(null)}
            onSaveStatusChange={setSaveStatus}
            onSaveReady={(fn) => { saveFnRef.current = fn; }}
          />
        </main>
      </div>

      <AiSidebar isOpen={aiOpen} onClose={() => setAiOpen(false)} />

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
