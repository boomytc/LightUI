export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

export type FileKind = "design" | "doc" | "deck" | "sheet" | "data" | "image" | "archive";

export type SampleFile = {
  id: string;
  name: string;
  size: string;
  kind: FileKind;
  type: { zh: string; en: string };
  date: { zh: string; en: string };
};

export const SAMPLE_FILES: SampleFile[] = [
  { id: "f1", name: "Design System v2.fig", size: "48.2 MB", kind: "design", type: { zh: "Figma 设计", en: "Figma" }, date: { zh: "今天 10:24", en: "Today 10:24" } },
  { id: "f2", name: "User Research.pdf", size: "12.4 MB", kind: "doc", type: { zh: "PDF 文稿", en: "PDF" }, date: { zh: "今天 09:40", en: "Today 09:40" } },
  { id: "f3", name: "Brand Guidelines.key", size: "85.1 MB", kind: "deck", type: { zh: "演示文稿", en: "Keynote" }, date: { zh: "昨天", en: "Yesterday" } },
  { id: "f4", name: "Product Roadmap.xlsx", size: "3.2 MB", kind: "sheet", type: { zh: "电子表格", en: "Spreadsheet" }, date: { zh: "8月24日", en: "Aug 24" } },
  { id: "f5", name: "Component Audit.csv", size: "512 KB", kind: "data", type: { zh: "数据表", en: "Data table" }, date: { zh: "8月20日", en: "Aug 20" } },
  { id: "f6", name: "Hero Stills.zip", size: "128 MB", kind: "archive", type: { zh: "压缩包", en: "Archive" }, date: { zh: "8月18日", en: "Aug 18" } },
  { id: "f7", name: "Onboarding Flow.png", size: "2.8 MB", kind: "image", type: { zh: "图片", en: "Image" }, date: { zh: "8月12日", en: "Aug 12" } },
  { id: "f8", name: "Interview Notes.pdf", size: "640 KB", kind: "doc", type: { zh: "PDF 文稿", en: "PDF" }, date: { zh: "8月9日", en: "Aug 9" } },
];

export function fileById(id: string): SampleFile | undefined {
  return SAMPLE_FILES.find((file) => file.id === id);
}
