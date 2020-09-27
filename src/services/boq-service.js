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
    const boq = await Promise.all(
      Object.keys(nodes).map((key) => this.boqdb.put(nodes[key]))
    );
    return boq;
  }

  async removeAll(project_hash) {
    const all = await this.getAll(project_hash);
    const boqs = await all.map(async (item) => await this.boqdb.del(item.hash));
    await this.boqdb.drop();
    return boqs;
  }

  async assign(project_hash, node) {
    const nodes = await this.boqService.get(project_hash, node);
    const assigned = nodes[0];
    assigned.status = 1;
    return assigned;
  }
}

export default BoQService;
