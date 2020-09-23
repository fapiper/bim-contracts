import Project from 'src/models/project-model.js';

class ProjectService {
  constructor(boqService, orbitdb, projectdb) {
    this.boqService = boqService;
    this.orbitdb = orbitdb;
    this.projectdb = projectdb;
  }

  static async init(boqService, orbitdb) {
    const projectdb = await orbitdb.docs('projects', {
      indexBy: 'hash',
      create: true,
      accessController: {
        write: ['*'],
      },
    });
    await projectdb.load();
    return new ProjectService(boqService, orbitdb, projectdb);
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
    await billingdb.put(project.billing);
    await project.boqs.forEach(
      async (boq) => await this.boqService.putAll(project.hash, boq.nodes)
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
    await this.boqService.removeAll(hash);
    await drop('billings');
    // await this.boqService.drop(hash);
    const project = await this.projectdb.del(hash);
    return project;
  }
}

export default ProjectService;
