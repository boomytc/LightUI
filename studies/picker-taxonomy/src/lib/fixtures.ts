import { day, type DateSpan, type Day, type Region } from "./machines";

export const RULER = {
  min: 30,
  max: 150,
  step: 0.1,
  pxPerUnit: 100,
  value: 60,
} as const;

export const RANGE = {
  min: 0,
  max: 1000,
  step: 10,
  gap: 10,
  lo: 100,
  hi: 800,
} as const;

export const STEPPER = {
  min: 1,
  max: 99,
  step: 1,
  qty: 1,
} as const;

export const PRODUCT = {
  nameZh: "棉质收纳袋",
  nameEn: "Cotton pouch",
  price: 29,
} as const;

export const LEVEL_LABEL = {
  zh: ["请选择省", "请选择市", "请选择区"],
  en: ["Province", "City", "District"],
} as const;

export const REGIONS: Region[] = [
  {
    name: "江苏省",
    children: [
      {
        name: "南京市",
        children: [{ name: "玄武区" }, { name: "秦淮区" }, { name: "鼓楼区" }],
      },
      {
        name: "苏州市",
        children: [{ name: "姑苏区" }, { name: "吴中区" }, { name: "工业园区" }],
      },
    ],
  },
  {
    name: "浙江省",
    children: [
      {
        name: "杭州市",
        children: [{ name: "上城区" }, { name: "拱墅区" }, { name: "西湖区" }],
      },
      {
        name: "宁波市",
        children: [{ name: "海曙区" }, { name: "江北区" }, { name: "鄞州区" }],
      },
    ],
  },
  {
    name: "广东省",
    children: [
      {
        name: "广州市",
        children: [{ name: "天河区" }, { name: "越秀区" }, { name: "海珠区" }],
      },
      {
        name: "深圳市",
        children: [{ name: "南山区" }, { name: "福田区" }, { name: "罗湖区" }],
      },
    ],
  },
];

export const CASCADE_PATH = ["浙江省", "杭州市", "西湖区"] as const;

/** Frozen so the stage does not drift with the clock. */
export const TODAY: Day = day(2026, 8, 20);

export const DATE_MONTH: Day = day(2026, 8, 1);

export const DATE_SPAN: DateSpan = {
  from: day(2026, 8, 20),
  to: day(2026, 8, 23),
};
