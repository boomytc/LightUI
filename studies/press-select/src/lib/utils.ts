export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

export const SAMPLE_FILES = [
  { id: "f1", name: "Design_System_v2.fig", size: "48.2 MB", type: "Figma File", date: "10:24" },
  { id: "f2", name: "User_Research_Interviews.pdf", size: "12.4 MB", type: "PDF Document", date: "09:40" },
  { id: "f3", name: "Brand_Guidelines_2026.key", size: "85.1 MB", type: "Presentation", date: "Yesterday" },
  { id: "f4", name: "Product_Roadmap_Q3.xlsx", size: "3.2 MB", type: "Spreadsheet", date: "Aug 24" },
  { id: "f5", name: "Component_Audit_Log.csv", size: "512 KB", type: "Data Table", date: "Aug 20" },
];
