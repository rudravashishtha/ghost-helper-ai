"use client";

import { useState } from "react";

export interface MockProject {
  id: string;
  name: string;
  slug: string;
  isOwned: boolean;
}

const MOCK_PROJECTS: MockProject[] = [
  {
    id: "1",
    name: "E-commerce Platform",
    slug: "e-commerce-platform",
    isOwned: true,
  },
  { id: "2", name: "Auth Service", slug: "auth-service", isOwned: true },
  { id: "3", name: "Data Pipeline", slug: "data-pipeline", isOwned: false },
];

export type DialogType = "none" | "create" | "rename" | "delete";

export function nameToSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function useProjectDialogs() {
  const [projects, setProjects] = useState<MockProject[]>(MOCK_PROJECTS);
  const [dialog, setDialog] = useState<DialogType>("none");
  const [activeProject, setActiveProject] = useState<MockProject | null>(null);
  const [formName, setFormName] = useState("");
  const [loading, setLoading] = useState(false);

  function openCreate() {
    setFormName("");
    setDialog("create");
  }

  function openRename(project: MockProject) {
    setFormName(project.name);
    setActiveProject(project);
    setDialog("rename");
  }

  function openDelete(project: MockProject) {
    setActiveProject(project);
    setDialog("delete");
  }

  function closeDialog() {
    setDialog("none");
    setActiveProject(null);
    setFormName("");
    setLoading(false);
  }

  function handleCreate() {
    const trimmedName = formName.trim();
    const slug = nameToSlug(trimmedName);
    if (!trimmedName || !slug) return;
    setLoading(true);
    setProjects((prev) => [
      ...prev,
      { id: String(Date.now()), name: trimmedName, slug, isOwned: true },
    ]);
    closeDialog();
  }

  function handleRename() {
    const trimmedName = formName.trim();
    const slug = nameToSlug(trimmedName);
    if (!trimmedName || !slug || !activeProject) return;
    setLoading(true);
    setProjects((prev) =>
      prev.map((p) =>
        p.id === activeProject.id ? { ...p, name: trimmedName, slug } : p,
      ),
    );
    closeDialog();
  }

  function handleDelete() {
    if (!activeProject) return;
    setLoading(true);
    setProjects((prev) => prev.filter((p) => p.id !== activeProject.id));
    closeDialog();
  }

  return {
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
  };
}
