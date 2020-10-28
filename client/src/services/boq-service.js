class BoQService {
  constructor(orbitdb) {
    this.orbitdb = orbitdb;
    this.boqdb = null;
    this._assigned = '';
  }

  async loadDb(projectId) {
    if (this._assigned !== projectId) {
      console.log('load boqdb', `projects.boqs`);
      const boqdb = await this.orbitdb.docs(`projects.boqs`, {
        indexBy: 'hash',
        create: true,
        accessController: {
          write: ['*'],
        },
      });
      boqdb.events.on('replicated', (args) => {
        console.log('replicated services', ...args);
      });

      await boqdb.load();
      this._assigned = projectId;
      this.boqdb = boqdb;
    }
    return this.boqdb;
  }

  async get(projectId, hash) {
    await this.loadDb(projectId);
    return this.boqdb.get(hash);
  }

  async getAll(projectId) {
    return this.query(projectId, (item) => item);
  }

  async query(projectId, queryFn) {
    await this.loadDb(projectId);
    return this.boqdb.query(queryFn);
  }

  async put(projectId, node) {
    await this.loadDb(projectId);
    const hash = await this.boqdb.put(node);
    return hash;
  }

  async putAll(projectId, nodes) {
    const boqdb = await this.loadDb(projectId);
    return boqdb.putAll(Object.values(nodes));
  }
}

export default BoQService;
