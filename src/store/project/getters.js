export function project(state) {
  return state.project;
}

export const assignments = (state) => (contractor_address) => {
  return state.assignments.filter(
    (a) => a.contractor_address === contractor_address
  );
};
export const awards = (state) => (client_address) => {
  return state.assignments.filter((a) => a.client_address === client_address);
};

export function newAssignments(state) {
  return state.assignments.filter((a) => !a.visited);
}
// export const check = (state) => (roles) =>
