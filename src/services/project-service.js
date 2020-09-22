import Project from 'src/models/project-model.js';

class ProjectService {
  constructor(orbitdb, projectdb) {
    this.orbitdb = orbitdb;
    this.projectdb = projectdb;
  }

  static async init(orbitdb) {
    const projectdb = await orbitdb.docs('projects', {
      indexBy: 'hash',
      create: true,
      accessController: {
        write: ['*'],
      },
    });
    await projectdb.load();
    return new ProjectService(orbitdb, projectdb);
  }

  async get(hash) {
    return this.projectdb.get(hash);
  }

  query(queryFn) {
    return this.projectdb.query(queryFn);
  }

  async put(project) {
    const billingdb = await this.orbitdb.keyvalue(
      `projects.${project.hash}.billings`
    );
    const boqdb = await this.orbitdb.keyvalue(`projects.${project.hash}.boqs`);
    await billingdb.put(project.billing);
    await project.boqs.forEach(
      async (boq) =>
        await Object.keys(boq.nodes).forEach(
          async (item) => await boqdb.put(item.hash, item)
        )
    );
    const res = Project.toStore(project);
    await this.projectdb.put(res);
    return res;
  }

  async remove(hash) {
    const drop = async (id) => {
      const db = await this.orbitdb.keyvalue(`projects.${hash}.${id}`);
      await db.load();
      await Object.keys(db.all).forEach(
        async (item) => await db.del(item.hash)
      );
      await db.drop();
    };
    await drop('billings');
    await drop('boqs');
    const project = await this.projectdb.del(hash);
    return project;
  }
}

export default ProjectService;
