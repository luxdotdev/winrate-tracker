import { MatchForm } from "@/components/dashboard/match-form";
import { MatchList } from "@/components/dashboard/match-list";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Crosshair, Plus } from "lucide-react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/sign-in");
  }

  const matches = await prisma.match.findMany({
    where: { userId: session.user.id },
    include: { heroes: true },
    orderBy: { playedAt: "desc" },
  });

  if (matches.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Crosshair />
          </EmptyMedia>
          <EmptyTitle>No matches tracked yet</EmptyTitle>
          <EmptyDescription>
            Start logging your games to see winrate trends across maps, heroes,
            and group sizes.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <MatchForm
            trigger={
              <Button className="active:scale-[0.97]">
                <Plus className="mr-1.5 size-4" />
                Track your first match
              </Button>
            }
          />
        </EmptyContent>
      </Empty>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-balance text-xl font-semibold tracking-tight">
          Dashboard
        </h2>
        <MatchForm
          trigger={
            <Button className="active:scale-[0.97]">
              <Plus className="mr-1.5 size-4" />
              Track match
            </Button>
          }
        />
      </div>
      <MatchList matches={matches} />
    </div>
  );
}
