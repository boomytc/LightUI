export type RevealState = { visible: number; playing: boolean; run: number };
export type Action =
  | { type: "play" | "pause" | "restart" | "next" | "complete" }
  | { type: "tick"; run: number };
export function initialState(total: number): RevealState {
  return { visible: Math.min(1, total), playing: false, run: 0 };
}
export function transition(
  state: RevealState,
  action: Action,
  total: number,
): RevealState {
  if (action.type === "pause")
    return { ...state, playing: false, run: state.run + 1 };
  if (action.type === "complete") {
    if (state.visible === total && !state.playing) return state;
    return { ...state, visible: total, playing: false, run: state.run + 1 };
  }
  if (action.type === "restart")
    return {
      visible: Math.min(1, total),
      playing: total > 1,
      run: state.run + 1,
    };
  if (action.type === "play")
    return { ...state, playing: state.visible < total };
  if (action.type === "tick" && (!state.playing || action.run !== state.run))
    return state;
  const visible = Math.min(total, state.visible + 1);
  return {
    ...state,
    visible,
    playing: action.type === "tick" && visible < total,
    run: action.type === "next" ? state.run + 1 : state.run,
  };
}
