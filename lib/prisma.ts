import { PrismaClient } from "../generated/prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

const url = process.env.DATABASE_URL;

if (!url) {
  throw new Error("DATABASE_URL environment variable is not set");
}

function makePrismaClient(): PrismaClient {
  if (
    url &&
    (url.startsWith("prisma+postgres://") || url.startsWith("prisma://"))
  ) {
    return new PrismaClient({ accelerateUrl: url }).$extends(
      withAccelerate(),
    ) as unknown as PrismaClient;
  }

  // const ssl = process.env.NODE_ENV === "production" ? { rejectUnauthorized: true } : { rejectUnauthorized: true }
  const adapter = new PrismaPg(
    new Pool({
      connectionString: url,
      ssl:
        process.env.NODE_ENV === "production"
          ? { rejectUnauthorized: true }
          : { rejectUnauthorized: false },
    }),
  );
  return new PrismaClient({ adapter });
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma: PrismaClient =
  globalForPrisma.prisma ?? makePrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
