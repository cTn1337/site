import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import StatusBadge from "@/components/StatusBadge";

export default async function InboxPage({ searchParams }: any) {
  const session = await auth();
  if (!session?.user?.appUserId) return null;

  const status = searchParams?.status as string | undefined;
  const type = searchParams?.type as string | undefined;

  const where: any = {};
  if (status && ["PENDING","APPROVED","DENIED","NEED_MORE_INFO"].includes(status)) where.status = status;
  if (type && ["STAFF","UNBAN","UNTIMEOUT"].includes(type)) where.type = type;

  const items = await prisma.request.findMany({
    where,
    include: { user: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Inbox</h1>
        <p className="text-zinc-300">Toate cererile (Reviewer/Admin)</p>
      </div>

      <div className="flex flex-wrap gap-2 text-sm">
        <Link className="rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 hover:bg-zinc-800" href="/inbox">Toate</Link>
        {["PENDING","NEED_MORE_INFO","APPROVED","DENIED"].map(s => (
          <Link key={s} className="rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 hover:bg-zinc-800" href={`/inbox?status=${s}`}>{s}</Link>
        ))}
        {["STAFF","UNBAN","UNTIMEOUT"].map(t => (
          <Link key={t} className="rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 hover:bg-zinc-800" href={`/inbox?type=${t}`}>{t}</Link>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-zinc-800">
        <table className="w-full text-sm">
          <thead className="bg-zinc-900 text-zinc-300">
            <tr>
              <th className="p-3 text-left">ID</th>
              <th className="p-3 text-left">User</th>
              <th className="p-3 text-left">Type</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Creat</th>
            </tr>
          </thead>
          <tbody>
            {items.map(r => (
              <tr key={r.id} className="border-t border-zinc-800 hover:bg-zinc-900/50">
                <td className="p-3">
                  <Link className="underline decoration-zinc-600 hover:decoration-zinc-300" href={`/inbox/${r.id}`}>
                    {r.id.slice(0, 8)}…
                  </Link>
                </td>
                <td className="p-3">{r.user.username}</td>
                <td className="p-3">{r.type}</td>
                <td className="p-3"><StatusBadge status={r.status} /></td>
                <td className="p-3 text-zinc-400">{new Date(r.createdAt).toLocaleString()}</td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr><td className="p-6 text-zinc-400" colSpan={5}>Inbox gol.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
