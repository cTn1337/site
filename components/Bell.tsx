"use client";

import { useEffect, useState } from "react";

type N = { id: string; title: string; body: string; readAt: string | null; createdAt: string };

export default function Bell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<N[]>([]);

  async function load() {
    const res = await fetch("/api/notifications");
    if (!res.ok) return;
    const data = await res.json();
    setItems(data.items);
  }

  useEffect(() => { load(); }, []);

  const unread = items.filter(i => !i.readAt).length;

  async function markRead(id: string) {
    await fetch("/api/notifications", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    await load();
  }

  return (
    <div className="relative">
      <button
        className="relative rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 hover:bg-zinc-800"
        onClick={() => setOpen(v => !v)}
        aria-label="Notificări"
      >
        🔔
        {unread > 0 && (
          <span className="absolute -right-1 -top-1 rounded-full bg-red-600 px-2 text-xs">{unread}</span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-zinc-800 bg-zinc-900 p-2 shadow-lg">
          <div className="px-2 py-1 text-sm font-medium text-zinc-200">Notificări</div>
          <div className="max-h-96 overflow-auto">
            {items.length === 0 ? (
              <div className="px-2 py-3 text-sm text-zinc-400">Nicio notificare.</div>
            ) : (
              items.map(n => (
                <button
                  key={n.id}
                  onClick={() => markRead(n.id)}
                  className="w-full rounded-xl px-2 py-2 text-left hover:bg-zinc-800"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-sm font-semibold">{n.title}</div>
                    {!n.readAt && <span className="text-xs text-red-300">nou</span>}
                  </div>
                  <div className="text-sm text-zinc-300">{n.body}</div>
                  <div className="text-xs text-zinc-500">{new Date(n.createdAt).toLocaleString()}</div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
