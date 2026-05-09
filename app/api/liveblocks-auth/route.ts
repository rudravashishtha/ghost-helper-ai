import { currentUser } from "@clerk/nextjs/server";
import { getLiveblocksClient, getUserColor } from "@/lib/liveblocks";
import { getCurrentIdentity, getProjectWithAccess } from "@/lib/project-access";

export async function POST(request: Request) {
  const identity = await getCurrentIdentity();
  if (!identity) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { room } = await request.json();
  if (!room) {
    return new Response("Missing room", { status: 400 });
  }

  const project = await getProjectWithAccess(room, identity.userId, identity.email);
  if (!project) {
    return new Response("Forbidden", { status: 403 });
  }

  const user = await currentUser();
  const name =
    user?.fullName ??
    user?.firstName ??
    user?.primaryEmailAddress?.emailAddress ??
    "Anonymous";
  const avatar = user?.imageUrl ?? "";
  const color = getUserColor(identity.userId);

  const liveblocks = getLiveblocksClient();

  await liveblocks.getOrCreateRoom(room, { defaultAccesses: [] });

  const session = liveblocks.prepareSession(identity.userId, {
    userInfo: { name, avatar, color },
  });

  session.allow(room, session.FULL_ACCESS);

  const { status, body } = await session.authorize();
  return new Response(body, { status });
}
