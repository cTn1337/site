import Link from "next/link";

export default function Home() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Discord Requests MVP</h1>
      <p className="text-zinc-300">
        Login cu Discord, trimite cereri (Staff/Unban/Untimeout), urmărește status-ul și primești notificări.
      </p>
      <div className="flex gap-3">
        <Link className="rounded-xl bg-zinc-800 px-4 py-2 hover:bg-zinc-700" href="/login">Login</Link>
        <Link className="rounded-xl bg-zinc-900 px-4 py-2 hover:bg-zinc-800" href="/dashboard">Dashboard</Link>
      </div>
    </div>
  );
}
