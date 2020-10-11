export async function loadProject(state, hash) {
  const projects = await this._vm.$services.project.get(hash);
  state.commit('setProject', projects[0]);
}
