"use client";

import { useMemo, useState } from "react";
import SelectField from "@/components/SelectField";
import Pagination from "@/components/Pagination";
import { CATEGORY_OPTIONS, BULLETINS } from "@/lib/mock";
import { DownloadIcon } from "@/components/Icons";

export default function BulletinPage() {
  const [cat, setCat] = useState("");
  const [page, setPage] = useState(4);
  const totalPages = 10;

  const list = useMemo(() => BULLETINS, []);

  return (
    <div>
      {/* top gray header like mock */}
      <div className="bg-gray-100 px-4 pt-10 pb-4">
        <div className="text-2xl font-semibold text-gray-800">Topic</div>
        <div className="mt-1 text-xs text-gray-500">
          Description. Lorem ipsum dolor sit amet consectetur adipisicing elit, sed do
        </div>
      </div>

      <div className="-mt-4 rounded-t-[28px] bg-white px-4 pt-4 pb-10">
        {/* category pill area */}
        <div className="rounded-[22px] bg-gray-200 p-3">
          <SelectField
            value={cat}
            onChange={setCat}
            options={CATEGORY_OPTIONS}
            placeholder="Category"
          />
        </div>

        <div className="mt-4">
          <div className="text-sm font-semibold text-gray-800">Title</div>
          <div className="text-xs text-gray-500">Description. Lorem ipsum dolor sit amet.</div>
        </div>

        <div className="mt-3 space-y-3">
          {list.map((b) => (
            <div key={b.date} className="flex items-center gap-3 rounded-2xl bg-gray-200 p-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-300">
                <DownloadIcon className="h-5 w-5 text-gray-600" />
              </div>

              <div className="min-w-0">
                <div className="text-sm font-semibold text-gray-800">{b.date}</div>
                <div className="truncate text-xs text-gray-600">{b.title}</div>
                <div className="truncate text-[11px] text-gray-500">{b.sub}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4">
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </div>
      </div>
    </div>
  );
}
