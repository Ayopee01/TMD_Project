import { NextResponse } from "next/server";
import { deprocProfile } from "@/lib/czpClient"; 

export const runtime = "nodejs";

// API route สำหรับ login ด้วย appId + mToken
export async function POST(req: Request) {
  const { appId, mToken } = (await req.json()) as { appId: string; mToken: string };

  console.log("[API] Login request - appId:", appId, "mToken:", mToken ? mToken.substring(0, 20) + "..." : "null");

  // ตรวจสอบ Parameter
  if (!appId || !mToken) {
    console.error("[API] Missing appId or mToken");
    return NextResponse.json({ status: "error", message: "Missing appId/mToken" }, { status: 400 });
  }

  try {
    // validate -> iToken -> deproc
    console.log("[API] Calling deprocProfile...");
    const profile = await deprocProfile(appId, mToken);

    console.log("[API] deprocProfile success:", profile);
    // ส่งข้อมูลกลับกรณีไม่สำเร็จ
    return NextResponse.json({ status: "success", data: profile }, { status: 200 });
  } catch (e: any) {
    console.error("[API] deprocProfile error:", e?.message || e);
    return NextResponse.json(
      { status: "error", message: e?.message || "Login failed" },
      { status: 401 }
    );
  }
}
