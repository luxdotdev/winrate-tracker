"use client";

import { createMatches } from "@/app/dashboard/actions";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TimePicker } from "@/components/ui/time-picker";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { HEROES_BY_ROLE, type HeroRole } from "@/data/heroes";
import { MAPS, MAP_TYPES, type MapType } from "@/data/maps";
import { heroImageUrl } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon, ChevronsUpDown, Plus, Trash2, X } from "lucide-react";
import Image from "next/image";
import { useState, useTransition } from "react";

type HeroSelection = {
  hero: string;
  percentage: number;
};

type MatchEntry = {
  id: string;
  map: string;
  result: "win" | "loss" | "draw" | "";
  groupSize: string;
  playedAt: Date;
  heroes: HeroSelection[];
};

let matchEntryCounter = 0;
function nextMatchEntryId() {
  return `match-entry-${++matchEntryCounter}`;
}

const PERCENTAGE_PRESETS = [25, 50, 75, 100] as const;

function handleComboboxWheel(e: React.WheelEvent<HTMLDivElement>) {
  const list = e.currentTarget.querySelector<HTMLElement>("[cmdk-list]");
  if (!list) return;
  const delta = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY;
  list.scrollTop += delta;
}

const GROUP_SIZE_OPTIONS = [
  { value: "1", label: "Solo" },
  { value: "2", label: "Duo" },
  { value: "3", label: "3-Stack" },
  { value: "4", label: "4-Stack" },
  { value: "5", label: "5-Stack" },
];

function createEmptyMatch(): MatchEntry {
  return {
    id: nextMatchEntryId(),
    map: "",
    result: "",
    groupSize: "1",
    playedAt: new Date(),
    heroes: [],
  };
}

function distributePercentages(heroes: HeroSelection[]): HeroSelection[] {
  if (heroes.length === 0) return heroes;
  if (heroes.length === 1) return [{ ...heroes[0], percentage: 100 }];

  const base = Math.floor(100 / heroes.length);
  const remainder = 100 - base * heroes.length;
  return heroes.map((h, i) => ({
    ...h,
    percentage: base + (i < remainder ? 1 : 0),
  }));
}

type MatchFormProps = {
  trigger: React.ReactNode;
};

export function MatchForm({ trigger }: MatchFormProps) {
  const [open, setOpen] = useState(false);
  const [matches, setMatches] = useState<MatchEntry[]>([createEmptyMatch()]);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function updateMatch(index: number, updates: Partial<MatchEntry>) {
    setMatches((prev) =>
      prev.map((m, i) => (i === index ? { ...m, ...updates } : m))
    );
  }

  function removeMatch(index: number) {
    setMatches((prev) => prev.filter((_, i) => i !== index));
  }

  function addHero(matchIndex: number, heroName: string) {
    setMatches((prev) =>
      prev.map((m, i) => {
        if (i !== matchIndex) return m;
        if (m.heroes.some((h) => h.hero === heroName)) return m;
        const updated = distributePercentages([
          ...m.heroes,
          { hero: heroName, percentage: 0 },
        ]);
        return { ...m, heroes: updated };
      })
    );
  }

  function removeHero(matchIndex: number, heroName: string) {
    setMatches((prev) =>
      prev.map((m, i) => {
        if (i !== matchIndex) return m;
        const filtered = m.heroes.filter((h) => h.hero !== heroName);
        return { ...m, heroes: distributePercentages(filtered) };
      })
    );
  }

  function updateHeroPercentage(
    matchIndex: number,
    heroName: string,
    percentage: number
  ) {
    setMatches((prev) =>
      prev.map((m, i) => {
        if (i !== matchIndex) return m;
        return {
          ...m,
          heroes: m.heroes.map((h) =>
            h.hero === heroName ? { ...h, percentage } : h
          ),
        };
      })
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    for (let i = 0; i < matches.length; i++) {
      const m = matches[i];
      if (!m.map) {
        setError(`Match ${i + 1}: Select a map`);
        return;
      }
      if (!m.result) {
        setError(`Match ${i + 1}: Select a result`);
        return;
      }
      if (m.heroes.length === 0) {
        setError(`Match ${i + 1}: Add at least one hero`);
        return;
      }
      const total = m.heroes.reduce((sum, h) => sum + h.percentage, 0);
      if (total !== 100) {
        setError(
          `Match ${i + 1}: Hero percentages must sum to 100 (currently ${total})`
        );
        return;
      }
    }

    startTransition(async () => {
      const result = await createMatches(
        matches.map((m) => ({
          map: m.map,
          result: m.result as "win" | "loss" | "draw",
          groupSize: parseInt(m.groupSize, 10),
          playedAt: m.playedAt.toISOString(),
          heroes: m.heroes.map((h) => ({
            hero: h.hero,
            percentage: h.percentage,
          })),
        }))
      );

      if (result.success) {
        setOpen(false);
        setMatches([createEmptyMatch()]);
        setError(null);
      } else {
        setError(result.error ?? "Something went wrong");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-h-[85dvh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Track Matches</DialogTitle>
          <DialogDescription className="text-pretty">
            Log your recent games. You can add multiple matches at once.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="flex flex-col gap-6">
            {matches.map((match, matchIndex) => (
              <MatchEntryCard
                key={match.id}
                match={match}
                matchIndex={matchIndex}
                totalMatches={matches.length}
                onUpdate={(updates) => updateMatch(matchIndex, updates)}
                onRemove={() => removeMatch(matchIndex)}
                onAddHero={(hero) => addHero(matchIndex, hero)}
                onRemoveHero={(hero) => removeHero(matchIndex, hero)}
                onUpdateHeroPercentage={(hero, pct) =>
                  updateHeroPercentage(matchIndex, hero, pct)
                }
              />
            ))}

            <Button
              type="button"
              variant="outline"
              onClick={() =>
                setMatches((prev) => [...prev, createEmptyMatch()])
              }
              className="w-full"
            >
              <Plus className="mr-1.5 size-4" />
              Add another match
            </Button>
          </div>

          {error && (
            <p className="mt-4 text-sm text-red-600 dark:text-red-400">
              {error}
            </p>
          )}

          <DialogFooter className="mt-6">
            <Button
              type="submit"
              disabled={isPending}
              className="active:scale-[0.97]"
            >
              {isPending
                ? "Submitting..."
                : `Submit ${matches.length > 1 ? `${matches.length} matches` : "match"}`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

type MatchEntryCardProps = {
  match: MatchEntry;
  matchIndex: number;
  totalMatches: number;
  onUpdate: (updates: Partial<MatchEntry>) => void;
  onRemove: () => void;
  onAddHero: (hero: string) => void;
  onRemoveHero: (hero: string) => void;
  onUpdateHeroPercentage: (hero: string, percentage: number) => void;
};

function MatchEntryCard({
  match,
  matchIndex,
  totalMatches,
  onUpdate,
  onRemove,
  onAddHero,
  onRemoveHero,
  onUpdateHeroPercentage,
}: MatchEntryCardProps) {
  return (
    <fieldset className="border-border space-y-4 rounded-lg border p-4">
      <div className="flex items-center justify-between">
        <legend className="text-sm font-medium">Match {matchIndex + 1}</legend>
        {totalMatches > 1 && (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={onRemove}
            aria-label={`Remove match ${matchIndex + 1}`}
          >
            <Trash2 className="size-4" />
          </Button>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <MapPicker value={match.map} onChange={(map) => onUpdate({ map })} />
        <DateTimePicker
          value={match.playedAt}
          onChange={(date) => onUpdate({ playedAt: date })}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Result</label>
          <ToggleGroup
            type="single"
            variant="outline"
            value={match.result}
            onValueChange={(value) => {
              if (value) onUpdate({ result: value as MatchEntry["result"] });
            }}
            className="w-full"
          >
            <ToggleGroupItem
              value="win"
              className="flex-1 rounded-l-md! data-[state=on]:bg-green-100 data-[state=on]:text-green-800 dark:data-[state=on]:bg-green-900/30 dark:data-[state=on]:text-green-400"
            >
              Win
            </ToggleGroupItem>
            <ToggleGroupItem
              value="loss"
              className="flex-1 data-[state=on]:bg-red-100 data-[state=on]:text-red-800 dark:data-[state=on]:bg-red-900/30 dark:data-[state=on]:text-red-400"
            >
              Loss
            </ToggleGroupItem>
            <ToggleGroupItem value="draw" className="flex-1 rounded-r-md!">
              Draw
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium">Group Size</label>
          <Select
            value={match.groupSize}
            onValueChange={(value) => onUpdate({ groupSize: value })}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {GROUP_SIZE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <HeroPicker
        heroes={match.heroes}
        onAddHero={onAddHero}
        onRemoveHero={onRemoveHero}
        onUpdatePercentage={onUpdateHeroPercentage}
      />
    </fieldset>
  );
}

function MapPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (map: string) => void;
}) {
  const [open, setOpen] = useState(false);

  const mapsByType = MAP_TYPES.reduce(
    (acc, type) => {
      acc[type] = MAPS.filter((m) => m.type === type);
      return acc;
    },
    {} as Record<MapType, typeof MAPS>
  );

  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium">Map</label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between font-normal"
          >
            {value || "Select map..."}
            <ChevronsUpDown className="ml-auto size-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-(--radix-popover-trigger-width) p-0"
          align="start"
          onWheel={handleComboboxWheel}
        >
          <Command>
            <CommandInput placeholder="Search maps..." />
            <CommandList>
              <CommandEmpty>No maps found.</CommandEmpty>
              {MAP_TYPES.map((type) => (
                <CommandGroup key={type} heading={type}>
                  {mapsByType[type].map((map) => (
                    <CommandItem
                      key={map.name}
                      value={map.name}
                      data-checked={value === map.name || undefined}
                      onSelect={() => {
                        onChange(map.name);
                        setOpen(false);
                      }}
                    >
                      {map.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              ))}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}

function DateTimePicker({
  value,
  onChange,
}: {
  value: Date;
  onChange: (date: Date) => void;
}) {
  function handleDaySelect(day: Date | undefined) {
    if (!day) return;
    const updated = new Date(day);
    updated.setHours(value.getHours(), value.getMinutes(), 0, 0);
    onChange(updated);
  }

  function handleTimeChange(date: Date | undefined) {
    if (!date) return;
    onChange(date);
  }

  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium">Date &amp; Time</label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className="w-full justify-start text-left font-normal"
          >
            <CalendarIcon className="mr-2 size-4" aria-hidden="true" />
            {format(value, "PPP p")}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={value}
            onSelect={handleDaySelect}
            disabled={(date) => date > new Date()}
          />
          <div className="border-border border-t p-3">
            <TimePicker date={value} setDate={handleTimeChange} />
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

function HeroPicker({
  heroes,
  onAddHero,
  onRemoveHero,
  onUpdatePercentage,
}: {
  heroes: HeroSelection[];
  onAddHero: (hero: string) => void;
  onRemoveHero: (hero: string) => void;
  onUpdatePercentage: (hero: string, percentage: number) => void;
}) {
  const selectedHeroNames = new Set(heroes.map((h) => h.hero));
  const totalPercentage = heroes.reduce((sum, h) => sum + h.percentage, 0);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">Heroes Played</label>
        {heroes.length > 0 && (
          <span
            className={`text-xs tabular-nums ${
              totalPercentage === 100
                ? "text-muted-foreground"
                : "text-red-600 dark:text-red-400"
            }`}
          >
            {totalPercentage}%
          </span>
        )}
      </div>

      {heroes.length > 0 && (
        <div className="space-y-2">
          {heroes.map((selection) => (
            <HeroRow
              key={selection.hero}
              selection={selection}
              onRemove={() => onRemoveHero(selection.hero)}
              onUpdatePercentage={(pct) =>
                onUpdatePercentage(selection.hero, pct)
              }
            />
          ))}
          {totalPercentage !== 100 && (
            <p className="text-xs text-red-600 dark:text-red-400">
              Percentages must sum to 100
            </p>
          )}
        </div>
      )}

      <HeroCombobox
        selectedHeroNames={selectedHeroNames}
        onSelect={onAddHero}
      />
    </div>
  );
}

function HeroRow({
  selection,
  onRemove,
  onUpdatePercentage,
}: {
  selection: HeroSelection;
  onRemove: () => void;
  onUpdatePercentage: (percentage: number) => void;
}) {
  const activePreset = PERCENTAGE_PRESETS.find(
    (p) => p === selection.percentage
  );

  return (
    <div className="bg-muted/50 flex items-center gap-3 rounded-md p-2">
      <Image
        src={heroImageUrl(selection.hero)}
        alt={selection.hero}
        width={32}
        height={32}
        className="size-8 rounded"
      />
      <span className="min-w-0 flex-1 truncate text-sm">{selection.hero}</span>

      <div className="flex items-center gap-1">
        {PERCENTAGE_PRESETS.map((preset) => (
          <button
            key={preset}
            type="button"
            onClick={() => onUpdatePercentage(preset)}
            className={`min-h-[44px] min-w-[44px] rounded-md px-2 py-1 text-xs tabular-nums transition-colors ${
              activePreset === preset
                ? "bg-primary text-primary-foreground"
                : "bg-background hover:bg-muted border"
            }`}
          >
            {preset}%
          </button>
        ))}
      </div>

      <input
        type="number"
        min={1}
        max={100}
        value={selection.percentage}
        onChange={(e) => {
          const val = parseInt(e.target.value, 10);
          if (!isNaN(val) && val >= 0 && val <= 100) {
            onUpdatePercentage(val);
          }
        }}
        className="border-input bg-background h-9 w-16 rounded-md border px-2 text-center text-sm tabular-nums"
        aria-label={`Percentage for ${selection.hero}`}
      />

      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${selection.hero}`}
        className="text-muted-foreground hover:text-foreground min-h-[44px] min-w-[44px] rounded-md p-2"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}

function HeroCombobox({
  selectedHeroNames,
  onSelect,
}: {
  selectedHeroNames: Set<string>;
  onSelect: (hero: string) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal"
        >
          Add hero...
          <ChevronsUpDown className="ml-auto size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-(--radix-popover-trigger-width) p-0"
        align="start"
        onWheel={handleComboboxWheel}
      >
        <Command>
          <CommandInput placeholder="Search heroes..." />
          <CommandList>
            <CommandEmpty>No heroes found.</CommandEmpty>
            {(Object.keys(HEROES_BY_ROLE) as HeroRole[]).map((role) => (
              <CommandGroup key={role} heading={role}>
                {HEROES_BY_ROLE[role]
                  .filter((name) => !selectedHeroNames.has(name))
                  .map((name) => (
                    <CommandItem
                      key={name}
                      value={name}
                      onSelect={() => {
                        onSelect(name);
                        setOpen(false);
                      }}
                    >
                      <Image
                        src={heroImageUrl(name)}
                        alt={name}
                        width={20}
                        height={20}
                        className="size-5 rounded-sm"
                      />
                      {name}
                    </CommandItem>
                  ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
