// src/app/week/page.ts
"use client";

import { useEffect, useMemo, useState } from "react";
import SelectField from "@/components/SelectField";

type Option = { label: string; value: string };

type Card = {
  region: string;

  // ✅ week data from API (/api/week)
  week: 1 | 2 | 3 | 4;
  weekLabel: string; // e.g. "สัปดาห์ที่ 1 (1-7)"
  startISO: string;
  endISO: string;

  desc: string;
  avgRainPct: number | null;
  avgMinTempC: number | null;
  avgMaxTempC: number | null;
  count: number;
};

type WeeklyData = {
  options: Option[];
  cards: Card[];
};

function n1(v: number | null | undefined) {
  if (v == null) return "-";
  return (Math.round(v * 10) / 10).toFixed(1);
}

function MetricRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-white/70">
          {icon}
        </span>
        <div className="text-sm text-gray-800">{label}</div>
      </div>
      <div className="text-sm font-medium text-gray-700">{value}</div>
    </div>
  );
}

function IconDroplet() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5 text-gray-700"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M12 2s6 7 6 12a6 6 0 0 1-12 0c0-5 6-12 6-12z" />
    </svg>
  );
}
function IconDown() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5 text-gray-700"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M12 5v14" />
      <path d="M19 12l-7 7-7-7" />
    </svg>
  );
}
function IconUp() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5 text-gray-700"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M12 19V5" />
      <path d="M5 12l7-7 7 7" />
    </svg>
  );
}

const weekOptions: Option[] = [
  { label: "สัปดาห์ที่ 1 (1-7)", value: "1" },
  { label: "สัปดาห์ที่ 2 (8-14)", value: "2" },
  { label: "สัปดาห์ที่ 3 (15-21)", value: "3" },
  { label: "สัปดาห์ที่ 4 (22-สิ้นเดือน)", value: "4" },
];

export default function WeekPage() {
  const [month, setMonth] = useState("AUTO");
  const onChangeMonth = (v: string) => {
    setMonth(v);
    setWeek("1");        // reset week
    setOpen(false);      // ปิด popup
    setSelected(null);   // เคลียร์ selected
  };

  const onChangeWeek = (v: string) => {
    setWeek(v as "1" | "2" | "3" | "4");
    setOpen(false);
    setSelected(null);
  };

  // ✅ เพิ่ม dropdown เลือก Week 1–4
  const [week, setWeek] = useState<"1" | "2" | "3" | "4">("1");

  // ✅ รวม state เป็นก้อนเดียว
  const [data, setData] = useState<WeeklyData>({ options: [], cards: [] });

  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Card | null>(null);

  // โหลดจาก API ตามเดือนที่เลือก
  useEffect(() => {
    if (!month) return;

    const ac = new AbortController();

    (async () => {
      try {
        const res = await fetch(
          `/api/week?month=${encodeURIComponent(month)}`,
          { cache: "no-store", signal: ac.signal }
        );

        const json = await res.json();

        setData({
          options: json.options ?? [],
          cards: json.cards ?? [],
        });
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        if (err instanceof Error && err.name === "AbortError") return;
        console.error(err);
      }
    })();

    return () => ac.abort();
  }, [month]);

  const options = data.options;

  // ✅ Filter cards ตาม week ที่เลือก
  const cards = useMemo(() => {
    const w = Number(week) as 1 | 2 | 3 | 4;
    return (data.cards ?? []).filter((c) => c.week === w);
  }, [data.cards, week]);

  const currentWeekLabel = useMemo(() => {
    // ถ้ามีข้อมูล ใช้ label จากข้อมูลจริง
    if (cards[0]?.weekLabel) return cards[0].weekLabel;
    // ถ้าไม่มีข้อมูล ใช้จาก dropdown
    return weekOptions.find((o) => o.value === week)?.label ?? `สัปดาห์ที่ ${week}`;
  }, [cards, week]);

  const onOpenCard = (c: Card) => {
    setSelected(c);
    setOpen(true);
  };

  const popupMetrics = useMemo(() => {
    const c = selected;
    if (!c) return null;

    return [
      {
        icon: <IconDroplet />,
        title: "ปริมาณฝนเฉลี่ย",
        desc: `ค่าเฉลี่ยจากข้อมูลรายวัน (${c.weekLabel})`,
        value: c.avgRainPct == null ? "-" : `${n1(c.avgRainPct)}%`,
      },
      {
        icon: <IconDown />,
        title: "อุณหภูมิต่ำสุดเฉลี่ย",
        desc: `ค่าเฉลี่ยจากฟิลด์ minTempC (${c.weekLabel})`,
        value: c.avgMinTempC == null ? "-" : `${n1(c.avgMinTempC)}°`,
      },
      {
        icon: <IconUp />,
        title: "อุณหภูมิสูงสุดเฉลี่ย",
        desc: `ค่าเฉลี่ยจากฟิลด์ maxTempC (${c.weekLabel})`,
        value: c.avgMaxTempC == null ? "-" : `${n1(c.avgMaxTempC)}°`,
      },
    ];
  }, [selected]);

  return (
    <div className="min-h-screen px-4 pt-5 pb-16">
      {/* Header */}
      <div className="rounded-2xl bg-gray-200 px-4 py-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-xl font-semibold text-gray-900">
              สรุปลักษณะอากาศรายสัปดาห์ (4 สัปดาห์/เดือน)
            </div>
            <div className="mt-1 text-xs text-gray-600">
              เลือกเดือน และเลือกสัปดาห์เพื่อดูข้อมูลเฉพาะช่วงนั้น
            </div>
          </div>
        </div>

        {/* ✅ Dropdown เดือน + Week */}
        <div className="mt-3 grid max-w-[720px] gap-3 sm:grid-cols-2">
          <SelectField
            value={month}
            onChange={onChangeMonth}
            options={options}
            placeholder="เลือกเดือน"
          />

          <SelectField
            value={week}
            onChange={onChangeWeek}
            options={weekOptions}
            placeholder="เลือกสัปดาห์"
          />
        </div>
      </div>

      {/* Status row */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm text-gray-700">
          กำลังแสดงผล:{" "}
          <span className="font-semibold text-gray-900">{currentWeekLabel}</span>
        </div>

        {/* ถ้าต้องการปุ่มขวาเหมือนตัวอย่าง */}
        <button
          type="button"
          className="hidden sm:inline-flex items-center gap-2 rounded-full bg-gray-300/80 px-4 py-2 text-sm text-gray-700 hover:bg-gray-300"
        >
          ดาวน์โหลดเอกสาร
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gray-200">
            ⬇️
          </span>
        </button>
      </div>

      {/* Empty state */}
      {cards.length === 0 ? (
        <div className="mt-6 rounded-3xl bg-white/70 p-6 ring-1 ring-black/5">
          <div className="text-base font-semibold text-gray-900">
            ไม่มีข้อมูลสำหรับ {currentWeekLabel}
          </div>
          <div className="mt-1 text-sm text-gray-600">
            ลองเปลี่ยนเดือน หรือเลือกสัปดาห์อื่น
          </div>
        </div>
      ) : (
        <>
          {/* ===== Desktop (3 cards/row, grid) ===== */}
          <div className="mt-6 hidden md:grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {cards.map((c) => (
              <button
                key={`${c.region}-${c.week}`}
                type="button"
                onClick={() => onOpenCard(c)}
                className="
                  group w-full
                  rounded-3xl bg-white/70 p-5 text-left
                  shadow-sm ring-1 ring-black/5
                  transition hover:-translate-y-1 hover:bg-white hover:shadow-md
                  active:translate-y-0 cursor-pointer
                  min-h-[250px]
                  flex flex-col
                "
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-gray-900">
                      {c.region}
                    </div>
                    <div className="mt-0.5 text-xs text-gray-500">
                      {c.desc}
                    </div>
                  </div>

                  <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-[11px] text-gray-700">
                    {c.weekLabel}
                  </span>
                </div>

                <div className="mt-4 rounded-2xl bg-gray-100/80 p-4 flex-1">
                  <div className="space-y-3">
                    <MetricRow
                      icon={<IconDroplet />}
                      label="ปริมาณฝนเฉลี่ย"
                      value={c.avgRainPct == null ? "-" : `${n1(c.avgRainPct)}%`}
                    />
                    <MetricRow
                      icon={<IconDown />}
                      label="อุณหภูมิต่ำสุดเฉลี่ย"
                      value={c.avgMinTempC == null ? "-" : `${n1(c.avgMinTempC)}°`}
                    />
                    <MetricRow
                      icon={<IconUp />}
                      label="อุณหภูมิสูงสุดเฉลี่ย"
                      value={c.avgMaxTempC == null ? "-" : `${n1(c.avgMaxTempC)}°`}
                    />
                  </div>
                </div>

                <div className="mt-3 text-[11px] text-gray-500">
                  จำนวนข้อมูลที่ใช้คำนวณ:{" "}
                  <span className="font-medium text-gray-700">{c.count}</span>
                </div>
              </button>
            ))}
          </div>

          {/* ===== Mobile (alternate layout) ===== */}
          <div className="mt-6 space-y-4 md:hidden">
            {cards.map((c) => (
              <button
                key={`${c.region}-${c.week}`}
                type="button"
                onClick={() => onOpenCard(c)}
                className="
                  w-full rounded-3xl bg-white/70 p-4 text-left
                  shadow-sm ring-1 ring-black/5
                  active:scale-[0.99] cursor-pointer
                "
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-base font-semibold text-gray-900">
                      {c.region}
                    </div>
                    <div className="mt-0.5 text-xs text-gray-500">{c.desc}</div>

                    <div className="mt-2 inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-[11px] text-gray-700">
                      {c.weekLabel}
                    </div>
                  </div>

                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-600">
                    <svg
                      viewBox="0 0 24 24"
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                  </span>
                </div>

                <div className="mt-3 flex items-center justify-between rounded-2xl bg-gray-100/80 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <IconDroplet />
                    <div className="text-xs text-gray-700">ฝนเฉลี่ย</div>
                  </div>
                  <div className="text-sm font-semibold text-gray-800">
                    {c.avgRainPct == null ? "-" : `${n1(c.avgRainPct)}%`}
                  </div>
                </div>

                <div className="mt-2 flex gap-3">
                  <div className="flex-1 rounded-2xl bg-gray-100/80 px-4 py-3">
                    <div className="flex items-center gap-2">
                      <IconDown />
                      <div className="text-xs text-gray-700">ต่ำสุดเฉลี่ย</div>
                    </div>
                    <div className="mt-1 text-sm font-semibold text-gray-800">
                      {c.avgMinTempC == null ? "-" : `${n1(c.avgMinTempC)}°`}
                    </div>
                  </div>

                  <div className="flex-1 rounded-2xl bg-gray-100/80 px-4 py-3">
                    <div className="flex items-center gap-2">
                      <IconUp />
                      <div className="text-xs text-gray-700">สูงสุดเฉลี่ย</div>
                    </div>
                    <div className="mt-1 text-sm font-semibold text-gray-800">
                      {c.avgMaxTempC == null ? "-" : `${n1(c.avgMaxTempC)}°`}
                    </div>
                  </div>
                </div>

                <div className="mt-2 text-[11px] text-gray-500">
                  จำนวนข้อมูลที่ใช้คำนวณ:{" "}
                  <span className="font-medium text-gray-700">{c.count}</span>
                </div>
              </button>
            ))}
          </div>
        </>
      )}

      {/* ===== Popup ===== */}
      <div
        className={`fixed inset-0 z-50 transition ${open ? "pointer-events-auto" : "pointer-events-none"
          }`}
        aria-hidden={!open}
      >
        {/* overlay */}
        <div
          className={`absolute inset-0 bg-black/30 backdrop-blur-[2px] transition-opacity duration-200 ${open ? "opacity-100" : "opacity-0"
            }`}
          onClick={() => setOpen(false)}
        />

        {/* panel */}
        <div
          className={`absolute left-1/2 top-1/2 w-[92%] max-w-[720px]
          -translate-x-1/2 -translate-y-1/2
          transition-all duration-200
          ${open ? "opacity-100 scale-100" : "opacity-0 scale-[0.98]"}
          `}
          role="dialog"
          aria-modal="true"
        >
          <div className="rounded-[28px] bg-white p-5 shadow-xl ring-1 ring-black/10">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-base font-semibold text-gray-900">
                  {selected?.region ?? "-"}
                </div>
                <div className="mt-1 text-xs text-gray-500">
                  {selected?.weekLabel ?? "-"} • จำนวนข้อมูลที่ใช้คำนวณ{" "}
                  {selected?.count ?? 0}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600 active:scale-[0.98] cursor-pointer"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {popupMetrics?.map((m) => (
                <div key={m.title} className="rounded-2xl bg-indigo-50/60 p-4">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white">
                      {m.icon}
                    </span>
                    <div className="text-sm font-semibold text-gray-900">
                      {m.title}
                    </div>
                  </div>
                  <div className="mt-2 text-xs leading-relaxed text-gray-600">
                    {m.desc}
                  </div>
                  <div className="mt-3 text-lg font-semibold text-gray-900">
                    {m.value}
                  </div>
                </div>
              ))}
            </div>

            {/* range */}
            <div className="mt-4 text-xs text-gray-500">
              ช่วงข้อมูล:{" "}
              <span className="font-medium text-gray-700">
                {selected?.startISO ?? "-"} ถึง {selected?.endISO ?? "-"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
