import { z } from "zod";

export const requestTypeSchema = z.enum(["STAFF", "UNBAN", "UNTIMEOUT"]);

export const staffSchema = z.object({
  age: z.string().min(1).max(10),
  experience: z.string().min(5).max(2000),
  availability: z.string().min(2).max(500),
  motivation: z.string().min(5).max(2000),
});

export const unbanSchema = z.object({
  targetDiscord: z.string().min(2).max(100),
  banReasonKnown: z.string().max(500).optional().or(z.literal("")),
  unbanReason: z.string().min(5).max(2000),
  proofLink: z.string().url().optional().or(z.literal("")),
});

export const untimeoutSchema = z.object({
  targetDiscord: z.string().min(2).max(100),
  timeoutReason: z.string().min(2).max(1000),
  untimeoutReason: z.string().min(5).max(2000),
});
