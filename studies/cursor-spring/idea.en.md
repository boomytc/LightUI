# Presence Cursor: Spring-Mass-Damper Trajectory Reconstruction

In real-time multiplayer collaborative applications (such as Figma, Miro, Linear, Liveblocks, collaborative canvases, and shared documents), multiple participants' cursors move concurrently across the viewport. Bandwidth and latency constraints dictate that remote cursor positions cannot be broadcast continuously at 60–120 Hz; instead, they are transmitted as sparse discrete packets at 8–20 Hz or lower.

If remote cursors simply teleport on packet arrival, motion appears jerky and stuttered. If linear interpolation (lerp) is used naively, directional momentum is lost, making turns feel sluggish and viscous. If CSS transitions are applied, incoming packets interrupt in-flight transitions, triggering visual jumps. How can a minimalist physics engine reconstruct sparse discrete coordinates into continuous trajectories with natural momentum and subtle overshoot on the client?

## What breaks without it

Without continuous physics-based smoothing, spatial awareness and the perception of presence degrade significantly:

1. **Stuttering Teleportation**: At 8–16 Hz, remote cursors hop discretely across the canvas, making trajectory tracking visually exhausting and giving a false impression of severe network failure.
2. **Viscous Drag**: Linear interpolation (`lerp`) lacks velocity states and momentum transfer during rapid turns, causing cursors to drag sluggishly like moving through thick mud without natural micro-overshoot.
3. **Jittery Retargeting**: With CSS `transition: transform/left/top`, new packets arriving mid-transition force the browser to reset transition origins, creating perceptible micro-teleportation glitches.

## The Rule

Employ a **second-order spring-mass-damper system** with **semi-implicit Euler integration** inside the client's `requestAnimationFrame` (rAF) render loop, completely decoupling network packet arrival frequency from local screen display refresh rates.

### 1. Equations of Motion

Model the remote cursor as a point mass pulled by a virtual spring toward the latest network coordinate:

$$a = \frac{-k \cdot (x - x_{\text{target}}) - c \cdot v}{m}$$

$$v \leftarrow v + a \cdot \Delta t$$

$$x \leftarrow x + v \cdot \Delta t$$

- **Stiffness ($k$)**: Spring force coefficient. Higher stiffness increases acceleration when chasing the target.
- **Damping ($c$)**: Friction coefficient. Dissipates kinetic energy and controls oscillation damping.
- **Mass ($m$)**: Virtual inertia mass. Higher mass softens turns and dampens sudden starts/stops.

### 2. Critical Damping and Damping Ratio

System behavior is governed by the dimensionless **damping ratio $\zeta$**:

$$\zeta = \frac{c}{2\sqrt{k \cdot m}}$$

- **Underdamped ($\zeta < 1$)**: Subtle momentum carries past the target on turns, producing a gentle micro-overshoot that closely mimics human neuromuscular hand dynamics (recommended default: $\zeta \approx 0.65$).
- **Critically Damped ($\zeta \approx 1$)**: Fastest approach without any overshoot, ideal for high-precision pointer tracking.
- **Overdamped ($\zeta > 1$)**: Heavy energy dissipation resulting in sluggish, viscous following.

### 3. Three Engineering Stability Rules

1. **Substepping with Delta Clamping**: Cap each frame's elapsed delta at $\Delta t \le 48\text{ms}$ and subdivide into $8\text{ms}$ substeps to prevent mathematical explosion when returning from background tabs.
2. **Deadband Settle**: In normalized unit space, when squared distance is $< 10^{-6}$ (approx. $< 0.8\text{px}$ on standard displays) and squared velocity is $< 10^{-4}$, snap directly to target and zero velocity to eliminate sub-pixel floating jitter.
3. **GPU Transform Push**: Apply position updates directly via `element.style.transform = translate3d(...)`, bypassing React component rerenders to preserve smooth 60/120fps throughput on the main thread.

## Why Not Naive Alternatives

| Approach | Mechanism | Failure Mode |
| --- | --- | --- |
| **Raw Teleportation** | Directly assign coordinates on packet arrival | 8–20 Hz discrete hops break visual continuity and eye tracking |
| **Linear Lerp** | $x \leftarrow x + (x_{\text{target}} - x) \cdot \lambda$ | No momentum or velocity state; fails to overshoot, feels sticky on sharp turns |
| **CSS Transition** | `transition: transform 100ms` | Retargeting on early packet arrivals resets origins, causing jumpy glitches |
| **Spline Interpolation** | Multi-point Hermite / Catmull-Rom fitting | Requires accumulating 2–3 historical samples, introducing 100–200ms mandatory latency |
| **Spring Integration (Ours)** | 2nd-order semi-implicit Euler + 8ms substeps | Zero buffer delay, dynamically absorbs network jitter, natural micro-overshoot |
