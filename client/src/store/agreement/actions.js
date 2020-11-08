export async function addContainer(state, { project, container }) {
  const { boqs } = container;
  const services = Object.values(boqs[0].nodes);
  const servicedb = await this._vm.$orbitdb.docs(
    `projects.${project._id}.services`,
    {
      accessController: {
        write: ['*'],
      },
    }
  );

  await servicedb.putAll(services);
  return services;
}
