// src/app/api/daily/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { DayNight } from "@prisma/client";

export const runtime = "nodejs";

const SLOT_HOURS = [7, 13, 19] as const;
const DAY_START_HOUR = 6;
const NIGHT_START_HOUR = 18;

// ลำดับ field (จะหยิบเฉพาะอันที่ไม่ null และเอาแค่ 6)
const FIELD_ORDER = [
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
] as const;

type FieldKey = (typeof FIELD_ORDER)[number];

function getDayNightByHour(hour: number): DayNight {
  return hour >= DAY_START_HOUR && hour < NIGHT_START_HOUR ? "Day" : "Night";
}

function pickSlotForDate(now: Date) {
  const base = new Date(now);
  base.setHours(0, 0, 0, 0);

  const slots = SLOT_HOURS.map((h) => {
    const d = new Date(base);
    d.setHours(h, 0, 0, 0);
    return d;
  });

  const past = slots.filter((d) => d.getTime() <= now.getTime());
  return past.length ? past[past.length - 1] : slots[0];
}

function fmtTH(dt: Date) {
  return dt.toLocaleString("th-TH", {
    timeZone: "Asia/Bangkok",
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const dtParam = searchParams.get("dt") || "AUTO";

  // ---------- options ----------
  // เอา dateTime ที่มีอยู่จริงในตารางมาเป็น dropdown
  const optionRows = await prisma.weatherForecast.findMany({
    distinct: ["dateTime"],
    select: { dateTime: true },
    orderBy: { dateTime: "asc" },
  });

  const options = [
    { label: "อัตโนมัติ (ตามเวลาปัจจุบัน)", value: "AUTO" },
    ...optionRows.map((r) => ({
      label: fmtTH(r.dateTime),
      value: r.dateTime.toISOString(),
    })),
  ];

  // ---------- resolve dt + slot + type ----------
  const now = dtParam === "AUTO" ? new Date() : new Date(dtParam);
  const slot = pickSlotForDate(now);
  const type = getDayNightByHour(now.getHours());

  // ---------- query forecasts ----------
  const rows = await prisma.weatherForecast.findMany({
    where: { dateTime: slot, type },
    include: { nearbyAreas: true },
    orderBy: { region: "asc" },
  });

  // ---------- build slides DTO ----------
  const slides = rows.map((r) => {
    const items: { key: FieldKey; value: string }[] = [];

    const pushIf = (key: FieldKey, val: string | null | undefined) => {
      if (val == null) return;
      items.push({ key, value: val });
    };

    // map value per field
    pushIf("clearPct", r.clearPct != null ? `${r.clearPct}%` : null);
    pushIf("partlyCloudyPct", r.partlyCloudyPct != null ? `${r.partlyCloudyPct}%` : null);
    pushIf("cloudyPct", r.cloudyPct != null ? `${r.cloudyPct}%` : null);
    pushIf("rainPct", r.rainPct != null ? `${r.rainPct}%` : null);
    pushIf("thunderstormPct", r.thunderstormPct != null ? `${r.thunderstormPct}%` : null);
    pushIf("fogPct", r.fogPct != null ? `${r.fogPct}%` : null);

    pushIf("maxTempC", r.maxTempC != null ? `${r.maxTempC}°` : null);
    pushIf("minTempC", r.minTempC != null ? `${r.minTempC}°` : null);

    pushIf("windText", r.windText ?? null);
    pushIf("waveText", r.waveText ?? null);

    pushIf(
      "nearbyAreas",
      r.nearbyAreas?.length ? `${r.nearbyAreas.length} พื้นที่` : null
    );

    // เรียงตาม FIELD_ORDER และเอาไม่เกิน 6
    const ordered = FIELD_ORDER
      .map((k) => items.find((x) => x.key === k))
      .filter(Boolean)
      .slice(0, 6) as { key: FieldKey; value: string }[];

    return {
      id: String(r.id),
      label: r.region,
      region: r.region,
      mainTemp: r.tempC != null ? `${r.tempC}°` : "-",
      desc: r.detail ?? "-",
      items: ordered,
      meta: {
        slotISO: slot.toISOString(),
        type,
      },
    };
  });

  return NextResponse.json({
    options,
    resolved: {
      dtParam,
      slotISO: slot.toISOString(),
      type,
    },
    slides,
  });
}
