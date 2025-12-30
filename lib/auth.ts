import NextAuth from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import { prisma } from "@/lib/prisma";

export const authOptions = {
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
      authorization: { params: { scope: "identify email" } },
    }),
  ],
  session: { strategy: "jwt" as const },
  callbacks: {
    async jwt({ token, profile }: any) {
      if (profile?.id) {
        const discordUserId = String(profile.id);
        const username = profile.username ?? token.name ?? "user";
        const avatar = profile.avatar
          ? `https://cdn.discordapp.com/avatars/${discordUserId}/${profile.avatar}.png`
          : null;
        const email = profile.email ?? null;

        const user = await prisma.user.upsert({
          where: { discordUserId },
          create: { discordUserId, username, avatar, email },
          update: { username, avatar, email: email ?? undefined },
        });

        token.appUserId = user.id;
        token.role = user.role;
        token.bannedFromApp = user.bannedFromApp;
      }
      return token;
    },
    async session({ session, token }: any) {
      session.user.appUserId = token.appUserId;
      session.user.role = token.role;
      session.user.bannedFromApp = token.bannedFromApp;
      return session;
    },
  },
} satisfies Parameters<typeof NextAuth>[0];

export const { auth, handlers, signIn, signOut } = NextAuth(authOptions);
