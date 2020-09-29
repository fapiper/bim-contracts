import { abi as ServiceAgreementFactoryAbi } from 'src/contracts/ServiceAgreementFactory.json';
import { abi as ServiceAgreementAbi } from 'src/contracts/ServiceAgreement.json';

import Assignment from 'src/models/assignment-model';

const ServiceAgreementFactoryAddress =
  '0x6A411718bAFb6E0bFD9fBD78a84A8605d57725c0';

const null32bytes = 0x0000000000000000000000000000000000000000000000000000000000000000;
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
    const contract = new this.web3.eth.Contract(ServiceAgreementAbi, address);
    return contract.methods.getServiceStage(hash).call();
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
      assignment.service.stage = await this._getStage(
        assignment.address,
        assignment.service.hash
      );
      return assignment;
    };
    const _assignments = await this.query(project_hash, (item) => item);
    const assignments = await Promise.all(_assignments.map(build));
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

  async assign(project_hash, service, client, contractor) {
    service.project_hash = project_hash;
    const handleFn = async (node) =>
      this.boqService.query(project_hash, (item) =>
        node.children.some((hash) => item.hash === hash)
      );
    const _nodes = await flatHandle(service, handleFn);
    const nodes = Array.isArray(_nodes) ? _nodes : [_nodes];

    // Store assignment on chain
    const children = nodes.map((c) => c.hash);
    const parents = nodes.map((c) => c.parent);
    const billings = nodes.map((c) => c.billing_item !== null);
    const res = await this.factoryContract.methods
      .createServiceAgreement(
        service.hash,
        service.parent || null32bytes,
        client.address,
        contractor.address,
        children,
        parents,
        billings,
        []
      )
      .send({ from: client.address, gas: 2000000 });

    const assignment = new Assignment(
      res.events.ServiceAgreementCreated.returnValues._address,
      service,
      client,
      contractor
    );
    console.log('put', assignment);
    await this.put(project_hash, assignment);
    return assignment;
  }

  async nextStage(assignment, service) {
    const stageToFunction = {
      1: 'startService',
      2: 'finishService',
      3: 'approveService',
      4: 'payService',
      5: 'rejectService',
    };
    console.log('nextStage', assignment, service);
    const contract = new this.web3.eth.Contract(
      ServiceAgreementAbi,
      assignment.address
    );
    console.log('got contract', contract);
    const res = await contract.methods[stageToFunction[service.stage]](
      service.hash
    ).send({ from: assignment.client.address, gas: 2000000 });
    console.log('res', res);
    return res;
  }
}

export default AssignmentService;
