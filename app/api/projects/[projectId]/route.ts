import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

interface RouteContext {
  params: Promise<{ projectId: string }>
}

async function requireOwner(userId: string, projectId: string) {
  const project = await prisma.project.findFirst({ where: { id: projectId } })
  if (!project) return { error: "Not found", status: 404 } as const
  if (project.ownerId !== userId) return { error: "Forbidden", status: 403 } as const
  return { project }
}

export async function PATCH(request: Request, { params }: RouteContext) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { projectId } = await params
  const body = await request.json().catch(() => ({}))
  const name = typeof body?.name === "string" ? body.name.trim() : ""
  if (!name) return NextResponse.json({ error: "name is required" }, { status: 400 })

  const check = await requireOwner(userId, projectId)
  if ("error" in check) return NextResponse.json({ error: check.error }, { status: check.status })

  const updated = await prisma.project.update({
    where: { id: projectId },
    data: { name },
  })

  return NextResponse.json({ project: updated })
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { projectId } = await params

  const check = await requireOwner(userId, projectId)
  if ("error" in check) return NextResponse.json({ error: check.error }, { status: check.status })

  await prisma.project.delete({ where: { id: projectId } })

  return new Response(null, { status: 204 })
}
