"use client";

import { useState } from "react";
import SelectField from "@/components/SelectField";
import { CATEGORY_OPTIONS, DATE_TIME_OPTIONS } from "@/lib/mock";

export default function MapPage() {
  const [cat, setCat] = useState("");
  const [dt, setDt] = useState("");

  return (
    <div className="px-4 pt-5 pb-8">
      <div className="text-2xl font-semibold text-gray-800">Topic</div>

      <div className="mt-4 space-y-3">
        <SelectField
          value={cat}
          onChange={setCat}
          options={CATEGORY_OPTIONS}
          placeholder="Category"
        />
        <SelectField
          value={dt}
          onChange={setDt}
          options={DATE_TIME_OPTIONS}
          placeholder="Date/Time"
        />
      </div>

      <div className="mt-6">
        <div className="text-sm font-semibold text-gray-800">ภาคกลาง</div>
        <div className="text-xs text-gray-500">Description. Lorem ipsum dolor sit amet.</div>

        <div className="mt-3 overflow-hidden rounded-2xl bg-gray-200">
          {/* Placeholder map */}
          <div className="aspect-square w-full bg-[linear-gradient(45deg,#d1d5db_25%,transparent_25%,transparent_50%,#d1d5db_50%,#d1d5db_75%,transparent_75%,transparent)] bg-[length:18px_18px]" />
        </div>

        <div className="mt-6">
          <div className="text-sm font-semibold text-gray-800">ภาคกลาง</div>
          <div className="text-xs text-gray-500">Description. Lorem ipsum dolor sit amet.</div>
        </div>
      </div>
    </div>
  );
}
