import { PrismaClient } from "../app/generated/prisma/client"
import { withAccelerate } from "@prisma/extension-accelerate"
import { Pool } from "pg"
import { PrismaPg } from "@prisma/adapter-pg"

const url = process.env.DATABASE_URL ?? ""

function makePrismaClient() {
  if (url.startsWith("prisma+postgres://") || url.startsWith("prisma://")) {
    return new PrismaClient({ accelerateUrl: url }).$extends(withAccelerate())
  }

  const adapter = new PrismaPg(new Pool({ connectionString: url }))
  return new PrismaClient({ adapter })
}

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof makePrismaClient> | undefined
}

export const prisma = globalForPrisma.prisma ?? makePrismaClient()

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma
}
