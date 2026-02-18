"use client";

import { ActivityHeatmap } from "@/components/dashboard/charts/activity-heatmap";
import { BestHeroPerMapCard } from "@/components/dashboard/charts/best-hero-per-map-card";
import { DayOfWeekCard } from "@/components/dashboard/charts/day-of-week-card";
import { GameModeDistributionChart } from "@/components/dashboard/charts/game-mode-distribution-chart";
import { GameModeWinrateChart } from "@/components/dashboard/charts/game-mode-winrate-chart";
import { GroupSizeBreakdownChart } from "@/components/dashboard/charts/group-size-breakdown-chart";
import { GroupSizeWinrateChart } from "@/components/dashboard/charts/group-size-winrate-chart";
import { HeroMapSynergyMatrix } from "@/components/dashboard/charts/hero-map-synergy-matrix";
import { HeroPoolDiversityCard } from "@/components/dashboard/charts/hero-pool-diversity-card";
import { HeroSwapAnalyticsChart } from "@/components/dashboard/charts/hero-swap-analytics-chart";
import { HeroWinrateChart } from "@/components/dashboard/charts/hero-winrate-chart";
import { MapFamiliarityCard } from "@/components/dashboard/charts/map-familiarity-card";
import { MapLearningCurveCard } from "@/components/dashboard/charts/map-learning-curve-card";
import { MapTierListCard } from "@/components/dashboard/charts/map-tier-list-card";
import { MapTimelineCard } from "@/components/dashboard/charts/map-timeline-card";
import { MapVolatilityCard } from "@/components/dashboard/charts/map-volatility-card";
import { MapWinLossChart } from "@/components/dashboard/charts/map-win-loss-chart";
import { MapWinrateRankingChart } from "@/components/dashboard/charts/map-winrate-ranking-chart";
import { MostPlayedHeroesChart } from "@/components/dashboard/charts/most-played-heroes-chart";
import { OneTrickDetectionCard } from "@/components/dashboard/charts/one-trick-detection-card";
import { RecentFormChart } from "@/components/dashboard/charts/recent-form-chart";
import { RepeatMapCard } from "@/components/dashboard/charts/repeat-map-card";
import { RoleDistributionChart } from "@/components/dashboard/charts/role-distribution-chart";
import { RoleFlexibilityCard } from "@/components/dashboard/charts/role-flexibility-card";
import { RoleWinrateChart } from "@/components/dashboard/charts/role-winrate-chart";
import { SessionAnalysisCard } from "@/components/dashboard/charts/session-analysis-card";
import { StreakChart } from "@/components/dashboard/charts/streak-chart";
import { WinrateTrendChart } from "@/components/dashboard/charts/winrate-trend-chart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type {
  ActivityHeatmapResult,
  DayOfWeekResult,
  GameModeDistResult,
  GameModeWinrateResult,
  GroupSizeResult,
  HeroMapSynergyResult,
  HeroPoolDiversityResult,
  HeroSwapResult,
  HeroWinrateResult,
  MapDetailedResult,
  MapFamiliarityResult,
  MapLearningResult,
  MapTimelineResult,
  MapWinLossResult,
  MatchData,
  MostPlayedHeroResult,
  OneTrickResult,
  RecentFormData,
  RepeatMapResult,
  RoleStatsResult,
  RollingWinrateResult,
  SessionAnalysisResult,
  StreakData,
} from "@/lib/match-stats";
import { Clock, Crosshair, LayoutGrid, Map, Shield, Users } from "lucide-react";

type DashboardTabsProps = {
  mapWinLoss: MapWinLossResult;
  gameModeDistribution: GameModeDistResult;
  gameModeWinrates: GameModeWinrateResult;
  mostPlayedHeroes: MostPlayedHeroResult;
  heroWinrates: HeroWinrateResult;
  matches: MatchData[];
  rollingWinrate: RollingWinrateResult;
  activityHeatmap: ActivityHeatmapResult;
  streakData: StreakData;
  recentForm: RecentFormData;
  groupSizeWinrates: GroupSizeResult;
  roleStats: RoleStatsResult;
  oneTrick: OneTrickResult;
  heroPoolDiversity: HeroPoolDiversityResult;
  heroSwapStats: HeroSwapResult;
  mapDetailedStats: MapDetailedResult;
  heroMapSynergy: HeroMapSynergyResult;
  mapLearningCurve: MapLearningResult;
  mapFamiliarity: MapFamiliarityResult;
  repeatMapData: RepeatMapResult;
  mapTimeline: MapTimelineResult;
  sessionAnalysis: SessionAnalysisResult;
  dayOfWeekStats: DayOfWeekResult;
};

export function DashboardTabs({
  mapWinLoss,
  gameModeDistribution,
  gameModeWinrates,
  mostPlayedHeroes,
  heroWinrates,
  matches,
  rollingWinrate,
  activityHeatmap,
  streakData,
  recentForm,
  groupSizeWinrates,
  roleStats,
  oneTrick,
  heroPoolDiversity,
  heroSwapStats,
  mapDetailedStats,
  heroMapSynergy,
  mapLearningCurve,
  mapFamiliarity,
  repeatMapData,
  mapTimeline,
  sessionAnalysis,
  dayOfWeekStats,
}: DashboardTabsProps) {
  return (
    <Tabs defaultValue="overview">
      <TabsList className="w-full" variant="line">
        <TabsTrigger value="overview">
          <LayoutGrid className="size-4" aria-hidden="true" />
          Overview
        </TabsTrigger>
        <TabsTrigger value="heroes">
          <Crosshair className="size-4" aria-hidden="true" />
          Heroes
        </TabsTrigger>
        <TabsTrigger value="maps">
          <Map className="size-4" aria-hidden="true" />
          Maps
        </TabsTrigger>
        <TabsTrigger value="time">
          <Clock className="size-4" aria-hidden="true" />
          Time
        </TabsTrigger>
        <TabsTrigger value="groups">
          <Users className="size-4" aria-hidden="true" />
          Groups
        </TabsTrigger>
        <TabsTrigger value="roles">
          <Shield className="size-4" aria-hidden="true" />
          Roles
        </TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-4 pt-4">
        <MapWinLossChart result={mapWinLoss} />
        <div className="grid gap-4 md:grid-cols-2">
          <GameModeDistributionChart result={gameModeDistribution} />
          <GameModeWinrateChart result={gameModeWinrates} />
        </div>
      </TabsContent>

      <TabsContent value="heroes" className="space-y-4 pt-4">
        <div className="grid gap-4 md:grid-cols-2">
          <MostPlayedHeroesChart result={mostPlayedHeroes} matches={matches} />
          <HeroWinrateChart result={heroWinrates} />
        </div>
        <p className="text-sm font-semibold tracking-tight">Hero Deep Dives</p>
        <div className="grid gap-4 md:grid-cols-2">
          <OneTrickDetectionCard result={oneTrick} />
          <HeroPoolDiversityCard result={heroPoolDiversity} />
        </div>
        <HeroSwapAnalyticsChart result={heroSwapStats} />
      </TabsContent>

      <TabsContent value="maps" className="space-y-4 pt-4">
        <MapWinrateRankingChart result={mapDetailedStats} />
        <div className="grid gap-4 md:grid-cols-2">
          <MapTierListCard result={mapDetailedStats} />
          <MapVolatilityCard result={mapDetailedStats} />
        </div>
        <p className="text-sm font-semibold tracking-tight">
          Hero &times; Map Analysis
        </p>
        <HeroMapSynergyMatrix result={heroMapSynergy} />
        <BestHeroPerMapCard result={heroMapSynergy} />
        <p className="text-sm font-semibold tracking-tight">Map Mastery</p>
        <div className="grid gap-4 md:grid-cols-2">
          <MapLearningCurveCard result={mapLearningCurve} />
          <MapTimelineCard result={mapTimeline} />
        </div>
        <p className="text-sm font-semibold tracking-tight">Patterns</p>
        <div className="grid gap-4 md:grid-cols-2">
          <MapFamiliarityCard result={mapFamiliarity} />
          <RepeatMapCard result={repeatMapData} />
        </div>
      </TabsContent>

      <TabsContent value="time" className="space-y-4 pt-4">
        <WinrateTrendChart result={rollingWinrate} />
        <div className="grid gap-4 md:grid-cols-2">
          <ActivityHeatmap result={activityHeatmap} />
          <StreakChart data={streakData} />
        </div>
        <RecentFormChart data={recentForm} />
        <div className="grid gap-4 md:grid-cols-2">
          <SessionAnalysisCard result={sessionAnalysis} />
          <DayOfWeekCard result={dayOfWeekStats} />
        </div>
      </TabsContent>

      <TabsContent value="groups" className="space-y-4 pt-4">
        <div className="grid gap-4 md:grid-cols-2">
          <GroupSizeWinrateChart result={groupSizeWinrates} />
          <GroupSizeBreakdownChart result={groupSizeWinrates} />
        </div>
      </TabsContent>

      <TabsContent value="roles" className="space-y-4 pt-4">
        <div className="grid gap-4 md:grid-cols-2">
          <RoleDistributionChart result={roleStats} />
          <RoleWinrateChart result={roleStats} />
        </div>
        <RoleFlexibilityCard result={roleStats} />
      </TabsContent>
    </Tabs>
  );
}
