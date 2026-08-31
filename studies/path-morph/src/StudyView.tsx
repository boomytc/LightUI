import { pick, useLocale } from "./lib/site-locale";
import { Playground } from "./morph/Playground";

const RULES = [
  {
    n: "1",
    title: { zh: "2D Procrustes 相似分解", en: "2D Procrustes Similarity" },
    example: {
      zh: "闭式解自然求解旋转角 θ* 与缩放 σ*，无需手工配置旋转组",
      en: "Closed-form optimal similarity yields θ* and σ* naturally without manual grouping",
    },
  },
  {
    n: "2",
    title: { zh: "极坐标插值杜绝弦长塌陷", en: "Polar Interpolation Avoids Chord Collapse" },
    example: {
      zh: "刚体在极坐标系线性旋转、对数线性缩放，中间帧绝不缩小变形",
      en: "Rigid rotation in polar space + log-linear scale; intermediate frames never shrink",
    },
  },
  {
    n: "3",
    title: { zh: "角点锚定等弧长重采样", en: "Corner-Anchored Arc-Length Resampling" },
    example: {
      zh: "8 点高斯积分 + 转角锚定，静止态端点 100% 保真，途中角点平滑锐化",
      en: "Gauss-Legendre arc length + corner anchors: exact rest fidelity, smooth sharpening",
    },
  },
  {
    n: "4",
    title: { zh: "满射配对与细胞分裂", en: "Surjective Matching & Cell Division" },
    example: {
      zh: "子路径数量不一时，邻近路径原地复制分裂，无凭空消失与点坍缩",
      en: "When subpath counts differ, nearest paths divide in place instead of vanishing",
    },
  },
];

export function StudyView() {
  const locale = useLocale();

  return (
    <div className="page-width min-w-0 overflow-x-hidden pb-20">
      {/* Header section */}
      <section className="grid gap-8 pb-10 pt-4 lg:grid-cols-[1.15fr_0.85fr] lg:items-end lg:gap-16 lg:pb-12 lg:pt-8">
        <div className="min-w-0">
          <h1 className="text-[2rem] font-semibold leading-[1.15] tracking-tight text-fg sm:text-[2.6rem]">
            {locale === "en"
              ? "Vector path morphing: Coordinate lerp or Polar Procrustes?"
              : "矢量路径变形：按坐标硬插值，还是极坐标相似分解？"}
          </h1>
          <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-fg-muted">
            {locale === "en"
              ? "Naive coordinate lerp sends rotating vertices along the chord, causing icons to shrink and shear mid-flight. Polar Procrustes decomposes motion into pure similarity rotation and residual shape deformation."
              : "朴素坐标插值让旋转点沿弦长运动，导致中间帧图形向内塌陷缩小。极坐标 Procrustes 分解将运动拆为刚体相似旋放与极坐标残差形变，旋转自然涌现。"}
          </p>
        </div>
        <p className="text-[13px] leading-relaxed text-fg-subtle">
          {locale === "en"
            ? "Inspect the side-by-side live comparison below. Toggle scrubber, spring physics, and geometry anchors."
            : "拖动下方时间轴对比左右两幅中间帧差异，切换弹簧物理与几何探针观察数学解算。"}
        </p>
      </section>

      {/* Main Interactive Playground */}
      <Playground />

      {/* Core Rules Strip */}
      <section className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {RULES.map((item) => (
          <div
            key={item.n}
            className="flex gap-3 rounded-xl border border-border bg-surface px-3 py-3"
          >
            <span className="inline-grid size-5 shrink-0 place-items-center rounded-md bg-fg text-[10px] font-semibold text-surface">
              {item.n}
            </span>
            <div className="min-w-0">
              <h2 className="text-[13px] font-semibold">{pick(item.title, locale)}</h2>
              <p className="mt-0.5 text-[12px] text-fg-muted">
                {pick(item.example, locale)}
              </p>
            </div>
          </div>
        ))}
      </section>

      {/* Deep-dive analysis and Code machine */}
      <section className="mt-14 grid min-w-0 gap-10 lg:grid-cols-2">
        <article className="min-w-0">
          <h2 className="text-[1.35rem] font-semibold tracking-tight">
            {locale === "en" ? "Why naive lerp fails" : "为什么朴素插值会崩坏"}
          </h2>
          <ol className="mt-5 space-y-4 text-[14px] leading-relaxed text-fg-muted">
            <li>
              <span className="font-medium text-fg">
                {locale === "en"
                  ? "1. Rotation along the chord shrinks the intermediate frame"
                  : "1. 旋转沿弦长走导致中间帧缩小塌陷"}
              </span>
              <br />
              {locale === "en"
                ? "In ArrowRight → ArrowDown, (1-t)A + tB forces the arrowhead to travel through (12, 12) at t=0.5, shrinking by ~30% instead of pivoting around its centroid."
                : "右箭头转下箭头时，坐标线性插值会让箭头在 t=0.5 时沿对角线抄近路，导致头部向中心收缩近 30%，产生无力的软绵感。"}
            </li>
            <li>
              <span className="font-medium text-fg">
                {locale === "en"
                  ? "2. Minimal-rotation tie-break (λ) resolves line inversion"
                  : "2. 最小旋转偏置（λ）防止 135° 大回环"}
              </span>
              <br />
              {locale === "en"
                ? "A symmetric straight line yields residual 0 in both directions. The tie-break score = res + λ·|θ|/π ensures hamburger lines fold ±45° instead of flipping 135°."
                : "直线等反演对称图形在正反两个遍历方向上的残差都是 0。评分函数引入 λ 偏置，确保汉堡菜单线按最近的 ±45° 折叠，而非怪异的 135° 大翻转。"}
            </li>
            <li>
              <span className="font-medium text-fg">
                {locale === "en"
                  ? "3. Surjective cell division avoids disappearing geometry"
                  : "3. 满射配对与细胞分裂避免凭空消失"}
              </span>
              <br />
              {locale === "en"
                ? "When subpath count changes (e.g. 1 triangle to 2 pause bars), the nearest subpath duplicates in place and separates smoothly, reading like organic cell division."
                : "子路径数量不等时，较少的一侧原地复制并同位分裂。在视觉上呈现为自然的细胞分裂，彻底避免了从单一零尺寸点凭空爆开的生硬感。"}
            </li>
          </ol>
        </article>

        <article className="min-w-0 overflow-hidden rounded-2xl border border-border bg-fg px-5 py-5 text-surface shadow-card sm:px-6">
          <p className="text-[12px] font-medium uppercase tracking-[0.12em] text-surface/45">
            Polar Procrustes Formula
          </p>
          <pre className="mt-3 overflow-x-auto font-mono text-[12px] leading-relaxed text-surface/85">
{`// 1. Closed-form 2D Procrustes (Optimal Similarity)
θ* = atan2(S_xy - S_yx, S_xx + S_yy)
σ* = [cos(θ*)·(S_xx + S_yy) + sin(θ*)·(S_xy - S_yx)] / Σ‖a_i‖²

// 2. Polar Decomposition Interpolation
P(t) = c(t) + σ*ᵗ · R(t·θ*) · [(1 - t)·aᶜ + t·b̃]

// 3. Rigid Block Transport (Global Hybrid)
c_k(t) = c_{A,k} + t·drift + (σ*ᵗ·R(t·θ*) - I)·(c_{A,k} - g_A)`}
          </pre>
          <p className="mt-4 text-[12px] text-surface/65">
            {locale === "en"
              ? "All operations are pure, zero-DOM computations. 0.01~0.4ms execution budget per plan."
              : "纯数学流水线，零 DOM 依赖，单次 plan 耗时 0.01~0.4ms，支持任意无缝打断与物理外推。"}
          </p>
        </article>
      </section>
    </div>
  );
}
