import { redirect } from "next/navigation";
import { getCurrentIdentity, getProjectWithAccess } from "@/lib/project-access";
import { getOwnedProjects, getSharedProjects } from "@/lib/projects";
import { AccessDenied } from "@/components/editor/access-denied";
import { WorkspaceShell } from "./workspace-shell";

interface WorkspacePageProps {
  params: Promise<{ roomId: string }>;
}

export default async function WorkspacePage({ params }: WorkspacePageProps) {
  const { roomId } = await params;

  const identity = await getCurrentIdentity();
  if (!identity) redirect("/sign-in");

  const { userId, email } = identity;

  const [project, ownedProjects, sharedProjects] = await Promise.all([
    email ? getProjectWithAccess(roomId, userId, email) : Promise.resolve(null),
    getOwnedProjects(userId),
    email ? getSharedProjects(email) : Promise.resolve([]),
  ]);

  if (!project) return <AccessDenied />;

  const isOwner = project.ownerId === userId;

  return (
    <WorkspaceShell
      project={project}
      ownedProjects={ownedProjects}
      sharedProjects={sharedProjects}
      isOwner={isOwner}
    />
  );
}
