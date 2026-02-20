import { AuthForm } from "@/components/auth/auth-form";
import { auth } from "@/lib/auth";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Sign Up | Winrate Tracker",
  description:
    "Create a Winrate Tracker account to start tracking your competitive map winrates.",
};

export default async function SignUpPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session) {
    redirect("/dashboard");
  }

  return <AuthForm mode="sign-up" />;
}
