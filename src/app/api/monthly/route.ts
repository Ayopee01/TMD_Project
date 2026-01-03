// src/app/api/monthly/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";

type Option = { label: string; value: string }; // value = YYYY-MM
type Card = {
  region: string;
  desc: string;
  avgRainPct: number | null;
  avgMinTempC: number | null;
  avgMaxTempC: number | null;
  count: number;
};

function monthLabelTH(ym: string) {
  // ym = "2025-11"
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

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const monthParam = searchParams.get("month") || "AUTO"; // "YYYY-MM" | "AUTO"

  // 1) หาเดือนที่มีอยู่จริงใน DB (เรียงล่าสุดก่อน)
  // ใช้ raw เพราะต้อง distinct ตาม YYYY-MM
  const monthRows = (await prisma.$queryRaw<
    { ym: string }[]
  >`
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
      ? (months[0] ?? null)
      : months.includes(monthParam)
        ? monthParam
        : (months[0] ?? null);

  // ถ้าไม่มีข้อมูลเลย -> ส่งกลับแบบว่าง (Front จะแสดง - เอง)
  if (!resolvedMonth) {
    return NextResponse.json({
      options,
      resolved: { monthParam, month: null },
      cards: [] as Card[],
    });
  }

  const { start, end } = parseMonthToRange(resolvedMonth);

  // 3) groupBy ต่อ region เพื่อคำนวณค่าเฉลี่ย
  const grouped = await prisma.weatherForecast.groupBy({
    by: ["region"],
    where: {
      dateTime: { gte: start, lt: end },
    },
    _avg: {
      rainPct: true,
      minTempC: true,
      maxTempC: true,
    },
    _count: { _all: true },
    orderBy: { region: "asc" },
  });

  const cards: Card[] = grouped.map((g) => ({
    region: g.region,
    desc: `สรุปค่าเฉลี่ยรายเดือนจากข้อมูลรายวัน`,
    avgRainPct: g._avg.rainPct ?? null,
    avgMinTempC: g._avg.minTempC ? Number(g._avg.minTempC) : null,
    avgMaxTempC: g._avg.maxTempC ? Number(g._avg.maxTempC) : null,
    count: g._count._all,
  }));

  return NextResponse.json({
    options,
    resolved: { monthParam, month: resolvedMonth, startISO: start.toISOString(), endISO: end.toISOString() },
    cards,
  });
}
