"use client";

import { useMemo, useState } from "react";

type Props = { defaultType?: "STAFF" | "UNBAN" | "UNTIMEOUT" };

export default function RequestForm({ defaultType = "STAFF" }: Props) {
  const [type, setType] = useState<Props["defaultType"]>(defaultType);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const fields = useMemo(() => {
    if (type === "STAFF") return [
      { name: "age", label: "Vârstă", type: "text" },
      { name: "experience", label: "Experiență", type: "textarea" },
      { name: "availability", label: "Disponibilitate", type: "text" },
      { name: "motivation", label: "Motiv", type: "textarea" },
    ];
    if (type === "UNBAN") return [
      { name: "targetDiscord", label: "Discord ID / tag (cel banat)", type: "text" },
      { name: "banReasonKnown", label: "Motiv ban (dacă știe)", type: "text" },
      { name: "unbanReason", label: "Motiv unban", type: "textarea" },
      { name: "proofLink", label: "Dovadă link (opțional)", type: "text" },
    ];
    return [
      { name: "targetDiscord", label: "Discord ID / tag", type: "text" },
      { name: "timeoutReason", label: "Motiv timeout", type: "text" },
      { name: "untimeoutReason", label: "Motiv untimeout", type: "textarea" },
    ];
  }, [type]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setBusy(true);

    const form = e.target as HTMLFormElement;
    const fd = new FormData(form);
    const answers: Record<string, string> = {};
    for (const f of fields) answers[f.name] = String(fd.get(f.name) ?? "");

    const res = await fetch("/api/requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, answers }),
    });

    const data = await res.json().catch(() => ({}));
    setBusy(false);

    if (!res.ok) {
      setMsg(data.error ?? "Eroare la trimitere.");
      return;
    }

    window.location.href = `/requests/${data.id}`;
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="text-sm text-zinc-300">Tip cerere</label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value as any)}
          className="mt-1 w-full rounded-xl border-zinc-700 bg-zinc-950"
        >
          <option value="STAFF">Aplicare Staff</option>
          <option value="UNBAN">Cerere Unban</option>
          <option value="UNTIMEOUT">Cerere Untimeout</option>
        </select>
      </div>

      {fields.map((f) => (
        <div key={f.name}>
          <label className="text-sm text-zinc-300">{f.label}</label>
          {f.type === "textarea" ? (
            <textarea name={f.name} className="mt-1 w-full rounded-xl border-zinc-700 bg-zinc-950" rows={5} required />
          ) : (
            <input name={f.name} className="mt-1 w-full rounded-xl border-zinc-700 bg-zinc-950" required={f.name !== "proofLink" && f.name !== "banReasonKnown"} />
          )}
        </div>
      ))}

      {msg && <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">{msg}</div>}

      <button
        disabled={busy}
        className="w-full rounded-xl bg-indigo-600 px-4 py-2 font-medium hover:bg-indigo-500 disabled:opacity-60"
      >
        {busy ? "Se trimite..." : "Trimite cererea"}
      </button>

      <p className="text-xs text-zinc-500">
        Limitare: max 1 cerere activă per tip (PENDING/NEED_MORE_INFO) + rate limit 10 minute per tip.
      </p>
    </form>
  );
}
