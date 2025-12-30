import Link from "next/link";

function DashboardPage() {
  return (
    <div className="px-4 pt-4">
      <div className="flex items-start gap-3">
        <div className="mt-1 h-7 w-7 rounded-full border border-gray-300" />
        <div>
          <div className="text-lg font-semibold text-gray-800">Hi, UserName</div>
          <div className="text-sm text-gray-500">ยินดีต้อนรับ , พีรพล</div>
        </div>
      </div>

      <div className="mt-4 rounded-t-[28px] bg-gray-200 px-4 pt-5 pb-10">
        <div className="text-base font-semibold text-gray-800">Topic</div>

        <div className="mt-3 grid grid-cols-2 gap-3">
          <Link
            href="/daily"
            className="flex min-h-[72px] items-center justify-center rounded-2xl bg-gray-600 px-3 text-center text-sm font-semibold text-white"
          >
            พยากรณ์อากาศประจำวัน
          </Link>

          <Link
            href="/map"
            className="flex min-h-[72px] items-center justify-center rounded-2xl bg-gray-600 px-3 text-center text-sm font-semibold text-white"
          >
            แผนที่อากาศพื้นผิว
          </Link>

          <Link
            href="/monthly"
            className="flex min-h-[72px] items-center justify-center rounded-2xl bg-gray-600 px-3 text-center text-sm font-semibold text-white"
          >
            สรุปลักษณะอากาศรายสัปดาห์
          </Link>

          <Link
            href="/regional"
            className="flex min-h-[72px] items-center justify-center rounded-2xl bg-gray-600 px-3 text-center text-sm font-semibold text-white"
          >
            สรุปลักษณะอากาศรายเดือน
          </Link>
        </div>

        <Link
          href="/bulletin"
          className="mt-3 flex min-h-[72px] items-center justify-center rounded-2xl bg-gray-600 px-3 text-center text-sm font-semibold text-white"
        >
          จดหมายวิชาการเกษตร
        </Link>
      </div>
    </div>
  );
}

export default DashboardPage;
