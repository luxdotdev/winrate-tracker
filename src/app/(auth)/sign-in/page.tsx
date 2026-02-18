import { AuthForm } from "@/components/auth/auth-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In | Winrate Tracker",
  description: "Sign in to your Winrate Tracker account.",
};

export default function SignInPage() {
  return <AuthForm mode="sign-in" />;
}
