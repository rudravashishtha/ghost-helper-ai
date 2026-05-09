import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

interface RouteContext {
  params: Promise<{ projectId: string; email: string }>
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { projectId, email: encodedEmail } = await params

  let email = ""
  try {
    email = decodeURIComponent(encodedEmail).trim().toLowerCase()
  } catch {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 })
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 })
  }

  const project = await prisma.project.findUnique({ where: { id: projectId } })
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 })
  if (project.ownerId !== userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  await prisma.projectCollaborator.deleteMany({ where: { projectId, email } })

  return new Response(null, { status: 204 })
}
