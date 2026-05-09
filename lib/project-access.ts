import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import type { Project } from "@/lib/types";

export async function getCurrentIdentity(): Promise<{
  userId: string;
  email: string;
} | null> {
  const { userId } = await auth();
  if (!userId) return null;
  const user = await currentUser();
  const email = user?.primaryEmailAddress?.emailAddress ?? "";
  return { userId, email };
}

export async function getProjectWithAccess(
  projectId: string,
  userId: string,
  email?: string
): Promise<Project | null> {
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) return null;

  if (project.ownerId === userId) return project;

  if (email) {
    const normalizedEmail = email.trim().toLowerCase();
    const collab = await prisma.projectCollaborator.findFirst({
      where: { projectId, email: normalizedEmail },
    });
    if (collab) return project;
  }

  return null;
}
