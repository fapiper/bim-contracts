export async function loadProject(state, hash) {
  const projects = await this._vm.$services.project.get(hash);
  state.commit('setProject', projects[0]);
}

export async function loadAssignments(state, { project_hash, user_address }) {
  const queryFn = (assignment) =>
    assignment.service.project_hash === project_hash;
  const assignments = await this._vm.$services.assignment.query(
    user_address,
    queryFn
  );
  state.commit('setAssignments', assignments);
}
