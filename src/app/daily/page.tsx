"use client";

import { useState } from "react";
import SelectField from "@/components/SelectField";
import { DATE_TIME_OPTIONS, DAILY_SLIDES } from "@/lib/mock";

export default function DailyPage() {
  const [dt, setDt] = useState("");
  const [active, setActive] = useState(0);

  const slide = DAILY_SLIDES[active];

  return (
    <section className="h-screen w-full bg-gray-200 overflow-hidden">
      <div className="relative mx-auto flex h-full w-full max-w-2xl flex-col px-8 py-8">
        {/* TOP */}
        <div className="">
          <SelectField
            value={dt}
            onChange={setDt}
            options={DATE_TIME_OPTIONS}
            placeholder="Date/Time"
          />
        </div>

        {/* MIDDLE (ให้กินพื้นที่ที่เหลือ และจัดกลาง) */}
        <div className="flex flex-col items-center justify-center text-center pt-20">
          <div className="text-sm text-gray-500">{slide.region}</div>
          <div className="mt-1 text-7xl font-semibold tracking-tight text-gray-600">
            {slide.mainTemp}
          </div>
          <div className="mt-3 text-sm text-gray-500">{slide.desc}</div>
        </div>

        {/* BOTTOM (ติดล่างสุด และอยู่กลาง) */}
        <div className="absolute inset-x-0 bottom-30">
          <div className="mx-auto w-full max-w-2xl">
            <div className="flex justify-center gap-6">
              {slide.items.map(({ Icon, temp }, idx) => (
                <div key={idx} className="flex flex-col items-center gap-1 text-gray-600">
                  <Icon className="h-6 w-6" />
                  <div className="text-xs">{temp}</div>
                </div>
              ))}
            </div>

            {/* DOTS: ดึงจาก mock และคลิกเปลี่ยนข้อมูล */}
            <div className="mt-4 flex items-center justify-center gap-2">
              {DAILY_SLIDES.map((s, i) => (
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
