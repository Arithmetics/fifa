import { config } from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

// Load .env from project root (parent directory) - must be first
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// seed.ts is at api/prisma/seed.ts, .env is at .env (root), so go up 2 levels
config({ path: path.resolve(__dirname, "../../.env") });

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL environment variable is not set. Make sure .env file exists in the project root."
  );
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Country data - single source of truth for all country information
const COUNTRIES = [
  {
    name: "Brazil",
    flag: "🇧🇷",
    group: "A",
    winGroupPoints: 99,
    qualifyPoints: 30,
    roundOf32Points: 15,
    roundOf16Points: 20,
    quarterfinalsPoints: 25,
    semifinalsPoints: 30,
    championshipPoints: 50,
  },
  {
    name: "Argentina",
    flag: "🇦🇷",
    group: "A",
    winGroupPoints: 95,
    qualifyPoints: 28,
    roundOf32Points: 14,
    roundOf16Points: 19,
    quarterfinalsPoints: 24,
    semifinalsPoints: 29,
    championshipPoints: 45,
  },
  {
    name: "France",
    flag: "🇫🇷",
    group: "A",
    winGroupPoints: 90,
    qualifyPoints: 27,
    roundOf32Points: 13,
    roundOf16Points: 18,
    quarterfinalsPoints: 23,
    semifinalsPoints: 28,
    championshipPoints: 40,
  },
  {
    name: "Spain",
    flag: "🇪🇸",
    group: "A",
    winGroupPoints: 85,
    qualifyPoints: 25,
    roundOf32Points: 12,
    roundOf16Points: 17,
    quarterfinalsPoints: 22,
    semifinalsPoints: 27,
    championshipPoints: 35,
  },
  {
    name: "Germany",
    flag: "🇩🇪",
    group: "B",
    winGroupPoints: 88,
    qualifyPoints: 26,
    roundOf32Points: 11,
    roundOf16Points: 16,
    quarterfinalsPoints: 21,
    semifinalsPoints: 26,
    championshipPoints: 38,
  },
  {
    name: "Italy",
    flag: "🇮🇹",
    group: "B",
    winGroupPoints: 82,
    qualifyPoints: 24,
    roundOf32Points: 10,
    roundOf16Points: 15,
    quarterfinalsPoints: 20,
    semifinalsPoints: 25,
    championshipPoints: 33,
  },
  {
    name: "Portugal",
    flag: "🇵🇹",
    group: "B",
    winGroupPoints: 80,
    qualifyPoints: 24,
    roundOf32Points: 9,
    roundOf16Points: 14,
    quarterfinalsPoints: 19,
    semifinalsPoints: 24,
    championshipPoints: 32,
  },
  {
    name: "England",
    flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
    group: "B",
    winGroupPoints: 87,
    qualifyPoints: 26,
    roundOf32Points: 8,
    roundOf16Points: 13,
    quarterfinalsPoints: 18,
    semifinalsPoints: 23,
    championshipPoints: 37,
  },
  {
    name: "Netherlands",
    flag: "🇳🇱",
    group: "C",
    winGroupPoints: 78,
    qualifyPoints: 23,
    roundOf32Points: 7,
    roundOf16Points: 12,
    quarterfinalsPoints: 17,
    semifinalsPoints: 22,
    championshipPoints: 31,
  },
  {
    name: "Belgium",
    flag: "🇧🇪",
    group: "C",
    winGroupPoints: 83,
    qualifyPoints: 25,
    roundOf32Points: 6,
    roundOf16Points: 11,
    quarterfinalsPoints: 16,
    semifinalsPoints: 21,
    championshipPoints: 34,
  },
  {
    name: "Croatia",
    flag: "🇭🇷",
    group: "C",
    winGroupPoints: 75,
    qualifyPoints: 22,
    roundOf32Points: 5,
    roundOf16Points: 10,
    quarterfinalsPoints: 15,
    semifinalsPoints: 20,
    championshipPoints: 29,
  },
  {
    name: "Uruguay",
    flag: "🇺🇾",
    group: "C",
    winGroupPoints: 77,
    qualifyPoints: 23,
    roundOf32Points: 4,
    roundOf16Points: 9,
    quarterfinalsPoints: 14,
    semifinalsPoints: 19,
    championshipPoints: 30,
  },
  {
    name: "Mexico",
    flag: "🇲🇽",
    group: "D",
    winGroupPoints: 72,
    qualifyPoints: 21,
    roundOf32Points: 3,
    roundOf16Points: 8,
    quarterfinalsPoints: 13,
    semifinalsPoints: 18,
    championshipPoints: 28,
  },
  {
    name: "Japan",
    flag: "🇯🇵",
    group: "D",
    winGroupPoints: 70,
    qualifyPoints: 21,
    roundOf32Points: 2,
    roundOf16Points: 7,
    quarterfinalsPoints: 12,
    semifinalsPoints: 17,
    championshipPoints: 27,
  },
  {
    name: "South Korea",
    flag: "🇰🇷",
    group: "D",
    winGroupPoints: 68,
    qualifyPoints: 20,
    roundOf32Points: 1,
    roundOf16Points: 6,
    quarterfinalsPoints: 11,
    semifinalsPoints: 16,
    championshipPoints: 26,
  },
  {
    name: "Morocco",
    flag: "🇲🇦",
    group: "D",
    winGroupPoints: 73,
    qualifyPoints: 22,
    roundOf32Points: 0,
    roundOf16Points: 5,
    quarterfinalsPoints: 10,
    semifinalsPoints: 15,
    championshipPoints: 25,
  },
  {
    name: "Senegal",
    flag: "🇸🇳",
    group: "E",
    winGroupPoints: 71,
    qualifyPoints: 21,
    roundOf32Points: 0,
    roundOf16Points: 4,
    quarterfinalsPoints: 9,
    semifinalsPoints: 14,
    championshipPoints: 24,
  },
  {
    name: "Egypt",
    flag: "🇪🇬",
    group: "E",
    winGroupPoints: 69,
    qualifyPoints: 20,
    roundOf32Points: 1,
    roundOf16Points: 6,
    quarterfinalsPoints: 11,
    semifinalsPoints: 16,
    championshipPoints: 26,
  },
  {
    name: "USA",
    flag: "🇺🇸",
    group: "E",
    winGroupPoints: 76,
    qualifyPoints: 23,
    roundOf32Points: 1,
    roundOf16Points: 6,
    quarterfinalsPoints: 11,
    semifinalsPoints: 16,
    championshipPoints: 26,
  },
  {
    name: "Canada",
    flag: "🇨🇦",
    group: "E",
    winGroupPoints: 65,
    qualifyPoints: 19,
    roundOf32Points: 0,
    roundOf16Points: 4,
    quarterfinalsPoints: 9,
    semifinalsPoints: 14,
    championshipPoints: 24,
  },
  {
    name: "Colombia",
    flag: "🇨🇴",
    group: "F",
    winGroupPoints: 74,
    qualifyPoints: 22,
    roundOf32Points: 2,
    roundOf16Points: 5,
    quarterfinalsPoints: 10,
    semifinalsPoints: 15,
    championshipPoints: 25,
  },
  {
    name: "Chile",
    flag: "🇨🇱",
    group: "F",
    winGroupPoints: 72,
    qualifyPoints: 21,
    roundOf32Points: 3,
    roundOf16Points: 8,
    quarterfinalsPoints: 13,
    semifinalsPoints: 18,
    championshipPoints: 28,
  },
  {
    name: "Peru",
    flag: "🇵🇪",
    group: "F",
    winGroupPoints: 66,
    qualifyPoints: 20,
    roundOf32Points: 1,
    roundOf16Points: 6,
    quarterfinalsPoints: 11,
    semifinalsPoints: 16,
    championshipPoints: 26,
  },
  {
    name: "Ecuador",
    flag: "🇪🇨",
    group: "F",
    winGroupPoints: 64,
    qualifyPoints: 19,
    roundOf32Points: 0,
    roundOf16Points: 4,
    quarterfinalsPoints: 9,
    semifinalsPoints: 14,
    championshipPoints: 24,
  },
  {
    name: "Denmark",
    flag: "🇩🇰",
    group: "G",
    winGroupPoints: 79,
    qualifyPoints: 24,
    roundOf32Points: 4,
    roundOf16Points: 9,
    quarterfinalsPoints: 14,
    semifinalsPoints: 19,
    championshipPoints: 30,
  },
  {
    name: "Switzerland",
    flag: "🇨🇭",
    group: "G",
    winGroupPoints: 76,
    qualifyPoints: 23,
    roundOf32Points: 5,
    roundOf16Points: 10,
    quarterfinalsPoints: 15,
    semifinalsPoints: 20,
    championshipPoints: 29,
  },
  {
    name: "Sweden",
    flag: "🇸🇪",
    group: "G",
    winGroupPoints: 74,
    qualifyPoints: 22,
    roundOf32Points: 6,
    roundOf16Points: 11,
    quarterfinalsPoints: 16,
    semifinalsPoints: 21,
    championshipPoints: 31,
  },
  {
    name: "Norway",
    flag: "🇳🇴",
    group: "G",
    winGroupPoints: 70,
    qualifyPoints: 21,
    roundOf32Points: 2,
    roundOf16Points: 7,
    quarterfinalsPoints: 12,
    semifinalsPoints: 17,
    championshipPoints: 27,
  },
  {
    name: "Poland",
    flag: "🇵🇱",
    group: "H",
    winGroupPoints: 73,
    qualifyPoints: 22,
    roundOf32Points: 7,
    roundOf16Points: 12,
    quarterfinalsPoints: 17,
    semifinalsPoints: 22,
    championshipPoints: 31,
  },
  {
    name: "Serbia",
    flag: "🇷🇸",
    group: "H",
    winGroupPoints: 71,
    qualifyPoints: 21,
    roundOf32Points: 8,
    roundOf16Points: 13,
    quarterfinalsPoints: 18,
    semifinalsPoints: 23,
    championshipPoints: 32,
  },
  {
    name: "Turkey",
    flag: "🇹🇷",
    group: "H",
    winGroupPoints: 68,
    qualifyPoints: 20,
    roundOf32Points: 1,
    roundOf16Points: 6,
    quarterfinalsPoints: 11,
    semifinalsPoints: 16,
    championshipPoints: 26,
  },
  {
    name: "Russia",
    flag: "🇷🇺",
    group: "H",
    winGroupPoints: 75,
    qualifyPoints: 22,
    roundOf32Points: 5,
    roundOf16Points: 10,
    quarterfinalsPoints: 15,
    semifinalsPoints: 20,
    championshipPoints: 29,
  },
  {
    name: "Australia",
    flag: "🇦🇺",
    group: "I",
    winGroupPoints: 67,
    qualifyPoints: 20,
    roundOf32Points: 2,
    roundOf16Points: 7,
    quarterfinalsPoints: 12,
    semifinalsPoints: 17,
    championshipPoints: 27,
  },
  {
    name: "Iran",
    flag: "🇮🇷",
    group: "I",
    winGroupPoints: 69,
    qualifyPoints: 20,
    roundOf32Points: 1,
    roundOf16Points: 6,
    quarterfinalsPoints: 11,
    semifinalsPoints: 16,
    championshipPoints: 26,
  },
  {
    name: "Saudi Arabia",
    flag: "🇸🇦",
    group: "I",
    winGroupPoints: 63,
    qualifyPoints: 19,
    roundOf32Points: 0,
    roundOf16Points: 4,
    quarterfinalsPoints: 9,
    semifinalsPoints: 14,
    championshipPoints: 24,
  },
  {
    name: "Qatar",
    flag: "🇶🇦",
    group: "I",
    winGroupPoints: 62,
    qualifyPoints: 18,
    roundOf32Points: 0,
    roundOf16Points: 3,
    quarterfinalsPoints: 8,
    semifinalsPoints: 13,
    championshipPoints: 23,
  },
  {
    name: "Nigeria",
    flag: "🇳🇬",
    group: "J",
    winGroupPoints: 72,
    qualifyPoints: 21,
    roundOf32Points: 12,
    roundOf16Points: 17,
    quarterfinalsPoints: 22,
    semifinalsPoints: 27,
    championshipPoints: 35,
  },
  {
    name: "Ghana",
    flag: "🇬🇭",
    group: "J",
    winGroupPoints: 70,
    qualifyPoints: 21,
    roundOf32Points: 15,
    roundOf16Points: 20,
    quarterfinalsPoints: 25,
    semifinalsPoints: 30,
    championshipPoints: 40,
  },
  {
    name: "Tunisia",
    flag: "🇹🇳",
    group: "J",
    winGroupPoints: 68,
    qualifyPoints: 20,
    roundOf32Points: 1,
    roundOf16Points: 6,
    quarterfinalsPoints: 11,
    semifinalsPoints: 16,
    championshipPoints: 26,
  },
  {
    name: "Cameroon",
    flag: "🇨🇲",
    group: "J",
    winGroupPoints: 67,
    qualifyPoints: 20,
    roundOf32Points: 0,
    roundOf16Points: 4,
    quarterfinalsPoints: 9,
    semifinalsPoints: 14,
    championshipPoints: 24,
  },
  {
    name: "Costa Rica",
    flag: "🇨🇷",
    group: "K",
    winGroupPoints: 65,
    qualifyPoints: 19,
    roundOf32Points: 0,
    roundOf16Points: 3,
    quarterfinalsPoints: 8,
    semifinalsPoints: 13,
    championshipPoints: 23,
  },
  {
    name: "Panama",
    flag: "🇵🇦",
    group: "K",
    winGroupPoints: 61,
    qualifyPoints: 18,
    roundOf32Points: 0,
    roundOf16Points: 2,
    quarterfinalsPoints: 7,
    semifinalsPoints: 12,
    championshipPoints: 22,
  },
  {
    name: "Jamaica",
    flag: "🇯🇲",
    group: "K",
    winGroupPoints: 60,
    qualifyPoints: 18,
    roundOf32Points: 0,
    roundOf16Points: 2,
    quarterfinalsPoints: 7,
    semifinalsPoints: 12,
    championshipPoints: 22,
  },
  {
    name: "New Zealand",
    flag: "🇳🇿",
    group: "K",
    winGroupPoints: 59,
    qualifyPoints: 18,
    roundOf32Points: 0,
    roundOf16Points: 1,
    quarterfinalsPoints: 6,
    semifinalsPoints: 11,
    championshipPoints: 21,
  },
  {
    name: "Algeria",
    flag: "🇩🇿",
    group: "L",
    winGroupPoints: 71,
    qualifyPoints: 21,
    roundOf32Points: 13,
    roundOf16Points: 18,
    quarterfinalsPoints: 23,
    semifinalsPoints: 28,
    championshipPoints: 38,
  },
  {
    name: "Iceland",
    flag: "🇮🇸",
    group: "L",
    winGroupPoints: 66,
    qualifyPoints: 20,
    roundOf32Points: 1,
    roundOf16Points: 6,
    quarterfinalsPoints: 11,
    semifinalsPoints: 16,
    championshipPoints: 26,
  },
  {
    name: "Ukraine",
    flag: "🇺🇦",
    group: "L",
    winGroupPoints: 74,
    qualifyPoints: 22,
    roundOf32Points: 9,
    roundOf16Points: 14,
    quarterfinalsPoints: 19,
    semifinalsPoints: 24,
    championshipPoints: 33,
  },
  {
    name: "Czech Republic",
    flag: "🇨🇿",
    group: "L",
    winGroupPoints: 72,
    qualifyPoints: 21,
    roundOf32Points: 10,
    roundOf16Points: 15,
    quarterfinalsPoints: 20,
    semifinalsPoints: 25,
    championshipPoints: 34,
  },
  {
    name: "Austria",
    flag: "🇦🇹",
    group: "L",
    winGroupPoints: 70,
    qualifyPoints: 21,
    roundOf32Points: 11,
    roundOf16Points: 16,
    quarterfinalsPoints: 21,
    semifinalsPoints: 26,
    championshipPoints: 36,
  },
  {
    name: "Wales",
    flag: "🏴󠁧󠁢󠁷󠁬󠁳󠁿",
    group: "L",
    winGroupPoints: 69,
    qualifyPoints: 20,
    roundOf32Points: 1,
    roundOf16Points: 6,
    quarterfinalsPoints: 11,
    semifinalsPoints: 16,
    championshipPoints: 26,
  },
];

// Player data
const GOLDEN_BOOT_PLAYERS = [
  { name: "Kylian Mbappé", country: "France", flag: "🇫🇷", points: 30 },
  { name: "Lionel Messi", country: "Argentina", flag: "🇦🇷", points: 28 },
  { name: "Cristiano Ronaldo", country: "Portugal", flag: "🇵🇹", points: 27 },
  { name: "Erling Haaland", country: "Norway", flag: "🇳🇴", points: 25 },
  { name: "Harry Kane", country: "England", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", points: 24 },
  { name: "Vinícius Júnior", country: "Brazil", flag: "🇧🇷", points: 23 },
  { name: "Karim Benzema", country: "France", flag: "🇫🇷", points: 22 },
  { name: "Robert Lewandowski", country: "Poland", flag: "🇵🇱", points: 21 },
  { name: "Neymar Jr", country: "Brazil", flag: "🇧🇷", points: 20 },
  { name: "Mohamed Salah", country: "Egypt", flag: "🇪🇬", points: 19 },
  { name: "Son Heung-min", country: "South Korea", flag: "🇰🇷", points: 18 },
  { name: "Kevin De Bruyne", country: "Belgium", flag: "🇧🇪", points: 17 },
  { name: "Luka Modrić", country: "Croatia", flag: "🇭🇷", points: 16 },
  { name: "Jude Bellingham", country: "England", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", points: 15 },
  { name: "Pedri", country: "Spain", flag: "🇪🇸", points: 14 },
  { name: "Gavi", country: "Spain", flag: "🇪🇸", points: 13 },
  { name: "Phil Foden", country: "England", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", points: 12 },
];

const GOLDEN_BALL_PLAYERS = [
  { name: "Lionel Messi", country: "Argentina", flag: "🇦🇷", points: 40 },
  { name: "Kylian Mbappé", country: "France", flag: "🇫🇷", points: 38 },
  { name: "Luka Modrić", country: "Croatia", flag: "🇭🇷", points: 36 },
  { name: "Kevin De Bruyne", country: "Belgium", flag: "🇧🇪", points: 35 },
  { name: "Jude Bellingham", country: "England", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", points: 34 },
  { name: "Vinícius Júnior", country: "Brazil", flag: "🇧🇷", points: 33 },
  { name: "Pedri", country: "Spain", flag: "🇪🇸", points: 32 },
  { name: "Jamal Musiala", country: "Germany", flag: "🇩🇪", points: 31 },
  { name: "Gavi", country: "Spain", flag: "🇪🇸", points: 30 },
  { name: "Phil Foden", country: "England", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", points: 29 },
];

const GOLDEN_GLOVE_PLAYERS = [
  { name: "Emiliano Martínez", country: "Argentina", flag: "🇦🇷", points: 25 },
  { name: "Thibaut Courtois", country: "Belgium", flag: "🇧🇪", points: 24 },
  { name: "Alisson Becker", country: "Brazil", flag: "🇧🇷", points: 23 },
  { name: "Manuel Neuer", country: "Germany", flag: "🇩🇪", points: 22 },
  { name: "Gianluigi Donnarumma", country: "Italy", flag: "🇮🇹", points: 21 },
  { name: "Jan Oblak", country: "Slovenia", flag: "🇸🇮", points: 20 },
  { name: "Marc-André ter Stegen", country: "Germany", flag: "🇩🇪", points: 19 },
  { name: "Ederson", country: "Brazil", flag: "🇧🇷", points: 18 },
  { name: "Édouard Mendy", country: "Senegal", flag: "🇸🇳", points: 17 },
  { name: "Jordan Pickford", country: "England", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", points: 16 },
];

const YOUNG_PLAYER_PLAYERS = [
  { name: "Jude Bellingham", country: "England", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", points: 20 },
  { name: "Pedri", country: "Spain", flag: "🇪🇸", points: 19 },
  { name: "Gavi", country: "Spain", flag: "🇪🇸", points: 18 },
  { name: "Jamal Musiala", country: "Germany", flag: "🇩🇪", points: 17 },
  { name: "Phil Foden", country: "England", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", points: 16 },
  { name: "Bukayo Saka", country: "England", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", points: 15 },
  { name: "Eduardo Camavinga", country: "France", flag: "🇫🇷", points: 14 },
  { name: "Florian Wirtz", country: "Germany", flag: "🇩🇪", points: 13 },
  { name: "Endrick", country: "Brazil", flag: "🇧🇷", points: 12 },
  { name: "Lamine Yamal", country: "Spain", flag: "🇪🇸", points: 11 },
];

async function main() {
  console.log("🌱 Starting database seed...");

  // Clear existing data
  console.log("🧹 Clearing existing data...");
  await prisma.bet.deleteMany();
  await prisma.choice.deleteMany();
  await prisma.line.deleteMany();

  // Create individual group lines
  console.log("📝 Creating group lines...");
  const groupLetters = [
    "A",
    "B",
    "C",
    "D",
    "E",
    "F",
    "G",
    "H",
    "I",
    "J",
    "K",
    "L",
  ];
  const groupWinnerLines: { id: string; groupLetter: string }[] = [];
  const groupRunnerUpLines: { id: string; groupLetter: string }[] = [];
  const groupThirdPlaceLines: { id: string; groupLetter: string }[] = [];

  for (const groupLetter of groupLetters) {
    const winnerLine = await prisma.line.create({
      data: {
        title: `Group ${groupLetter} Winner`,
        choiceLimit: 1,
        collection: ["group-winner"],
        choiceCollectionLimit: 12, // Total across all 12 group winner lines
      },
    });
    groupWinnerLines.push({ id: winnerLine.id, groupLetter });

    const runnerUpLine = await prisma.line.create({
      data: {
        title: `Group ${groupLetter} Runner Up`,
        choiceLimit: 1,
        collection: ["group-runner-up"],
        choiceCollectionLimit: 12, // Total across all 12 group runner-up lines
      },
    });
    groupRunnerUpLines.push({ id: runnerUpLine.id, groupLetter });

    const thirdPlaceLine = await prisma.line.create({
      data: {
        title: `Group ${groupLetter} Third Place`,
        choiceLimit: 1,
        collection: ["group-third-place"],
        choiceCollectionLimit: 8, // Total across all group third-place lines (only 8 advance)
      },
    });
    groupThirdPlaceLines.push({ id: thirdPlaceLine.id, groupLetter });
  }

  // Create playoff round lines
  console.log("📝 Creating playoff round lines...");
  const roundOf32Line = await prisma.line.create({
    data: {
      title: "Round of 32",
      choiceLimit: 16, // Pick 16 teams from this single line
      collection: [],
      choiceCollectionLimit: null, // Not part of a collection
    },
  });

  const roundOf16Line = await prisma.line.create({
    data: {
      title: "Round of 16",
      choiceLimit: 8, // Pick 8 teams from this single line
      collection: [],
      choiceCollectionLimit: null,
    },
  });

  const quarterfinalsLine = await prisma.line.create({
    data: {
      title: "Quarterfinals",
      choiceLimit: 4, // Pick 4 teams from this single line
      collection: [],
      choiceCollectionLimit: null,
    },
  });

  const semifinalsLine = await prisma.line.create({
    data: {
      title: "Semifinals",
      choiceLimit: 2, // Pick 2 teams from this single line
      collection: [],
      choiceCollectionLimit: null,
    },
  });

  const championshipLine = await prisma.line.create({
    data: {
      title: "Championship",
      choiceLimit: 1, // Pick 1 team from this single line
      collection: [],
      choiceCollectionLimit: null,
    },
  });

  const goldenBootLine = await prisma.line.create({
    data: {
      title: "Golden Boot (Top Scorer)",
      choiceLimit: 1,
      collection: [],
      choiceCollectionLimit: null,
    },
  });

  const goldenBallLine = await prisma.line.create({
    data: {
      title: "Golden Ball (Best Player)",
      choiceLimit: 1,
      collection: [],
      choiceCollectionLimit: null,
    },
  });

  const goldenGloveLine = await prisma.line.create({
    data: {
      title: "Golden Glove (Best Goalkeeper)",
      choiceLimit: 1,
      collection: [],
      choiceCollectionLimit: null,
    },
  });

  const youngPlayerLine = await prisma.line.create({
    data: {
      title: "FIFA Young Player Award",
      choiceLimit: 1,
      collection: [],
      choiceCollectionLimit: null,
    },
  });

  // Generate groups from COUNTRIES using the group field
  const GROUPS: Record<string, typeof COUNTRIES> = {};
  for (const groupLetter of groupLetters) {
    GROUPS[groupLetter] = COUNTRIES.filter((c) => c.group === groupLetter);
  }

  // Create Choices for individual group lines
  console.log("🏆 Creating group winner choices...");
  for (const { id: lineId, groupLetter } of groupWinnerLines) {
    const groupCountries = GROUPS[groupLetter];
    await prisma.choice.createMany({
      data: groupCountries.map((country) => ({
        lineId,
        title: country.name,
        flag: country.flag,
        primaryPoints: country.winGroupPoints,
        secondaryPoints: country.qualifyPoints,
        isPrimaryWin: true,
      })),
    });
  }

  console.log("🥈 Creating group runners-up choices...");
  for (const { id: lineId, groupLetter } of groupRunnerUpLines) {
    const groupCountries = GROUPS[groupLetter];
    await prisma.choice.createMany({
      data: groupCountries.map((country) => ({
        lineId,
        title: country.name,
        flag: country.flag,
        primaryPoints: 0,
        secondaryPoints: country.qualifyPoints,
        isPrimaryWin: false,
      })),
    });
  }

  console.log("🥉 Creating third place choices...");
  for (const { id: lineId, groupLetter } of groupThirdPlaceLines) {
    const groupCountries = GROUPS[groupLetter];
    await prisma.choice.createMany({
      data: groupCountries.map((country) => ({
        lineId,
        title: country.name,
        flag: country.flag,
        primaryPoints: 0,
        secondaryPoints: country.qualifyPoints,
        isPrimaryWin: false,
      })),
    });
  }

  // Create Choices for Round of 32 - all countries available
  console.log("🎯 Creating round of 32 choices...");
  await prisma.choice.createMany({
    data: COUNTRIES.map((country) => ({
      lineId: roundOf32Line.id,
      title: country.name,
      flag: country.flag,
      primaryPoints: 0,
      secondaryPoints: country.roundOf32Points,
      isPrimaryWin: false,
    })),
  });

  // Create Choices for Round of 16 - all countries available
  console.log("🎯 Creating round of 16 choices...");
  await prisma.choice.createMany({
    data: COUNTRIES.map((country) => ({
      lineId: roundOf16Line.id,
      title: country.name,
      flag: country.flag,
      primaryPoints: 0,
      secondaryPoints: country.roundOf16Points,
      isPrimaryWin: false,
    })),
  });

  // Create Choices for Quarterfinals - all countries available
  console.log("🎯 Creating quarterfinals choices...");
  await prisma.choice.createMany({
    data: COUNTRIES.map((country) => ({
      lineId: quarterfinalsLine.id,
      title: country.name,
      flag: country.flag,
      primaryPoints: 0,
      secondaryPoints: country.quarterfinalsPoints,
      isPrimaryWin: false,
    })),
  });

  // Create Choices for Semifinals - all countries available
  console.log("🎯 Creating semifinals choices...");
  await prisma.choice.createMany({
    data: COUNTRIES.map((country) => ({
      lineId: semifinalsLine.id,
      title: country.name,
      flag: country.flag,
      primaryPoints: 0,
      secondaryPoints: country.semifinalsPoints,
      isPrimaryWin: false,
    })),
  });

  // Create Choices for Championship - all countries available (primary points for winner)
  console.log("🏆 Creating championship choices...");
  await prisma.choice.createMany({
    data: COUNTRIES.map((country) => ({
      lineId: championshipLine.id,
      title: country.name,
      flag: country.flag,
      primaryPoints: country.championshipPoints,
      secondaryPoints: 0,
      isPrimaryWin: true,
    })),
  });

  // Create Choices for Golden Boot
  console.log("⚽ Creating golden boot choices...");
  await prisma.choice.createMany({
    data: GOLDEN_BOOT_PLAYERS.map((player) => ({
      lineId: goldenBootLine.id,
      title: player.name,
      flag: player.flag,
      primaryPoints: player.points,
      secondaryPoints: 0,
      isPrimaryWin: true,
    })),
  });

  // Create Choices for Golden Ball
  console.log("⚽ Creating golden ball choices...");
  await prisma.choice.createMany({
    data: GOLDEN_BALL_PLAYERS.map((player) => ({
      lineId: goldenBallLine.id,
      title: player.name,
      flag: player.flag,
      primaryPoints: player.points,
      secondaryPoints: 0,
      isPrimaryWin: true,
    })),
  });

  // Create Choices for Golden Glove
  console.log("🧤 Creating golden glove choices...");
  await prisma.choice.createMany({
    data: GOLDEN_GLOVE_PLAYERS.map((player) => ({
      lineId: goldenGloveLine.id,
      title: player.name,
      flag: player.flag,
      primaryPoints: player.points,
      secondaryPoints: 0,
      isPrimaryWin: true,
    })),
  });

  // Create Choices for Young Player Award
  console.log("🌟 Creating young player award choices...");
  await prisma.choice.createMany({
    data: YOUNG_PLAYER_PLAYERS.map((player) => ({
      lineId: youngPlayerLine.id,
      title: player.name,
      flag: player.flag,
      primaryPoints: player.points,
      secondaryPoints: 0,
      isPrimaryWin: true,
    })),
  });

  console.log("✅ Database seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
