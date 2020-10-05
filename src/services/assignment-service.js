import { abi as ServiceContractAbi } from 'src/contracts/ServiceContract.json';
import { serviceContract as ServiceContractAddress } from 'app/bim-contracts.config';

const n32 =
  '0x0000000000000000000000000000000000000000000000000000000000000000';

class AssignmentService {
  constructor(orbitdb, boqService, web3) {
    this.orbitdb = orbitdb;
    this.assignmentdb = null;
    this.boqService = boqService;
    this.web3 = web3;
    this.serviceContract = new web3.eth.Contract(
      ServiceContractAbi,
      ServiceContractAddress
    );
  }

  async loadDb(project_hash) {
    if (this._assigned !== project_hash) {
      const assignmentdb = await this.orbitdb.docstore(
        `projects.${project_hash}.assignments`,
        {
          indexBy: 'hash',
          create: true,
          accessController: {
            write: ['*'],
          },
        }
      );
      await assignmentdb.load();
      this._assigned = project_hash;
      this.assignmentdb = assignmentdb;
    }
    return this.assignmentdb;
  }

  async getAllByProject(project_hash) {
    const build = async (assignment) => {
      assignment.service.stage = await this.serviceContract.methods
        .stageOf(assignment.service.hash)
        .call();
      if (assignment.stage < assignment.service.stage) {
        assignment.stage = assignment.service.stage;
      }
      return assignment;
    };
    return this.query(project_hash, (item) => item).then((assignments) =>
      Promise.all(assignments.map(build))
    );
  }

  async getChildren(project_hash, service_hash) {
    const build = async (item) => {
      item.stage = await this.serviceContract.methods.stageOf(item.hash).call();
      return item;
    };
    const _items = await this.boqService.query(
      project_hash,
      (item) => item.parent === service_hash
    );
    const items = await Promise.all(_items.map(build));
    return items;
  }

  async getAllServices(project_hash, service) {
    const flatHandle = async (node, handleFn, collect = []) => {
      const children = await handleFn(node);
      const _collect = await Promise.all(
        children.map((child) => flatHandle(child, handleFn, collect))
      );
      _collect.push(node);
      return _collect.flat();
    };
    return flatHandle(service, (node) =>
      this.boqService.query(project_hash, (item) =>
        node.children.some((hash) => item.hash === hash)
      )
    );
  }

  async put(project_hash, assignment) {
    const assignmentdb = await this.loadDb(project_hash);
    const hash = await assignmentdb.put(assignment);
    return hash;
  }

  async query(project_hash, queryFn) {
    const assignmentdb = await this.loadDb(project_hash);
    const assignments = await assignmentdb.query(queryFn);
    return assignments;
  }

  async assign(project_hash, assignment) {
    await this.serviceContract.methods
      .createServiceContract(assignment.hash, assignment.contractor.address)
      .send({ from: assignment.client.address, gas: 2000000 });
    const services = await this.getAllServices(
      project_hash,
      assignment.service
    );
    const sections = services.filter((s) => !s.qty);
    for (const section of sections) {
      const items = services.filter((s) => s.parent === section.hash);
      const billings = items.map(
        (s) => (s.billing_item && s.billing_item.hash) || n32
      );
      await this.serviceContract.methods
        .addServiceSection(
          assignment.hash,
          section.hash,
          items.map((item) => item.hash),
          billings
        )
        .send({ from: assignment.client.address, gas: 2000000 });
    }

    await this.put(project_hash, assignment);
    return assignment;
  }

  async handleTransition(project_hash, contractor_address, service, method) {
    const services = await this.getAllServices(project_hash, service).then(
      async (services) => {
        for (const _service of services) {
          _service.stage = await this.serviceContract.methods
            .stageOf(_service.hash)
            .call();
          if (_service.stage < service.stage + 1) {
            await this.serviceContract.methods[method](_service.hash).send({
              from: contractor_address,
              gas: 2000000,
            });
          }
        }
        return services;
      }
    );
    return services;
  }
}

export default AssignmentService;
