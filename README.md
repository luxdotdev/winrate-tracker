# Winrate Tracker

A personal Overwatch 2 match tracking and analytics dashboard. Log your matches and get deep insights into your performance across heroes, maps, roles, group sizes, and time patterns.

## Features

- **Match logging** — Record matches with map, game mode, result, group size, heroes played, and role time splits
- **Overview** — Win/loss breakdown by map, game mode distribution, and per-mode winrates
- **Hero analytics** — Most-played heroes, per-hero winrates, one-trick detection, hero pool diversity, and hero swap patterns
- **Map analytics** — Winrate rankings, map tier list, volatility scoring, hero×map synergy matrix, learning curves, familiarity scores, and repeat-map patterns
- **Time analytics** — Rolling winrate trend, activity heatmap, win/loss streaks, recent form, session analysis, and day-of-week performance
- **Group analytics** — Winrate and match breakdown by group size (solo, duo, trio, full stack)
- **Role analytics** — Role distribution, per-role winrates, and role flexibility scoring

## Tech Stack

- **Framework** — [Next.js 16](https://nextjs.org) (App Router, React Server Components)
- **Database** — PostgreSQL via [Prisma](https://prisma.io)
- **Auth** — [Better Auth](https://better-auth.com) with GitHub, Google, Discord OAuth, and magic link
- **UI** — [Tailwind CSS v4](https://tailwindcss.com), [Radix UI](https://radix-ui.com), [shadcn/ui](https://ui.shadcn.com)
- **Charts** — [Recharts](https://recharts.org)
- **Animations** — [Motion](https://motion.dev)

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm
- A PostgreSQL database

### Setup

1. Clone the repository and install dependencies:

```bash
git clone https://github.com/lucasdoell/winrate-tracker.git
cd winrate-tracker
pnpm install
```

2. Copy the environment file and fill in your values:

```bash
cp .env.example .env
```

Required environment variables:

```env
DATABASE_URL=

BETTER_AUTH_SECRET=

GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

DISCORD_CLIENT_ID=
DISCORD_CLIENT_SECRET=
```

3. Push the database schema:

```bash
pnpm db:push
```

4. Start the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Start the development server |
| `pnpm build` | Build for production |
| `pnpm start` | Start the production server |
| `pnpm lint` | Run ESLint |
| `pnpm typecheck` | Run TypeScript type checking |
| `pnpm format` | Format with Prettier |
| `pnpm db:push` | Push schema changes to the database |
| `pnpm db:migrate` | Create and apply a migration |
| `pnpm db:deploy` | Deploy pending migrations (production) |
| `pnpm db:generate` | Regenerate the Prisma client |

## License

[MIT](LICENSE)
