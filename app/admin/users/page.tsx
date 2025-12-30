"use client";

import { useEffect, useState } from "react";

type U = { id: string; username: string; discordUserId: string; email: string | null; role: string; bannedFromApp: boolean; createdAt: string };

export default function AdminUsers() {
  const [items, setItems] = useState<U[]>([]);
  const [msg, setMsg] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/admin/users");
    const j = await res.json();
    if (!res.ok) { setMsg(j.error || "Eroare"); return; }
    setItems(j.users);
  }

  useEffect(() => { load(); }, []);

  async function save(userId: string, role: string, bannedFromApp: boolean) {
    setMsg(null);
    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, role, bannedFromApp }),
    });
    const j = await res.json().catch(() => ({}));
    if (!res.ok) { setMsg(j.error || "Eroare"); return; }
    await load();
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Users</h1>
      {msg && <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">{msg}</div>}

      <div className="overflow-hidden rounded-2xl border border-zinc-800">
        <table className="w-full text-sm">
          <thead className="bg-zinc-900 text-zinc-300">
            <tr>
              <th className="p-3 text-left">User</th>
              <th className="p-3 text-left">Role</th>
              <th className="p-3 text-left">Banned</th>
              <th className="p-3 text-left">Email</th>
              <th className="p-3 text-left">Acțiuni</th>
            </tr>
          </thead>
          <tbody>
            {items.map(u => (
              <Row key={u.id} u={u} onSave={save} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Row({ u, onSave }: { u: U; onSave: (id: string, role: string, banned: boolean) => void }) {
  const [role, setRole] = useState(u.role);
  const [banned, setBanned] = useState(u.bannedFromApp);

  return (
    <tr className="border-t border-zinc-800">
      <td className="p-3">
        <div className="font-semibold">{u.username}</div>
        <div className="text-xs text-zinc-500">{u.discordUserId}</div>
      </td>
      <td className="p-3">
        <select value={role} onChange={(e) => setRole(e.target.value)} className="rounded-xl border-zinc-700 bg-zinc-950">
          <option value="USER">USER</option>
          <option value="REVIEWER">REVIEWER</option>
          <option value="ADMIN">ADMIN</option>
        </select>
      </td>
      <td className="p-3">
        <input type="checkbox" checked={banned} onChange={(e) => setBanned(e.target.checked)} />
      </td>
      <td className="p-3 text-zinc-300">{u.email ?? "-"}</td>
      <td className="p-3">
        <button onClick={() => onSave(u.id, role, banned)} className="rounded-xl bg-indigo-600 px-3 py-2 font-medium hover:bg-indigo-500">
          Save
        </button>
      </td>
    </tr>
  );
}
