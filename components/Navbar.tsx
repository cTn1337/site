import Link from "next/link";
import { auth, signOut } from "@/lib/auth";
import Bell from "./Bell";

export default async function Navbar() {
  const session = await auth();
  const role = session?.user?.role;

  return (
    <header className="border-b border-zinc-800 bg-zinc-950">
      <div className="mx-auto flex max-w-5xl items-center justify-between p-4">
        <Link href="/" className="font-semibold">Requests</Link>

        <nav className="flex items-center gap-2">
          {session ? (
            <>
              <Link className="rounded-xl px-3 py-2 hover:bg-zinc-900" href="/dashboard">Dashboard</Link>
              <Link className="rounded-xl px-3 py-2 hover:bg-zinc-900" href="/requests/new">New Request</Link>
              {(role === "REVIEWER" || role === "ADMIN") && (
                <Link className="rounded-xl px-3 py-2 hover:bg-zinc-900" href="/inbox">Inbox</Link>
              )}
              {role === "ADMIN" && (
                <Link className="rounded-xl px-3 py-2 hover:bg-zinc-900" href="/admin">Admin</Link>
              )}
              <Bell />
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/" });
                }}
              >
                <button className="rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 hover:bg-zinc-800">
                  Logout
                </button>
              </form>
            </>
          ) : (
            <Link className="rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 hover:bg-zinc-800" href="/login">
              Login
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
