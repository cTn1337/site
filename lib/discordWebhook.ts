import { prisma } from "./prisma";

function statusColor(kind: string) {
  if (kind === "approved") return 0x57F287;
  if (kind === "denied") return 0xED4245;
  if (kind === "need_more_info") return 0xFEE75C;
  return 0x5865F2;
}

export async function sendDiscordWebhook(kind: string, reqObj: any) {
  const cfg = await prisma.appConfig.findUnique({ where: { id: "singleton" } });
  const url = cfg?.discordWebhookUrl || process.env.DISCORD_WEBHOOK_URL;
  if (!url) return;

  const payload = {
    embeds: [
      {
        title: `Request ${kind.toUpperCase()}`,
        color: statusColor(kind),
        fields: [
          { name: "Type", value: String(reqObj.type), inline: true },
          { name: "Status", value: String(reqObj.status), inline: true },
          { name: "Request ID", value: String(reqObj.id), inline: false },
          { name: "User", value: reqObj.user?.username ? `${reqObj.user.username}` : "Unknown", inline: false },
        ],
        timestamp: new Date().toISOString(),
      },
    ],
  };

  await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }).catch(() => {});
}
