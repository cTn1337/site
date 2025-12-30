export default function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    PENDING: "bg-yellow-500/15 text-yellow-300 border-yellow-500/30",
    APPROVED: "bg-green-500/15 text-green-300 border-green-500/30",
    DENIED: "bg-red-500/15 text-red-300 border-red-500/30",
    NEED_MORE_INFO: "bg-blue-500/15 text-blue-300 border-blue-500/30",
  };
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs ${map[status] ?? "bg-zinc-500/15 text-zinc-200 border-zinc-500/30"}`}>
      {status}
    </span>
  );
}
