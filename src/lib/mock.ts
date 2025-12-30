export const DATE_TIME_OPTIONS = [
  "12 ธ.ค. 2568 07:00",
  "12 ธ.ค. 2568 13:00",
  "12 ธ.ค. 2568 19:00",
];

export const CATEGORY_OPTIONS = ["ภาคกลาง", "ภาคเหนือ", "ภาคอีสาน", "ภาคใต้"];

export const REGIONAL_ITEMS = [
  {
    region: "ภาคกลาง",
    desc: "Description. Lorem ipsum dolor sit amet.",
    maxRain: 35.2,
    minTemp: 12.0,
    maxTemp: 22.0,
  },
  {
    region: "ภาคกลาง",
    desc: "Description. Lorem ipsum dolor sit amet.",
    maxRain: 35.2,
    minTemp: 12.0,
    maxTemp: 22.0,
  },
  {
    region: "ภาคกลาง",
    desc: "Description. Lorem ipsum dolor sit amet.",
    maxRain: 35.2,
    minTemp: 12.0,
    maxTemp: 22.0,
  },
];

// src/lib/mock.ts
import type { ComponentType } from "react";
import {
  WeatherCloudRain,
  WeatherSun,
  WeatherDrop,
  WeatherMountain,
  WeatherWind,
  WeatherSnow,
} from "@/components/Icons";


export type DailyItem = {
  Icon: ComponentType<{ className?: string }>;
  temp: string;
};

export type DailySlide = {
  id: string;
  label: string; // ใช้ทำชื่อ/aria-label ได้
  bg: string;    // path จาก public เช่น "/img_daily/desktop/test1.png"
  region: string;
  mainTemp: string;
  desc: string;
  items: DailyItem[];
};

export const DAILY_SLIDES: DailySlide[] = [
  {
    id: "north",
    label: "ภาคเหนือ",
    bg: "/img_daily/desktop/test1.png",
    region: "ภาคเหนือ",
    mainTemp: "18°",
    desc: "มีฝนเล็กน้อย ในบางพื้นที่",
    items: [
      { Icon: WeatherCloudRain, temp: "12°" },
      { Icon: WeatherSun, temp: "12°" },
      { Icon: WeatherDrop, temp: "65%" },
      { Icon: WeatherMountain, temp: "1,200m" },
      { Icon: WeatherWind, temp: "12 km/h" },
      { Icon: WeatherSnow, temp: "-" },
    ],
  },
  {
    id: "central",
    label: "ภาคตะวันออกเฉียงเหนือ",
    bg: "/img_daily/desktop/test2.png",
    region: "ภาคตะวันออกเฉียงเหนือ",
    mainTemp: "29°",
    desc: "แดดจัดบางช่วง",
    items: [
      { Icon: WeatherSun, temp: "29°" },
      { Icon: WeatherWind, temp: "10 km/h" },
      { Icon: WeatherDrop, temp: "55%" },
      { Icon: WeatherCloudRain, temp: "10%" },
      { Icon: WeatherMountain, temp: "-" },
      { Icon: WeatherSnow, temp: "-" },
    ],
  },
  {
    id: "isaan",
    label: "ภาคกลาง",
    bg: "/img_daily/desktop/test3.png",
    region: "ภาคกลาง",
    mainTemp: "25°",
    desc: "เมฆมาก โอกาสฝน",
    items: [
      { Icon: WeatherCloudRain, temp: "40%" },
      { Icon: WeatherSun, temp: "25°" },
      { Icon: WeatherDrop, temp: "70%" },
      { Icon: WeatherWind, temp: "14 km/h" },
      { Icon: WeatherMountain, temp: "-" },
      { Icon: WeatherSnow, temp: "-" },
    ],
  },
  {
    id: "east",
    label: "ภาคใต้(ฝั่งตะวันออก)",
    bg: "/img_daily/desktop/test4.png",
    region: "ภาคใต้(ฝั่งตะวันออก)",
    mainTemp: "28°",
    desc: "ร้อนชื้น มีฝนกระจาย",
    items: [
      { Icon: WeatherDrop, temp: "78%" },
      { Icon: WeatherCloudRain, temp: "35%" },
      { Icon: WeatherSun, temp: "28°" },
      { Icon: WeatherWind, temp: "15 km/h" },
      { Icon: WeatherMountain, temp: "-" },
      { Icon: WeatherSnow, temp: "-" },
    ],
  },
  {
    id: "south",
    label: "ภาคใต้(ฝั่งตะวันตก)",
    bg: "/img_daily/desktop/test5.png",
    region: "ภาคใต้(ฝั่งตะวันตก)",
    mainTemp: "27°",
    desc: "ฝนฟ้าคะนองบางพื้นที่",
    items: [
      { Icon: WeatherCloudRain, temp: "60%" },
      { Icon: WeatherWind, temp: "20 km/h" },
      { Icon: WeatherDrop, temp: "85%" },
      { Icon: WeatherSun, temp: "27°" },
      { Icon: WeatherMountain, temp: "-" },
      { Icon: WeatherSnow, temp: "-" },
    ],
  },
  {
    id: "bkk",
    label: "กรุงเทพและปริมณฑล",
    bg: "/img_daily/desktop/test6.png",
    region: "กรุงเทพและปริมณฑล",
    mainTemp: "31°",
    desc: "ร้อนอบอ้าว มีฝนช่วงเย็น",
    items: [
      { Icon: WeatherSun, temp: "31°" },
      { Icon: WeatherCloudRain, temp: "30%" },
      { Icon: WeatherDrop, temp: "60%" },
      { Icon: WeatherWind, temp: "9 km/h" },
      { Icon: WeatherMountain, temp: "-" },
      { Icon: WeatherSnow, temp: "-" },
    ],
  },
];

export const BULLETINS = [
  { date: "12 ธันวาคม 2568", title: "หมายเหตุ:จดหมายวิชาการเกษตร", sub: "หน่วยงาน:กองพัฒนาอุตุนิยมวิทยา" },
  { date: "13 ธันวาคม 2568", title: "หมายเหตุ:จดหมายวิชาการเกษตร", sub: "หน่วยงาน:กองพัฒนาอุตุนิยมวิทยา" },
  { date: "14 ธันวาคม 2568", title: "หมายเหตุ:จดหมายวิชาการเกษตร", sub: "หน่วยงาน:กองพัฒนาอุตุนิยมวิทยา" },
  { date: "15 ธันวาคม 2568", title: "หมายเหตุ:จดหมายวิชาการเกษตร", sub: "หน่วยงาน:กองพัฒนาอุตุนิยมวิทยา" },
];
