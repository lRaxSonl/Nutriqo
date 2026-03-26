import NextAuth from "next-auth";
import type { User } from "@/entities/user/model/types";

declare module "next-auth" {
  interface Session {
    user: User & { id: string };
    pbToken?: string; // PocketBase authentication token
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    sub?: string;
    id?: string;
    pbUserId?: string; // PocketBase user ID
    pbToken?: string;
    subscriptionStatus?: 'active' | 'inactive';
  }
}