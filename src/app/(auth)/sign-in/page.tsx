import { AuthForm } from "@/components/auth/auth-form";
import { auth } from "@/lib/auth";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Sign In | Winrate Tracker",
  description: "Sign in to your Winrate Tracker account.",
};

export default async function SignInPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session) {
    redirect("/dashboard");
  }

  return <AuthForm mode="sign-in" />;
}
