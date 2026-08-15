import { Grid2x2, Home, Star, User } from "lucide-react";
import { loc } from "./site-locale";

export const LINKS = [
  { id: "home", label: loc("首页", "Home"), icon: Home },
  { id: "tools", label: loc("工具", "Tools"), icon: Grid2x2 },
  { id: "inspire", label: loc("灵感", "Inspire"), icon: Star },
  { id: "about", label: loc("关于", "About"), icon: User },
] as const;
