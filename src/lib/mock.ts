// src/lib/mock.ts

/** Regions (ใช้ร่วมกันหลายหน้า เช่น dropdown / map) */
export const REGIONS = [
  "ภาคเหนือ",
  "ภาคตะวันออกเฉียงเหนือ",
  "ภาคกลาง",
  "ภาคตะวันออก",
  "ภาคใต้(ฝั่งตะวันออก)",
  "ภาคใต้(ฝั่งตะวันตก)",
  "กรุงเทพและปริมณฑล",
] as const;

export type Region = (typeof REGIONS)[number];

/** ใช้กับ dropdown ในหน้า bulletin/map (ถ้ายังเรียกชื่อนี้อยู่) */
export const CATEGORY_OPTIONS = [...REGIONS];

/** ใช้กับหน้า bulletin */
export const BULLETINS = [
  { date: "12 ธันวาคม 2568", title: "หมายเหตุ:จดหมายวิชาการเกษตร", sub: "หน่วยงาน:กองพัฒนาอุตุนิยมวิทยา" },
  { date: "13 ธันวาคม 2568", title: "หมายเหตุ:จดหมายวิชาการเกษตร", sub: "หน่วยงาน:กองพัฒนาอุตุนิยมวิทยา" },
  { date: "14 ธันวาคม 2568", title: "หมายเหตุ:จดหมายวิชาการเกษตร", sub: "หน่วยงาน:กองพัฒนาอุตุนิยมวิทยา" },
  { date: "15 ธันวาคม 2568", title: "หมายเหตุ:จดหมายวิชาการเกษตร", sub: "หน่วยงาน:กองพัฒนาอุตุนิยมวิทยา" },
];

/** ใช้กับหน้า regional (เดิม) */
export const REGIONAL_ITEMS = [
  {
    region: "ภาคกลาง",
    desc: "Description. Lorem ipsum dolor sit amet.",
    maxRain: 35.2,
    minTemp: 12.0,
    maxTemp: 22.0,
  },
  {
    region: "ภาคเหนือ",
    desc: "Description. Lorem ipsum dolor sit amet.",
    maxRain: 20.1,
    minTemp: 14.0,
    maxTemp: 28.0,
  },
  {
    region: "ภาคอีสาน",
    desc: "Description. Lorem ipsum dolor sit amet.",
    maxRain: 12.5,
    minTemp: 16.0,
    maxTemp: 30.0,
  },
];
