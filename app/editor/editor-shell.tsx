"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { EditorNavbar } from "@/components/editor/editor-navbar"
import { ProjectSidebar } from "@/components/editor/project-sidebar"
import { CreateProjectDialog } from "@/components/editor/dialogs/create-project-dialog"
import { RenameProjectDialog } from "@/components/editor/dialogs/rename-project-dialog"
import { DeleteProjectDialog } from "@/components/editor/dialogs/delete-project-dialog"
import { Button } from "@/components/ui/button"
import { useProjectDialogs } from "@/hooks/use-project-dialogs"

export function EditorShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const {
    projects,
    dialog,
    activeProject,
    formName,
    setFormName,
    loading,
    openCreate,
    openRename,
    openDelete,
    closeDialog,
    handleCreate,
    handleRename,
    handleDelete,
  } = useProjectDialogs()

  return (
    <div className="flex flex-col h-screen bg-base">
      <EditorNavbar
        isSidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen((v) => !v)}
      />

      <ProjectSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        projects={projects}
        onNewProject={openCreate}
        onRenameProject={openRename}
        onDeleteProject={openDelete}
      />

      <main className="flex-1 overflow-hidden flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex flex-col items-center gap-2">
            <h1 className="text-xl font-semibold text-copy-primary">
              Create a project or open an existing one
            </h1>
            <p className="text-sm text-copy-muted max-w-xs">
              Start a new architecture workspace, or choose a project from the sidebar.
            </p>
          </div>
          <Button onClick={openCreate} className="gap-2">
            <Plus className="h-4 w-4" />
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
