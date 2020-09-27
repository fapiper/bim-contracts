export function project(state) {
  return state.project;
}

export function assignments(state) {
  return state.assignments;
}

export function newAssignments(state) {
  return state.assignments.filter((a) => !a.visited);
}
