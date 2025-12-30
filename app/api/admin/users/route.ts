import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/rbac";

export async function GET() {
  const session = await auth();
  if (!session?.user?.appUserId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isAdmin(session.user.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, username: true, discordUserId: true, email: true, role: true, bannedFromApp: true, createdAt: true },
    take: 200,
  });

  return NextResponse.json({ users });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.appUserId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isAdmin(session.user.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const userId = String(body.userId);
  const role = String(body.role);
  const bannedFromApp = Boolean(body.bannedFromApp);

  if (!["USER","REVIEWER","ADMIN"].includes(role)) {
    return NextResponse.json({ error: "Rol invalid." }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: userId },
    data: { role: role as any, bannedFromApp },
  });

  return NextResponse.json({ ok: true });
}
