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

// --- Group Size ---

const GROUP_SIZE_LABELS: Record<number, string> = {
  1: "Solo",
  2: "Duo",
  3: "Trio",
  4: "4-Stack",
  5: "5-Stack",
  6: "Full Stack",
};

const GROUP_SIZE_MIN_MATCHES = 3;

type GroupSizeEntry = {
  groupSize: number;
  label: string;
  wins: number;
  losses: number;
  draws: number;
  total: number;
  winrate: number;
};

type GroupSizeInsight = {
  optimalSize: number;
  optimalLabel: string;
  optimalWinrate: number;
  soloWinrate: number | null;
  hasEnoughData: boolean;
};

type GroupSizeResult = {
  data: GroupSizeEntry[];
  insight: GroupSizeInsight;
};

function getGroupSizeWinrates(matches: MatchData[]): GroupSizeResult {
  const buckets = new Map<number, { wins: number; losses: number; draws: number }>();

  for (const match of matches) {
    const size = match.groupSize;
    const current = buckets.get(size) ?? { wins: 0, losses: 0, draws: 0 };
    if (match.result === "win") current.wins++;
    else if (match.result === "loss") current.losses++;
    else current.draws++;
    buckets.set(size, current);
  }

  const data: GroupSizeEntry[] = Array.from(buckets.entries())
    .map(([groupSize, stats]) => {
      const total = stats.wins + stats.losses + stats.draws;
      const winrate =
        total > 0
          ? Math.round((stats.wins / total) * 1000) / 10
          : 0;
      return {
        groupSize,
        label: GROUP_SIZE_LABELS[groupSize] ?? `${groupSize}-Stack`,
        ...stats,
        total,
        winrate,
      };
    })
    .sort((a, b) => a.groupSize - b.groupSize);

  const qualified = data.filter((e) => e.total >= GROUP_SIZE_MIN_MATCHES);
  const hasEnoughData = qualified.length > 0;

  let optimalEntry = qualified[0];
  for (const entry of qualified) {
    if (entry.winrate > optimalEntry.winrate) optimalEntry = entry;
  }

  const soloEntry = data.find((e) => e.groupSize === 1);
  const soloWinrate =
    soloEntry && soloEntry.total >= GROUP_SIZE_MIN_MATCHES
      ? soloEntry.winrate
      : null;

  return {
    data,
    insight: {
      optimalSize: optimalEntry?.groupSize ?? 1,
      optimalLabel: optimalEntry?.label ?? "Solo",
      optimalWinrate: optimalEntry?.winrate ?? 0,
      soloWinrate,
      hasEnoughData,
    },
  };
}

// --- Role Stats ---

const ROLE_COLORS: Record<string, string> = {
  Tank: "oklch(0.65 0.18 250)",
  Damage: "oklch(0.65 0.18 25)",
  Support: "oklch(0.65 0.18 160)",
};

const ROLES = ["Tank", "Damage", "Support"] as const;

type RoleDistEntry = {
  role: string;
  weightedCount: number;
  percentage: number;
  fill: string;
};

type RoleWinrateEntry = {
  role: string;
  winrate: number;
  wins: number;
  losses: number;
  draws: number;
  total: number;
  fill: string;
};

type RoleFlexibilityData = {
  score: number;
  label: "Adaptive" | "Flexible" | "Specialist";
  description: string;
};

type RoleStatsInsight = {
  dominantRole: string;
  dominantPct: number;
  bestRole: string;
  bestWinrate: number;
  hasEnoughData: boolean;
};

type RoleStatsResult = {
  distribution: RoleDistEntry[];
  winrates: RoleWinrateEntry[];
  flexibility: RoleFlexibilityData;
  insight: RoleStatsInsight;
};

const ROLE_WINRATE_MIN_MATCHES = 3;

function getRoleStats(matches: MatchData[]): RoleStatsResult {
  const weightedCounts = new Map<string, number>(ROLES.map((r) => [r, 0]));
  const winrateBuckets = new Map<
    string,
    { wins: number; losses: number; draws: number }
  >(ROLES.map((r) => [r, { wins: 0, losses: 0, draws: 0 }]));

  for (const match of matches) {
    const totalPct = match.heroes.reduce((sum, h) => sum + h.percentage, 0);
    const normalizer = totalPct > 0 ? totalPct : 1;

    for (const hero of match.heroes) {
      const role = hero.role;
      if (!ROLES.includes(role as (typeof ROLES)[number])) continue;
      const weight = hero.percentage / normalizer;
      weightedCounts.set(role, (weightedCounts.get(role) ?? 0) + weight);
    }

    const rolesInMatch = new Set(match.heroes.map((h) => h.role));
    for (const role of rolesInMatch) {
      if (!ROLES.includes(role as (typeof ROLES)[number])) continue;
      const bucket = winrateBuckets.get(role)!;
      if (match.result === "win") bucket.wins++;
      else if (match.result === "loss") bucket.losses++;
      else bucket.draws++;
    }
  }

  const totalWeight = Array.from(weightedCounts.values()).reduce(
    (s, v) => s + v,
    0
  );

  const distribution: RoleDistEntry[] = ROLES.map((role) => {
    const weightedCount = weightedCounts.get(role) ?? 0;
    const percentage =
      totalWeight > 0 ? Math.round((weightedCount / totalWeight) * 1000) / 10 : 0;
    return {
      role,
      weightedCount,
      percentage,
      fill: ROLE_COLORS[role] ?? "var(--chart-1)",
    };
  }).sort((a, b) => b.weightedCount - a.weightedCount);

  const winrates: RoleWinrateEntry[] = ROLES.map((role) => {
    const bucket = winrateBuckets.get(role)!;
    const total = bucket.wins + bucket.losses + bucket.draws;
    const winrate =
      total > 0 ? Math.round((bucket.wins / total) * 1000) / 10 : 0;
    return {
      role,
      winrate,
      wins: bucket.wins,
      losses: bucket.losses,
      draws: bucket.draws,
      total,
      fill: ROLE_COLORS[role] ?? "var(--chart-1)",
    };
  });

  // Flexibility: normalized deviation from a perfectly even split (1/3 each)
  // score = (1 - sum(|p_i - 1/3|) / (4/3)) * 100
  // max deviation (all on one role): |1 - 1/3| + |0 - 1/3| + |0 - 1/3| = 4/3
  const proportions = ROLES.map((role) => {
    const entry = distribution.find((d) => d.role === role);
    return entry ? entry.percentage / 100 : 0;
  });
  const deviation = proportions.reduce(
    (sum, p) => sum + Math.abs(p - 1 / 3),
    0
  );
  const flexScore = Math.round((1 - deviation / (4 / 3)) * 100);

  const flexLabel =
    flexScore >= 80 ? "Adaptive" : flexScore >= 55 ? "Flexible" : "Specialist";

  const dominantEntry = distribution[0];
  const flexDescription =
    flexScore >= 80
      ? "You play all three roles nearly equally — a true flex player"
      : flexScore >= 55
        ? `You lean toward ${dominantEntry?.role ?? "one role"} but still play others`
        : `You mainly play ${dominantEntry?.role ?? "one role"} — a dedicated specialist`;

  const qualifiedWinrates = winrates.filter(
    (r) => r.total >= ROLE_WINRATE_MIN_MATCHES
  );
  const bestRoleEntry = qualifiedWinrates.reduce<RoleWinrateEntry | null>(
    (best, r) => (!best || r.winrate > best.winrate ? r : best),
    null
  );

  return {
    distribution,
    winrates,
    flexibility: {
      score: flexScore,
      label: flexLabel,
      description: flexDescription,
    },
    insight: {
      dominantRole: dominantEntry?.role ?? "",
      dominantPct: dominantEntry?.percentage ?? 0,
      bestRole: bestRoleEntry?.role ?? "",
      bestWinrate: bestRoleEntry?.winrate ?? 0,
      hasEnoughData: qualifiedWinrates.length > 0,
    },
  };
}

// --- One-Trick Detection ---

const ONE_TRICK_THRESHOLD = 40;
const SPECIALIST_THRESHOLD = 25;

type OneTrickResult = {
  topHero: string;
  topHeroRole: string;
  topHeroPct: number;
  label: "One-Trick" | "Specialist" | "Diverse";
  description: string;
  topHeroesData: { hero: string; pct: number; role: string }[];
};

function getOneTrickStats(matches: MatchData[]): OneTrickResult {
  const totalMatches = matches.length;

  if (totalMatches === 0) {
    return {
      topHero: "",
      topHeroRole: "",
      topHeroPct: 0,
      label: "Diverse",
      description: "No matches tracked yet",
      topHeroesData: [],
    };
  }

  const heroWeights = new Map<string, { weight: number; role: string }>();

  for (const match of matches) {
    for (const hero of match.heroes) {
      const current = heroWeights.get(hero.hero) ?? { weight: 0, role: hero.role };
      current.weight += hero.percentage;
      heroWeights.set(hero.hero, current);
    }
  }

  const topHeroesData = Array.from(heroWeights.entries())
    .map(([hero, { weight, role }]) => ({
      hero,
      pct: Math.round((weight / (totalMatches * 100)) * 1000) / 10,
      role,
    }))
    .sort((a, b) => b.pct - a.pct)
    .slice(0, 5);

  const top = topHeroesData[0];
  const topHeroPct = top?.pct ?? 0;

  const label =
    topHeroPct >= ONE_TRICK_THRESHOLD
      ? "One-Trick"
      : topHeroPct >= SPECIALIST_THRESHOLD
        ? "Specialist"
        : "Diverse";

  const description =
    label === "One-Trick"
      ? `You've spent ${topHeroPct}% of your time on ${top?.hero} — a dedicated one-trick`
      : label === "Specialist"
        ? `You lean toward ${top?.hero} but still have some variety`
        : top?.hero
          ? `Your playtime is spread across many heroes`
          : "No matches tracked yet";

  return {
    topHero: top?.hero ?? "",
    topHeroRole: top?.role ?? "",
    topHeroPct,
    label,
    description,
    topHeroesData,
  };
}

// --- Hero Pool Diversity ---

type HeroPoolDiversityResult = {
  totalUnique: number;
  byRole: { role: string; count: number; fill: string }[];
  heroList: { hero: string; role: string }[];
};

function getHeroPoolDiversity(matches: MatchData[]): HeroPoolDiversityResult {
  const seen = new Map<string, string>();

  for (const match of matches) {
    for (const hero of match.heroes) {
      if (!seen.has(hero.hero)) {
        seen.set(hero.hero, hero.role);
      }
    }
  }

  const heroList = Array.from(seen.entries())
    .map(([hero, role]) => ({ hero, role }))
    .sort((a, b) => a.hero.localeCompare(b.hero));

  const roleCounts = new Map<string, number>(ROLES.map((r) => [r, 0]));
  for (const { role } of heroList) {
    if (ROLES.includes(role as (typeof ROLES)[number])) {
      roleCounts.set(role, (roleCounts.get(role) ?? 0) + 1);
    }
  }

  const byRole = ROLES.map((role) => ({
    role,
    count: roleCounts.get(role) ?? 0,
    fill: ROLE_COLORS[role] ?? "var(--chart-1)",
  }));

  return {
    totalUnique: seen.size,
    byRole,
    heroList,
  };
}

// --- Hero Swap Analytics ---

const SWAP_MIN_PERCENTAGE = 20;

type HeroSwapEntry = {
  label: "Swapped" | "Stayed";
  winrate: number;
  wins: number;
  total: number;
};

type HeroSwapResult = {
  data: HeroSwapEntry[];
  swapWinrate: number;
  noSwapWinrate: number;
  swapTotal: number;
  noSwapTotal: number;
  delta: number;
  avgHeroesPerSwapMatch: number;
  insight: string;
};

function getHeroSwapStats(matches: MatchData[]): HeroSwapResult {
  let swapWins = 0;
  let swapTotal = 0;
  let noSwapWins = 0;
  let noSwapTotal = 0;
  let totalSignificantHeroesInSwapMatches = 0;

  for (const match of matches) {
    const significantHeroes = match.heroes.filter(
      (h) => h.percentage >= SWAP_MIN_PERCENTAGE
    );
    const isSwap = significantHeroes.length >= 2;

    if (isSwap) {
      swapTotal++;
      totalSignificantHeroesInSwapMatches += significantHeroes.length;
      if (match.result === "win") swapWins++;
    } else {
      noSwapTotal++;
      if (match.result === "win") noSwapWins++;
    }
  }

  const swapWinrate =
    swapTotal > 0 ? Math.round((swapWins / swapTotal) * 1000) / 10 : 0;
  const noSwapWinrate =
    noSwapTotal > 0 ? Math.round((noSwapWins / noSwapTotal) * 1000) / 10 : 0;
  const delta = Math.round((swapWinrate - noSwapWinrate) * 10) / 10;
  const avgHeroesPerSwapMatch =
    swapTotal > 0
      ? Math.round((totalSignificantHeroesInSwapMatches / swapTotal) * 10) / 10
      : 0;

  const hasEnoughData = swapTotal >= 3 && noSwapTotal >= 3;

  let insight: string;
  if (!hasEnoughData) {
    insight = "Not enough data yet — play more matches to see swap correlation";
  } else if (Math.abs(delta) < 2) {
    insight = "Swapping heroes has no meaningful impact on your winrate";
  } else if (delta > 0) {
    insight = `Swapping heroes gives you a +${delta}% winrate boost`;
  } else {
    insight = `Staying on your hero gives you a +${Math.abs(delta)}% winrate advantage`;
  }

  const data: HeroSwapEntry[] = [
    { label: "Swapped", winrate: swapWinrate, wins: swapWins, total: swapTotal },
    { label: "Stayed", winrate: noSwapWinrate, wins: noSwapWins, total: noSwapTotal },
  ];

  return {
    data,
    swapWinrate,
    noSwapWinrate,
    swapTotal,
    noSwapTotal,
    delta,
    avgHeroesPerSwapMatch,
    insight,
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
  getRollingWinrateData,
  getActivityHeatmapData,
  getStreakData,
  getRecentFormData,
  getGroupSizeWinrates,
  getRoleStats,
  getOneTrickStats,
  getHeroPoolDiversity,
  getHeroSwapStats,
  HERO_WINRATE_MIN_MATCHES,
  GROUP_SIZE_MIN_MATCHES,
  ROLE_WINRATE_MIN_MATCHES,
  SWAP_MIN_PERCENTAGE,
  ONE_TRICK_THRESHOLD,
  SPECIALIST_THRESHOLD,
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
  GroupSizeEntry,
  GroupSizeInsight,
  GroupSizeResult,
  RoleDistEntry,
  RoleWinrateEntry,
  RoleFlexibilityData,
  RoleStatsInsight,
  RoleStatsResult,
  OneTrickResult,
  HeroPoolDiversityResult,
  HeroSwapEntry,
  HeroSwapResult,
};
