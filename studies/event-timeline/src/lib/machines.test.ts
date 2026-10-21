import assert from "node:assert/strict";
import { test } from "node:test";
import { initialState, transition } from "./machines";
test("pause and restart reject a queued callback from the old run", () => {
  let state = transition(initialState(4), { type: "restart" }, 4);
  const old = state.run;
  state = transition(state, { type: "pause" }, 4);
  assert.deepEqual(transition(state, { type: "tick", run: old }, 4), state);
  state = transition(state, { type: "restart" }, 4);
  assert.deepEqual(transition(state, { type: "tick", run: old }, 4), state);
  assert.equal(
    transition(state, { type: "tick", run: state.run }, 4).visible,
    2,
  );
});
test("completion stops playback and next cannot overshoot", () => {
  let state = transition(initialState(2), { type: "play" }, 2);
  state = transition(state, { type: "tick", run: state.run }, 2);
  assert.equal(state.visible, 2);
  assert.equal(state.playing, false);
  assert.equal(transition(state, { type: "next" }, 2).visible, 2);
  assert.deepEqual(initialState(0), { visible: 0, playing: false, run: 0 });
});

test("reduced-motion completion is idempotent; manual next invalidates a run", () => {
  const playing=transition(initialState(4),{type:"restart"},4);
  const next=transition(playing,{type:"next"},4);
  assert.deepEqual(transition(next,{type:"tick",run:playing.run},4),next);
  const complete=transition(playing,{type:"complete"},4);
  assert.equal(transition(complete,{type:"complete"},4),complete);
});
