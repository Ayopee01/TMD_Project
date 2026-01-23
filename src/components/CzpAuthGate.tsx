"use client";

import Script from "next/script";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CzpAuthProvider, type CzpUser } from "@/hooks/useCzpAuth";

type LoginResponse =
  | { status: "success"; data: CzpUser }
  | { status: "error"; message: string };

// เก็บ session ไว้ใน sessionStorage
const SESSION_KEY = "czp_profile";

function toErrorMessage(e: unknown): string {
  if (e instanceof Error) return e.message;
  if (typeof e === "string") return e;

  // รองรับกรณี throw เป็น object 
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

  // Function อ่านค่า query string (รับค่าจาก URL Params)
  const querystring = () => {
    const sp = new URLSearchParams(window.location.search);
    return {
      appId: sp.get("appId") || undefined,
      mToken: sp.get("mToken") || undefined,
    };
  };

  // Function Login
  const doLogin = useCallback(async (a: string, t: string) => {
    if (!a || !t) throw new Error("Missing appId or mToken");

    console.log("[doLogin] Starting login with appId:", a);
    console.log("[doLogin] mToken:", t.substring(0, 20) + "...");

    setAppId(a);
    setMToken(t);

    // เรียก API ใน api/auth/login เพื่อได้รับ user profile
    console.log("[doLogin] Calling /api/auth/login");
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ appId: a, mToken: t }),
      cache: "no-store",
    });

    console.log("[doLogin] API response status:", res.status);
    // ตรวจผลลัพธ์
    const text = await res.text();
    console.log("[doLogin] API response text:", text);
    
    let json: LoginResponse;
    try {
      json = JSON.parse(text);
    } catch (parseErr) {
      console.error("[doLogin] JSON parse error - received HTML instead of JSON");
      console.error("[doLogin] First 500 chars:", text.substring(0, 500));
      throw new Error(`Invalid response format: ${text.substring(0, 100)}`);
    }
    console.log("[doLogin] API response:", json);

    if (!res.ok || json.status !== "success") {
      throw new Error(json.status === "error" ? json.message : "Login failed");
    }

    console.log("[doLogin] Login successful, user:", json.data);
    // เก็บข้อมูล user profile
    setUser(json.data);
    // save ลง session user profile+appId (ไม่เก็บ mToken)
    saveSession({ appId: a, user: json.data });
  }, []);

  // Function relogin
  const relogin = useCallback(async () => {
    console.log("[relogin] Started, sdkReady:", sdkReady);
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

      // 1) Querystring
      const q = querystring();
      console.log("[relogin] Querystring check - appId:", q.appId, "mToken:", q.mToken ? q.mToken.substring(0, 20) + "..." : undefined);
      if (q.appId && q.mToken) {
        console.log("[relogin] Found appId/mToken in querystring, attempting login");
        await doLogin(q.appId, q.mToken);
        return;
      }

      // 2) SDK
      console.log("[relogin] Checking SDK");
      const sdk = window.czpSdk;
      if (!sdk) throw new Error("Citizen Portal SDK not loaded");
      console.log("[relogin] SDK loaded successfully");

      // ตั้ง title
      sdk.setTitle("My Mini App", true);

      // ตรวจสอบสภาพแวดล้อม
      const isInPortal = sdk.isCitizenPortal();
      console.log("[relogin] isCitizenPortal:", isInPortal);
      if (!isInPortal) {
        throw new Error("Not running in Citizen Portal");
      }

      // ดึง appId + mToken จาก SDK
      const foundAppId = sdk.getAppId();
      const foundToken = sdk.getToken();
      console.log("[relogin] SDK appId:", foundAppId);
      console.log("[relogin] SDK mToken:", foundToken ? foundToken.substring(0, 20) + "..." : undefined);
      if (!foundAppId || !foundToken) {
        throw new Error("Missing appId or mToken from SDK");
      }

      // เรียก login
      console.log("[relogin] Calling doLogin with SDK credentials");
      await doLogin(foundAppId, foundToken);
    } catch (e: unknown) {
      const errorMsg = toErrorMessage(e);
      console.error("[relogin] Error:", errorMsg);
      setError(errorMsg);
    } finally {
      setLoading(false);
      busyRef.current = false;
    }
  }, [sdkReady, doLogin]);

  // ✅ ทำครั้งเดียว: ถ้ามี session ก็ใช้เลย ไม่ login ใหม่
  useEffect(() => {
    console.log("[Auth] useEffect triggered, sdkReady:", sdkReady);
    if (!sdkReady) return;

    const cached = loadSession();
    console.log("[Auth] Cached session:", cached);
    if (cached?.appId && cached?.user) {
      console.log("[Auth] Using cached session with appId:", cached.appId);
      setAppId(cached.appId);
      setUser(cached.user);
      setError(null);
      setLoading(false);
      return;
    }

    console.log("[Auth] No cached session, calling relogin");
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
        onLoad={() => {
          console.log("[Script] CZP SDK loaded successfully");
          console.log("[Script] window.czpSdk:", window.czpSdk);
          setSdkReady(true);
        }}
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

export default CzpAuthGate