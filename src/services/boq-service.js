class BoQService {
  constructor(orbitdb) {
    this.orbitdb = orbitdb;
    this.boqdb = null;
    this._assigned = '';
  }

  async loadDb(project_hash) {
    if (this._assigned !== project_hash) {
      const boqdb = await this.orbitdb.docs(`projects.${project_hash}.boqs`, {
        indexBy: 'hash',
        create: true,
        accessController: {
          write: ['*'],
        },
      });
      await boqdb.load();
      this._assigned = project_hash;
      this.boqdb = boqdb;
      console.log('loaded db from loadDb', this.boqdb);
    }
    return this.boqdb;
  }

  async get(project_hash, hash) {
    await this.loadDb(project_hash);
    return this.boqdb.get(hash);
  }

  async getAll(project_hash) {
    return this.query(project_hash, (item) => item);
  }

  async query(project_hash, queryFn) {
    await this.loadDb(project_hash);
    return this.boqdb.query(queryFn);
  }

  async put(project_hash, node) {
    await this.loadDb(project_hash);
    const hash = await this.boqdb.put(node);
    return hash;
  }

  async putAll(project_hash, nodes) {
    await this.loadDb(project_hash);
    const boq = await Object.keys(nodes).map(
      async (key) => await this.boqdb.put(nodes[key])
    );
    return boq;
  }

  async removeAll(project_hash) {
    console.log('remove all boqs from project', project_hash);
    const all = await this.getAll(project_hash);
    const boqs = await all.map(async (item) => await this.boqdb.del(item.hash));
    await this.boqdb.drop();
    return boqs;
  }
}

export default BoQService;
