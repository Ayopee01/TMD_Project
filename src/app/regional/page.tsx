"use client";

import { useState } from "react";
import SelectField from "@/components/SelectField";
import { CATEGORY_OPTIONS } from "@/lib/mock";

export default function MonthlyPage() {
  const [dt, setDt] = useState("");

  return (
    <div className="px-4 pt-5 pb-10">
      <div className="text-2xl font-semibold text-gray-800">Topic</div>
      <div className="mt-1 text-xs text-gray-500">
        Description. Lorem ipsum dolor sit amet consectetur adipisicing elit, sed do
      </div>

      <div className="mt-4">
        <SelectField
          value={dt}
          onChange={setDt}
          options={CATEGORY_OPTIONS}
          placeholder="Date/Time"
        />
      </div>

      <div className="mt-5 rounded-[28px] bg-gray-200 p-6">
        <div className="text-sm font-semibold text-gray-700">Title</div>
        <div className="text-xs text-gray-500">Description. Lorem ipsum dolor sit amet.</div>
        <div className="mt-4 h-[360px] rounded-2xl bg-gray-300" />
      </div>
    </div>
  );
}