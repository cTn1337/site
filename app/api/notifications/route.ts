import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.appUserId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const items = await prisma.notification.findMany({
    where: { userId: session.user.appUserId },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return NextResponse.json({ items });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.appUserId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const id = String(body.id);

  await prisma.notification.updateMany({
    where: { id, userId: session.user.appUserId },
    data: { readAt: new Date() },
  });

  return NextResponse.json({ ok: true });
}
