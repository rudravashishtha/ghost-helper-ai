import { auth, clerkClient, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";

interface RouteContext {
  params: Promise<{ projectId: string }>;
}

async function resolveAccess(
  projectId: string,
  userId: string,
  userEmail: string,
) {
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) return { error: "Not found", status: 404 } as const;
  const isOwner = project.ownerId === userId;
  if (!isOwner) {
    const collab = await prisma.projectCollaborator.findFirst({
      where: { projectId, email: userEmail },
    });
    if (!collab) return { error: "Forbidden", status: 403 } as const;
  }
  return { project, isOwner };
}

export async function GET(request: Request, { params }: RouteContext) {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { projectId } = await params;
  const clerkUser = await currentUser();
  const userEmail =
    clerkUser?.primaryEmailAddress?.emailAddress ??
    clerkUser?.emailAddresses[0]?.emailAddress ??
    "";

  const access = await resolveAccess(projectId, userId, userEmail);
  if ("error" in access)
    return NextResponse.json(
      { error: access.error },
      { status: access.status },
    );

  const { searchParams } = new URL(request.url);
  const cursor = searchParams.get("cursor");
  const limit = Math.min(parseInt(searchParams.get("limit") || "25"), 100);
  const query = searchParams.get("query")?.trim().toLowerCase();

  const where: Prisma.ProjectCollaboratorWhereInput = {
    projectId,
    ...(query
      ? {
          email: {
            contains: query,
            mode: "insensitive",
          },
        }
      : {}),
  };

  const collaborators = await prisma.projectCollaborator.findMany({
    where,
    take: limit + 1,
    cursor: cursor ? { id: cursor } : undefined,
    skip: cursor ? 1 : 0,
    orderBy: { id: "asc" },
  });

  const hasMore = collaborators.length > limit;
  const pageItems = hasMore ? collaborators.slice(0, limit) : collaborators;
  const nextCursor = hasMore ? pageItems[pageItems.length - 1].id : null;

  const client = await clerkClient();

  // Only fetch owner on initial load (no cursor)
  let owner = null;
  if (!cursor) {
    const ownerClerkUser = await client.users
      .getUser(access.project.ownerId)
      .catch(() => null);

    if (ownerClerkUser) {
      const ownerName =
        `${ownerClerkUser.firstName ?? ""} ${ownerClerkUser.lastName ?? ""}`.trim();
      const ownerEmail =
        ownerClerkUser.primaryEmailAddress?.emailAddress ??
        ownerClerkUser.emailAddresses[0]?.emailAddress ??
        "";
      owner = {
        email: ownerEmail,
        name: ownerName || null,
        imageUrl: ownerClerkUser.imageUrl ?? null,
      };
    }
  }

  // Enrich page items with Clerk data
  const emails = pageItems.map((c) => c.email);
  let clerkUsers: Awaited<
    ReturnType<typeof client.users.getUserList>
  >["data"] = [];
  if (emails.length) {
    clerkUsers = (await client.users.getUserList({ emailAddress: emails }))
      .data;
  }

  const enriched = pageItems.map((c) => {
    const match = clerkUsers.find((u) =>
      u.emailAddresses.some((e) => e.emailAddress === c.email),
    );
    const fullName = match
      ? `${match.firstName ?? ""} ${match.lastName ?? ""}`.trim()
      : "";
    return {
      email: c.email,
      name: fullName || null,
      imageUrl: match?.imageUrl ?? null,
    };
  });

  return NextResponse.json({
    owner,
    collaborators: enriched,
    isOwner: access.isOwner,
    nextCursor,
    hasMore,
  });
}

export async function POST(request: Request, { params }: RouteContext) {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { projectId } = await params;

  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (project.ownerId !== userId)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json().catch(() => ({}));
  const email =
    typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    return NextResponse.json(
      { error: "Valid email is required" },
      { status: 400 },
    );
  }

  const ownerUser = await currentUser();
  const ownerEmail = ownerUser?.primaryEmailAddress?.emailAddress ?? "";
  if (ownerEmail && ownerEmail.toLowerCase() === email) {
    return NextResponse.json(
      { error: "Cannot add owner as collaborator" },
      { status: 400 },
    );
  }

  const collaborator = await prisma.projectCollaborator.upsert({
    where: { projectId_email: { projectId, email } },
    update: {},
    create: { projectId, email },
  });

  return NextResponse.json({ collaborator }, { status: 201 });
}
