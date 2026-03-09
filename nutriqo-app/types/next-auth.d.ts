import NextAuth from "next-auth";
import { User } from "@/types/user"; // путь к твоему интерфейсу

declare module "next-auth" {
  interface Session {
    user: User;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    sub?: string;
    subscriptionStatus?: 'active' | 'inactive';
  }
}