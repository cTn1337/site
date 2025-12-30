"use client";

import { useEffect, useState } from "react";

export default function AdminSettings() {
  const [serverName, setServerName] = useState("");
  const [discordWebhookUrl, setDiscordWebhookUrl] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/admin/settings");
    const j = await res.json();
    if (!res.ok) { setMsg(j.error || "Eroare"); return; }
    setServerName(j.config.serverName);
    setDiscordWebhookUrl(j.config.discordWebhookUrl || "");
  }

  useEffect(() => { load(); }, []);

  async function save() {
    setMsg(null);
    const res = await fetch("/api/admin/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ serverName, discordWebhookUrl }),
    });
    const j = await res.json().catch(() => ({}));
    if (!res.ok) { setMsg(j.error || "Eroare"); return; }
    setMsg("Salvat.");
    await load();
  }

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <h1 className="text-2xl font-semibold">Settings</h1>

      {msg && <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-3 text-sm">{msg}</div>}

      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 space-y-4">
        <div>
          <label className="text-sm text-zinc-300">Server Name</label>
          <input value={serverName} onChange={(e) => setServerName(e.target.value)} className="mt-1 w-full rounded-xl border-zinc-700 bg-zinc-950" />
        </div>
        <div>
          <label className="text-sm text-zinc-300">Discord Webhook URL (opțional)</label>
          <input value={discordWebhookUrl} onChange={(e) => setDiscordWebhookUrl(e.target.value)} className="mt-1 w-full rounded-xl border-zinc-700 bg-zinc-950" />
          <p className="mt-1 text-xs text-zinc-500">Trimite embed la create/approve/deny/need_more_info.</p>
        </div>
        <button onClick={save} className="rounded-xl bg-indigo-600 px-4 py-2 font-medium hover:bg-indigo-500">Save</button>
      </div>
    </div>
  );
}
