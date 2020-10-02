export async function loadProject(state, hash) {
  const projects = await this._vm.$services.project.get(hash);
  console.log('got project', projects);
  state.commit('setProject', projects[0]);
}

export async function loadAssignments(state, project_hash) {
  const assignments = await this._vm.$services.assignment.getAllByProject(
    project_hash
  );
  state.commit('setAssignments', assignments);
}
