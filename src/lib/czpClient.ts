type ValidateResponse = { Result: string };
type DeprocResponse = {
  result?: {
    userId?: string;
    citizenId?: string;
    firstName?: string;
    lastName?: string;
    dateOfBirthString?: string;
    mobile?: string;
    email?: string;
    notification?: boolean;
  };
  messageCode?: number;
  message?: string;
};

// Cache iToken ชั่วคราว
let cachedIToken: { token: string; exp: number } | null = null;

// ดึง iToken โดยใช้ ConsumerSecret + AgentID
async function getIToken(): Promise<string> {
  const now = Date.now();
  // คืนค่า token จาก cache ถ้ายังไม่หมดอายุ
  if (cachedIToken && cachedIToken.exp > now) return cachedIToken.token;

  // เรียก validate API จาก .env GDX_AUTH_UR, ConsumerSecret, AgentID
  const url = new URL(process.env.GDX_AUTH_URL!);
  url.searchParams.set("ConsumerSecret", process.env.CONSUMER_SECRET!);
  url.searchParams.set("AgentID", process.env.AGENT_ID!);

  // fetch validate GET GDX_AUTH_URL ส่งค่า Consumer-Key ใน header
  const res = await fetch(url.toString(), {
    method: "GET",
    headers: {
      "Consumer-Key": process.env.CONSUMER_KEY!,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  // ตรวจสอบผลลัพธ์ หากผิดพลาด throw error
  if (!res.ok) throw new Error(`validate failed: ${res.status}`);
  // ดึงข้อมูล json
  const data = (await res.json()) as ValidateResponse;

  // ตรวจสอบ Result token หากไม่มีให้ throw error
  if (!data?.Result) throw new Error("validate missing Result token");

  // cache สั้นๆ กันยิง validate ถี่เกิน (ปรับได้)
  cachedIToken = { token: data.Result, exp: now + 5 * 60 * 1000 };
  // คืนค่า iToken
  return data.Result;
}

// ดึงข้อมูล profile จาก deproc โดยใช้ appId + mToken
export async function deprocProfile(appId: string, mToken: string) {
  const iToken = await getIToken();

  // fetch deproc
  const res = await fetch(process.env.DEPROC_API_URL!, {
    method: "POST",
    headers: {
      "Consumer-Key": process.env.CONSUMER_KEY!,
      "Content-Type": "application/json",
      Token: iToken,
    },
    body: JSON.stringify({ AppId: appId, MToken: mToken }),
    cache: "no-store",
  });

  // ตรวจสอบผลลัพธ์
  const data = (await res.json()) as DeprocResponse;

  // แสดง messageCode=200 success หากไม่สำเร็จ throw error deproc failed
  if (!res.ok || data?.messageCode !== 200 || !data?.result?.userId) {
    throw new Error(data?.message || `deproc failed (${res.status})`);
  }

  // คืนค่า profile(result)
  return data.result;
}
