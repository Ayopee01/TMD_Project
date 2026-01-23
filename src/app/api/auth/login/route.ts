import { NextResponse } from "next/server";
import { deprocProfile } from "@/lib/czpClient";

export const runtime = "nodejs";

// API route สำหรับ login ด้วย appId + mToken
export async function POST(req: Request) {
  /**
   * ✅ กัน body พัง / type ไม่ตรง
   * - บางที client ส่งมาไม่ครบ/ผิดรูปแบบ จะไม่ให้ server crash
   */
  const body = (await req.json().catch(() => ({}))) as {
    appId?: unknown;
    mToken?: unknown;
  };

  /**
   * ✅ Normalize ฝั่ง server ซ้ำอีกชั้น (Defense-in-depth)
   * เหตุผล:
   * - บาง reverse proxy / URL decode อาจทำให้ "+" กลายเป็น " "
   * - ถึง client จะแก้แล้ว แต่กันเผื่อ client รุ่นเก่า/เรียกตรง
   */
  const appId = typeof body.appId === "string" ? body.appId.trim() : "";
  const mToken =
    typeof body.mToken === "string" ? body.mToken.replace(/ /g, "+").trim() : "";

  // ตรวจสอบ Parameter
  if (!appId || !mToken) {
    return NextResponse.json(
      { status: "error", message: "Missing appId/mToken" },
      { status: 400 }
    );
  }

  try {
    // validate -> iToken -> deproc
    const profile = await deprocProfile(appId, mToken);

    return NextResponse.json({ status: "success", data: profile }, { status: 200 });
  } catch (e: any) {
    // ❗️อย่า log token เต็มเพื่อความปลอดภัย
    // console.log("login failed", { appIdLen: appId.length, tokenLen: mToken.length, hasSpace: mToken.includes(" ") });

    return NextResponse.json(
      { status: "error", message: e?.message || "Login failed" },
      { status: 401 }
    );
  }
}
