export async function loadProject(state, hash) {
  const projects = await this._vm.$services.project.get(hash);
  state.commit('setProject', projects[0]);
}

export async function loadAssignments(state, project_hash) {
  const assignments = await this._vm.$services.assignment.getAll(project_hash);
  state.commit('setAssignments', assignments);
}
