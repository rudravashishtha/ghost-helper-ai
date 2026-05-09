"use client";

import { X, Pencil, Trash2, FolderOpen, Share2, Sparkles } from "lucide-react";
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
  onNavigate: (roomId: string) => void;
  currentRoomId?: string;
  sidebarId?: string;
}

interface ProjectItemProps {
  project: Project;
  isOwned: boolean;
  isActive?: boolean;
  onRename: (project: Project) => void;
  onDelete: (project: Project) => void;
  onNavigate: (roomId: string) => void;
}

function ProjectItem({
  project,
  isOwned,
  isActive,
  onRename,
  onDelete,
  onNavigate,
}: ProjectItemProps) {
  return (
    <div
      onClick={() => onNavigate(project.id)}
      className={[
        "group relative flex items-center gap-2 rounded-lg px-3 py-2 transition-all duration-300 cursor-pointer",
        isActive
          ? "bg-brand/10 border border-brand/20 glow-celestial translate-x-1"
          : "hover:bg-subtle hover:translate-x-1 border border-transparent hover:border-surface-border/40",
      ].join(" ")}
    >
      {/* Left accent bar on hover/active */}
      <div
        className={[
          "absolute left-0 top-2 bottom-2 w-0.5 rounded-full transition-all duration-300",
          isActive
            ? "bg-brand opacity-100"
            : "bg-ai opacity-0 group-hover:opacity-100",
        ].join(" ")}
      />

      <div
        className={[
          "h-1.5 w-1.5 rounded-full shrink-0 transition-all duration-300",
          isActive
            ? "bg-brand shadow-[0_0_8px_rgba(0,200,212,0.8)] scale-110"
            : "bg-surface-border group-hover:bg-ai group-hover:shadow-[0_0_8px_rgba(100,87,249,0.5)] group-hover:scale-110",
        ].join(" ")}
      />

      <span
        className={[
          "flex-1 truncate text-sm tracking-tight transition-colors duration-300",
          isActive
            ? "text-brand font-medium"
            : "text-copy-primary group-hover:text-copy-primary",
        ].join(" ")}
      >
        {project.name}
      </span>

      {isOwned && (
        <div
          className={[
            "flex items-center gap-0.5 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-all duration-300",
            "translate-x-1 group-hover:translate-x-0",
          ].join(" ")}
        >
          <Button
            variant="ghost"
            size="icon-xs"
            className="h-6 w-6 text-copy-muted hover:text-copy-primary hover:bg-white/5 transition-colors"
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
            className="h-6 w-6 text-copy-muted hover:text-error hover:bg-error/10 transition-colors"
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
  onNavigate,
  currentRoomId,
  sidebarId = "project-sidebar",
}: ProjectSidebarProps) {
  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm md:hidden transition-opacity duration-300"
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
          "transition-all duration-500 cubic-bezier(0.16, 1, 0.3, 1)",
          isOpen
            ? "translate-x-0 shadow-[0_20px_50px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.05)]"
            : "-translate-x-[calc(100%+0.5rem)] shadow-none",
        ].join(" ")}
      >
        {/* Header with AI accent */}
        <div className="relative flex items-center justify-between px-4 h-14 border-b border-surface-border shrink-0 overflow-hidden">
          <div className="absolute bottom-0 left-0 w-full h-px bg-linear-to-r from-transparent via-ai/40 to-transparent" />

          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-ai animate-pulse shadow-[0_0_8px_var(--accent-ai)]" />
            <span className="text-sm font-bold text-copy-primary tracking-tight">
              Projects
            </span>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Close sidebar"
            className="h-8 w-8 text-copy-muted hover:text-copy-primary hover:bg-subtle rounded-lg transition-colors"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col px-3 pt-4 gap-2 relative">
          <Tabs defaultValue="my-projects" className="flex flex-col flex-1">
            <TabsList
              variant="line"
              className="w-full bg-transparent border-b border-surface-border/40"
            >
              <TabsTrigger
                value="my-projects"
                className="flex-1 text-xs font-semibold py-2 data-[state=active]:text-ai"
              >
                My Projects
              </TabsTrigger>
              <TabsTrigger
                value="shared"
                className="flex-1 text-xs font-semibold py-2 data-[state=active]:text-ai"
              >
                Shared
              </TabsTrigger>
            </TabsList>

            <TabsContent
              value="my-projects"
              className={[
                "flex-1 overflow-y-auto mt-2 pr-1",
                "[scrollbar-width:thin] [scrollbar-color:var(--color-surface-border)_transparent]",
                "[&::-webkit-scrollbar]:w-1",
                "[&::-webkit-scrollbar-thumb]:bg-surface-border/50",
                "[&::-webkit-scrollbar-thumb]:rounded-full",
                "hover:[&::-webkit-scrollbar-thumb]:bg-ai/30",
              ].join(" ")}
            >
              {ownedProjects.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-center px-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="w-12 h-12 rounded-2xl bg-ai/5 border border-ai/10 flex items-center justify-center mb-3 glow-celestial">
                    <FolderOpen className="h-6 w-6 text-ai/60" />
                  </div>
                  <p className="text-sm text-copy-primary font-medium">
                    No projects yet
                  </p>
                  <p className="text-xs text-copy-faint mt-1 leading-relaxed">
                    Create your first masterpiece to see it here.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-1 py-1">
                  {ownedProjects.map((project) => (
                    <ProjectItem
                      key={project.id}
                      project={project}
                      isOwned
                      onNavigate={onNavigate}
                      isActive={project.id === currentRoomId}
                      onRename={onRenameProject}
                      onDelete={onDeleteProject}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent
              value="shared"
              className={[
                "flex-1 overflow-y-auto mt-2 pr-1",
                "[scrollbar-width:thin] [scrollbar-color:var(--color-surface-border)_transparent]",
                "[&::-webkit-scrollbar]:w-1",
                "[&::-webkit-scrollbar-thumb]:bg-surface-border/50",
                "[&::-webkit-scrollbar-thumb]:rounded-full",
                "hover:[&::-webkit-scrollbar-thumb]:bg-ai/30",
              ].join(" ")}
            >
              {sharedProjects.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-center px-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="w-12 h-12 rounded-2xl bg-ai/5 border border-ai/10 flex items-center justify-center mb-3 glow-celestial">
                    <Share2 className="h-6 w-6 text-ai/60" />
                  </div>
                  <p className="text-sm text-copy-primary font-medium">
                    No shared projects
                  </p>
                  <p className="text-xs text-copy-faint mt-1 leading-relaxed">
                    Projects shared with you will appear here.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-1 py-1">
                  {sharedProjects.map((project) => (
                    <ProjectItem
                      key={project.id}
                      project={project}
                      isOwned={false}
                      onNavigate={onNavigate}
                      isActive={project.id === currentRoomId}
                      onRename={onRenameProject}
                      onDelete={onDeleteProject}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>

          {/* Bottom radial glow */}
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-linear-to-t from-ai/5 to-transparent pointer-events-none" />
        </div>

        <div className="p-4 shrink-0 bg-elevated/50 backdrop-blur-sm border-t border-surface-border">
          <Button
            variant="default"
            className="w-full gap-2 shadow-[0_0_20px_-5px_rgba(0,200,212,0.4)] hover:shadow-[0_0_25px_-2px_rgba(0,200,212,0.5)] transition-all duration-300"
            onClick={onNewProject}
          >
            <Sparkles className="h-4 w-4" />
            New Project
          </Button>
        </div>
      </div>
    </>
  );
}
