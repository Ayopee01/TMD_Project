"use client";

import Link from "next/link";
import { BurgerIcon } from "@/components/Icons";
import Image from "next/image";

type Props = {
  onOpenMenu: () => void;
};

function Navbar({ onOpenMenu }: Props) {
  return (
    <nav className="sticky top-0 z-30 border-b border-gray-200 bg-white/90 backdrop-blur dark:border-gray-700 dark:bg-gray-900/80">
      <div className="flex h-18 w-full items-center justify-between px-4 md:h-22">
        {/* Left: Brand/Logo */}
        <Link href="/" className="flex items-center gap-3 h-full">
          <span className="relative h-full w-36 sm:w-40 md:w-42">
            <Image
              src="/logo.png"
              alt="Logo"
              fill
              priority
              className="object-contain"
              sizes="(max-width: 640px) 144px, (max-width: 768px) 160px, 256px"
            />
          </span>
        </Link>

        {/* Center: Desktop menu */}
        <div className="hidden items-center gap-8 xl:flex">
          <Link
            href="/daily"
            className="group relative px-1 py-2 text-sm font-medium text-gray-700 transition-colors hover:text-indigo-600 dark:text-gray-200 dark:hover:text-indigo-400"
          >
            พยากรณ์อากาศประจำวัน
            <span className="absolute left-0 -bottom-1 h-[3px] w-full origin-left scale-x-0 rounded-full bg-indigo-600 transition-transform duration-500 ease-out group-hover:scale-x-100 dark:bg-indigo-400" />
          </Link>

          <Link
            href="/map"
            className="group relative px-1 py-2 text-sm font-medium text-gray-700 transition-colors hover:text-indigo-600 dark:text-gray-200 dark:hover:text-indigo-400"
          >
            แผนที่อากาศพื้นผิว
            <span className="absolute left-0 -bottom-1 h-[3px] w-full origin-left scale-x-0 rounded-full bg-indigo-600 transition-transform duration-500 ease-out group-hover:scale-x-100 dark:bg-indigo-400" />
          </Link>

          <Link
            href="/monthly"
            className="group relative px-1 py-2 text-sm font-medium text-gray-700 transition-colors hover:text-indigo-600 dark:text-gray-200 dark:hover:text-indigo-400"
          >
            สรุปลักษณะอากาศรายสัปดาห์
            <span className="absolute left-0 -bottom-1 h-[3px] w-full origin-left scale-x-0 rounded-full bg-indigo-600 transition-transform duration-500 ease-out group-hover:scale-x-100 dark:bg-indigo-400" />
          </Link>

          <Link
            href="/regional"
            className="group relative px-1 py-2 text-sm font-medium text-gray-700 transition-colors hover:text-indigo-600 dark:text-gray-200 dark:hover:text-indigo-400"
          >
            สรุปลักษณะอากาศรายเดือน
            <span className="absolute left-0 -bottom-1 h-[3px] w-full origin-left scale-x-0 rounded-full bg-indigo-600 transition-transform duration-500 ease-out group-hover:scale-x-100 dark:bg-indigo-400" />
          </Link>

          <Link
            href="/bulletin"
            className="group relative px-1 py-2 text-sm font-medium text-gray-700 transition-colors hover:text-indigo-600 dark:text-gray-200 dark:hover:text-indigo-400"
          >
            จดหมายวิชาการเกษตร
            <span className="absolute left-0 -bottom-1 h-[3px] w-full origin-left scale-x-0 rounded-full bg-indigo-600 transition-transform duration-500 ease-out group-hover:scale-x-100 dark:bg-indigo-400" />
          </Link>
        </div>

        {/* Right: Mobile hamburger */}
        <div className="flex items-center gap-3">
          <button
            className="cursor-pointer inline-flex h-11 w-11 items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/10 xl:hidden"
            onClick={onOpenMenu}
            aria-label="Open Menu"
          >
            <BurgerIcon className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-gray-700 dark:text-gray-200" />
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
