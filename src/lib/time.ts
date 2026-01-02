// src/lib/time.ts
export type DayNight = "Day" | "Night";

export function getDayNightByHour(dt: Date, dayStart = 6, nightStart = 21): DayNight {
  const h = dt.getHours();
  return h >= dayStart && h < nightStart ? "Day" : "Night";
}

/**
 * เลือกรอบข้อมูลของ "วันนี้" จาก slotHours เช่น [7,13,21]
 * - ถ้ามีรอบที่ผ่านแล้ว -> เอารอบล่าสุด
 * - ถ้ายังไม่ถึงรอบแรก -> เอารอบแรกของวัน
 */
export function pickDefaultSlotToday(slotHours: number[], now = new Date()) {
  const sorted = [...slotHours].sort((a, b) => a - b);

  const slots = sorted.map((h) => {
    const d = new Date(now);
    d.setHours(h, 0, 0, 0);
    return d;
  });

  const past = slots.filter((d) => d.getTime() <= now.getTime());
  return past.length ? past[past.length - 1] : slots[0];
}

export function toISO(dt: Date) {
  return dt.toISOString();
}

export function fromISO(iso: string) {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** format label ให้ dropdown (ไทยแบบง่าย) */
export function formatThaiDateTime(dt: Date) {
  return dt.toLocaleString("th-TH", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}
