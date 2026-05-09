"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import type { Project } from "@/lib/types";

export type { Project };

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

function shortSuffix(): string {
  return Math.random().toString(36).slice(2, 8);
}

export function useProjectActions() {
  const router = useRouter();
  const params = useParams<{ projectId?: string }>();

  const [dialog, setDialog] = useState<DialogType>("none");
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [formName, setFormName] = useState("");
  const [loading, setLoading] = useState(false);
  const [createSuffix, setCreateSuffix] = useState("");

  function openCreate() {
    setFormName("");
    setCreateSuffix(shortSuffix());
    setDialog("create");
  }

  function openRename(project: Project) {
    setFormName(project.name);
    setActiveProject(project);
    setDialog("rename");
  }

  function openDelete(project: Project) {
    setActiveProject(project);
    setDialog("delete");
  }

  function closeDialog() {
    setDialog("none");
    setActiveProject(null);
    setFormName("");
    setLoading(false);
    setCreateSuffix("");
  }

  async function handleCreate() {
    const trimmedName = formName.trim();
    const slug = nameToSlug(trimmedName);
    if (!trimmedName || !slug) return;

    if (!createSuffix) return;
    setLoading(true);

    async function attemptCreate(suffix: string): Promise<boolean> {
      const roomId = `${slug}-${suffix}`;
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmedName, id: roomId }),
      });
      if (res.status === 409) return false;
      if (!res.ok) throw new Error("Failed to create project");
      closeDialog();
      router.push(`/editor/${roomId}`);
      return true;
    }

    try {
      const ok = await attemptCreate(createSuffix);
      if (!ok) {
        await attemptCreate(shortSuffix());
      }
    } catch {
      setLoading(false);
    }
  }

  async function handleRename() {
    const trimmedName = formName.trim();
    if (!trimmedName || !activeProject) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/projects/${activeProject.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmedName }),
      });
      if (!res.ok) throw new Error("Failed to rename project");
      closeDialog();
      router.refresh();
    } catch {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!activeProject) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/projects/${activeProject.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete project");
      closeDialog();
      if (params?.projectId === activeProject.id) {
        router.push("/editor");
      } else {
        router.refresh();
      }
    } catch {
      setLoading(false);
    }
  }

  const previewRoomId = (() => {
    const slug = nameToSlug(formName);
    return slug && createSuffix ? `${slug}-${createSuffix}` : "";
  })();

  return {
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
  };
}
