// prisma/seed.ts
import "dotenv/config";
import { PrismaClient, DayNight } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

/**
 * Prisma 7 ต้องมี adapter หรือ accelerateUrl ตอน new PrismaClient()
 * (เราใช้ adapter-pg สำหรับ PostgreSQL)
 */

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("Missing DIRECT_URL or DATABASE_URL in .env");
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

/** -----------------------
 * CONFIG
 * ---------------------- */
const SLOT_HOURS = [7, 13, 19] as const; // 3 รอบ/วัน
const MONTHS_TO_SEED = 2;

const DAY_START_HOUR = 6;
const NIGHT_START_HOUR = 18;

const REGIONS = [
  "ภาคเหนือ",
  "ภาคตะวันออกเฉียงเหนือ",
  "ภาคกลาง",
  "ภาคตะวันออก",
  "ภาคใต้(ฝั่งตะวันออก)",
  "ภาคใต้(ฝั่งตะวันตก)",
  "กรุงเทพและปริมณฑล",
] as const;

type Region = (typeof REGIONS)[number];

type FieldKey =
  | "clearPct"
  | "partlyCloudyPct"
  | "cloudyPct"
  | "rainPct"
  | "thunderstormPct"
  | "fogPct"
  | "maxTempC"
  | "minTempC"
  | "windText"
  | "waveText"
  | "nearbyAreas";

/** -----------------------
 * HELPERS (deterministic RNG)
 * ---------------------- */
function hashStringToInt(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function round1(n: number) {
  return Math.round(n * 10) / 10;
}

function formatWind(rnd: () => number) {
  const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  const sp = Math.round(3 + rnd() * 27); // 3..30
  const dir = dirs[Math.floor(rnd() * dirs.length)];
  return `${sp} km/h ${dir}`;
}

function formatWave(rnd: () => number) {
  const h = round1(0.2 + rnd() * 2.3); // 0.2..2.5
  return `${h} m`;
}

function getDayNightByHour(hour: number): DayNight {
  return hour >= DAY_START_HOUR && hour < NIGHT_START_HOUR ? "Day" : "Night";
}

/** -----------------------
 * REGION -> fields to show (<= 6, consistent for that region)
 * ---------------------- */
const ALL_FIELDS: FieldKey[] = [
  "clearPct",
  "partlyCloudyPct",
  "cloudyPct",
  "rainPct",
  "thunderstormPct",
  "fogPct",
  "maxTempC",
  "minTempC",
  "windText",
  "waveText",
  "nearbyAreas",
];

function pickRegionFields(region: Region): Set<FieldKey> {
  const rnd = mulberry32(hashStringToInt(`fields:${region}`));

  const arr = [...ALL_FIELDS];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }

  const picked = new Set<FieldKey>(arr.slice(0, 6));

  // ให้มีอย่างน้อย 1 weather condition
  if (
    !picked.has("rainPct") &&
    !picked.has("cloudyPct") &&
    !picked.has("clearPct") &&
    !picked.has("partlyCloudyPct")
  ) {
    picked.add("rainPct");
    while (picked.size > 6) picked.delete(arr[arr.length - 1]);
  }

  return picked;
}

const REGION_FIELDS: Record<Region, Set<FieldKey>> = Object.fromEntries(
  REGIONS.map((r) => [r, pickRegionFields(r)])
) as Record<Region, Set<FieldKey>>;

/** -----------------------
 * REGION base profiles
 * ---------------------- */
const REGION_PROFILE: Record<Region, { baseTemp: number; rainBias: number }> = {
  "ภาคเหนือ": { baseTemp: 24, rainBias: 0.35 },
  "ภาคตะวันออกเฉียงเหนือ": { baseTemp: 28, rainBias: 0.25 },
  "ภาคกลาง": { baseTemp: 30, rainBias: 0.3 },
  "ภาคตะวันออก": { baseTemp: 29, rainBias: 0.35 },
  "ภาคใต้(ฝั่งตะวันออก)": { baseTemp: 28, rainBias: 0.45 },
  "ภาคใต้(ฝั่งตะวันตก)": { baseTemp: 28, rainBias: 0.5 },
  "กรุงเทพและปริมณฑล": { baseTemp: 31, rainBias: 0.28 },
};

type ForecastPayload = {
  region: string;
  detail: string | null;

  tempC: number | null;

  clearPct: number | null;
  partlyCloudyPct: number | null;
  cloudyPct: number | null;
  rainPct: number | null;
  thunderstormPct: number | null;
  fogPct: number | null;

  maxTempC: number | null;
  minTempC: number | null;

  windText: string | null;
  waveText: string | null;

  dateTime: Date;
  type: DayNight;

  _nearbyAreas?: string[];
};

function buildForecast(region: Region, date: Date, hour: number): ForecastPayload {
  const seedKey = `data:${region}:${date.toISOString().slice(0, 10)}:${hour}`;
  const rnd = mulberry32(hashStringToInt(seedKey));

  const profile = REGION_PROFILE[region];
  const type = getDayNightByHour(hour);

  const hourAdj = hour === 7 ? -2 : hour === 13 ? +1 : 0;
  const dailyNoise = (rnd() - 0.5) * 4;
  const tempC = round1(profile.baseTemp + hourAdj + dailyNoise);

  const rain = clamp(Math.round(profile.rainBias * 100 + (rnd() - 0.5) * 40), 0, 100);
  const thunder = clamp(Math.round(rain * 0.25 + (rnd() - 0.5) * 20), 0, 100);
  const fog = clamp(Math.round(rnd() * 20 + (type === "Night" ? 10 : 0)), 0, 100);

  const cloudy = clamp(Math.round(rain * 0.7 + (rnd() - 0.5) * 30), 0, 100);
  const partly = clamp(Math.round((100 - cloudy) * 0.5 + (rnd() - 0.5) * 20), 0, 100);
  const clear = clamp(100 - cloudy - partly, 0, 100);

  const maxTemp = round1(tempC + 2 + rnd() * 3);
  const minTemp = round1(tempC - (2 + rnd() * 3));

  let detail = "แดดสลับเมฆ";
  if (rain >= 60) detail = "มีฝนในหลายพื้นที่";
  else if (rain >= 35) detail = "มีฝนกระจาย";
  else if (cloudy >= 60) detail = "เมฆมาก";
  else if (clear >= 60) detail = "ท้องฟ้าแจ่มใส";

  const dt = new Date(date);
  dt.setHours(hour, 0, 0, 0);

  const allowed = REGION_FIELDS[region];

  const payload: ForecastPayload = {
    region,
    detail,

    tempC,

    clearPct: allowed.has("clearPct") ? clear : null,
    partlyCloudyPct: allowed.has("partlyCloudyPct") ? partly : null,
    cloudyPct: allowed.has("cloudyPct") ? cloudy : null,
    rainPct: allowed.has("rainPct") ? rain : null,
    thunderstormPct: allowed.has("thunderstormPct") ? thunder : null,
    fogPct: allowed.has("fogPct") ? fog : null,

    maxTempC: allowed.has("maxTempC") ? maxTemp : null,
    minTempC: allowed.has("minTempC") ? minTemp : null,

    windText: allowed.has("windText") ? formatWind(rnd) : null,
    waveText: allowed.has("waveText") ? formatWave(rnd) : null,

    dateTime: dt,
    type,

    _nearbyAreas: undefined,
  };

  if (allowed.has("nearbyAreas")) {
    const count = Math.floor(rnd() * 3); // 0..2
    const list = Array.from({ length: count }).map(
      (_, i) => `พื้นที่ใกล้เคียง ${String.fromCharCode(65 + i)}`
    );
    payload._nearbyAreas = list;
  }

  return payload;
}

function getStartOfCurrentMonth() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
}

function addMonths(d: Date, m: number) {
  return new Date(d.getFullYear(), d.getMonth() + m, d.getDate(), 0, 0, 0, 0);
}

function eachDay(start: Date, endExclusive: Date) {
  const days: Date[] = [];
  const d = new Date(start);
  while (d < endExclusive) {
    days.push(new Date(d));
    d.setDate(d.getDate() + 1);
  }
  return days;
}

async function main() {
  console.log("🌱 Seeding started...");

  await prisma.weatherNearbyArea.deleteMany();
  await prisma.weatherForecast.deleteMany();

  const start = getStartOfCurrentMonth();
  const end = addMonths(start, MONTHS_TO_SEED);
  const days = eachDay(start, end);

  const forecastCreates: ForecastPayload[] = [];
  for (const day of days) {
    for (const hour of SLOT_HOURS) {
      for (const region of REGIONS) {
        forecastCreates.push(buildForecast(region, day, hour));
      }
    }
  }

  console.log(`Total forecasts to create: ${forecastCreates.length}`);

  const CONCURRENCY = 25; // ปรับ 10/25/50 ได้ตามความเร็ว DB
  let createdForecast = 0;
  let createdNearby = 0;

  for (let i = 0; i < forecastCreates.length; i += CONCURRENCY) {
    const chunk = forecastCreates.slice(i, i + CONCURRENCY);

    const results = await Promise.all(
      chunk.map(async (f) => {
        const { _nearbyAreas, ...data } = f;

        const created = await prisma.weatherForecast.create({
          data: {
            region: data.region,
            detail: data.detail,

            tempC: data.tempC,
            clearPct: data.clearPct,
            partlyCloudyPct: data.partlyCloudyPct,
            cloudyPct: data.cloudyPct,
            rainPct: data.rainPct,
            thunderstormPct: data.thunderstormPct,
            fogPct: data.fogPct,
            maxTempC: data.maxTempC,
            minTempC: data.minTempC,
            windText: data.windText,
            waveText: data.waveText,
            dateTime: data.dateTime,
            type: data.type,

            // ✅ ใส่ nearby แบบ nested (สำคัญมาก)
            nearbyAreas:
              _nearbyAreas && _nearbyAreas.length
                ? {
                  createMany: {
                    data: _nearbyAreas.map((name) => ({ name })),
                  },
                }
                : undefined,
          },
          select: { id: true },
        });

        return { created, nearbyCount: _nearbyAreas?.length ?? 0 };
      })
    );

    createdForecast += results.length;
    createdNearby += results.reduce((sum, r) => sum + r.nearbyCount, 0);

    console.log(`Progress: ${Math.min(i + CONCURRENCY, forecastCreates.length)}/${forecastCreates.length}`);
  }

  console.log("✅ Seeding done.");
  console.log(`Created WeatherForecast: ${createdForecast}`);
  console.log(`Created WeatherNearbyArea: ${createdNearby}`);

  console.log("\n📌 Region fields (<= 6) used:");
  for (const r of REGIONS) console.log(`- ${r}: ${Array.from(REGION_FIELDS[r]).join(", ")}`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
    await pool.end();
  })
  .catch(async (e) => {
    console.error("❌ Seed failed:", e);
    await prisma.$disconnect();
    await pool.end();
    process.exit(1);
  });
