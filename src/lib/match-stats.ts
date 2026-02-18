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
  createdAt: Date;
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

// --- Rolling Winrate ---

type RollingWinrateEntry = {
  gameIndex: number;
  date: string;
  rollingWinrate: number;
  result: string;
};

type RollingWinrateInsight = {
  trend: "improving" | "declining" | "stable";
  peakWinrate: number;
  currentWinrate: number;
  window: number;
};

type RollingWinrateResult = {
  data: RollingWinrateEntry[];
  insight: RollingWinrateInsight;
};

const ROLLING_WINDOW = 10;
const TREND_THRESHOLD = 5;

function getRollingWinrateData(
  matches: MatchData[],
  window = ROLLING_WINDOW
): RollingWinrateResult {
  const sorted = [...matches].sort(
    (a, b) => new Date(a.playedAt).getTime() - new Date(b.playedAt).getTime()
  );

  const data: RollingWinrateEntry[] = sorted.map((match, i) => {
    const slice = sorted.slice(Math.max(0, i - window + 1), i + 1);
    const wins = slice.filter((m) => m.result === "win").length;
    const rollingWinrate = Math.round((wins / slice.length) * 100);
    return {
      gameIndex: i + 1,
      date: new Date(match.playedAt).toLocaleDateString(),
      rollingWinrate,
      result: match.result,
    };
  });

  const peakWinrate = data.reduce(
    (max, d) => Math.max(max, d.rollingWinrate),
    0
  );
  const currentWinrate = data.at(-1)?.rollingWinrate ?? 0;

  let trend: "improving" | "declining" | "stable" = "stable";
  if (data.length >= window * 2) {
    const midpoint = Math.floor(data.length / 2);
    const firstHalf = data.slice(0, midpoint);
    const secondHalf = data.slice(midpoint);
    const firstAvg =
      firstHalf.reduce((s, d) => s + d.rollingWinrate, 0) / firstHalf.length;
    const secondAvg =
      secondHalf.reduce((s, d) => s + d.rollingWinrate, 0) / secondHalf.length;
    if (secondAvg - firstAvg >= TREND_THRESHOLD) trend = "improving";
    else if (firstAvg - secondAvg >= TREND_THRESHOLD) trend = "declining";
  }

  return { data, insight: { trend, peakWinrate, currentWinrate, window } };
}

// --- Activity Heatmap ---

type HeatmapEntry = {
  date: string;
  count: number;
};

type ActivityHeatmapInsight = {
  peakDayOfWeek: string;
  avgGamesPerActiveDay: number;
  totalActiveDays: number;
};

type ActivityHeatmapResult = {
  data: HeatmapEntry[];
  maxCount: number;
  insight: ActivityHeatmapInsight;
};

const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

function getActivityHeatmapData(
  matches: MatchData[],
  weeks = 16
): ActivityHeatmapResult {
  const countsByDate = new Map<string, number>();
  for (const match of matches) {
    const d = new Date(match.playedAt);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    countsByDate.set(key, (countsByDate.get(key) ?? 0) + 1);
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const endSunday = new Date(today);
  endSunday.setDate(today.getDate() + (6 - today.getDay()));

  const startDate = new Date(endSunday);
  startDate.setDate(endSunday.getDate() - weeks * 7 + 1);

  const data: HeatmapEntry[] = [];
  const cursor = new Date(startDate);
  while (cursor <= endSunday) {
    const key = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}-${String(cursor.getDate()).padStart(2, "0")}`;
    data.push({ date: key, count: countsByDate.get(key) ?? 0 });
    cursor.setDate(cursor.getDate() + 1);
  }

  const maxCount = data.reduce((max, d) => Math.max(max, d.count), 0);

  const dayTotals = new Array(7).fill(0);
  for (const match of matches) {
    dayTotals[new Date(match.playedAt).getDay()]++;
  }
  const peakDayIndex = dayTotals.indexOf(
    dayTotals.reduce((max: number, v: number) => Math.max(max, v), 0)
  );
  const peakDayOfWeek = DAY_NAMES[peakDayIndex] ?? "Unknown";

  const activeDays = data.filter((d) => d.count > 0);
  const totalActiveDays = activeDays.length;
  const avgGamesPerActiveDay =
    totalActiveDays > 0
      ? Math.round(
          (activeDays.reduce((s, d) => s + d.count, 0) / totalActiveDays) * 10
        ) / 10
      : 0;

  return { data, maxCount, insight: { peakDayOfWeek, avgGamesPerActiveDay, totalActiveDays } };
}

// --- Streak Data ---

type RecentResult = {
  matchId: string;
  result: "win" | "loss" | "draw";
};

type StreakData = {
  currentStreak: number;
  currentStreakType: "win" | "loss" | "none";
  longestWinStreak: number;
  longestLossStreak: number;
  recentResults: RecentResult[];
};

function getStreakData(matches: MatchData[]): StreakData {
  const sorted = [...matches].sort(
    (a, b) => new Date(b.playedAt).getTime() - new Date(a.playedAt).getTime()
  );

  const recentResults: RecentResult[] = sorted
    .slice(0, 20)
    .map((m) => ({ matchId: m.id, result: m.result as "win" | "loss" | "draw" }));

  let currentStreak = 0;
  let currentStreakType: "win" | "loss" | "none" = "none";
  if (sorted.length > 0) {
    const first = sorted[0].result;
    if (first === "win" || first === "loss") {
      currentStreakType = first;
      for (const match of sorted) {
        if (match.result === first) currentStreak++;
        else break;
      }
    }
  }

  const chronological = [...sorted].reverse();
  let longestWinStreak = 0;
  let longestLossStreak = 0;
  let runWin = 0;
  let runLoss = 0;
  for (const match of chronological) {
    if (match.result === "win") {
      runWin++;
      runLoss = 0;
      longestWinStreak = Math.max(longestWinStreak, runWin);
    } else if (match.result === "loss") {
      runLoss++;
      runWin = 0;
      longestLossStreak = Math.max(longestLossStreak, runLoss);
    } else {
      runWin = 0;
      runLoss = 0;
    }
  }

  return {
    currentStreak,
    currentStreakType,
    longestWinStreak,
    longestLossStreak,
    recentResults,
  };
}

// --- Recent Form ---

type FormStats = {
  winrate: number;
  wins: number;
  losses: number;
  draws: number;
  total: number;
};

type RecentFormData = {
  recent: FormStats;
  overall: FormStats;
  delta: number;
  trend: "improving" | "declining" | "stable";
};

const RECENT_FORM_WINDOW = 20;
const RECENT_FORM_THRESHOLD = 5;

function computeFormStats(matches: MatchData[]): FormStats {
  const wins = matches.filter((m) => m.result === "win").length;
  const losses = matches.filter((m) => m.result === "loss").length;
  const draws = matches.filter((m) => m.result === "draw").length;
  const total = matches.length;
  return {
    wins,
    losses,
    draws,
    total,
    winrate: total > 0 ? Math.round((wins / total) * 100) : 0,
  };
}

function getRecentFormData(
  matches: MatchData[],
  window = RECENT_FORM_WINDOW
): RecentFormData {
  const sorted = [...matches].sort(
    (a, b) => new Date(b.playedAt).getTime() - new Date(a.playedAt).getTime()
  );

  const recentMatches = sorted.slice(0, window);
  const recent = computeFormStats(recentMatches);
  const overall = computeFormStats(matches);
  const delta = recent.winrate - overall.winrate;

  let trend: "improving" | "declining" | "stable" = "stable";
  if (delta >= RECENT_FORM_THRESHOLD) trend = "improving";
  else if (delta <= -RECENT_FORM_THRESHOLD) trend = "declining";

  return { recent, overall, delta, trend };
}

export {
  filterMatchesByRole,
  getMapWinLossData,
  getGameModeDistribution,
  getGameModeWinrates,
  getMostPlayedHeroes,
  getHeroWinrates,
  getSummaryStats,
  getRollingWinrateData,
  getActivityHeatmapData,
  getStreakData,
  getRecentFormData,
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
  RollingWinrateEntry,
  RollingWinrateResult,
  ActivityHeatmapResult,
  RecentResult,
  StreakData,
  RecentFormData,
};
