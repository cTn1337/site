import { auth } from "@/lib/auth";
import StatusBadge from "@/components/StatusBadge";

export default async function RequestDetail({ params }: any) {
  const session = await auth();
  if (!session?.user?.appUserId) return null;

  const res = await fetch(`${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}/api/requests/${params.id}`, {
    cache: "no-store",
    headers: { cookie: "" },
  }).catch(() => null);

  // Fallback: direct DB if internal fetch is not desired (server component already on server)
  // We'll do direct DB for reliability:
  const { prisma } = await import("@/lib/prisma");
  const r = await prisma.request.findUnique({
    where: { id: params.id },
    include: { actions: { include: { actor: true }, orderBy: { createdAt: "asc" } }, reviewedBy: true },
  });
  if (!r) return <div>Not found</div>;

  const canSee = r.userId === session.user.appUserId || ["REVIEWER","ADMIN"].includes(session.user.role);
  if (!canSee) return <div>Forbidden</div>;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Request</h1>
          <div className="text-zinc-300">{r.id}</div>
        </div>
        <StatusBadge status={r.status} />
      </div>

      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 space-y-2">
        <div className="text-sm text-zinc-300">Type: <span className="text-zinc-100">{r.type}</span></div>
        {r.reviewReason && <div className="text-sm text-zinc-300">Review reason: <span className="text-zinc-100">{r.reviewReason}</span></div>}
        {r.needMoreInfoMessage && <div className="text-sm text-zinc-300">Need more info: <span className="text-zinc-100">{r.needMoreInfoMessage}</span></div>}
        <div className="mt-3">
          <div className="text-sm font-semibold">Answers</div>
          <pre className="mt-2 overflow-auto rounded-xl bg-zinc-950 p-3 text-xs text-zinc-200">{JSON.stringify(r.answers, null, 2)}</pre>
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
        <div className="text-sm font-semibold">Istoric acțiuni</div>
        <ul className="mt-3 space-y-2 text-sm">
          {r.actions.map(a => (
            <li key={a.id} className="rounded-xl bg-zinc-950 p-3">
              <div className="text-zinc-200">
                <span className="font-semibold">{a.actor.username}</span> → <span className="font-mono">{a.toStatus}</span>
              </div>
              {a.reason && <div className="text-zinc-300">Motiv: {a.reason}</div>}
              <div className="text-xs text-zinc-500">{new Date(a.createdAt).toLocaleString()}</div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
