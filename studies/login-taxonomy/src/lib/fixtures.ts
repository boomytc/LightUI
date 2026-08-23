import { loc, type Localized } from "./site-locale";
import type { RoleId } from "./machines";

export const EMAIL_PLACEHOLDER = "sue@north.studio";
export const PASSWORD_PLACEHOLDER = "••••••••";
export const PHONE_PLACEHOLDER = "138 0000 0000";
export const CODE_PLACEHOLDER = "826419";

export const ROLES: { id: RoleId; label: Localized }[] = [
  { id: "personal", label: loc("个人用户", "Personal") },
  { id: "enterprise", label: loc("企业管理员", "Enterprise") },
];

export const COPY = {
  welcome: loc("欢迎回来", "Welcome back"),
  continueDesk: loc("登录以继续使用工作台", "Sign in to open the desk"),
  continueStudio: loc("登录以继续使用创作工作台", "Sign in to keep making"),
  continueTrail: loc("登录以继续你的旅程", "Sign in to keep travelling"),
  email: loc("邮箱", "Email"),
  password: loc("密码", "Password"),
  phone: loc("手机号", "Phone"),
  code: loc("验证码", "Code"),
  workEmail: loc("企业邮箱", "Work email"),
  signIn: loc("登录", "Sign in"),
  forgot: loc("忘记密码？", "Forgot password?"),
  continue: loc("继续", "Continue"),
  back: loc("返回修改邮箱", "Back to email"),
  stepEmailTitle: loc("输入邮箱", "Enter your email"),
  stepEmailHint: loc("一屏只做一件事", "One job on this screen"),
  stepPasswordTitle: loc("输入密码", "Enter your password"),
  personalTitle: loc("个人账号登录", "Personal sign-in"),
  personalHint: loc("手机号进入个人空间", "Phone, into a personal space"),
  enterpriseTitle: loc("企业管理员登录", "Admin sign-in"),
  enterpriseHint: loc("企业邮箱进入管理后台", "Work email, into admin"),
  brandKicker: loc("North Studio", "North Studio"),
  brandTitle: loc("把每一个模糊灵感变成清晰作品", "Turn a fuzzy spark into a clear piece"),
  brandBody: loc("项目、素材和灵感，都在一个工作台里。", "Projects, assets, and sparks in one desk."),
  trailTitle: loc("下一站，出发", "Next stop — go"),
  trailBody: loc("登录旅行账户，继续整理收藏的目的地。", "Open the travel account; keep the places you saved."),
};
