"use client";
import { useEffect, useMemo, useState } from "react";

type UpperWindItem = {
  title: string;
  description?: string;
  alt?: string;
  url: string;
  contentdate?: string; // ISO string
};

type UpperWindKey =
  | "UpperWind925hPa"
  | "UpperWind850hPa"
  | "UpperWind700hPa"
  | "UpperWind500hPa"
  | "UpperWind300hPa"
  | "UpperWind200hPa";

type UpperWindData = Partial<Record<UpperWindKey, UpperWindItem>>;

type UpperWindApiResponse = {
  success: boolean;
  data?: UpperWindData;
  message?: string;
};

const UPPER_WIND_KEYS: UpperWindKey[] = [
  "UpperWind925hPa",
  "UpperWind850hPa",
  "UpperWind700hPa",
  "UpperWind500hPa",
  "UpperWind300hPa",
  "UpperWind200hPa",
];

function hasItemWithUrl(item?: UpperWindItem): item is UpperWindItem {
  return !!item && typeof item.url === "string" && item.url.length > 0;
}

function formatThaiDateTime(iso?: string) {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat("th-TH", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(d);
}

function Map() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [payload, setPayload] = useState<UpperWindApiResponse | null>(null);

  const [selectedKey, setSelectedKey] = useState<UpperWindKey>("UpperWind925hPa");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch("/api/map", { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const json: UpperWindApiResponse = await res.json();

        if (cancelled) return;

        setPayload(json);

        // เลือก default key ตัวแรกที่มีจริง
        const d = json.data;
        const firstValidKey = d
          ? UPPER_WIND_KEYS.find((k) => hasItemWithUrl(d[k]))
          : undefined;

        if (firstValidKey && firstValidKey !== selectedKey) {
          setSelectedKey(firstValidKey);
        }
      } catch (e: unknown) {
        if (!cancelled) {
          const msg = e instanceof Error ? e.message : "Load failed";
          setError(msg);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const availableKeys = useMemo<UpperWindKey[]>(() => {
    const d = payload?.data;
    if (!d) return [];
    return UPPER_WIND_KEYS.filter((k) => hasItemWithUrl(d[k]));
  }, [payload]);

  const selectedItem = useMemo<UpperWindItem | undefined>(() => {
    const d = payload?.data;
    if (!d) return undefined;
    return d[selectedKey];
  }, [payload, selectedKey]);

  return (
    <section>
      <div className="flex  gap-4">
        <div className="flex flex-col">
          <div className="">
            <h1>แผนที่อากาศชั้นบน</h1>
            <h1>เลือกระดับความกดอากาศ</h1>
          </div>

          <select
            className="w-full rounded-xl border border-gray-300 p-3"
            value={selectedKey}
            onChange={(e) => setSelectedKey(e.target.value as UpperWindKey)}
            disabled={loading || availableKeys.length === 0}
          >
            {availableKeys.map((k) => (
              <option key={k} value={k}>
                {k.replace("UpperWind", "").replace("hPa", " hPa")}
              </option>
            ))}
          </select>

          <div className="">
            <div className="">
              {selectedItem?.title ?? "—"}
            </div>

            <div className="">
              เวลาอัปเดต: {formatThaiDateTime(selectedItem?.contentdate)}
            </div>

            {selectedItem?.description ? (
              <div className="">
                {selectedItem.description}
              </div>
            ) : null}
          </div>

          <div>
            <a className=""
              href={selectedItem?.url ?? "#"}
              download
            >
              ดาวน์โหลดเอกสาร
            </a>
            {loading ? <p style={{ marginTop: 12 }}>กำลังโหลด…</p> : null}
            {error ? (
              <p style={{ marginTop: 12, color: "crimson" }}>Error: {error}</p>
            ) : null}
          </div>
        </div>

        <div className=""
        >
          {!selectedItem?.url ? (
            <div className="">ไม่พบข้อมูลรูปภาพ</div>
          ) : (
            <div className="">
              <div className="">
                {selectedItem.title}
              </div>

              <div className=""
              >
                {/* img map */}
                <img
                  className="h-100 w-full object-contain"
                  src={selectedItem.url}
                  alt={selectedItem.alt ?? selectedItem.title}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default Map
