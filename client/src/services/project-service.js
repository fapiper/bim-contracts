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

  async query(queryFn) {
    const all = await this.projectdb.query((i) => i);
    console.log('all projects', all);
    return this.projectdb.query(queryFn);
  }

  async put(project_hash, { billing, boqs }) {
    const billingdb = await this.orbitdb.keyvalue(
      `projects.${project_hash}.billings`
    );
    await billingdb.put(billing);
    await Promise.all(
      boqs.map((boq) => this.boqService.putAll(project_hash, boq.nodes))
    );
    return project_hash;
  }

  async addProject(project, services) {
    console.log('put', services);

    await Promise.all(
      services.map((service) =>
        this.boqService.putAll(project.hash, service.nodes)
      )
    );
    const res = Project.toStore(project);
    await this.projectdb.put(Project.toStore(project));
    return res;
  }

  async addActor(project_hash, actor_address) {
    const projects = await this.get(project_hash);
    projects[0].actor_addresses.push(actor_address);
    const res = await this.projectdb.put(projects[0]);
    console.log('put', res);
    return projects[0];
  }
}

export default ProjectService;
