// src/lib/mock.ts
import type { ComponentType } from "react";
import {
  WeatherCloudRain,
  WeatherSun,
  WeatherWind,
  CloudIcon,
  PartlyCloudyIcon,
  ThunderIcon,
  FogIcon,
  TempMaxIcon,
  TempMinIcon,
  WaveIcon,
  NearbyIcon,
} from "@/components/Icons";

export type DayNight = "Day" | "Night";

/** ====== TABLE ROW (รูปแบบเดียวกับที่จะลง SQL/Prisma) ====== */
export type TempTableRow = {
  region: string;
  detail: string | null;

  temp_c: number | null;
  clear_pct: number | null;
  partly_cloudy_pct: number | null;
  cloudy_pct: number | null;
  rain_pct: number | null;
  thunderstorm_pct: number | null;
  fog_pct: number | null;

  max_temp_c: number | null;
  min_temp_c: number | null;

  wind_text: string | null;
  wave_text: string | null;

  nearby_areas: string[] | null;

  date_time_iso: string; // ISO
  type: DayNight;
};

/** ปรับรอบข้อมูลตรงนี้ได้ */
export const SLOT_HOURS = [7, 13, 21];

/** Regions */
export const REGIONS = [
  "ภาคเหนือ",
  "ภาคตะวันออกเฉียงเหนือ",
  "ภาคกลาง",
  "ภาคตะวันออก",
  "ภาคใต้(ฝั่งตะวันออก)",
  "ภาคใต้(ฝั่งตะวันตก)",
  "กรุงเทพและปริมณฑล",
] as const;

type Region = (typeof REGIONS)[number];

/** ====== Metrics (ชื่อฟิลด์ที่คุยไว้) ====== */
type MetricKey =
  | "clear"
  | "partly_cloudy"
  | "cloudy"
  | "rain"
  | "thunderstorm"
  | "fog"
  | "max_temp"
  | "min_temp"
  | "wind"
  | "wave"
  | "nearbyAreas";

/** Icon mapping ให้ตรงกับชื่อฟิลด์ */
const ICON_BY_METRIC: Record<MetricKey, ComponentType<{ className?: string }>> = {
  clear: WeatherSun,
  partly_cloudy: PartlyCloudyIcon,
  cloudy: CloudIcon,
  rain: WeatherCloudRain,
  thunderstorm: ThunderIcon,
  fog: FogIcon,
  max_temp: TempMaxIcon,
  min_temp: TempMinIcon,
  wind: WeatherWind,
  wave: WaveIcon,
  nearbyAreas: NearbyIcon,
};

/**
 * ✅ เงื่อนไข: "แต่ละภาคมี icon ไม่เกิน 6"
 * ✅ "สุ่มเป็นภาคๆ แต่ภาคนั้นวันอื่นต้องเหมือนเดิม"
 * -> เลยกำหนดชุดฟิลด์ให้แต่ละภาคคงที่ (เหมือนสุ่มแต่ fix ไว้)
 */
const REGION_METRICS: Record<Region, MetricKey[]> = {
  "ภาคเหนือ": ["clear", "rain", "fog", "max_temp", "min_temp", "wind"],
  "ภาคตะวันออกเฉียงเหนือ": ["partly_cloudy", "cloudy", "thunderstorm", "max_temp", "min_temp", "wind"],
  "ภาคกลาง": ["clear", "cloudy", "rain", "max_temp", "min_temp", "wind"],
  "ภาคตะวันออก": ["partly_cloudy", "rain", "thunderstorm", "wind", "wave", "max_temp"],
  "ภาคใต้(ฝั่งตะวันออก)": ["rain", "thunderstorm", "wind", "wave", "max_temp", "min_temp"],
  "ภาคใต้(ฝั่งตะวันตก)": ["cloudy", "rain", "fog", "wind", "wave", "nearbyAreas"],
  "กรุงเทพและปริมณฑล": ["clear", "partly_cloudy", "rain", "max_temp", "min_temp", "nearbyAreas"],
};

/** ====== Deterministic RNG (ให้ค่าคงที่ตามวัน/ภาค/เวลา) ====== */
function seedFromString(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
function makeRng(seed: number) {
  let x = seed >>> 0;
  return () => {
    // LCG
    x = (Math.imul(1664525, x) + 1013904223) >>> 0;
    return x / 4294967296;
  };
}
function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}
function pick<T>(rnd: () => number, arr: T[]) {
  return arr[Math.floor(rnd() * arr.length)];
}
function round1(n: number) {
  return Math.round(n * 10) / 10;
}

/** ====== Date helpers ====== */
function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}
function toISO(d: Date) {
  return d.toISOString();
}
function dateKey(d: Date) {
  // YYYY-MM-DD (local-ish key for seed)
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** ====== Generate 30 days ====== */
const DAYS_TO_GEN = 30;

/** ====== MOCK TABLE DATA (1 เดือน) ====== */
export const TEMP_TABLE_ROWS: TempTableRow[] = (() => {
  const base = startOfToday();
  const rows: TempTableRow[] = [];

  const regionBaseTemp: Record<Region, number> = {
    "ภาคเหนือ": 20,
    "ภาคตะวันออกเฉียงเหนือ": 26,
    "ภาคกลาง": 28,
    "ภาคตะวันออก": 27,
    "ภาคใต้(ฝั่งตะวันออก)": 29,
    "ภาคใต้(ฝั่งตะวันตก)": 28,
    "กรุงเทพและปริมณฑล": 30,
  };

  const nearbyPool: Record<Region, string[]> = {
    "ภาคเหนือ": ["ลำพูน", "ลำปาง", "เชียงราย"],
    "ภาคตะวันออกเฉียงเหนือ": ["ขอนแก่น", "อุดรธานี", "นครราชสีมา"],
    "ภาคกลาง": ["พระนครศรีอยุธยา", "นครปฐม", "สุพรรณบุรี"],
    "ภาคตะวันออก": ["ชลบุรี", "ระยอง", "จันทบุรี"],
    "ภาคใต้(ฝั่งตะวันออก)": ["สุราษฎร์ธานี", "นครศรีธรรมราช", "สงขลา"],
    "ภาคใต้(ฝั่งตะวันตก)": ["ภูเก็ต", "พังงา", "กระบี่"],
    "กรุงเทพและปริมณฑล": ["นนทบุรี", "ปทุมธานี", "สมุทรปราการ"],
  };

  for (let dayIndex = 0; dayIndex < DAYS_TO_GEN; dayIndex++) {
    const day = new Date(base);
    day.setDate(base.getDate() + dayIndex);

    for (const hour of SLOT_HOURS) {
      const slot = new Date(day);
      slot.setHours(hour, 0, 0, 0);
      const slotISO = toISO(slot);
      const dkey = dateKey(slot);

      for (const region of REGIONS) {
        const metrics = REGION_METRICS[region];

        // สร้าง 2 แถวต่อ slot: Day + Night (เพื่อให้ getDailySlides(slotISO,type) ใช้ได้)
        (["Day", "Night"] as DayNight[]).forEach((type) => {
          const seed = seedFromString(`${dkey}|${hour}|${region}|${type}`);
          const rnd = makeRng(seed);

          // อุณหภูมิหลัก (ปรับเล็กน้อยตาม day/night + noise)
          const baseT = regionBaseTemp[region];
          const diurnal = type === "Day" ? 1.5 : -1.0;
          const noise = (rnd() - 0.5) * 3; // -1.5..+1.5
          const temp = round1(baseT + diurnal + noise);

          // max/min แบบสัมพันธ์กัน
          const maxT = round1(temp + 2 + rnd() * 2);
          const minT = round1(temp - (2 + rnd() * 2));

          // ค่า percent weather
          const clear = clamp(Math.floor(rnd() * 60 + (type === "Day" ? 30 : 10)), 0, 100);
          const partly = clamp(Math.floor(rnd() * 50), 0, 100);
          const cloudy = clamp(Math.floor(rnd() * 70), 0, 100);
          const rain = clamp(Math.floor(rnd() * 80), 0, 100);
          const thunder = clamp(Math.floor(rnd() * 40), 0, 100);
          const fog = clamp(Math.floor(rnd() * 30 + (type === "Night" ? 10 : 0)), 0, 100);

          // wind/wave text
          const windSpd = Math.floor(5 + rnd() * 25); // 5-30
          const windDir = pick(rnd, ["N", "NE", "E", "SE", "S", "SW", "W", "NW"]);
          const windText = `${windSpd} km/h ${windDir}`;

          const waveH = round1(0.3 + rnd() * 2.2); // 0.3-2.5
          const waveText = `${waveH} m`;

          // nearby areas
          const nearCount = 1 + Math.floor(rnd() * 3); // 1-3
          const near = Array.from({ length: nearCount }, () => pick(rnd, nearbyPool[region]));

          // สร้าง detail จาก “ตัวเด่น” ใน metrics ที่ภาคนั้นมี
          let detail = "สภาพอากาศทั่วไป";
          if (metrics.includes("thunderstorm") && thunder >= 25) detail = "มีฝนฟ้าคะนองบางพื้นที่";
          else if (metrics.includes("rain") && rain >= 40) detail = "มีฝนเป็นบางแห่ง";
          else if (metrics.includes("fog") && fog >= 20) detail = "มีหมอกในตอนเช้า/กลางคืน";
          else if (metrics.includes("cloudy") && cloudy >= 50) detail = "เมฆมากเป็นส่วนใหญ่";
          else if (metrics.includes("clear") && clear >= 50) detail = "ท้องฟ้าแจ่มใส";

          // init row
          const row: TempTableRow = {
            region,
            detail,

            temp_c: temp,

            clear_pct: null,
            partly_cloudy_pct: null,
            cloudy_pct: null,
            rain_pct: null,
            thunderstorm_pct: null,
            fog_pct: null,

            max_temp_c: null,
            min_temp_c: null,

            wind_text: null,
            wave_text: null,

            nearby_areas: null,

            date_time_iso: slotISO,
            type,
          };

          // เติมค่าเฉพาะ metrics ที่ภาคนั้น “เลือกไว้” (<= 6) ส่วนที่เหลือปล่อย null
          for (const m of metrics) {
            if (m === "clear") row.clear_pct = clear;
            if (m === "partly_cloudy") row.partly_cloudy_pct = partly;
            if (m === "cloudy") row.cloudy_pct = cloudy;
            if (m === "rain") row.rain_pct = rain;
            if (m === "thunderstorm") row.thunderstorm_pct = thunder;
            if (m === "fog") row.fog_pct = fog;
            if (m === "max_temp") row.max_temp_c = maxT;
            if (m === "min_temp") row.min_temp_c = minT;
            if (m === "wind") row.wind_text = windText;
            if (m === "wave") row.wave_text = waveText;
            if (m === "nearbyAreas") row.nearby_areas = near;
          }

          rows.push(row);
        });
      }
    }
  }

  return rows;
})();

/** ====== dropdown options (1 เดือน * 3 เวลา) ====== */
export const DATE_TIME_OPTIONS = (() => {
  const base = startOfToday();

  const opts: { label: string; value: string }[] = [];

  for (let dayIndex = 0; dayIndex < DAYS_TO_GEN; dayIndex++) {
    const day = new Date(base);
    day.setDate(base.getDate() + dayIndex);

    for (const hour of SLOT_HOURS) {
      const d = new Date(day);
      d.setHours(hour, 0, 0, 0);

      opts.push({
        label: d.toLocaleString("th-TH", {
          year: "numeric",
          month: "short",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        }),
        value: d.toISOString(),
      });
    }
  }

  return opts;
})();

/** ====== DAILY SLIDES (รูปเดิมที่หน้า Daily ใช้อยู่) ====== */
export type DailyItem = {
  Icon: ComponentType<{ className?: string }>;
  temp: string;
};

export type DailySlide = {
  id: string;
  label: string;
  region: string;
  mainTemp: string;
  desc: string;
  items: DailyItem[];
};

/** ====== Logic: Day/Night จาก dt ====== */
export function getDayNightByHour(dt: Date, dayStart = 6, nightStart = 21): DayNight {
  const h = dt.getHours();
  return h >= dayStart && h < nightStart ? "Day" : "Night";
}

/** เลือกรอบข้อมูลล่าสุดของวันนี้จาก SLOT_HOURS */
export function pickDefaultSlotToday(now = new Date()) {
  const base = new Date(now);
  base.setHours(0, 0, 0, 0);

  const slots = SLOT_HOURS
    .slice()
    .sort((a, b) => a - b)
    .map((h) => {
      const d = new Date(base);
      d.setHours(h, 0, 0, 0);
      return d;
    });

  const past = slots.filter((d) => d.getTime() <= now.getTime());
  return (past.length ? past[past.length - 1] : slots[0]).toISOString();
}

/** แปลงค่าจาก row ให้เป็น string ตาม metric */
function metricValue(r: TempTableRow, k: MetricKey): string | null {
  switch (k) {
    case "clear":
      return r.clear_pct != null ? `${r.clear_pct}%` : null;
    case "partly_cloudy":
      return r.partly_cloudy_pct != null ? `${r.partly_cloudy_pct}%` : null;
    case "cloudy":
      return r.cloudy_pct != null ? `${r.cloudy_pct}%` : null;
    case "rain":
      return r.rain_pct != null ? `${r.rain_pct}%` : null;
    case "thunderstorm":
      return r.thunderstorm_pct != null ? `${r.thunderstorm_pct}%` : null;
    case "fog":
      return r.fog_pct != null ? `${r.fog_pct}%` : null;
    case "max_temp":
      return r.max_temp_c != null ? `${r.max_temp_c}°` : null;
    case "min_temp":
      return r.min_temp_c != null ? `${r.min_temp_c}°` : null;
    case "wind":
      return r.wind_text ?? null;
    case "wave":
      return r.wave_text ?? null;
    case "nearbyAreas":
      return r.nearby_areas?.length ? r.nearby_areas.join(", ") : null;
    default:
      return null;
  }
}

/**
 * ✅ คืน items “ไม่เกิน 6” ตามชุดของ region
 * และ “ภาคนั้นวันอื่นต้องเหมือนเดิม” -> เพราะ REGION_METRICS fix ไว้แล้ว
 */
function buildItemsFromRow(r: TempTableRow): DailyItem[] {
  const region = r.region as Region;
  const metrics = REGION_METRICS[region] ?? [];

  return metrics
    .map((k) => {
      const val = metricValue(r, k);
      if (!val) return null; // ไม่มีค่าก็ไม่โชว์
      return { Icon: ICON_BY_METRIC[k], temp: val };
    })
    .filter(Boolean) as DailyItem[];
}

/** คืน slides ตาม slot(ISO) + type(Day/Night) */
export function getDailySlides(slotISO: string, type: DayNight): DailySlide[] {
  const rows = TEMP_TABLE_ROWS.filter((r) => r.date_time_iso === slotISO && r.type === type);

  return rows.map((r, idx) => ({
    id: `${type}-${slotISO}-${idx}`,
    label: r.region,
    region: r.region,
    mainTemp: r.temp_c != null ? `${r.temp_c}°` : "-",
    desc: r.detail ?? "-",
    items: buildItemsFromRow(r),
  }));
}

/** ====== compatibility exports (กันหน้าอื่นพัง) ====== */

// ใช้กับหน้า bulletin
export const BULLETINS = [
  { date: "12 ธันวาคม 2568", title: "หมายเหตุ:จดหมายวิชาการเกษตร", sub: "หน่วยงาน:กองพัฒนาอุตุนิยมวิทยา" },
  { date: "13 ธันวาคม 2568", title: "หมายเหตุ:จดหมายวิชาการเกษตร", sub: "หน่วยงาน:กองพัฒนาอุตุนิยมวิทยา" },
  { date: "14 ธันวาคม 2568", title: "หมายเหตุ:จดหมายวิชาการเกษตร", sub: "หน่วยงาน:กองพัฒนาอุตุนิยมวิทยา" },
  { date: "15 ธันวาคม 2568", title: "หมายเหตุ:จดหมายวิชาการเกษตร", sub: "หน่วยงาน:กองพัฒนาอุตุนิยมวิชาการเกษตร" },
];

// ใช้กับ dropdown ในหน้า bulletin/map (ถ้าหน้าคุณยังเรียกชื่อนี้อยู่)
export const CATEGORY_OPTIONS = [...REGIONS];

// ใช้กับหน้า regional (เดิม)
export const REGIONAL_ITEMS = [
  { region: "ภาคกลาง", desc: "Description. Lorem ipsum dolor sit amet.", maxRain: 35.2, minTemp: 12.0, maxTemp: 22.0 },
  { region: "ภาคเหนือ", desc: "Description. Lorem ipsum dolor sit amet.", maxRain: 20.1, minTemp: 14.0, maxTemp: 28.0 },
  { region: "ภาคอีสาน", desc: "Description. Lorem ipsum dolor sit amet.", maxRain: 12.5, minTemp: 16.0, maxTemp: 30.0 },
];
