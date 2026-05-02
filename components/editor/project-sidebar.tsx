"use client"

import { X, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

interface ProjectSidebarProps {
  isOpen: boolean
  onClose: () => void
  sidebarId?: string
}

export function ProjectSidebar({ isOpen, onClose, sidebarId = "project-sidebar" }: ProjectSidebarProps) {
  return (
    <div
      id={sidebarId}
      aria-hidden={isOpen ? undefined : true}
      inert={isOpen ? undefined : true}
      className={[
        "fixed top-0 left-0 z-50 h-full w-72 flex flex-col",
        "bg-surface border-r border-surface-border",
        "transition-transform duration-200 ease-in-out",
        isOpen ? "translate-x-0" : "-translate-x-full",
      ].join(" ")}
    >
      <div className="flex items-center justify-between px-4 h-12 border-b border-surface-border shrink-0">
        <span className="text-sm font-semibold text-copy-primary">Projects</span>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          aria-label="Close sidebar"
          className="h-7 w-7 text-copy-muted hover:text-copy-primary"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col px-3 pt-3">
        <Tabs defaultValue="my-projects">
          <TabsList variant="line" className="w-full">
            <TabsTrigger value="my-projects" className="flex-1 text-xs">
              My Projects
            </TabsTrigger>
            <TabsTrigger value="shared" className="flex-1 text-xs">
              Shared
            </TabsTrigger>
          </TabsList>

          <TabsContent value="my-projects">
            <div className="flex items-center justify-center h-32 text-copy-faint text-sm">
              No projects yet
            </div>
          </TabsContent>

          <TabsContent value="shared">
            <div className="flex items-center justify-center h-32 text-copy-faint text-sm">
              No shared projects
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <div className="px-3 pb-4 shrink-0">
        <Button
          variant="default"
          className="w-full gap-2"
          size="sm"
        >
          <Plus className="h-4 w-4" />
          New Project
        </Button>
      </div>
    </div>
  )
}
