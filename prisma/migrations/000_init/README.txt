MVP note:
After you run `npx prisma migrate dev --name init`, add the following SQL
in a follow-up migration (recommended) or directly in a SQL migration:

CREATE UNIQUE INDEX IF NOT EXISTS uniq_active_request_per_type
ON "Request" ("userId", "type")
WHERE "status" IN ('PENDING', 'NEED_MORE_INFO');

This enforces: max 1 active request per user per type.
