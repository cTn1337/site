import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      name?: string | null;
      email?: string | null;
      image?: string | null;
      appUserId: string;
      role: "USER" | "REVIEWER" | "ADMIN";
      bannedFromApp: boolean;
    };
  }
}
