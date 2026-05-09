import { prisma } from "@/lib/prisma";
import type { Project } from "@/lib/types";

export async function getOwnedProjects(userId: string): Promise<Project[]> {
  return prisma.project.findMany({
    where: { ownerId: userId },
    orderBy: { createdAt: "desc" },
  });
}

export async function getSharedProjects(userEmail: string): Promise<Project[]> {
  const collaborations = await prisma.projectCollaborator.findMany({
    where: { email: userEmail },
    include: { project: true },
    orderBy: { createdAt: "desc" },
  });
  return collaborations.map((c) => c.project);
}
