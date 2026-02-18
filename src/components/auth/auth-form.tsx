"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { authClient } from "@/lib/auth-client";
import { BarChart3, Mail } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

type AuthMode = "sign-in" | "sign-up";

const CALLBACK_URL = "/dashboard";

function SocialIcon({
  provider,
}: {
  provider: "github" | "discord" | "google";
}) {
  switch (provider) {
    case "github":
      return (
        <svg
          fill="currentColor"
          viewBox="0 0 24 24"
          className="size-5"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
            clipRule="evenodd"
          />
        </svg>
      );
    case "discord":
      return (
        <svg
          fill="currentColor"
          viewBox="0 0 24 24"
          className="size-5"
          aria-hidden="true"
        >
          <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
        </svg>
      );
    case "google":
      return (
        <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>
      );
  }
}

const socialProviders = [
  { id: "github" as const, label: "GitHub" },
  { id: "discord" as const, label: "Discord" },
  { id: "google" as const, label: "Google" },
];

type AuthFormProps = {
  mode: AuthMode;
};

export function AuthForm({ mode }: AuthFormProps) {
  const [email, setEmail] = useState("");
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);

  const isSignIn = mode === "sign-in";

  async function handleMagicLink(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const { error } = await authClient.signIn.magicLink({
      email,
      callbackURL: CALLBACK_URL,
    });

    setLoading(false);

    if (error) {
      toast.error(error.message ?? "Something went wrong. Please try again.");
      return;
    }

    setMagicLinkSent(true);
  }

  async function handleSocial(provider: "github" | "discord" | "google") {
    setSocialLoading(provider);

    await authClient.signIn.social({
      provider,
      callbackURL: CALLBACK_URL,
    });

    setSocialLoading(null);
  }

  if (magicLinkSent) {
    return (
      <Card className="w-full max-w-sm backdrop-blur-sm">
        <CardHeader className="items-center text-center">
          <div className="bg-primary/10 mb-2 flex h-12 w-12 items-center justify-center rounded-full">
            <Mail className="text-primary h-6 w-6" aria-hidden="true" />
          </div>
          <h1 className="text-foreground text-xl font-bold tracking-tight">
            Check your inbox
          </h1>
          <p className="text-muted-foreground text-sm">
            We sent a magic link to{" "}
            <span className="text-foreground font-medium">{email}</span>. Click
            the link in the email to sign in.
          </p>
        </CardHeader>
        <CardFooter className="justify-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setMagicLinkSent(false);
              setEmail("");
            }}
          >
            Use a different email
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-sm backdrop-blur-sm">
      <CardHeader className="items-center text-center">
        <Link href="/" className="mb-2 flex items-center gap-2">
          <BarChart3 className="text-primary h-6 w-6" aria-hidden="true" />
          <span className="text-foreground text-lg font-bold tracking-tight">
            lux.dev <span className="text-muted-foreground font-normal">/</span>{" "}
            <span className="text-primary">winrate</span>
          </span>
        </Link>
        <h1 className="text-foreground text-xl font-bold tracking-tight">
          {isSignIn ? "Welcome back" : "Create an account"}
        </h1>
        <p className="text-muted-foreground text-sm">
          {isSignIn
            ? "Sign in to continue tracking your winrates"
            : "Get started tracking your competitive map winrates"}
        </p>
      </CardHeader>

      <CardContent className="grid gap-4">
        <form onSubmit={handleMagicLink} className="grid gap-3">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? <Spinner /> : <Mail aria-hidden="true" />}
            Continue with Email
          </Button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="border-border w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card text-muted-foreground px-2">
              Or continue with
            </span>
          </div>
        </div>

        <div className="grid gap-2">
          {socialProviders.map(({ id, label }) => (
            <Button
              key={id}
              variant="outline"
              disabled={socialLoading !== null}
              onClick={() => handleSocial(id)}
            >
              {socialLoading === id ? (
                <Spinner />
              ) : (
                <SocialIcon provider={id} />
              )}
              {label}
            </Button>
          ))}
        </div>
      </CardContent>

      <CardFooter className="justify-center">
        <p className="text-muted-foreground text-sm">
          {isSignIn ? "Don't have an account?" : "Already have an account?"}{" "}
          <Link
            href={isSignIn ? "/sign-up" : "/sign-in"}
            className="text-primary hover:text-primary/80 font-medium"
          >
            {isSignIn ? "Sign up" : "Sign in"}
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
