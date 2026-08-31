import {
  allocOutputs,
  buildPlan,
  cubicsToPathD,
  detectCorners,
  iconToCubics,
  interpLinear,
  interpPolar,
  resampleIcon,
  serialize,
  type IconInput,
  type MorphPlan,
  type Sampled,
} from "./core";

export interface MorphMetrics {
  subpathsCount: number;
  maxResidual: number;
  primaryThetaDeg: number;
  primarySigma: number;
  isRigidCongruent: boolean;
  cornersA: number;
  cornersB: number;
  hasBlockTransport: boolean;
}

export interface MorphFrameResult {
  d: string;
  plan: MorphPlan;
  buffers: Float64Array[];
  metrics: MorphMetrics;
}

// Memory-efficient plan cache
const planCache = new Map<string, { plan: MorphPlan; sampledA: Sampled[]; sampledB: Sampled[] }>();

function iconKey(icon: IconInput): string {
  if (typeof icon === "string") return icon;
  return JSON.stringify(icon);
}

export function getOrBuildPlan(from: IconInput, to: IconInput, n = 64): {
  plan: MorphPlan;
  sampledA: Sampled[];
  sampledB: Sampled[];
} {
  const key = `${iconKey(from)}-->${iconKey(to)}@${n}`;
  const hit = planCache.get(key);
  if (hit) return hit;

  const sampledA = resampleIcon(from, n);
  const sampledB = resampleIcon(to, n);
  const plan = buildPlan(sampledA, sampledB);

  const entry = { plan, sampledA, sampledB };
  if (planCache.size > 200) planCache.clear();
  planCache.set(key, entry);
  return entry;
}

export function extractMetrics(from: IconInput, to: IconInput, plan: MorphPlan): MorphMetrics {
  const cubicsA = iconToCubics(from);
  const cubicsB = iconToCubics(to);

  const cornersA = cubicsA.reduce((sum, c) => sum + detectCorners(c).length, 0);
  const cornersB = cubicsB.reduce((sum, c) => sum + detectCorners(c).length, 0);

  let maxRes = 0;
  let mainTheta = 0;
  let mainSigma = 1;
  let blockTransport = false;

  for (const item of plan.items) {
    if (item.res > maxRes) maxRes = item.res;
    if (Math.abs(item.theta) > Math.abs(mainTheta)) {
      mainTheta = item.theta;
      mainSigma = Math.exp(item.lnSigma);
    }
    if (item.block !== null) {
      blockTransport = true;
    }
  }

  return {
    subpathsCount: plan.items.length,
    maxResidual: maxRes,
    primaryThetaDeg: (mainTheta * 180) / Math.PI,
    primarySigma: mainSigma,
    isRigidCongruent: maxRes < 5e-3,
    cornersA,
    cornersB,
    hasBlockTransport: blockTransport,
  };
}

export function computeMorphFrame(
  from: IconInput,
  to: IconInput,
  t: number,
  mode: "polar" | "linear" = "polar",
  n = 64,
): MorphFrameResult {
  const { plan } = getOrBuildPlan(from, to, n);
  const buffers = allocOutputs(plan);

  if (mode === "polar") {
    interpPolar(plan, t, buffers);
  } else {
    interpLinear(plan, t, buffers);
  }

  const closedFlags = plan.items.map((it) => it.closed);
  const d = serialize(buffers, closedFlags);
  const metrics = extractMetrics(from, to, plan);

  return {
    d,
    plan,
    buffers,
    metrics,
  };
}

/** Get at-rest canonical d string for an icon. */
export function getCanonicalD(icon: IconInput): string {
  const cubics = iconToCubics(icon);
  return cubicsToPathD(cubics);
}
