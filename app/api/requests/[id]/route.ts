import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isReviewer } from "@/lib/rbac";

export async function GET(_req: Request, { params }: any) {
  const session = await auth();
  if (!session?.user?.appUserId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const request = await prisma.request.findUnique({
    where: { id: params.id },
    include: {
      user: true,
      reviewedBy: true,
      actions: { include: { actor: true }, orderBy: { createdAt: "asc" } },
    },
  });
  if (!request) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const canSee = request.userId === session.user.appUserId || isReviewer(session.user.role);
  if (!canSee) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  return NextResponse.json({ request });
}
