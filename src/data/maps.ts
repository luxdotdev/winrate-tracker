export type MapType = "Control" | "Escort" | "Hybrid" | "Push" | "Flashpoint";

export type MapEntry = {
  name: string;
  type: MapType;
};

export const MAPS: MapEntry[] = [
  { name: "Antarctic Peninsula", type: "Control" },
  { name: "Busan", type: "Control" },
  { name: "Ilios", type: "Control" },
  { name: "Lijiang Tower", type: "Control" },
  { name: "Nepal", type: "Control" },
  { name: "Oasis", type: "Control" },
  { name: "Samoa", type: "Control" },

  { name: "Circuit Royal", type: "Escort" },
  { name: "Dorado", type: "Escort" },
  { name: "Havana", type: "Escort" },
  { name: "Junkertown", type: "Escort" },
  { name: "Rialto", type: "Escort" },
  { name: "Route 66", type: "Escort" },
  { name: "Shambali Monastery", type: "Escort" },
  { name: "Watchpoint: Gibraltar", type: "Escort" },

  { name: "Blizzard World", type: "Hybrid" },
  { name: "Eichenwalde", type: "Hybrid" },
  { name: "Hollywood", type: "Hybrid" },
  { name: "King's Row", type: "Hybrid" },
  { name: "Midtown", type: "Hybrid" },
  { name: "Numbani", type: "Hybrid" },
  { name: "Paraiso", type: "Hybrid" },

  { name: "Colosseo", type: "Push" },
  { name: "Esperança", type: "Push" },
  { name: "New Queen Street", type: "Push" },
  { name: "Runasapi", type: "Push" },

  { name: "Aatlis", type: "Flashpoint" },
  { name: "New Junk City", type: "Flashpoint" },
  { name: "Suravasa", type: "Flashpoint" },
];

export const MAP_TYPES: MapType[] = [
  "Control",
  "Escort",
  "Hybrid",
  "Push",
  "Flashpoint",
];

export const MAP_NAMES = MAPS.map((m) => m.name);
