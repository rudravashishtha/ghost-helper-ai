"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { EditorNavbar } from "@/components/editor/editor-navbar"
import { ProjectSidebar } from "@/components/editor/project-sidebar"
import { CreateProjectDialog } from "@/components/editor/dialogs/create-project-dialog"
import { RenameProjectDialog } from "@/components/editor/dialogs/rename-project-dialog"
import { DeleteProjectDialog } from "@/components/editor/dialogs/delete-project-dialog"
import { Button } from "@/components/ui/button"
import { useProjectActions } from "@/hooks/use-project-actions"
import type { Project } from "@/lib/types"

interface EditorShellProps {
  ownedProjects: Project[]
  sharedProjects: Project[]
}

export function EditorShell({ ownedProjects, sharedProjects }: EditorShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

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
  } = useProjectActions()

  return (
    <div className="flex flex-col h-screen bg-base">
      <EditorNavbar
        isSidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen((v) => !v)}
      />

      <ProjectSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        ownedProjects={ownedProjects}
        sharedProjects={sharedProjects}
        onNewProject={openCreate}
        onRenameProject={openRename}
        onDeleteProject={openDelete}
      />

      <main className="flex-1 overflow-hidden relative flex flex-col items-center justify-center p-6 bg-cosmic">
        <div className="absolute inset-0 bg-cosmic-grid pointer-events-none opacity-50" />
        
        <div className="relative z-10 flex flex-col items-center max-w-2xl w-full text-center">
          <div className="mb-10 relative" aria-hidden="true">
            <div className="absolute -inset-8 bg-brand/20 blur-3xl rounded-full opacity-60" />
            <div className="relative flex items-center justify-center w-20 h-20 rounded-full glass-panel-deep border border-brand/30 glow-celestial">
              <Plus className="h-8 w-8 text-brand" />
            </div>
          </div>

          <div className="flex flex-col items-center gap-4 mb-10">
            <div className="space-y-3">
              <h1 className="text-4xl font-semibold tracking-tight text-copy-primary">
                Initialize Workspace
              </h1>
              <p className="text-lg text-copy-muted max-w-md mx-auto leading-relaxed">
                Connect to the neural architecture core. Create a new project or select an active node.
              </p>
            </div>
          </div>

          <Button 
            onClick={openCreate} 
            size="lg"
            className="gap-2 px-8 h-12 text-base rounded-full shadow-[0_0_20px_rgba(0,200,212,0.3)] hover:shadow-[0_0_30px_rgba(0,200,212,0.5)] transition-shadow"
          >
            <Plus className="h-5 w-5" />
            New Project
          </Button>
        </div>
      </main>

      <CreateProjectDialog
        open={dialog === "create"}
        onOpenChange={(open) => { if (!open) closeDialog() }}
        name={formName}
        onNameChange={setFormName}
        onCreate={handleCreate}
        loading={loading}
        previewRoomId={previewRoomId}
      />

      <RenameProjectDialog
        open={dialog === "rename"}
        onOpenChange={(open) => { if (!open) closeDialog() }}
        project={activeProject}
        name={formName}
        onNameChange={setFormName}
        onRename={handleRename}
        loading={loading}
      />

      <DeleteProjectDialog
        open={dialog === "delete"}
        onOpenChange={(open) => { if (!open) closeDialog() }}
        project={activeProject}
        onDelete={handleDelete}
        loading={loading}
      />
    </div>
  )
}
