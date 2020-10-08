import Project from 'src/models/project-model.js';
import Assignment from 'src/models/assignment-model.js';
import { User } from 'src/models/user-model.js';

class ProjectService {
  constructor(boqService, assignmentService, orbitdb, projectdb) {
    this.boqService = boqService;
    this.assignmentService = assignmentService;
    this.orbitdb = orbitdb;
    this.projectdb = projectdb;
  }

  static async init(boqService, assignmentService, orbitdb) {
    const projectdb = await orbitdb.docs('projects', {
      indexBy: 'hash',
      create: true,
      accessController: {
        write: ['*'],
      },
    });
    await projectdb.load();
    return new ProjectService(
      boqService,
      assignmentService,
      orbitdb,
      projectdb
    );
  }

  async get(hash) {
    return this.projectdb.get(hash);
  }

  async query(queryFn) {
    const all = await this.projectdb.query((i) => i);
    console.log('all projects', all);
    return this.projectdb.query(queryFn);
  }

  async addProject(project, client, contractor, { billing, boqs }) {
    const billingdb = await this.orbitdb.keyvalue(
      `projects.${project.hash}.billings`
    );
    await billingdb.put(billing);
    await Promise.all(
      boqs.map((boq) => this.boqService.putAll(project.hash, boq.nodes))
    );
    const service = Project.toServiceSection(project);
    service.children = boqs.flatMap((boq) => boq.roots);
    const assignment = new Assignment(
      project.name,
      service,
      User.toStore(client),
      contractor
    );
    const res = Project.toStore(project);
    await this.projectdb.put(Project.toStore(project));
    await this.assignmentService.assign(project.hash, assignment);
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
