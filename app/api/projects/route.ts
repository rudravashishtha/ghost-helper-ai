import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const projects = await prisma.project.findMany({
    where: { ownerId: userId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ projects });
}

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const name =
    typeof body?.name === "string" && body.name.trim()
      ? body.name.trim()
      : "Untitled Project";
  const id =
    typeof body?.id === "string" &&
    /^[a-z0-9](?:[a-z0-9]|-(?=[a-z0-9])){2,126}[a-z0-9]$/.test(body.id)
      ? body.id
      : undefined;

  try {
    const project = await prisma.project.create({
      data: { ...(id ? { id } : {}), ownerId: userId, name },
    });
    return NextResponse.json({ project }, { status: 201 });
  } catch (err: unknown) {
    if (
      typeof err === "object" &&
      err !== null &&
      "code" in err &&
      (err as { code: string }).code === "P2002"
    ) {
      return NextResponse.json({ error: "ID already taken" }, { status: 409 });
    }
    throw err;
  }
}
