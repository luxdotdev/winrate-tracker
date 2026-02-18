"use server";

import { getHeroRole, HERO_NAMES } from "@/data/heroes";
import { MAPS } from "@/data/maps";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

type MatchHeroInput = {
  hero: string;
  percentage: number;
};

type MatchInput = {
  map: string;
  result: "win" | "loss" | "draw";
  groupSize: number;
  playedAt: string;
  heroes: MatchHeroInput[];
};

type ActionResult = {
  success: boolean;
  error?: string;
};

export async function createMatches(
  matches: MatchInput[]
): Promise<ActionResult> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return { success: false, error: "Not authenticated" };
  }

  const userId = session.user.id;

  for (let i = 0; i < matches.length; i++) {
    const match = matches[i];

    const mapEntry = MAPS.find((m) => m.name === match.map);
    if (!mapEntry) {
      return {
        success: false,
        error: `Match ${i + 1}: Invalid map "${match.map}"`,
      };
    }

    if (!["win", "loss", "draw"].includes(match.result)) {
      return { success: false, error: `Match ${i + 1}: Invalid result` };
    }

    if (match.groupSize < 1 || match.groupSize > 5) {
      return {
        success: false,
        error: `Match ${i + 1}: Group size must be 1-5`,
      };
    }

    if (match.heroes.length === 0) {
      return {
        success: false,
        error: `Match ${i + 1}: At least one hero required`,
      };
    }

    const totalPercentage = match.heroes.reduce(
      (sum, h) => sum + h.percentage,
      0
    );
    if (totalPercentage !== 100) {
      return {
        success: false,
        error: `Match ${i + 1}: Hero percentages must sum to 100 (got ${totalPercentage})`,
      };
    }

    for (const hero of match.heroes) {
      if (!HERO_NAMES.includes(hero.hero)) {
        return {
          success: false,
          error: `Match ${i + 1}: Invalid hero "${hero.hero}"`,
        };
      }

      if (hero.percentage < 1 || hero.percentage > 100) {
        return {
          success: false,
          error: `Match ${i + 1}: Hero percentage must be 1-100`,
        };
      }
    }
  }

  await prisma.$transaction(
    matches.map((match) => {
      const mapEntry = MAPS.find((m) => m.name === match.map)!;
      return prisma.match.create({
        data: {
          userId,
          map: match.map,
          mapType: mapEntry.type,
          result: match.result,
          groupSize: match.groupSize,
          playedAt: new Date(match.playedAt),
          heroes: {
            create: match.heroes.map((h) => ({
              hero: h.hero,
              role: getHeroRole(h.hero) ?? "Damage",
              percentage: h.percentage,
            })),
          },
        },
      });
    })
  );

  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteMatch(matchId: string): Promise<ActionResult> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return { success: false, error: "Not authenticated" };
  }

  const match = await prisma.match.findUnique({
    where: { id: matchId },
  });

  if (match?.userId !== session.user.id) {
    return { success: false, error: "Match not found" };
  }

  await prisma.match.delete({
    where: { id: matchId },
  });

  revalidatePath("/dashboard");
  return { success: true };
}
