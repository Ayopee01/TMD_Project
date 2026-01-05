// src/app/api/week/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";

type Option = { label: string; value: string }; // value = YYYY-MM

type Card = {
  region: string;
  week: 1 | 2 | 3 | 4;
  weekLabel: string;
  startISO: string;
  endISO: string;
  desc: string;
  avgRainPct: number | null;
  avgMinTempC: number | null;
  avgMaxTempC: number | null;
  count: number;
};

function monthLabelTH(ym: string) {
  const [yStr, mStr] = ym.split("-");
  const y = Number(yStr);
  const m = Number(mStr);
  const d = new Date(Date.UTC(y, m - 1, 1));
  return d.toLocaleString("th-TH", { year: "numeric", month: "long" });
}

function parseMonthToRange(ym: string) {
  const [yStr, mStr] = ym.split("-");
  const y = Number(yStr);
  const m = Number(mStr);
  const start = new Date(y, m - 1, 1, 0, 0, 0, 0);
  const end = new Date(y, m, 1, 0, 0, 0, 0);
  return { start, end };
}

function weekRangeInMonth(resolvedMonth: string, week: 1 | 2 | 3 | 4) {
  const [yStr, mStr] = resolvedMonth.split("-");
  const y = Number(yStr);
  const m = Number(mStr);

  const lastDay = new Date(y, m, 0).getDate(); // วันสุดท้ายของเดือน
  const ranges: Record<1 | 2 | 3 | 4, { startDay: number; endDay: number }> = {
    1: { startDay: 1, endDay: 7 },
    2: { startDay: 8, endDay: 14 },
    3: { startDay: 15, endDay: 21 },
    4: { startDay: 22, endDay: lastDay },
  };

  const { startDay, endDay } = ranges[week];

  // start inclusive, end exclusive => end = endDay+1 (แต่ระวังเลยเดือน)
  const start = new Date(y, m - 1, startDay, 0, 0, 0, 0);
  const end = new Date(y, m - 1, endDay + 1, 0, 0, 0, 0);

  return {
    startISO: start.toISOString(),
    endISO: end.toISOString(),
    weekLabel: `สัปดาห์ที่ ${week} (${startDay}-${endDay})`,
  };
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const monthParam = searchParams.get("month") || "AUTO"; // "YYYY-MM" | "AUTO"

  // 1) หาเดือนที่มีอยู่จริงใน DB (เรียงล่าสุดก่อน)
  const monthRows =
    (await prisma.$queryRaw<{ ym: string }[]>`
      SELECT to_char("dateTime", 'YYYY-MM') as ym
      FROM "WeatherForecast"
      GROUP BY ym
      ORDER BY ym DESC
    `) ?? [];

  const months = monthRows.map((r) => r.ym).filter(Boolean);

  const options: Option[] = [
    { label: "อัตโนมัติ (เดือนล่าสุด)", value: "AUTO" },
    ...months.map((ym) => ({ label: monthLabelTH(ym), value: ym })),
  ];

  // 2) resolve month ที่จะใช้จริง
  const resolvedMonth =
    monthParam === "AUTO"
      ? months[0] ?? null
      : months.includes(monthParam)
        ? monthParam
        : months[0] ?? null;

  if (!resolvedMonth) {
    return NextResponse.json({
      options,
      resolved: { monthParam, month: null },
      cards: [] as Card[],
    });
  }

  const { start, end } = parseMonthToRange(resolvedMonth);

  /**
   * 3) Group ตาม region + week (แบ่ง week จาก day-of-month)
   * week = 1 (1-7), 2 (8-14), 3 (15-21), 4 (22-สิ้นเดือน)
   */
  const rows =
    (await prisma.$queryRaw<
      {
        region: string;
        week: number;
        avg_rain: number | null;
        avg_min: number | null;
        avg_max: number | null;
        count: number;
      }[]
    >`
    SELECT
      "region" as region,
      CASE
        WHEN EXTRACT(DAY FROM "dateTime") BETWEEN 1 AND 7 THEN 1
        WHEN EXTRACT(DAY FROM "dateTime") BETWEEN 8 AND 14 THEN 2
        WHEN EXTRACT(DAY FROM "dateTime") BETWEEN 15 AND 21 THEN 3
        ELSE 4
      END as week,
      AVG("rainPct") as avg_rain,
      AVG("minTempC") as avg_min,
      AVG("maxTempC") as avg_max,
      COUNT(*)::int as count
    FROM "WeatherForecast"
    WHERE "dateTime" >= ${start} AND "dateTime" < ${end}
    GROUP BY "region", week
    ORDER BY "region" ASC, week ASC
  `) ?? [];

  const cards: Card[] = rows.map((r) => {
    const week = (Number(r.week) as 1 | 2 | 3 | 4) || 1;
    const info = weekRangeInMonth(resolvedMonth, week);

    return {
      region: r.region,
      week,
      weekLabel: info.weekLabel,
      startISO: info.startISO,
      endISO: info.endISO,
      desc: `สรุปค่าเฉลี่ยรายสัปดาห์จากข้อมูลรายวัน (${info.weekLabel})`,
      avgRainPct: r.avg_rain ?? null,
      avgMinTempC: r.avg_min ?? null,
      avgMaxTempC: r.avg_max ?? null,
      count: r.count ?? 0,
    };
  });

  return NextResponse.json({
    options,
    resolved: {
      monthParam,
      month: resolvedMonth,
      startISO: start.toISOString(),
      endISO: end.toISOString(),
    },
    cards,
  });
}
