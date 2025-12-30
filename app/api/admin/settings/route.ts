import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/rbac";
import { cleanText } from "@/lib/sanitize";

export async function GET() {
  const session = await auth();
  if (!session?.user?.appUserId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isAdmin(session.user.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const config = await prisma.appConfig.upsert({
    where: { id: "singleton" },
    create: { id: "singleton" },
    update: {},
  });

  return NextResponse.json({ config });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.appUserId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isAdmin(session.user.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const serverName = cleanText(String(body.serverName ?? "")).slice(0, 80) || "Discord Requests";
  const discordWebhookUrlRaw = cleanText(String(body.discordWebhookUrl ?? "")).trim();

  const discordWebhookUrl = discordWebhookUrlRaw.length ? discordWebhookUrlRaw : null;

  await prisma.appConfig.upsert({
    where: { id: "singleton" },
    create: { id: "singleton", serverName, discordWebhookUrl },
    update: { serverName, discordWebhookUrl },
  });

  return NextResponse.json({ ok: true });
}
