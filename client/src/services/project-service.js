class ProjectService {
  constructor(boqService, orbitdb) {
    this.boqService = boqService;
    this.orbitdb = orbitdb;
  }

  async put(project, { billing, boqs }) {
    const billingdb = await this.orbitdb.keyvalue(
      `projects.${project._id}.billings`
    );
    await billingdb.put(billing);
    return Promise.all(
      boqs.map((boq) => this.boqService.putAll(project._id, boq.nodes))
    );
  }
}

export default ProjectService;
