import type { HeroRole } from "@/data/heroes";
import type { MapType } from "@/data/maps";

type MatchHeroData = {
  id: string;
  hero: string;
  role: string;
  percentage: number;
};

type MatchData = {
  id: string;
  map: string;
  mapType: string;
  result: string;
  groupSize: number;
  playedAt: Date;
  heroes: MatchHeroData[];
};

type RoleFilter = HeroRole | "all";

function filterMatchesByRole(
  matches: MatchData[],
  role: RoleFilter
): MatchData[] {
  if (role === "all") return matches;

  return matches
    .filter((match) => match.heroes.some((h) => h.role === role))
    .map((match) => ({
      ...match,
      heroes: match.heroes.filter((h) => h.role === role),
    }));
}

// --- Map Win/Loss ---

type MapWinLossEntry = {
  name: string;
  wins: number;
  losses: number;
};

type MapWinLossInsight = {
  bestMap: string;
  bestWinrate: number;
  worstMap: string;
  worstWinrate: number;
};

type MapWinLossResult = {
  data: MapWinLossEntry[];
  insight: MapWinLossInsight;
};

function getMapWinLossData(matches: MatchData[]): MapWinLossResult {
  const mapStats = new Map<string, { wins: number; losses: number }>();

  for (const match of matches) {
    const current = mapStats.get(match.map) ?? { wins: 0, losses: 0 };
    if (match.result === "win") current.wins++;
    else if (match.result === "loss") current.losses++;
    mapStats.set(match.map, current);
  }

  const data: MapWinLossEntry[] = Array.from(mapStats.entries())
    .map(([name, stats]) => ({ name, ...stats }))
    .sort((a, b) => b.wins + b.losses - (a.wins + a.losses));

  let bestMap = "";
  let bestWinrate = -1;
  let worstMap = "";
  let worstWinrate = 101;

  for (const entry of data) {
    const total = entry.wins + entry.losses;
    if (total === 0) continue;
    const winrate = (entry.wins / total) * 100;
    if (winrate > bestWinrate) {
      bestWinrate = winrate;
      bestMap = entry.name;
    }
    if (winrate < worstWinrate) {
      worstWinrate = winrate;
      worstMap = entry.name;
    }
  }

  return {
    data,
    insight: {
      bestMap,
      bestWinrate: Math.round(bestWinrate),
      worstMap,
      worstWinrate: Math.round(worstWinrate),
    },
  };
}

// --- Game Mode Distribution ---

type GameModeDistEntry = {
  mode: string;
  count: number;
  fill: string;
};

type GameModeDistInsight = {
  dominantMode: string;
  dominantPct: number;
};

type GameModeDistResult = {
  data: GameModeDistEntry[];
  insight: GameModeDistInsight;
};

const MODE_COLORS: Record<string, string> = {
  Control: "var(--chart-1)",
  Escort: "var(--chart-2)",
  Hybrid: "var(--chart-3)",
  Push: "var(--chart-4)",
  Flashpoint: "var(--chart-5)",
  Clash: "var(--color-primary)",
};

function getGameModeDistribution(matches: MatchData[]): GameModeDistResult {
  const modeCounts = new Map<string, number>();

  for (const match of matches) {
    modeCounts.set(match.mapType, (modeCounts.get(match.mapType) ?? 0) + 1);
  }

  const data: GameModeDistEntry[] = Array.from(modeCounts.entries())
    .map(([mode, count]) => ({
      mode,
      count,
      fill: MODE_COLORS[mode] ?? "var(--chart-1)",
    }))
    .sort((a, b) => b.count - a.count);

  const total = matches.length;
  const dominant = data[0];

  return {
    data,
    insight: {
      dominantMode: dominant?.mode ?? "",
      dominantPct: total > 0 ? Math.round((dominant.count / total) * 100) : 0,
    },
  };
}

// --- Game Mode Winrates ---

type GameModeWinrateEntry = {
  mode: string;
  winrate: number;
  wins: number;
  total: number;
};

type GameModeWinrateInsight = {
  bestMode: string;
  bestWinrate: number;
  worstMode: string;
  worstWinrate: number;
};

type GameModeWinrateResult = {
  data: GameModeWinrateEntry[];
  insight: GameModeWinrateInsight;
};

function getGameModeWinrates(matches: MatchData[]): GameModeWinrateResult {
  const modeStats = new Map<string, { wins: number; total: number }>();

  for (const match of matches) {
    const current = modeStats.get(match.mapType) ?? { wins: 0, total: 0 };
    current.total++;
    if (match.result === "win") current.wins++;
    modeStats.set(match.mapType, current);
  }

  const data: GameModeWinrateEntry[] = Array.from(modeStats.entries())
    .map(([mode, stats]) => ({
      mode,
      winrate: Math.round((stats.wins / stats.total) * 100),
      wins: stats.wins,
      total: stats.total,
    }))
    .sort((a, b) => b.winrate - a.winrate);

  return {
    data,
    insight: {
      bestMode: data[0]?.mode ?? "",
      bestWinrate: data[0]?.winrate ?? 0,
      worstMode: data.at(-1)?.mode ?? "",
      worstWinrate: data.at(-1)?.winrate ?? 0,
    },
  };
}

// --- Most Played Heroes ---

type MostPlayedHeroEntry = {
  hero: string;
  count: number;
  role: string;
};

type MostPlayedHeroInsight = {
  topHero: string;
  topCount: number;
  topRole: string;
};

type MostPlayedHeroResult = {
  data: MostPlayedHeroEntry[];
  insight: MostPlayedHeroInsight;
};

function getMostPlayedHeroes(
  matches: MatchData[],
  modeFilter?: MapType
): MostPlayedHeroResult {
  const filtered = modeFilter
    ? matches.filter((m) => m.mapType === modeFilter)
    : matches;

  const heroCounts = new Map<string, { count: number; role: string }>();

  for (const match of filtered) {
    for (const hero of match.heroes) {
      const current = heroCounts.get(hero.hero) ?? {
        count: 0,
        role: hero.role,
      };
      current.count++;
      heroCounts.set(hero.hero, current);
    }
  }

  const data: MostPlayedHeroEntry[] = Array.from(heroCounts.entries())
    .map(([hero, stats]) => ({ hero, ...stats }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const top = data[0];

  return {
    data,
    insight: {
      topHero: top?.hero ?? "",
      topCount: top?.count ?? 0,
      topRole: top?.role ?? "",
    },
  };
}

// --- Hero Winrates ---

type HeroWinrateEntry = {
  hero: string;
  winrate: number;
  wins: number;
  total: number;
};

type HeroWinrateInsight = {
  bestHero: string;
  bestWinrate: number;
  bestTotal: number;
  worstHero: string;
  worstWinrate: number;
};

type HeroWinrateResult = {
  data: HeroWinrateEntry[];
  insight: HeroWinrateInsight;
};

const HERO_WINRATE_MIN_MATCHES = 3;

function getHeroWinrates(matches: MatchData[]): HeroWinrateResult {
  const heroStats = new Map<string, { wins: number; total: number }>();

  for (const match of matches) {
    for (const hero of match.heroes) {
      const current = heroStats.get(hero.hero) ?? { wins: 0, total: 0 };
      current.total++;
      if (match.result === "win") current.wins++;
      heroStats.set(hero.hero, current);
    }
  }

  const data: HeroWinrateEntry[] = Array.from(heroStats.entries())
    .filter(([, stats]) => stats.total >= HERO_WINRATE_MIN_MATCHES)
    .map(([hero, stats]) => ({
      hero,
      winrate: Math.round((stats.wins / stats.total) * 100),
      wins: stats.wins,
      total: stats.total,
    }))
    .sort((a, b) => b.winrate - a.winrate);

  const best = data[0];
  const worst = data.at(-1);

  return {
    data,
    insight: {
      bestHero: best?.hero ?? "",
      bestWinrate: best?.winrate ?? 0,
      bestTotal: best?.total ?? 0,
      worstHero: worst?.hero ?? "",
      worstWinrate: worst?.winrate ?? 0,
    },
  };
}

// --- Summary Stats ---

type SummaryStats = {
  totalMatches: number;
  wins: number;
  losses: number;
  draws: number;
  winrate: number;
  uniqueMaps: number;
  bestMap: string;
  bestMapWinrate: number;
  currentStreak: number;
  streakType: "win" | "loss" | "none";
};

function getSummaryStats(matches: MatchData[]): SummaryStats {
  const wins = matches.filter((m) => m.result === "win").length;
  const losses = matches.filter((m) => m.result === "loss").length;
  const draws = matches.filter((m) => m.result === "draw").length;
  const total = matches.length;
  const winrate = total > 0 ? Math.round((wins / total) * 100) : 0;
  const uniqueMaps = new Set(matches.map((m) => m.map)).size;

  const { insight } = getMapWinLossData(matches);

  const sorted = [...matches].sort(
    (a, b) => new Date(b.playedAt).getTime() - new Date(a.playedAt).getTime()
  );

  let currentStreak = 0;
  let streakType: "win" | "loss" | "none" = "none";

  if (sorted.length > 0) {
    const firstResult = sorted[0].result;
    if (firstResult === "win" || firstResult === "loss") {
      streakType = firstResult;
      for (const match of sorted) {
        if (match.result === firstResult) {
          currentStreak++;
        } else {
          break;
        }
      }
    }
  }

  return {
    totalMatches: total,
    wins,
    losses,
    draws,
    winrate,
    uniqueMaps,
    bestMap: insight.bestMap,
    bestMapWinrate: insight.bestWinrate,
    currentStreak,
    streakType,
  };
}

export {
  filterMatchesByRole,
  getMapWinLossData,
  getGameModeDistribution,
  getGameModeWinrates,
  getMostPlayedHeroes,
  getHeroWinrates,
  getSummaryStats,
  HERO_WINRATE_MIN_MATCHES,
};

export type {
  MatchData,
  MatchHeroData,
  RoleFilter,
  MapWinLossResult,
  GameModeDistResult,
  GameModeWinrateResult,
  MostPlayedHeroResult,
  HeroWinrateResult,
  SummaryStats,
};
