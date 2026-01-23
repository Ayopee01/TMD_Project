"use client";

import Script from "next/script";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CzpAuthProvider, type CzpUser } from "@/hooks/useCzpAuth";

type LoginResponse =
  | { status: "success"; data: CzpUser }
  | { status: "error"; message: string };

// เก็บ session ไว้ใน sessionStorage
const SESSION_KEY = "czp_profile";

/**
 * ✅ สำคัญมาก (สาเหตุที่ Local ผ่าน แต่ Server พังบ่อย)
 * - token บางประเภทมีเครื่องหมาย "+" อยู่
 * - ในโลกของ querystring/บาง reverse proxy: "+" อาจถูก decode เป็น " " (space)
 * - พอส่งต่อไป deproc แล้ว pattern จะไม่ตรง => "The string did not match the expected pattern."
 *
 * ดังนั้น normalize โดย "แปลง space -> +" และ trim
 */
const normalizeToken = (v?: string | null) => (v ? v.replace(/ /g, "+").trim() : "");

/**
 * ✅ รองรับกรณี deploy ใต้ path เช่น /test2
 * - ถ้าโปรดักชันคุณใช้ basePath หรือ nginx serve อยู่ใต้ /test2
 * - ให้ตั้งค่า env: NEXT_PUBLIC_BASE_PATH=/test2
 * - local ไม่ต้องตั้ง (ค่าเป็น "")
 */
const BASE_PATH = (process.env.NEXT_PUBLIC_BASE_PATH || "").replace(/\/$/, "");

function toErrorMessage(e: unknown): string {
  if (e instanceof Error) return e.message;
  if (typeof e === "string") return e;

  // รองรับกรณี throw เป็น object แปลก ๆ
  try {
    return JSON.stringify(e);
  } catch {
    return String(e);
  }
}

function CzpAuthGate({ children }: { children: React.ReactNode }) {
  // สถานะ SDK Load Citizen Portal SDK
  const [sdkReady, setSdkReady] = useState(false);
  // สถานะการ Loading / Error
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // ข้อมูล session ที่ได้รับมา
  const [appId, setAppId] = useState<string | null>(null);
  const [mToken, setMToken] = useState<string | null>(null); // จะอยู่แค่ใน state ชั่วคราว
  const [user, setUser] = useState<CzpUser | null>(null);
  // ป้องกันการ login ซ้ำด้วย useRef
  const busyRef = useRef(false);

  // โหลด session
  const loadSession = () => {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      if (!raw) return null;
      return JSON.parse(raw) as { appId: string; user: CzpUser };
    } catch {
      return null;
    }
  };

  // บันทึก session
  const saveSession = (data: { appId: string; user: CzpUser }) => {
    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(data));
    } catch {}
  };

  // ลบ session
  const clearSession = () => {
    try {
      sessionStorage.removeItem(SESSION_KEY);
    } catch {}
  };

  /**
   * Function อ่านค่า query string (รับค่าจาก URL Params)
   * ✅ ทำ normalize mToken ที่นี่เลย กัน "+" ถูก decode เป็น space
   */
  const querystring = () => {
    const sp = new URLSearchParams(window.location.search);

    const rawAppId = sp.get("appId");
    const rawMToken = sp.get("mToken");

    const cleanAppId = (rawAppId || "").trim() || undefined;
    const cleanMToken = rawMToken ? normalizeToken(rawMToken) : undefined;

    return { appId: cleanAppId, mToken: cleanMToken };
  };

  /**
   * Function Login
   * ✅ ใช้ BASE_PATH เพื่อรองรับ deploy ใต้ /test2
   * ✅ ส่ง token ที่ normalize แล้วเท่านั้น
   */
  const doLogin = useCallback(async (a: string, t: string) => {
    const cleanAppId = (a || "").trim();
    const cleanToken = normalizeToken(t);

    if (!cleanAppId || !cleanToken) throw new Error("Missing appId or mToken");

    setAppId(cleanAppId);
    setMToken(cleanToken);

    // เรียก API ใน api/auth/login เพื่อได้รับ user profile
    // - ถ้า deploy ใต้ /test2 ให้ตั้ง NEXT_PUBLIC_BASE_PATH=/test2
    const res = await fetch(`${BASE_PATH}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ appId: cleanAppId, mToken: cleanToken }),
      cache: "no-store",
    });

    const json = (await res.json()) as LoginResponse;

    if (!res.ok || json.status !== "success") {
      throw new Error(json.status === "error" ? json.message : "Login failed");
    }

    // เก็บข้อมูล user profile
    setUser(json.data);

    // save ลง session user profile+appId (ไม่เก็บ mToken)
    saveSession({ appId: cleanAppId, user: json.data });
  }, []);

  // Function relogin
  const relogin = useCallback(async () => {
    if (!sdkReady) return;
    if (busyRef.current) return;
    busyRef.current = true;

    // เริ่ม login
    setLoading(true);
    setError(null);

    try {
      // ล้าง state เก่า + session เก่า
      clearSession();
      setUser(null);
      setAppId(null);
      setMToken(null);

      // 1) Querystring (ถ้ามี appId/mToken จาก URL จะใช้ก่อน)
      const q = querystring();
      if (q.appId && q.mToken) {
        await doLogin(q.appId, q.mToken);
        return;
      }

      // 2) SDK (กรณีไม่มี querystring ให้ไปดึงจาก Citizen Portal SDK)
      const sdk = window.czpSdk;
      if (!sdk) throw new Error("Citizen Portal SDK not loaded");

      // ตั้ง title
      sdk.setTitle("My Mini App", true);

      // ตรวจสอบสภาพแวดล้อม
      if (!sdk.isCitizenPortal()) {
        throw new Error("Not running in Citizen Portal");
      }

      // ดึง appId + mToken จาก SDK
      const foundAppId = (sdk.getAppId() || "").trim();
      const foundToken = normalizeToken(sdk.getToken());

      if (!foundAppId || !foundToken) {
        throw new Error("Missing appId or mToken from SDK");
      }

      // เรียก login
      await doLogin(foundAppId, foundToken);
    } catch (e: unknown) {
      setError(toErrorMessage(e));
    } finally {
      setLoading(false);
      busyRef.current = false;
    }
  }, [sdkReady, doLogin]);

  // ✅ ทำครั้งเดียว: ถ้ามี session ก็ใช้เลย ไม่ login ใหม่
  useEffect(() => {
    if (!sdkReady) return;

    const cached = loadSession();
    if (cached?.appId && cached?.user) {
      setAppId(cached.appId);
      setUser(cached.user);
      setError(null);
      setLoading(false);
      return;
    }

    relogin();
  }, [sdkReady, relogin]);

  // ค่า context
  const ctxValue = useMemo(
    () => ({ loading, error, appId, mToken, user, relogin }),
    [loading, error, appId, mToken, user, relogin]
  );

  return (
    <>
      <Script
        src="https://czp.dga.or.th/cportal/sdk/iu/v3/sdk.js"
        strategy="afterInteractive"
        onLoad={() => setSdkReady(true)}
      />

      <CzpAuthProvider value={ctxValue}>
        {loading ? (
          <div className="min-h-screen bg-white">
            <div className="mx-auto max-w-3xl px-4 py-10">
              <div className="rounded-xl border p-4 text-gray-700">
                กำลังเข้าสู่ระบบ...
              </div>
            </div>
          </div>
        ) : error ? (
          <div className="min-h-screen bg-white">
            <div className="mx-auto max-w-3xl px-4 py-10">
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
                Login ไม่สำเร็จ: {error}
              </div>
            </div>
          </div>
        ) : (
          children
        )}
      </CzpAuthProvider>
    </>
  );
}

export default CzpAuthGate;
