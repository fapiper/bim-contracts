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
      });
      await boqdb.load();
      this._assigned = project_hash;
      this.boqdb = boqdb;
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
    const boqdb = await this.loadDb(project_hash);
    const boq = await Promise.all(
      Object.keys(nodes).map((key) => boqdb.put(nodes[key]))
    );
    return boq;
  }
}

export default BoQService;
