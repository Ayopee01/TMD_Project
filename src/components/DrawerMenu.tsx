"use client";

import Link from "next/link";

type Props = { open: boolean; onClose: () => void };

export default function DrawerMenu({ open, onClose }: Props) {
  const linkClass =
    "group relative block rounded-xl px-3 py-3 text-sm font-medium text-gray-800 transition " +
    "hover:bg-gray-50 hover:text-indigo-600 active:scale-[0.99] active:bg-gray-100";

  const underlineClass =
    "absolute left-3 right-3 -bottom-0.5 h-[3px] origin-left scale-x-0 rounded-full bg-indigo-600 " +
    "transition-transform duration-500 ease-out group-hover:scale-x-100";

  return (
    <>
      {/* overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black/30 transition-opacity duration-300 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
      />

      {/* panel */}
      <div
        className={`fixed right-0 top-0 z-50 h-full w-[78%] max-w-[320px] bg-white shadow-xl transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="relative border-b px-4 py-4">
          <div className="text-sm font-semibold text-gray-900">Menu</div>

          {/* Close (X) */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="absolute right-3 top-3 inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-full
                       text-gray-500 transition hover:bg-red-50 hover:text-red-600 active:scale-[0.98]"
          >
            {/* X icon */}
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5"
              aria-hidden="true"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        {/* Menu */}
        <nav className="p-2">
          <Link href="/" onClick={onClose} className={linkClass}>
            Dashboard
            <span className={underlineClass} />
          </Link>

          <div className="my-2 h-px bg-gray-100" />

          <Link href="/daily" onClick={onClose} className={linkClass}>
            พยากรณ์อากาศประจำวัน
            <span className={underlineClass} />
          </Link>

          <Link href="/map" onClick={onClose} className={linkClass}>
            แผนที่อากาศพื้นผิว
            <span className={underlineClass} />
          </Link>

          <Link href="/monthly" onClick={onClose} className={linkClass}>
            สรุปลักษณะอากาศรายสัปดาห์
            <span className={underlineClass} />
          </Link>

          <Link href="/regional" onClick={onClose} className={linkClass}>
            สรุปลักษณะอากาศรายเดือน
            <span className={underlineClass} />
          </Link>

          <Link href="/bulletin" onClick={onClose} className={linkClass}>
            จดหมายวิชาการเกษตร
            <span className={underlineClass} />
          </Link>
        </nav>
      </div>
    </>
  );
}
