import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requestTypeSchema, staffSchema, unbanSchema, untimeoutSchema } from "@/lib/validators";
import { cleanText } from "@/lib/sanitize";
import { notifyUser } from "@/lib/notify";
import { sendDiscordWebhook } from "@/lib/discordWebhook";

function sanitizeAnswers(obj: Record<string, any>) {
  const out: Record<string, any> = {};
  for (const [k, v] of Object.entries(obj)) out[k] = typeof v === "string" ? cleanText(v) : v;
  return out;
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.appUserId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.bannedFromApp) return NextResponse.json({ error: "Ești banat din aplicație." }, { status: 403 });

  const body = await req.json();
  const type = requestTypeSchema.parse(body.type);

  const tenMinAgo = new Date(Date.now() - 10 * 60 * 1000);
  const recentSame = await prisma.request.findFirst({
    where: { userId: session.user.appUserId, type, createdAt: { gte: tenMinAgo } },
    select: { id: true },
  });
  if (recentSame) return NextResponse.json({ error: "Poți trimite aceeași cerere o dată la 10 minute." }, { status: 429 });

  let answers: any;
  if (type === "STAFF") answers = staffSchema.parse(body.answers);
  if (type === "UNBAN") answers = unbanSchema.parse(body.answers);
  if (type === "UNTIMEOUT") answers = untimeoutSchema.parse(body.answers);

  const sanitized = sanitizeAnswers(answers);

  try {
    const created = await prisma.request.create({
      data: {
        type,
        answers: sanitized,
        userId: session.user.appUserId,
        actions: {
          create: { actorId: session.user.appUserId, toStatus: "PENDING", fromStatus: null, reason: "Cerere creată" },
        },
      },
      include: { user: true },
    });

    await notifyUser(session.user.appUserId, "Cerere trimisă", `Cererea ta (${type}) a fost creată și este PENDING.`);
    await sendDiscordWebhook("created", created);

    return NextResponse.json({ ok: true, id: created.id });
  } catch (e: any) {
    return NextResponse.json({ error: "Ai deja o cerere activă pentru acest tip." }, { status: 400 });
  }
}
