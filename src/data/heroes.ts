export type HeroRole = "Tank" | "Damage" | "Support";

export type HeroEntry = {
  name: string;
  role: HeroRole;
};

export const HEROES_BY_ROLE: Record<HeroRole, string[]> = {
  Tank: [
    "D.Va",
    "Domina",
    "Doomfist",
    "Hazard",
    "Junker Queen",
    "Mauga",
    "Orisa",
    "Ramattra",
    "Reinhardt",
    "Roadhog",
    "Sigma",
    "Winston",
    "Wrecking Ball",
    "Zarya",
  ],
  Damage: [
    "Anran",
    "Ashe",
    "Bastion",
    "Cassidy",
    "Echo",
    "Emre",
    "Freja",
    "Genji",
    "Hanzo",
    "Junkrat",
    "Mei",
    "Pharah",
    "Reaper",
    "Sojourn",
    "Soldier: 76",
    "Sombra",
    "Symmetra",
    "Torbjörn",
    "Tracer",
    "Vendetta",
    "Venture",
    "Widowmaker",
  ],
  Support: [
    "Ana",
    "Baptiste",
    "Brigitte",
    "Illari",
    "Jetpack Cat",
    "Juno",
    "Kiriko",
    "Lifeweaver",
    "Lúcio",
    "Mercy",
    "Mizuki",
    "Moira",
    "Wuyang",
    "Zenyatta",
  ],
};

export const ALL_HEROES: HeroEntry[] = (
  Object.entries(HEROES_BY_ROLE) as [HeroRole, string[]][]
).flatMap(([role, heroes]) => heroes.map((name) => ({ name, role })));

export const HERO_NAMES = ALL_HEROES.map((h) => h.name);

export function getHeroRole(heroName: string): HeroRole | undefined {
  return ALL_HEROES.find((h) => h.name === heroName)?.role;
}
