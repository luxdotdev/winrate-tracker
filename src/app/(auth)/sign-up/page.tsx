import { AuthForm } from "@/components/auth/auth-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up | Winrate Tracker",
  description:
    "Create a Winrate Tracker account to start tracking your competitive map winrates.",
};

export default function SignUpPage() {
  return <AuthForm mode="sign-up" />;
}
