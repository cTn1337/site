"use client";

import { useEffect, useState } from "react";
import StatusBadge from "@/components/StatusBadge";

export default function InboxDetail({ params }: any) {
  const [data, setData] = useState<any>(null);
  const [reason, setReason] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  async function load() {
    const res = await fetch(`/api/requests/${params.id}`, { cache: "no-store" });
    const j = await res.json();
    if (res.ok) setData(j.request);
    else setMsg(j.error || "Eroare");
  }

  useEffect(() => { load(); }, []);

  async function act(action: "APPROVE" | "DENY" | "NEED_MORE_INFO") {
    setMsg(null);
    const res = await fetch(`/api/requests/${params.id}/review`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, reason }),
    });
    const j = await res.json().catch(() => ({}));
    if (!res.ok) { setMsg(j.error || "Eroare"); return; }
    setReason("");
    await load();
  }

  if (msg && !data) return <div className="text-red-200">{msg}</div>;
  if (!data) return <div className="text-zinc-300">Loading...</div>;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Review</h1>
          <div className="text-zinc-300">{data.id}</div>
        </div>
        <StatusBadge status={data.status} />
      </div>

      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
        <div className="text-sm text-zinc-300">User: <span className="text-zinc-100">{data.user?.username}</span></div>
        <div className="text-sm text-zinc-300">Type: <span className="text-zinc-100">{data.type}</span></div>
        <pre className="mt-3 overflow-auto rounded-xl bg-zinc-950 p-3 text-xs">{JSON.stringify(data.answers, null, 2)}</pre>
      </div>

      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 space-y-3">
        <div className="text-sm font-semibold">Acțiuni</div>

        {msg && <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">{msg}</div>}

        <div>
          <label className="text-sm text-zinc-300">Motiv / mesaj</label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="mt-1 w-full rounded-xl border-zinc-700 bg-zinc-950"
            rows={4}
            placeholder="Motiv (obligatoriu la Deny). Pentru Need more info: mesaj către user."
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <button onClick={() => act("APPROVE")} className="rounded-xl bg-green-600 px-4 py-2 font-medium hover:bg-green-500">
            Approve
          </button>
          <button onClick={() => act("DENY")} className="rounded-xl bg-red-600 px-4 py-2 font-medium hover:bg-red-500">
            Deny
          </button>
          <button onClick={() => act("NEED_MORE_INFO")} className="rounded-xl bg-blue-600 px-4 py-2 font-medium hover:bg-blue-500">
            Need more info
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
        <div className="text-sm font-semibold">Istoric</div>
        <ul className="mt-3 space-y-2 text-sm">
          {(data.actions ?? []).map((a: any) => (
            <li key={a.id} className="rounded-xl bg-zinc-950 p-3">
              <div className="text-zinc-200">
                <span className="font-semibold">{a.actor?.username}</span> → <span className="font-mono">{a.toStatus}</span>
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
