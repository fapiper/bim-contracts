export async function loadProject(state, id) {
  const res = await this._vm.$axios.get(`projects/${id}`);
  state.commit('setProject', res.data);
}

export async function addActor(state, actorId) {
  console.log('state', state);
  const res = await this._vm.$axios.post(
    `projects/${state.state.project._id}/addActor`,
    {
      actorId,
    }
  );
  state.commit('setProject', res.data);
  return res.data;
}
