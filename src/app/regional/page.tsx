"use client";

import { useState } from "react";
import SelectField from "@/components/SelectField";
import { DATE_TIME_OPTIONS, REGIONAL_ITEMS } from "@/lib/mock";
import { Droplet, ArrowDown, ArrowUp } from "@/components/Icons";

export default function RegionalPage() {
  const [dt, setDt] = useState("");

  return (
    <div className="bg-gray-200 px-4 pt-5 pb-10">
      <div className="text-xl font-semibold text-gray-800">ลักษณะอากาศรายภาค</div>
      <div className="mt-1 text-xs text-gray-500">
        Description. Lorem ipsum dolor sit amet consectetur adipisicing elit, sed do
      </div>

      <div className="mt-4">
        <SelectField
          value={dt}
          onChange={setDt}
          options={DATE_TIME_OPTIONS}
          placeholder="Date/Time"
        />
      </div>

      <div className="mt-5 space-y-6">
        {REGIONAL_ITEMS.map((it, idx) => (
          <section key={idx}>
            <div className="text-sm font-semibold text-gray-800">{it.region}</div>
            <div className="text-xs text-gray-500">{it.desc}</div>

            <div className="mt-3 rounded-2xl bg-white px-4 py-4 shadow-sm">
              <div className="flex items-center justify-between text-sm text-gray-700">
                <div className="flex items-center gap-2">
                  <Droplet className="h-4 w-4 text-gray-500" />
                  <span>ปริมาณฝนสูงสุด</span>
                </div>
                <span className="text-gray-500">{it.maxRain.toFixed(1)} มม</span>
              </div>

              <div className="mt-3 flex items-center justify-between text-sm text-gray-700">
                <div className="flex items-center gap-2">
                  <ArrowDown className="h-4 w-4 text-gray-500" />
                  <span>อุณหภูมิต่ำสุด</span>
                </div>
                <span className="text-gray-500">{it.minTemp.toFixed(1)} °</span>
              </div>

              <div className="mt-3 flex items-center justify-between text-sm text-gray-700">
                <div className="flex items-center gap-2">
                  <ArrowUp className="h-4 w-4 text-gray-500" />
                  <span>อุณหภูมิสูงสุด</span>
                </div>
                <span className="text-gray-500">{it.maxTemp.toFixed(1)} °</span>
              </div>
            </div>

            <div className="mt-5 h-px bg-gray-300/70" />
          </section>
        ))}
      </div>
    </div>
  );
}
