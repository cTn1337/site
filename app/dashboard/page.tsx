import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import StatusBadge from "@/components/StatusBadge";

export default async function DashboardPage({ searchParams }: any) {
  const session = await auth();
  if (!session?.user?.appUserId) return null;

  const status = searchParams?.status as string | undefined;

  const where: any = { userId: session.user.appUserId };
  if (status && ["PENDING","APPROVED","DENIED","NEED_MORE_INFO"].includes(status)) where.status = status;

  const items = await prisma.request.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-zinc-300">Cererile tale</p>
        </div>

        <div className="flex gap-2">
          <Link className="rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 hover:bg-zinc-800" href="/requests/new">
            New Request
          </Link>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 text-sm">
        <Link className="rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 hover:bg-zinc-800" href="/dashboard">Toate</Link>
        {["PENDING","NEED_MORE_INFO","APPROVED","DENIED"].map(s => (
          <Link key={s} className="rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 hover:bg-zinc-800" href={`/dashboard?status=${s}`}>{s}</Link>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-zinc-800">
        <table className="w-full text-sm">
          <thead className="bg-zinc-900 text-zinc-300">
            <tr>
              <th className="p-3 text-left">ID</th>
              <th className="p-3 text-left">Type</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Creat</th>
            </tr>
          </thead>
          <tbody>
            {items.map(r => (
              <tr key={r.id} className="border-t border-zinc-800 hover:bg-zinc-900/50">
                <td className="p-3">
                  <Link className="underline decoration-zinc-600 hover:decoration-zinc-300" href={`/requests/${r.id}`}>
                    {r.id.slice(0, 8)}…
                  </Link>
                </td>
                <td className="p-3">{r.type}</td>
                <td className="p-3"><StatusBadge status={r.status} /></td>
                <td className="p-3 text-zinc-400">{new Date(r.createdAt).toLocaleString()}</td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr><td className="p-6 text-zinc-400" colSpan={4}>Nu ai cereri.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
