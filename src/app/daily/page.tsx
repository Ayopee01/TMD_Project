"use client";

import { useEffect, useMemo, useState } from "react";
import SelectField from "@/components/SelectField";
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

type Option = { label: string; value: string };

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

type SlideItem = { key: FieldKey; value: string };

type Slide = {
  id: string;
  label: string;
  region: string;
  mainTemp: string;
  desc: string;
  items: SlideItem[];
};

const ICON_BY_FIELD: Record<FieldKey, ComponentType<{ className?: string }>> = {
  clearPct: WeatherSun,
  partlyCloudyPct: PartlyCloudyIcon,
  cloudyPct: CloudIcon,
  rainPct: WeatherCloudRain,
  thunderstormPct: ThunderIcon,
  fogPct: FogIcon,
  maxTempC: TempMaxIcon,
  minTempC: TempMinIcon,
  windText: WeatherWind,
  waveText: WaveIcon,
  nearbyAreas: NearbyIcon,
};

export default function DailyPage() {
  const [dt, setDt] = useState("AUTO");
  const [active, setActive] = useState(0);

  const [options, setOptions] = useState<Option[]>([]);
  const [slides, setSlides] = useState<Slide[]>([]);

  const slide = slides[active];

  // โหลด options ครั้งเดียว
  useEffect(() => {
    (async () => {
      const res = await fetch("/api/daily", { cache: "no-store" });
      const data = await res.json();
      setOptions(data.options ?? []);
      setSlides(data.slides ?? []);
      setActive(0);
      // ให้ dt เป็น AUTO ตั้งแต่เริ่ม (ถ้าต้องการ)
      setDt("AUTO");
    })();
  }, []);

  // โหลด slides เมื่อเปลี่ยน dt
  useEffect(() => {
    if (!dt) return;

    (async () => {
      const res = await fetch(`/api/daily?dt=${encodeURIComponent(dt)}`, {
        cache: "no-store",
      });
      const data = await res.json();
      setSlides(data.slides ?? []);
      setActive(0);
    })();
  }, [dt]);

  return (
    <section className="h-screen w-full bg-gray-200 overflow-hidden">
      <div className="relative mx-auto flex h-full w-full max-w-2xl flex-col px-8 py-8">
        {/* TOP */}
        <div className="">
          <SelectField
            value={dt}
            onChange={setDt}
            options={options}
            placeholder="Date/Time"
          />
        </div>

        {/* MIDDLE */}
        <div className="flex flex-col items-center justify-center text-center pt-20">
          <div className="text-sm text-gray-500">{slide?.region ?? "-"}</div>
          <div className="mt-1 text-7xl font-semibold tracking-tight text-gray-600">
            {slide?.mainTemp ?? "-"}
          </div>
          <div className="mt-3 text-sm text-gray-500">{slide?.desc ?? "-"}</div>
        </div>

        {/* BOTTOM */}
        <div className="absolute inset-x-0 bottom-30">
          <div className="mx-auto w-full max-w-2xl">
            <div className="flex justify-center gap-6">
              {(slide?.items ?? []).map((it, idx) => {
                const Icon = ICON_BY_FIELD[it.key];
                return (
                  <div key={idx} className="flex flex-col items-center gap-1 text-gray-600">
                    <Icon className="h-6 w-6" />
                    <div className="text-xs">{it.value}</div>
                  </div>
                );
              })}
            </div>

            {/* DOTS */}
            <div className="mt-4 flex items-center justify-center gap-2">
              {slides.map((s, i) => (
                <button
                  key={s.id ?? i}
                  type="button"
                  aria-label={s.label ?? `dot-${i + 1}`}
                  onClick={() => setActive(i)}
                  className={`h-2 w-2 rounded-full cursor-pointer ${
                    i === active ? "bg-gray-700" : "bg-gray-400/50"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
