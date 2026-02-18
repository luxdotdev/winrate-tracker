"use client";

import { useMemo, useState } from "react";
import { DashboardTabs } from "@/components/dashboard/dashboard-tabs";
import { MatchForm } from "@/components/dashboard/match-form";
import { MatchList } from "@/components/dashboard/match-list";
import { SummaryCards } from "@/components/dashboard/summary-cards";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  filterMatchesByRole,
  getActivityHeatmapData,
  getGameModeDistribution,
  getGameModeWinrates,
  getGroupSizeWinrates,
  getHeroWinrates,
  getMapWinLossData,
  getMostPlayedHeroes,
  getRecentFormData,
  getRollingWinrateData,
  getRoleStats,
  getStreakData,
  getSummaryStats,
  type MatchData,
  type RoleFilter,
} from "@/lib/match-stats";
import { Plus, Shield, Swords, Heart } from "lucide-react";

type DashboardContentProps = {
  matches: MatchData[];
};

const ROLE_OPTIONS: { value: RoleFilter; label: string; icon: typeof Shield }[] = [
  { value: "all", label: "All Roles", icon: Swords },
  { value: "Tank", label: "Tank", icon: Shield },
  { value: "Damage", label: "Damage", icon: Swords },
  { value: "Support", label: "Support", icon: Heart },
];

export function DashboardContent({ matches }: DashboardContentProps) {
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");

  const filteredMatches = useMemo(
    () => filterMatchesByRole(matches, roleFilter),
    [matches, roleFilter]
  );

  const summaryStats = useMemo(
    () => getSummaryStats(filteredMatches),
    [filteredMatches]
  );
  const mapWinLoss = useMemo(
    () => getMapWinLossData(filteredMatches),
    [filteredMatches]
  );
  const gameModeDistribution = useMemo(
    () => getGameModeDistribution(filteredMatches),
    [filteredMatches]
  );
  const gameModeWinrates = useMemo(
    () => getGameModeWinrates(filteredMatches),
    [filteredMatches]
  );
  const mostPlayedHeroes = useMemo(
    () => getMostPlayedHeroes(filteredMatches),
    [filteredMatches]
  );
  const heroWinrates = useMemo(
    () => getHeroWinrates(filteredMatches),
    [filteredMatches]
  );
  const rollingWinrate = useMemo(
    () => getRollingWinrateData(filteredMatches),
    [filteredMatches]
  );
  const activityHeatmap = useMemo(
    () => getActivityHeatmapData(filteredMatches),
    [filteredMatches]
  );
  const streakData = useMemo(
    () => getStreakData(filteredMatches),
    [filteredMatches]
  );
  const recentForm = useMemo(
    () => getRecentFormData(filteredMatches),
    [filteredMatches]
  );
  const groupSizeWinrates = useMemo(
    () => getGroupSizeWinrates(filteredMatches),
    [filteredMatches]
  );
  const roleStats = useMemo(() => getRoleStats(matches), [matches]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold tracking-tight text-balance">
          Dashboard
        </h2>
        <div className="flex items-center gap-2">
          <Select
            value={roleFilter}
            onValueChange={(v) => setRoleFilter(v as RoleFilter)}
          >
            <SelectTrigger size="sm" aria-label="Filter by role">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ROLE_OPTIONS.map(({ value, label, icon: Icon }) => (
                <SelectItem key={value} value={value}>
                  <Icon className="size-4" aria-hidden="true" />
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <MatchForm
            trigger={
              <Button className="active:scale-[0.97]">
                <Plus className="mr-1.5 size-4" />
                Track match
              </Button>
            }
          />
        </div>
      </div>

      <SummaryCards stats={summaryStats} />

      <DashboardTabs
        mapWinLoss={mapWinLoss}
        gameModeDistribution={gameModeDistribution}
        gameModeWinrates={gameModeWinrates}
        mostPlayedHeroes={mostPlayedHeroes}
        heroWinrates={heroWinrates}
        matches={filteredMatches}
        rollingWinrate={rollingWinrate}
        activityHeatmap={activityHeatmap}
        streakData={streakData}
        recentForm={recentForm}
        groupSizeWinrates={groupSizeWinrates}
        roleStats={roleStats}
      />

      <MatchList matches={filteredMatches} />
    </div>
  );
}
