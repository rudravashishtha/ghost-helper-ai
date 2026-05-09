import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { put, get } from "@vercel/blob";
import { prisma } from "@/lib/prisma";
import { getProjectWithAccess, getCurrentIdentity } from "@/lib/project-access";

interface RouteContext {
  params: Promise<{ projectId: string }>;
}

export async function GET(_request: Request, { params }: RouteContext) {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { projectId } = await params;
  const identity = await getCurrentIdentity();
  const project = await getProjectWithAccess(
    projectId,
    userId,
    identity?.email,
  );
  if (!project)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (!project.canvasJsonPath) {
    return NextResponse.json({ nodes: [], edges: [] });
  }

  const result = await get(project.canvasJsonPath, { access: "private" }).catch(() => null);
  if (!result || result.statusCode !== 200)
    return NextResponse.json({ nodes: [], edges: [] });

  const text = await new Response(result.stream).text();
  const data = JSON.parse(text);
  return NextResponse.json(data);
}

export async function PUT(request: Request, { params }: RouteContext) {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { projectId } = await params;
  const identity = await getCurrentIdentity();
  const project = await getProjectWithAccess(
    projectId,
    userId,
    identity?.email,
  );
  if (!project)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await request.json().catch(() => null);
  if (!body)
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });

  const blob = await put(`canvas/${projectId}.json`, JSON.stringify(body), {
    access: "private",
    contentType: "application/json",
    allowOverwrite: true,
  });

  await prisma.project.update({
    where: { id: projectId },
    data: { canvasJsonPath: blob.url },
  });

  return NextResponse.json({ url: blob.url });
}
