"use client";

type Props = {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
};

export default function Pagination({ page, totalPages, onChange }: Props) {
  const clamp = (p: number) => Math.max(1, Math.min(totalPages, p));

  return (
    <div className="flex items-center justify-between gap-3 px-4 pb-6">
      <div className="flex items-center gap-2">
        <button
          className="h-9 w-9 rounded-full bg-gray-200 text-sm"
          onClick={() => onChange(1)}
          aria-label="first"
        >
          «
        </button>
        <button
          className="h-9 w-9 rounded-full bg-gray-200 text-sm"
          onClick={() => onChange(clamp(page - 1))}
          aria-label="prev"
        >
          ‹
        </button>

        {/* simple middle indicators like mock */}
        <div className="flex items-center gap-2 px-2">
          {[3, 4, 5].map((n) => (
            <button
              key={n}
              onClick={() => onChange(clamp(n))}
              className={[
                "h-10 w-10 rounded-full text-sm",
                n === page ? "bg-gray-700 text-white" : "bg-gray-200 text-gray-700",
              ].join(" ")}
            >
              {n}
            </button>
          ))}
        </div>

        <button
          className="h-9 w-9 rounded-full bg-gray-200 text-sm"
          onClick={() => onChange(clamp(page + 1))}
          aria-label="next"
        >
          ›
        </button>
        <button
          className="h-9 w-9 rounded-full bg-gray-200 text-sm"
          onClick={() => onChange(totalPages)}
          aria-label="last"
        >
          »
        </button>
      </div>

      <div className="flex items-center gap-2 text-xs text-gray-600">
        <span>Page</span>
        <select
          className="h-9 rounded-full border border-gray-300 bg-white px-3 text-xs"
          value={page}
          onChange={(e) => onChange(Number(e.target.value))}
        >
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
        <span>of {totalPages}</span>
      </div>
    </div>
  );
}
