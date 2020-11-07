class ContainerDb {
  constructor(orbitdb) {
    this.orbitdb = orbitdb;
  }

  async add(projectId, container) {
    const { boqs } = container;
    const services = Object.values(boqs[0].nodes);
    const servicedb = await this.orbitdb.docs(
      `projects.${projectId}.services`,
      {
        indexBy: 'hash',
      }
    );
    await servicedb.putAll(services);
    return services;
  }
}

export default ContainerDb;
