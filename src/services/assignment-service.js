import { abi as ServiceAgreementFactoryAbi } from 'src/contracts/ServiceAgreementFactory.json';
import { abi as ServiceAgreementAbi } from 'src/contracts/ServiceAgreement.json';

const ServiceAgreementFactoryAddress =
  '0x9e9d3a137F64585dcA38Eb6e9C62DF8B38CD59c4';

const null32bytes =
  '0x0000000000000000000000000000000000000000000000000000000000000000';
const flatHandle = async (node, handleFn) => {
  const children = await handleFn(node);
  return children.length > 0
    ? Promise.all(
        children.map((child) => flatHandle(child, handleFn))
      ).then((res) => res.flat())
    : node;
};

class AssignmentService {
  constructor(orbitdb, boqService, web3) {
    this.orbitdb = orbitdb;
    this.assignmentdb = null;
    this.boqService = boqService;
    this.web3 = web3;
    this.factoryContract = new web3.eth.Contract(
      ServiceAgreementFactoryAbi,
      ServiceAgreementFactoryAddress
    );
  }

  async _getStage(address, hash) {
    return this.factoryContract.methods.getServiceStage(hash).call();
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
      assignment.stage = 0;
      await Promise.all(
        assignment.services.map(async (service) => {
          service.stage = await this._getStage(
            assignment.address,
            service.hash
          );
          if (assignment.stage < service.stage)
            assignment.stage = service.stage;
          return service;
        })
      );
      return assignment;
    };
    const _assignments = await this.query(project_hash, (item) => item);
    const assignments = await Promise.all(_assignments.map(build));
    console.log('got assignments', assignments);

    return assignments;
  }

  async getChildren(project_hash, assignment) {
    const build = async (item) => {
      item.stage = await this._getStage(assignment.address, item.hash);
      return item;
    };
    const _items = await this.boqService.query(
      project_hash,
      (item) => item.parent === assignment.service.hash
    );
    const items = await Promise.all(_items.map(build));
    return items;
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

  async checkForUpdates(project_hash) {
    return this.query(project_hash, (a) => !a.visited);
  }

  async assign(
    project_hash,
    assignment,
    assignment_root,
    assignment_parent = null32bytes
  ) {
    const nodes = [];
    const handleFn = async (node) => {
      const services = await this.boqService.query(project_hash, (item) => {
        return node.children.some((hash) => item.hash === hash);
      });
      services.forEach((s) => (s.project_hash = project_hash));
      return services;
    };
    await assignment.services.forEach(async (service) => {
      const _nodes = await flatHandle(service, handleFn);
      if (Array.isArray(_nodes)) nodes.push(..._nodes);
      else nodes.push(_nodes);
    });

    console.log('assign', assignment);
    // Store assignment on chain
    const children = nodes.map((c) => c.hash);
    const parents = nodes.map((c) => c.parent || null32bytes);
    const billings = nodes.map((c) => c.billing_item !== null);
    console.log(
      'args',
      assignment_root,
      assignment_parent,
      assignment.client.address,
      assignment.contractor.address,
      children,
      parents,
      billings,
      []
    );

    const res = await this.factoryContract.methods
      .createServiceAgreement(
        assignment_root,
        assignment_parent,
        assignment.client.address,
        assignment.contractor.address,
        children,
        parents,
        billings,
        []
      )
      .send({ from: assignment.client.address, gas: 2000000 });

    assignment.address =
      res.events.ServiceAgreementCreated.returnValues._address;
    console.log('put', assignment);
    // await this.put(project_hash, assignment);
    return assignment;
  }

  async handleTransition(
    assignment_address,
    contractor_address,
    service_hash,
    method
  ) {
    console.log('set Transition', method);
    const contract = new this.web3.eth.Contract(
      ServiceAgreementAbi,
      assignment_address
    );
    console.log('got contract', contract);
    const res = await contract.methods[method](service_hash).send({
      from: contractor_address,
      gas: 2000000,
    });
    console.log('res', res);
    return res;
  }
}

export default AssignmentService;
