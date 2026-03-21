// In-memory singleton for tracking background job progress
let state = { running: false, current: 0, total: 0, label: '', done: false, result: null };

export function startProgress(label, total) {
  state = { running: true, current: 0, total, label, done: false, result: null };
}

export function incrementProgress() {
  if (state.running) state.current = Math.min(state.current + 1, state.total);
}

export function endProgress(result = null) {
  state = { ...state, running: false, done: true, result };
}

export function getProgress() {
  return { ...state };
}
