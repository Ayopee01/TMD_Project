// prisma/seed.ts
import "dotenv/config";
import { PrismaClient, DayNight } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

/**
 * Prisma 7 + PostgreSQL: ใช้ adapter-pg
 */
const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
if (!connectionString) throw new Error("Missing DIRECT_URL or DATABASE_URL in .env");

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

/** -----------------------
 * CONFIG
 * ---------------------- */
const SLOT_HOURS = [7, 13, 19] as const;
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
 * TH Provinces (nameTh + code)
 * - code แนะนำใช้ TH-xx (เลขจังหวัด) เพื่อใช้งาน production
 * - nameEn ใส่/ไม่ใส่ก็ได้
 * ---------------------- */
type ProvinceSeed = { code: string; nameTh: string; nameEn?: string };

const PROVINCES: ProvinceSeed[] = [
  { code: "TH-10", nameTh: "กรุงเทพมหานคร", nameEn: "Bangkok" },
  { code: "TH-11", nameTh: "สมุทรปราการ", nameEn: "Samut Prakan" },
  { code: "TH-12", nameTh: "นนทบุรี", nameEn: "Nonthaburi" },
  { code: "TH-13", nameTh: "ปทุมธานี", nameEn: "Pathum Thani" },
  { code: "TH-14", nameTh: "พระนครศรีอยุธยา", nameEn: "Phra Nakhon Si Ayutthaya" },
  { code: "TH-15", nameTh: "อ่างทอง", nameEn: "Ang Thong" },
  { code: "TH-16", nameTh: "ลพบุรี", nameEn: "Lopburi" },
  { code: "TH-17", nameTh: "สิงห์บุรี", nameEn: "Sing Buri" },
  { code: "TH-18", nameTh: "ชัยนาท", nameEn: "Chai Nat" },
  { code: "TH-19", nameTh: "สระบุรี", nameEn: "Saraburi" },
  { code: "TH-20", nameTh: "ชลบุรี", nameEn: "Chon Buri" },
  { code: "TH-21", nameTh: "ระยอง", nameEn: "Rayong" },
  { code: "TH-22", nameTh: "จันทบุรี", nameEn: "Chanthaburi" },
  { code: "TH-23", nameTh: "ตราด", nameEn: "Trat" },
  { code: "TH-24", nameTh: "ฉะเชิงเทรา", nameEn: "Chachoengsao" },
  { code: "TH-25", nameTh: "ปราจีนบุรี", nameEn: "Prachin Buri" },
  { code: "TH-26", nameTh: "นครนายก", nameEn: "Nakhon Nayok" },
  { code: "TH-27", nameTh: "สระแก้ว", nameEn: "Sa Kaeo" },
  { code: "TH-30", nameTh: "นครราชสีมา", nameEn: "Nakhon Ratchasima" },
  { code: "TH-31", nameTh: "บุรีรัมย์", nameEn: "Buri Ram" },
  { code: "TH-32", nameTh: "สุรินทร์", nameEn: "Surin" },
  { code: "TH-33", nameTh: "ศรีสะเกษ", nameEn: "Si Sa Ket" },
  { code: "TH-34", nameTh: "อุบลราชธานี", nameEn: "Ubon Ratchathani" },
  { code: "TH-35", nameTh: "ยโสธร", nameEn: "Yasothon" },
  { code: "TH-36", nameTh: "ชัยภูมิ", nameEn: "Chaiyaphum" },
  { code: "TH-37", nameTh: "อำนาจเจริญ", nameEn: "Amnat Charoen" },
  { code: "TH-38", nameTh: "บึงกาฬ", nameEn: "Bueng Kan" },
  { code: "TH-39", nameTh: "หนองบัวลำภู", nameEn: "Nong Bua Lam Phu" },
  { code: "TH-40", nameTh: "ขอนแก่น", nameEn: "Khon Kaen" },
  { code: "TH-41", nameTh: "อุดรธานี", nameEn: "Udon Thani" },
  { code: "TH-42", nameTh: "เลย", nameEn: "Loei" },
  { code: "TH-43", nameTh: "หนองคาย", nameEn: "Nong Khai" },
  { code: "TH-44", nameTh: "มหาสารคาม", nameEn: "Maha Sarakham" },
  { code: "TH-45", nameTh: "ร้อยเอ็ด", nameEn: "Roi Et" },
  { code: "TH-46", nameTh: "กาฬสินธุ์", nameEn: "Kalasin" },
  { code: "TH-47", nameTh: "สกลนคร", nameEn: "Sakon Nakhon" },
  { code: "TH-48", nameTh: "นครพนม", nameEn: "Nakhon Phanom" },
  { code: "TH-49", nameTh: "มุกดาหาร", nameEn: "Mukdahan" },
  { code: "TH-50", nameTh: "เชียงใหม่", nameEn: "Chiang Mai" },
  { code: "TH-51", nameTh: "ลำพูน", nameEn: "Lamphun" },
  { code: "TH-52", nameTh: "ลำปาง", nameEn: "Lampang" },
  { code: "TH-53", nameTh: "อุตรดิตถ์", nameEn: "Uttaradit" },
  { code: "TH-54", nameTh: "แพร่", nameEn: "Phrae" },
  { code: "TH-55", nameTh: "น่าน", nameEn: "Nan" },
  { code: "TH-56", nameTh: "พะเยา", nameEn: "Phayao" },
  { code: "TH-57", nameTh: "เชียงราย", nameEn: "Chiang Rai" },
  { code: "TH-58", nameTh: "แม่ฮ่องสอน", nameEn: "Mae Hong Son" },
  { code: "TH-60", nameTh: "นครสวรรค์", nameEn: "Nakhon Sawan" },
  { code: "TH-61", nameTh: "อุทัยธานี", nameEn: "Uthai Thani" },
  { code: "TH-62", nameTh: "กำแพงเพชร", nameEn: "Kamphaeng Phet" },
  { code: "TH-63", nameTh: "ตาก", nameEn: "Tak" },
  { code: "TH-64", nameTh: "สุโขทัย", nameEn: "Sukhothai" },
  { code: "TH-65", nameTh: "พิษณุโลก", nameEn: "Phitsanulok" },
  { code: "TH-66", nameTh: "พิจิตร", nameEn: "Phichit" },
  { code: "TH-67", nameTh: "เพชรบูรณ์", nameEn: "Phetchabun" },
  { code: "TH-70", nameTh: "ราชบุรี", nameEn: "Ratchaburi" },
  { code: "TH-71", nameTh: "กาญจนบุรี", nameEn: "Kanchanaburi" },
  { code: "TH-72", nameTh: "สุพรรณบุรี", nameEn: "Suphan Buri" },
  { code: "TH-73", nameTh: "นครปฐม", nameEn: "Nakhon Pathom" },
  { code: "TH-74", nameTh: "สมุทรสาคร", nameEn: "Samut Sakhon" },
  { code: "TH-75", nameTh: "สมุทรสงคราม", nameEn: "Samut Songkhram" },
  { code: "TH-76", nameTh: "เพชรบุรี", nameEn: "Phetchaburi" },
  { code: "TH-77", nameTh: "ประจวบคีรีขันธ์", nameEn: "Prachuap Khiri Khan" },
  { code: "TH-80", nameTh: "นครศรีธรรมราช", nameEn: "Nakhon Si Thammarat" },
  { code: "TH-81", nameTh: "กระบี่", nameEn: "Krabi" },
  { code: "TH-82", nameTh: "พังงา", nameEn: "Phang Nga" },
  { code: "TH-83", nameTh: "ภูเก็ต", nameEn: "Phuket" },
  { code: "TH-84", nameTh: "สุราษฎร์ธานี", nameEn: "Surat Thani" },
  { code: "TH-85", nameTh: "ระนอง", nameEn: "Ranong" },
  { code: "TH-86", nameTh: "ชุมพร", nameEn: "Chumphon" },
  { code: "TH-90", nameTh: "สงขลา", nameEn: "Songkhla" },
  { code: "TH-91", nameTh: "สตูล", nameEn: "Satun" },
  { code: "TH-92", nameTh: "ตรัง", nameEn: "Trang" },
  { code: "TH-93", nameTh: "พัทลุง", nameEn: "Phatthalung" },
  { code: "TH-94", nameTh: "ปัตตานี", nameEn: "Pattani" },
  { code: "TH-95", nameTh: "ยะลา", nameEn: "Yala" },
  { code: "TH-96", nameTh: "นราธิวาส", nameEn: "Narathiwat" },
];

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
  const sp = Math.round(3 + rnd() * 27);
  const dir = dirs[Math.floor(rnd() * dirs.length)];
  return `${sp} km/h ${dir}`;
}

function formatWave(rnd: () => number) {
  const h = round1(0.2 + rnd() * 2.3);
  return `${h} m`;
}

function getDayNightByHour(hour: number): DayNight {
  return hour >= DAY_START_HOUR && hour < NIGHT_START_HOUR ? "Day" : "Night";
}

/** -----------------------
 * REGION -> fields to show (<= 6)
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

  // เปลี่ยนเป็น "code จังหวัด" หรือ "ชื่อจังหวัด"
  _nearbyProvinceCodes?: string[];
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
    _nearbyProvinceCodes: undefined,
  };

  // nearby จังหวัด 0..2 จังหวัด (ใช้ code)
  if (allowed.has("nearbyAreas")) {
    const count = Math.floor(rnd() * 3); // 0..2
    if (count > 0) {
      // เลือกแบบ deterministic จาก PROVINCES
      const picked = new Set<string>();
      while (picked.size < count) {
        const idx = Math.floor(rnd() * PROVINCES.length);
        picked.add(PROVINCES[idx].code);
      }
      payload._nearbyProvinceCodes = [...picked];
    } else {
      payload._nearbyProvinceCodes = [];
    }
  }

  return payload;
}

/** -----------------------
 * Date range helpers
 * ---------------------- */
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

/** -----------------------
 * MAIN
 * ---------------------- */
async function main() {
  console.log("🌱 Seeding started...");

  // 1) ลบข้อมูลตามลำดับ FK
  await prisma.weatherNearbyArea.deleteMany();
  await prisma.weatherForecast.deleteMany();
  await prisma.province.deleteMany();

  // 2) Seed provinces
  await prisma.province.createMany({
    data: PROVINCES.map((p) => ({
      code: p.code,
      nameTh: p.nameTh,
      nameEn: p.nameEn ?? null,
    })),
  });

  const provinceRows = await prisma.province.findMany({
    select: { id: true, code: true },
  });

  const provinceIdByCode = new Map<string, bigint>();
  for (const p of provinceRows) provinceIdByCode.set(p.code, p.id as unknown as bigint);

  console.log(`✅ Provinces seeded: ${provinceRows.length}`);

  // 3) Build forecasts
  // ✅ ช่วงข้อมูลย้อนหลัง: พ.ย. 2568 + ธ.ค. 2568 + 1 ม.ค. 2569
  // 2568 = 2025, 2569 = 2026
  const SEED_START = new Date(2025, 10, 1, 0, 0, 0, 0); // 1 Nov 2025
  const SEED_END_EXCLUSIVE = new Date(2026, 0, 2, 0, 0, 0, 0); // ถึง 1 Jan 2026 (end exclusive = 2 Jan)

  const days = eachDay(SEED_START, SEED_END_EXCLUSIVE);

  const forecastCreates: ForecastPayload[] = [];
  for (const day of days) {
    for (const hour of SLOT_HOURS) {
      for (const region of REGIONS) {
        forecastCreates.push(buildForecast(region, day, hour));
      }
    }
  }
  console.log(`Total forecasts to create: ${forecastCreates.length}`);

  // 4) Insert forecasts (ไม่ใช้ transaction ยาว ๆ กัน timeout)
  const CONCURRENCY = 25;
  let createdForecast = 0;
  let createdNearby = 0;

  for (let i = 0; i < forecastCreates.length; i += CONCURRENCY) {
    const chunk = forecastCreates.slice(i, i + CONCURRENCY);

    const results = await Promise.all(
      chunk.map(async (f) => {
        const { _nearbyProvinceCodes, ...data } = f;

        // map code -> provinceId
        const provinceIds =
          (_nearbyProvinceCodes ?? [])
            .map((code) => provinceIdByCode.get(code))
            .filter((x): x is bigint => typeof x === "bigint");

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

            // ✅ nearby แบบใหม่: provinceId
            nearbyAreas:
              provinceIds.length > 0
                ? {
                  createMany: {
                    data: provinceIds.map((provinceId) => ({
                      provinceId,
                    })),
                    skipDuplicates: true,
                  },
                }
                : undefined,
          },
          select: { id: true },
        });

        return { created, nearbyCount: provinceIds.length };
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
