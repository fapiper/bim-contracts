export async function loadProject(state, id) {
  const res = await this._vm.$axios.get(`projects/${id}`);
  state.commit('setProject', res.data);
}
