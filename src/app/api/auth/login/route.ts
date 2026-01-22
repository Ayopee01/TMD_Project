import { NextResponse } from "next/server";
import { deprocProfile } from "@/lib/czpClient"; 

export const runtime = "nodejs";

// API route สำหรับ login ด้วย appId + mToken
export async function POST(req: Request) {
  const { appId, mToken } = (await req.json()) as { appId: string; mToken: string };

  // ตรวจสอบ Parameter
  if (!appId || !mToken) {
    return NextResponse.json({ status: "error", message: "Missing appId/mToken" }, { status: 400 });
  }

  try {
    // validate -> iToken -> deproc
    const profile = await deprocProfile(appId, mToken);

    // ส่งข้อมูลกลับกรณีไม่สำเร็จ
    return NextResponse.json({ status: "success", data: profile }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json(
      { status: "error", message: e?.message || "Login failed" },
      { status: 401 }
    );
  }
}
