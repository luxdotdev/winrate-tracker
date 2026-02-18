import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function toKebabCase(str: string): string {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, "-");
}

export function toHero(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s/g, "")
    .replace(":", "")
    .replace(".", "")
    .toLowerCase();
}

const PARSERTIME_BASE = "https://parsertime.app";

export function mapImageUrl(mapName: string): string {
  return `${PARSERTIME_BASE}/maps/${toKebabCase(mapName)}.webp`;
}

export function heroImageUrl(heroName: string): string {
  return `${PARSERTIME_BASE}/heroes/${toHero(heroName)}.png`;
}
