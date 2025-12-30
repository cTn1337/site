import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isReviewer } from "@/lib/rbac";
import { cleanText } from "@/lib/sanitize";
import { notifyUser } from "@/lib/notify";
import { sendDiscordWebhook } from "@/lib/discordWebhook";

export async function POST(req: Request, { params }: any) {
  const session = await auth();
  if (!session?.user?.appUserId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isReviewer(session.user.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const action = String(body.action);
  const reason = cleanText(String(body.reason ?? ""));

  const current = await prisma.request.findUnique({ where: { id: params.id } });
  if (!current) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (action === "DENY" && reason.length < 3) {
    return NextResponse.json({ error: "Motivul este obligatoriu la DenY." }, { status: 400 });
  }

  const toStatus =
    action === "APPROVE" ? "APPROVED" :
    action === "DENY" ? "DENIED" :
    "NEED_MORE_INFO";

  const updated = await prisma.request.update({
    where: { id: params.id },
    data: {
      status: toStatus as any,
      reviewedById: session.user.appUserId,
      reviewReason: (action === "APPROVE" || action === "DENY") ? (reason || null) : null,
      needMoreInfoMessage: action === "NEED_MORE_INFO" ? (reason || "Te rugăm să adaugi mai multe detalii.") : null,
      actions: {
        create: {
          actorId: session.user.appUserId,
          fromStatus: current.status,
          toStatus: toStatus as any,
          reason: reason || null,
        },
      },
    },
    include: { user: true },
  });

  if (toStatus === "NEED_MORE_INFO") {
    await notifyUser(updated.userId, "Mai multe informații necesare", updated.needMoreInfoMessage ?? "");
  } else if (toStatus === "APPROVED") {
    await notifyUser(updated.userId, "Cerere aprobată", reason ? `Motiv: ${reason}` : "Cererea ta a fost aprobată.");
  } else {
    await notifyUser(updated.userId, "Cerere respinsă", `Motiv: ${reason}`);
  }

  await sendDiscordWebhook(toStatus.toLowerCase(), updated);

  console.log(`[REVIEW] ${session.user.appUserId} set ${updated.id} -> ${toStatus}. Reason="${reason}"`);

  return NextResponse.json({ ok: true });
}
