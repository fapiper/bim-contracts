function buildProject(project) {
  project.actors.forEach((actor) => {
    const actorAddress = actor;
    actor = this.query((a) => a.address === actorAddress).then((res) => res[0]);
  });
}

export async function loadProjects(state, user) {
  const userdb = await this._vm.$orbitdb.docs('users');
  const res = await this._vm.$axios.get(`users/${user._id}/projects`);
  const projects = res.data;
  if (res.data.length > 0) await userdb.load();
  projects.forEach(buildProject.bind(userdb));
  state.commit('setProjects', projects);
}

export async function loadProject(state, id) {
  const userdb = await this._vm.$orbitdb.docs('users');
  const res = await this._vm.$axios.get(`projects/${id}`);
  const project = res.data;
  await userdb.load();
  buildProject.call(userdb, project);
  state.commit('setProject', res.data);
}

export async function addActor(state, actorAddress) {
  const userdb = await this._vm.$orbitdb.docs('users');
  await userdb.load();
  const actors = this.query((a) => a.address === actorAddress);
  if (actors.length <= 0) throw new Error('Actor not found');
  const res = await this._vm.$axios.post(
    `projects/${state.state.project._id}/addActor`,
    {
      actorAddress,
    }
  );
  const project = res.data;
  buildProject.call(userdb, project);
  state.commit('setProject', project);
  return project;
}
