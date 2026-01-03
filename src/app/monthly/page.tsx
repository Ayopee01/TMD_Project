"use client";

import { useEffect, useMemo, useState } from "react";
import SelectField from "@/components/SelectField";

type Option = { label: string; value: string };

type Card = {
  region: string;
  desc: string;
  avgRainPct: number | null;
  avgMinTempC: number | null;
  avgMaxTempC: number | null;
  count: number;
};

type MonthlyData = {
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

export default function MonthlyPage() {
  const [month, setMonth] = useState("AUTO");

  // ✅ รวม state เป็นก้อนเดียว (ลด/หาย warning cascading renders)
  const [data, setData] = useState<MonthlyData>({ options: [], cards: [] });

  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Card | null>(null);

  // โหลดจาก API ตามเดือนที่เลือก
  useEffect(() => {
    if (!month) return;

    const ac = new AbortController();

    (async () => {
      try {
        const res = await fetch(
          `/api/monthly?month=${encodeURIComponent(month)}`,
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
  const cards = data.cards;

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
        desc: `ค่าเฉลี่ยจากข้อมูลรายวันทั้งเดือน (อ้างอิงฟิลด์ rainPct)`,
        value: c.avgRainPct == null ? "-" : `${n1(c.avgRainPct)}%`,
      },
      {
        icon: <IconDown />,
        title: "อุณหภูมิต่ำสุดเฉลี่ย",
        desc: `ค่าเฉลี่ยจากฟิลด์ minTempC`,
        value: c.avgMinTempC == null ? "-" : `${n1(c.avgMinTempC)}°`,
      },
      {
        icon: <IconUp />,
        title: "อุณหภูมิสูงสุดเฉลี่ย",
        desc: `ค่าเฉลี่ยจากฟิลด์ maxTempC`,
        value: c.avgMaxTempC == null ? "-" : `${n1(c.avgMaxTempC)}°`,
      },
    ];
  }, [selected]);

  return (
    <div className="px-4 pt-5 pb-10">
      {/* Header */}
      <div className="text-2xl font-semibold text-gray-900">
        ลักษณะอากาศรายภาค
      </div>
      <div className="mt-1 text-xs text-gray-500">
        สรุปค่าเฉลี่ยรายเดือนจากข้อมูลรายวันในฐานข้อมูล
      </div>

      {/* Controls */}
      <div className="mt-4 max-w-[520px]">
        <SelectField
          value={month}
          onChange={setMonth}
          options={options}
          placeholder="เลือกเดือน/ปี"
        />
      </div>

      {/* ===== Desktop (3 cards/row, flex) ===== */}
      <div className="mt-6 hidden md:flex flex-wrap gap-6">
        {cards.map((c) => (
          <button
            key={c.region}
            type="button"
            onClick={() => onOpenCard(c)}
            className="
              group w-[calc(33.333%-16px)]
              rounded-3xl bg-white/70 p-5 text-left
              shadow-sm ring-1 ring-black/5
              transition hover:-translate-y-1 hover:bg-white hover:shadow-md
              active:translate-y-0
            "
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-gray-900">
                  {c.region}
                </div>
                <div className="mt-0.5 text-xs text-gray-500">{c.desc}</div>
              </div>

              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition group-hover:bg-indigo-50 group-hover:text-indigo-600">
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M6 18L18 6" />
                  <path d="M6 6l12 12" />
                </svg>
              </span>
            </div>

            <div className="mt-4 rounded-2xl bg-gray-100/80 p-4">
              <div className="space-y-3">
                <MetricRow
                  icon={<IconDroplet />}
                  label="ปริมาณฝนเฉลี่ย"
                  value={c.avgRainPct == null ? "-" : `${n1(c.avgRainPct)}%`}
                />
                <MetricRow
                  icon={<IconDown />}
                  label="อุณหภูมิต่ำสุดเฉลี่ย"
                  value={
                    c.avgMinTempC == null ? "-" : `${n1(c.avgMinTempC)}°`
                  }
                />
                <MetricRow
                  icon={<IconUp />}
                  label="อุณหภูมิสูงสุดเฉลี่ย"
                  value={
                    c.avgMaxTempC == null ? "-" : `${n1(c.avgMaxTempC)}°`
                  }
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
            key={c.region}
            type="button"
            onClick={() => onOpenCard(c)}
            className="
              w-full rounded-3xl bg-white/70 p-4 text-left
              shadow-sm ring-1 ring-black/5
              active:scale-[0.99]
            "
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-base font-semibold text-gray-900">
                  {c.region}
                </div>
                <div className="mt-0.5 text-xs text-gray-500">{c.desc}</div>
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
          </button>
        ))}
      </div>

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
          className={`absolute left-1/2 top-24 w-[92%] max-w-[720px] -translate-x-1/2 transition-all duration-200 ${open ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
            }`}
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
                  {selected?.desc ?? "-"} • จำนวนข้อมูลที่ใช้คำนวณ{" "}
                  {selected?.count ?? 0}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600 active:scale-[0.98]"
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

            <div className="mt-4 text-[11px] text-gray-500">
              หมายเหตุ: หากเดือนนั้นไม่มีข้อมูลใน DB ระบบจะแสดงเครื่องหมาย “-”
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
