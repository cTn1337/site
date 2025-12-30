import Link from "next/link";

export default function AdminHome() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Admin</h1>
      <div className="grid gap-3 sm:grid-cols-2">
        <Link className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 hover:bg-zinc-800" href="/admin/users">
          <div className="text-lg font-semibold">Users</div>
          <div className="text-zinc-300">Roluri + ban din aplicație</div>
        </Link>
        <Link className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 hover:bg-zinc-800" href="/admin/settings">
          <div className="text-lg font-semibold">Settings</div>
          <div className="text-zinc-300">Server name + Discord Webhook URL</div>
        </Link>
      </div>
    </div>
  );
}
