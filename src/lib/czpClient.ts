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

/**
 * helper ตรวจ env แบบชัดเจน (โปรดักชันพลาดง่าย)
 */
function mustEnv(key: string): string {
  const v = process.env[key];
  if (!v) throw new Error(`Missing env: ${key}`);
  return v;
}

// ดึง iToken โดยใช้ ConsumerSecret + AgentID
async function getIToken(): Promise<string> {
  const now = Date.now();

  // คืนค่า token จาก cache ถ้ายังไม่หมดอายุ
  if (cachedIToken && cachedIToken.exp > now) return cachedIToken.token;

  // เรียก validate API จาก .env GDX_AUTH_URL, ConsumerSecret, AgentID
  const url = new URL(mustEnv("GDX_AUTH_URL"));
  url.searchParams.set("ConsumerSecret", mustEnv("CONSUMER_SECRET"));
  url.searchParams.set("AgentID", mustEnv("AGENT_ID"));

  // fetch validate GET GDX_AUTH_URL ส่งค่า Consumer-Key ใน header
  const res = await fetch(url.toString(), {
    method: "GET",
    headers: {
      "Consumer-Key": mustEnv("CONSUMER_KEY"),
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  if (!res.ok) throw new Error(`validate failed: ${res.status}`);

  const data = (await res.json()) as ValidateResponse;
  if (!data?.Result) throw new Error("validate missing Result token");

  // cache สั้นๆ กันยิง validate ถี่เกิน (ปรับได้)
  cachedIToken = { token: data.Result, exp: now + 5 * 60 * 1000 };

  return data.Result;
}

/**
 * ดึงข้อมูล profile จาก deproc โดยใช้ appId + mToken
 * ✅ sanitize อีกชั้น กัน mToken เพี้ยนจาก upstream ใดๆ
 */
export async function deprocProfile(appId: string, mToken: string) {
  const cleanAppId = (appId || "").trim();
  const cleanMToken = (mToken || "").replace(/ /g, "+").trim();

  if (!cleanAppId || !cleanMToken) {
    throw new Error("Missing appId/mToken (after sanitize)");
  }

  const iToken = await getIToken();

  const res = await fetch(mustEnv("DEPROC_API_URL"), {
    method: "POST",
    headers: {
      "Consumer-Key": mustEnv("CONSUMER_KEY"),
      "Content-Type": "application/json",
      Token: iToken,
    },
    body: JSON.stringify({ AppId: cleanAppId, MToken: cleanMToken }),
    cache: "no-store",
  });

  const data = (await res.json()) as DeprocResponse;

  // success เมื่อ messageCode=200 และมี userId
  if (!res.ok || data?.messageCode !== 200 || !data?.result?.userId) {
    throw new Error(data?.message || `deproc failed (${res.status})`);
  }

  return data.result;
}
