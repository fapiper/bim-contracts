export async function loadProject(state, hash) {
  const projectdb = await this._vm.$orbitdb.projectdb;
  await projectdb.load();
  const projects = await projectdb.get(hash);
  state.commit('setProject', projects[0]);
}
