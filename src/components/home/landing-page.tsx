"use client";

import { ModeToggle } from "@/components/mode-toggle";
import AnimatedList, {
  type AnimatedListItem,
} from "@/components/react-bits/animated-list";
import AuroraBlur from "@/components/react-bits/aurora-blur";
import StaggeredText from "@/components/react-bits/staggered-text";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  BarChart3,
  ChevronRight,
  Globe,
  History,
  Map,
  Swords,
  TrendingUp,
  Trophy,
} from "lucide-react";
import Link from "next/link";

const features = [
  {
    name: "Map Winrate Tracking",
    description:
      "See your ranked win/loss record broken down by every map in the competitive pool. Quickly identify which maps are carrying your SR and which are holding you back.",
    icon: Map,
  },
  {
    name: "Season History",
    description:
      "Track your ranked performance across competitive seasons. Compare trends over time to see how meta shifts and patches affect your climb.",
    icon: History,
  },
  {
    name: "Hero Performance",
    description:
      "Drill down into your ranked winrates by hero on each map. Discover which picks give you the best edge in competitive.",
    icon: Swords,
  },
];

const steps = [
  {
    name: "Sign Up",
    description: "Create an account to start tracking your matches.",
    icon: Globe,
  },
  {
    name: "Log Games",
    description: "Record your match results after each competitive game.",
    icon: Trophy,
  },
  {
    name: "Improve",
    description: "Review breakdowns by map, mode, hero, and season.",
    icon: TrendingUp,
  },
];

const stats = [
  { name: "Maps tracked", value: "35+" },
  { name: "Game modes", value: "5" },
  { name: "Seasons supported", value: "All" },
  { name: "Data points per match", value: "12+" },
];

const mapData = [
  { map: "King's Row", wins: 8, losses: 2, rate: 80 },
  { map: "Ilios", wins: 7, losses: 3, rate: 70 },
  { map: "Numbani", wins: 6, losses: 3, rate: 67 },
  { map: "Lijiang Tower", wins: 5, losses: 3, rate: 63 },
  { map: "Dorado", wins: 4, losses: 4, rate: 50 },
  { map: "Junkertown", wins: 2, losses: 5, rate: 29 },
];

function rateColor(rate: number) {
  if (rate >= 60) return "text-emerald-500";
  if (rate >= 50) return "text-amber-500";
  return "text-red-500";
}

const animatedListItems: AnimatedListItem[] = mapData.map((entry) => ({
  id: entry.map,
  content: (
    <div className="flex w-full items-center justify-between">
      <div>
        <p className="text-sm font-medium">{entry.map}</p>
        <p className="text-xs opacity-60">
          {entry.wins}W &ndash; {entry.losses}L
        </p>
      </div>
      <span
        className={`font-mono text-sm font-semibold tabular-nums ${rateColor(entry.rate)}`}
      >
        {entry.rate}%
      </span>
    </div>
  ),
}));

const auroraLayers = [
  { color: "#6C3AED", speed: 0.3, intensity: 0.4 },
  { color: "#80caff", speed: 0.15, intensity: 0.3 },
  { color: "#4f46e5", speed: 0.2, intensity: 0.25 },
  { color: "#B19EEF", speed: 0.1, intensity: 0.15 },
];

const auroraSkyLayers = [
  { color: "#1a0a2e", blend: 0.5 },
  { color: "#0a1628", blend: 0.5 },
];

export function LandingPage() {
  const currentYear = new Date().getFullYear();
  const copyrightYear = currentYear === 2026 ? "2026" : `2026–${currentYear}`;

  return (
    <div className="bg-background">
      <main>
        {/* Hero — centered layout with Aurora Blur background */}
        <section className="relative isolate overflow-hidden pb-32 sm:pb-48">
          {/* Aurora background — dark mode only */}
          <div className="pointer-events-none absolute inset-0 -z-10 hidden dark:block">
            <AuroraBlur
              speed={1}
              layers={auroraLayers}
              skyLayers={auroraSkyLayers}
              opacity={0.35}
              brightness={0.6}
              saturation={1.2}
              noiseScale={3}
              movementX={-1.5}
              movementY={-2}
              verticalFade={0.8}
              bloomIntensity={1.8}
            />
          </div>
          {/* Light mode gradient fallback */}
          <div
            className="pointer-events-none absolute inset-0 -z-10 block dark:hidden"
            aria-hidden="true"
          >
            <div className="from-primary/6 via-primary/3 absolute inset-0 bg-linear-to-b to-transparent" />
            <div className="bg-primary/8 absolute top-0 left-1/2 h-[600px] w-[900px] -translate-x-1/2 rounded-full blur-[100px]" />
          </div>

          {/* Navbar */}
          <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-6 pt-6 lg:px-8">
            <Link href="/" className="flex items-center gap-2">
              <BarChart3 className="text-primary h-7 w-7" aria-hidden="true" />
              <span className="text-foreground text-lg font-bold tracking-tight">
                lux.dev{" "}
                <span className="text-muted-foreground font-normal">/</span>{" "}
                <span className="text-primary">winrate</span>
              </span>
            </Link>
            <nav className="flex items-center gap-4">
              <ModeToggle />
              <Button asChild variant="outline" size="sm">
                <Link href="/sign-in">Sign In</Link>
              </Button>
            </nav>
          </header>

          <div className="mx-auto max-w-3xl px-6 pt-24 text-center sm:pt-32 lg:px-8">
            <div className="mb-8 flex justify-center">
              <Link
                href="#features"
                className="border-border bg-card/60 inline-flex items-center gap-x-3 rounded-full border px-4 py-1.5 text-sm backdrop-blur-sm"
              >
                <span className="text-primary font-semibold">
                  2026 S1 Ready
                </span>
                <span className="bg-border h-4 w-px" aria-hidden="true" />
                <span className="text-muted-foreground inline-flex items-center gap-1">
                  Track every map
                  <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
              </Link>
            </div>
            <StaggeredText
              text="Know your maps. Win more games."
              as="h1"
              className="text-foreground justify-center text-4xl font-bold tracking-tight sm:text-6xl"
              segmentBy="words"
              direction="top"
              blur
              duration={0.5}
              delay={60}
            />
            <p className="text-muted-foreground mx-auto mt-6 max-w-2xl text-lg leading-8">
              The simple way to track your ranked Overwatch winrates by map. Log
              your competitive games, spot your strongest maps, and climb with
              confidence.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Button asChild size="lg">
                <Link href="/sign-up">Get Started</Link>
              </Button>
              <Link
                href="https://github.com/lucasdoell/winrate-tracker"
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground text-sm leading-6 font-semibold"
              >
                View on GitHub <span aria-hidden="true">&rarr;</span>
              </Link>
            </div>
          </div>

          {/* Preview card with Animated List */}
          <div className="mx-auto mt-16 max-w-xl px-6 sm:mt-20 lg:px-8">
            <div className="border-border bg-card/80 shadow-primary/5 rounded-xl border shadow-xl backdrop-blur-sm">
              <div className="p-6 sm:p-8">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h3 className="text-card-foreground text-lg font-semibold">
                      Map Winrates &mdash; 2026 S1
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      Competitive &middot; All Roles
                    </p>
                  </div>
                  <span className="bg-primary/10 text-primary ring-primary/20 rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset">
                    47 matches played
                  </span>
                </div>
                <AnimatedList
                  items={animatedListItems}
                  height="340px"
                  maxItems={5}
                  autoAddDelay={2500}
                  animationType="slide"
                  enterFrom="top"
                  startFrom="top"
                  pauseOnHover
                  fadeEdges
                  fadeEdgeSize={40}
                  itemGap={8}
                  duration={0.35}
                />
              </div>
            </div>
          </div>

          {/* Gradient fade into features */}
          <div
            className="to-background pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-linear-to-b from-transparent sm:h-48"
            aria-hidden="true"
          />
        </section>

        {/* Features — bordered cards */}
        <section
          id="features"
          className="mx-auto mt-24 max-w-7xl px-6 sm:mt-32 lg:px-8"
        >
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-primary text-base leading-7 font-semibold">
              Built for ranked
            </h2>
            <p
              className="text-foreground mt-2 text-3xl font-bold tracking-tight sm:text-4xl"
              style={{ textWrap: "balance" }}
            >
              Everything you need to climb
            </p>
            <p className="text-muted-foreground mt-6 text-lg leading-8">
              Stop guessing which maps are dragging your SR down. Get clear,
              actionable data on your ranked performance across every map in the
              competitive rotation.
            </p>
          </div>
          <div className="mx-auto mt-16 grid max-w-xl grid-cols-1 gap-6 sm:mt-20 lg:mt-24 lg:max-w-none lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.name}
                className="border-border bg-card rounded-xl border p-8"
              >
                <div className="bg-primary/10 mb-4 flex h-10 w-10 items-center justify-center rounded-lg">
                  <feature.icon
                    className="text-primary h-5 w-5"
                    aria-hidden="true"
                  />
                </div>
                <h3 className="text-foreground text-base leading-7 font-semibold">
                  {feature.name}
                </h3>
                <p className="text-muted-foreground mt-2 text-sm leading-6">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* How it works — timeline steps */}
        <section className="mx-auto mt-24 max-w-7xl px-6 sm:mt-32 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-primary text-base leading-7 font-semibold">
              Simple setup
            </h2>
            <p
              className="text-foreground mt-2 text-3xl font-bold tracking-tight sm:text-4xl"
              style={{ textWrap: "balance" }}
            >
              Up and running in minutes
            </p>
          </div>
          <div className="relative mx-auto mt-16 max-w-3xl sm:mt-20">
            <div
              className="bg-border absolute top-5 right-10 left-10 hidden h-px sm:block"
              aria-hidden="true"
            />
            <div className="grid grid-cols-1 gap-12 sm:grid-cols-3 sm:gap-0">
              {steps.map((step, idx) => (
                <div
                  key={step.name}
                  className="relative flex flex-col items-center text-center"
                >
                  <div className="bg-primary text-primary-foreground relative z-10 flex h-10 w-10 items-center justify-center rounded-full">
                    <step.icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <span className="text-muted-foreground mt-4 font-mono text-xs">
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <h3 className="text-foreground mt-1 text-sm font-semibold">
                    {step.name}
                  </h3>
                  <p className="text-muted-foreground mt-2 text-sm leading-6">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats — centered cards */}
        <section className="mx-auto mt-24 max-w-7xl px-6 sm:mt-32 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-primary text-base leading-7 font-semibold">
              Comprehensive coverage
            </h2>
            <p
              className="text-foreground mt-2 text-3xl font-bold tracking-tight sm:text-4xl"
              style={{ textWrap: "balance" }}
            >
              Built for the full competitive experience
            </p>
          </div>
          <dl className="mx-auto mt-12 grid max-w-4xl grid-cols-2 gap-4 sm:mt-16 sm:gap-6 lg:grid-cols-4">
            {stats.map((stat) => (
              <div
                key={stat.name}
                className="border-border bg-card flex flex-col items-center rounded-xl border px-6 py-8 text-center"
              >
                <dd className="text-foreground font-mono text-3xl font-semibold tracking-tight tabular-nums">
                  {stat.value}
                </dd>
                <dt className="text-muted-foreground mt-1 text-sm">
                  {stat.name}
                </dt>
              </div>
            ))}
          </dl>
        </section>

        {/* Parsertime cross-promotion */}
        <section className="mx-auto mt-24 max-w-7xl px-6 sm:mt-32 lg:px-8">
          <div className="border-border bg-card/50 rounded-2xl border p-8 sm:p-12">
            <div className="flex flex-col items-center gap-8 lg:flex-row lg:items-start lg:gap-12">
              <div className="bg-primary/10 flex h-14 w-14 shrink-0 items-center justify-center rounded-xl">
                <BarChart3
                  className="text-primary h-7 w-7"
                  aria-hidden="true"
                />
              </div>
              <div className="flex-1 text-center lg:text-left">
                <h2 className="text-foreground text-2xl font-bold tracking-tight sm:text-3xl">
                  Need more than ranked tracking?
                </h2>
                <p className="text-muted-foreground mt-3 max-w-2xl text-base leading-7">
                  Winrate Tracker is purpose-built for ranked play. If
                  you&apos;re looking for in-depth scrim analytics, team
                  performance breakdowns, and detailed match replay stats,{" "}
                  <strong className="text-foreground">Parsertime</strong> is our
                  sister project designed for exactly that.
                </p>
                <Link
                  href="https://parsertime.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:text-primary/80 mt-6 inline-flex items-center gap-2 text-sm font-semibold transition-colors"
                >
                  Explore Parsertime
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* CTA — card with Aurora Blur */}
        <section className="mx-auto mt-24 max-w-7xl px-6 sm:mt-32 lg:px-8">
          <div className="ring-border relative isolate overflow-hidden rounded-2xl ring-1">
            {/* Dark mode: Aurora Blur */}
            <div className="pointer-events-none absolute inset-0 -z-10 hidden dark:block">
              <AuroraBlur
                speed={0.8}
                layers={[
                  { color: "#6C3AED", speed: 0.25, intensity: 0.5 },
                  { color: "#4f46e5", speed: 0.15, intensity: 0.4 },
                  { color: "#80caff", speed: 0.1, intensity: 0.2 },
                  { color: "#B19EEF", speed: 0.08, intensity: 0.15 },
                ]}
                skyLayers={[
                  { color: "#120824", blend: 0.6 },
                  { color: "#0a1020", blend: 0.4 },
                ]}
                opacity={0.5}
                brightness={0.5}
                saturation={1.3}
                noiseScale={2.5}
                movementX={-1}
                movementY={-1.5}
                verticalFade={0.5}
                bloomIntensity={2}
              />
            </div>
            {/* Light mode: gradient */}
            <div
              className="pointer-events-none absolute inset-0 -z-10 block dark:hidden"
              aria-hidden="true"
            >
              <div className="from-primary/8 via-primary/4 absolute inset-0 bg-linear-to-br to-[#80caff]/6" />
              <div className="bg-primary/6 absolute top-1/2 left-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full blur-[80px]" />
            </div>
            <div className="relative px-6 py-20 text-center sm:px-16 sm:py-24">
              <h2
                className="text-foreground text-3xl font-bold tracking-tight sm:text-4xl"
                style={{ textWrap: "balance" }}
              >
                Start climbing today
              </h2>
              <p className="text-muted-foreground mx-auto mt-4 max-w-xl text-lg leading-8">
                Log your ranked games, track your map winrates, and make
                data-driven decisions to push your SR higher. Free and open
                source.
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-6">
                <Button asChild size="lg">
                  <Link href="/sign-up">Get Started</Link>
                </Button>
                <Link
                  href="https://github.com/lucasdoell/winrate-tracker"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-foreground text-sm leading-6 font-semibold"
                >
                  View on GitHub <span aria-hidden="true">&rarr;</span>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer aria-labelledby="footer-heading" className="relative">
        <h2 id="footer-heading" className="sr-only">
          Footer
        </h2>
        <div className="mx-auto max-w-7xl px-6 pt-12 pb-8 lg:px-8">
          <div className="border-border flex items-center justify-between border-t pt-8">
            <p className="text-muted-foreground text-xs leading-5">
              &copy; {copyrightYear} lux.dev. All rights reserved.
            </p>
            <div className="flex gap-x-6">
              <Link
                href="https://github.com/lucasdoell"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <span className="sr-only">GitHub</span>
                <svg
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  className="h-5 w-5"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                    clipRule="evenodd"
                  />
                </svg>
              </Link>
              <Link
                href="https://bsky.app/profile/lux.dev"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <span className="sr-only">Bluesky</span>
                <svg
                  fill="currentColor"
                  viewBox="-50 -50 430 390"
                  className="h-5 w-5"
                  aria-hidden="true"
                >
                  <path d="M180 141.964C163.699 110.262 119.308 51.1817 78.0347 22.044C38.4971 -5.86834 23.414 -1.03207 13.526 3.43594C2.08093 8.60755 0 26.1785 0 36.5164C0 46.8542 5.66748 121.272 9.36416 133.694C21.5786 174.738 65.0603 188.607 105.104 184.156C107.151 183.852 109.227 183.572 111.329 183.312C109.267 183.642 107.19 183.924 105.104 184.156C46.4204 192.847 -5.69621 214.233 62.6582 290.33C137.848 368.18 165.705 273.637 180 225.702C194.295 273.637 210.76 364.771 295.995 290.33C360 225.702 313.58 192.85 254.896 184.158C252.81 183.926 250.733 183.645 248.671 183.315C250.773 183.574 252.849 183.855 254.896 184.158C294.94 188.61 338.421 174.74 350.636 133.697C354.333 121.275 360 46.8568 360 36.519C360 26.1811 357.919 8.61012 346.474 3.43851C336.586 -1.02949 321.503 -5.86576 281.965 22.0466C240.692 51.1843 196.301 110.262 180 141.964Z" />
                </svg>
              </Link>
              <Link
                href="https://twitter.com/luxdotdev"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <span className="sr-only">X</span>
                <svg
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  className="h-5 w-5"
                  aria-hidden="true"
                >
                  <path d="M13.6823 10.6218L20.2391 3H18.6854L12.9921 9.61788L8.44486 3H3.2002L10.0765 13.0074L3.2002 21H4.75404L10.7663 14.0113L15.5685 21H20.8131L13.6819 10.6218H13.6823ZM11.5541 13.0956L10.8574 12.0991L5.31391 4.16971H7.70053L12.1742 10.5689L12.8709 11.5655L18.6861 19.8835H16.2995L11.5541 13.096V13.0956Z" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
