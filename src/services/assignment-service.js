import { abi as ServiceAgreementFactoryAbi } from 'src/contracts/ServiceAgreementFactory.json';
import { abi as ServiceAgreementAbi } from 'src/contracts/ServiceAgreement.json';

import Assignment from 'src/models/assignment-model';

const ServiceAgreementFactoryAddress =
  '0xEe44B9702161FC3BA816E858640eE3749d02FEF2';

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
      assignment.stage = await this._getStage(
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

  // async removeAll(project_hash) {
  //   const all = await this.getAll(project_hash);
  //   const assignments = Promise.all(
  //     all.map(async (a) => await this.assignmentdb.del(a.hash))
  //   );
  //   await this.assignmentdb.drop();
  //   return assignments;
  // }

  async checkForUpdates(project_hash) {
    return this.query(project_hash, (a) => !a.visited);
  }

  async assign(project_hash, service, client, contractor) {
    service.project_hash = project_hash;
    // Store assignment in db of contractor

    // Update boq item status in project db
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

    // TODO store full data (service has to be typeof boq item; client + contractor must be known)
    const assignment = new Assignment(
      res.events.ServiceAgreementCreated.returnValues._address,
      service.id,
      service.short_desc || service.name,
      service.children,
      service.parent,
      service.hash,
      client.address,
      contractor.address
    );
    console.log('put', assignment);
    await this.put(project_hash, assignment);
    return assignment;
  }

  async nextStage(assignment) {
    const contract = new this.web3.eth.Contract(
      ServiceAgreementFactoryAbi,
      assignment.address
    );

    const res = await contract.methods
      .setServiceStage(assignment.stage + 1)
      .send({ from: assignment.client_address, gas: 2000000 });
    console.log('res', res);
    return res;
  }
}

export default AssignmentService;
