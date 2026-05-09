"use client";

import { X, Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import type { Project } from "@/lib/types";

interface ProjectSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  ownedProjects: Project[];
  sharedProjects: Project[];
  onNewProject: () => void;
  onRenameProject: (project: Project) => void;
  onDeleteProject: (project: Project) => void;
  currentRoomId?: string;
  sidebarId?: string;
}

interface ProjectItemProps {
  project: Project;
  isOwned: boolean;
  isActive?: boolean;
  onRename: (project: Project) => void;
  onDelete: (project: Project) => void;
}

function ProjectItem({ project, isOwned, isActive, onRename, onDelete }: ProjectItemProps) {
  return (
    <div className={[
      "group flex items-center gap-2 rounded-lg px-3 py-2 transition-all duration-300",
      isActive 
        ? "bg-brand/10 border border-brand/20 glow-celestial" 
        : "hover:bg-elevated border border-transparent",
    ].join(" ")}>
      <div className={[
        "h-1 w-1 rounded-full shrink-0 transition-colors",
        isActive ? "bg-brand shadow-[0_0_8px_rgba(0,200,212,0.8)]" : "bg-surface-border group-hover:bg-copy-muted",
      ].join(" ")} />
      
      <span className={[
        "flex-1 truncate text-sm tracking-tight",
        isActive ? "text-brand font-medium" : "text-copy-primary",
      ].join(" ")}>
        {project.name}
      </span>

      {isOwned && (
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon-xs"
            className="h-6 w-6 text-copy-muted hover:text-copy-primary"
            onClick={(e) => {
              e.stopPropagation();
              onRename(project);
            }}
            aria-label={`Rename ${project.name}`}
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon-xs"
            className="h-6 w-6 text-copy-muted hover:text-error"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(project);
            }}
            aria-label={`Delete ${project.name}`}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}
    </div>
  );
}

export function ProjectSidebar({
  isOpen,
  onClose,
  ownedProjects,
  sharedProjects,
  onNewProject,
  onRenameProject,
  onDeleteProject,
  currentRoomId,
  sidebarId = "project-sidebar",
}: ProjectSidebarProps) {
  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={onClose}
          aria-hidden
        />
      )}

      <div
        id={sidebarId}
        aria-hidden={isOpen ? undefined : true}
        inert={isOpen ? undefined : true}
        className={[
          "fixed z-40 flex flex-col",
          "top-16 left-2 h-[calc(100vh-3.5rem-16px)] w-72",
          "bg-elevated/95 backdrop-blur-2xl",
          "border border-surface-border/60 rounded-2xl overflow-hidden",
          "transition-all duration-300 ease-in-out",
          isOpen
            ? "translate-x-0 shadow-[0_8px_40px_-4px_rgba(0,0,0,0.8),0_2px_12px_-2px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.04)]"
            : "-translate-x-[calc(100%+0.5rem)] shadow-none",
        ].join(" ")}
      >
        <div className="flex items-center justify-between px-4 h-14 border-b border-surface-border shrink-0">
          <span className="text-sm font-semibold text-copy-primary">
            Projects
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Close sidebar"
            className="h-8 w-8 text-copy-muted hover:text-copy-primary hover:bg-elevated"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col px-3 pt-4 gap-2">
          <Tabs defaultValue="my-projects" className="flex flex-col flex-1">
            <TabsList variant="line" className="w-full">
              <TabsTrigger value="my-projects" className="flex-1 text-xs font-medium py-1.5">
                My Projects
              </TabsTrigger>
              <TabsTrigger value="shared" className="flex-1 text-xs font-medium py-1.5">
                Shared
              </TabsTrigger>
            </TabsList>

            <TabsContent value="my-projects" className="flex-1 overflow-y-auto mt-2">
              {ownedProjects.length === 0 ? (
                <div className="flex items-center justify-center h-32 text-sm text-copy-faint">
                  No projects yet
                </div>
              ) : (
                <div className="flex flex-col gap-0.5">
                  {ownedProjects.map((project) => (
                    <ProjectItem
                      key={project.id}
                      project={project}
                      isOwned
                      isActive={project.id === currentRoomId}
                      onRename={onRenameProject}
                      onDelete={onDeleteProject}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="shared" className="flex-1 overflow-y-auto mt-2">
              {sharedProjects.length === 0 ? (
                <div className="flex items-center justify-center h-32 text-sm text-copy-faint">
                  No shared projects
                </div>
              ) : (
                <div className="flex flex-col gap-0.5">
                  {sharedProjects.map((project) => (
                    <ProjectItem
                      key={project.id}
                      project={project}
                      isOwned={false}
                      isActive={project.id === currentRoomId}
                      onRename={onRenameProject}
                      onDelete={onDeleteProject}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        <div className="p-4 shrink-0">
          <Button
            variant="default"
            className="w-full gap-2"
            onClick={onNewProject}
          >
            <Plus className="h-4 w-4" />
            New Project
          </Button>
        </div>
      </div>
    </>
  );
}
