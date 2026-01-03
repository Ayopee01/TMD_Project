"use client";

import { useEffect, useState } from "react";
import SelectField from "@/components/SelectField";
import { CATEGORY_OPTIONS } from "@/lib/mock"; // ถ้า map ยังใช้ category อยู่

type Option = { label: string; value: string };

export default function MapPage() {
  const [cat, setCat] = useState("");
  const [dt, setDt] = useState("AUTO");

  const [dtOptions, setDtOptions] = useState<Option[]>([]);

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/daily", { cache: "no-store" });
      const data = await res.json();
      setDtOptions(data.options ?? []);
      setDt("AUTO");
    })();
  }, []);

  return (
    <section className="h-screen w-full">
      <div className="p-6">
        {/* ตัวอย่าง: category */}
        <SelectField
          value={cat}
          onChange={setCat}
          options={CATEGORY_OPTIONS.map((x) => ({ label: x, value: x }))}
          placeholder="Category"
        />

        {/* Date/Time ที่เดิมเคยใช้ DATE_TIME_OPTIONS */}
        <div className="mt-4">
          <SelectField
            value={dt}
            onChange={setDt}
            options={dtOptions}
            placeholder="Date/Time"
          />
        </div>
      </div>
    </section>
  );
}
