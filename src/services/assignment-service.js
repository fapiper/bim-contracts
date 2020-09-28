import { abi as ServiceAgreementFactoryAbi } from 'src/contracts/ServiceAgreementFactory.json';
import { abi as ServiceAgreementAbi } from 'src/contracts/ServiceAgreement.json';

import Assignment from 'src/models/assignment-model';

const ServiceAgreementFactoryAddress =
  '0x3AA550487A462473B282cbDFf6b1Dd53ed4034A8';

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

  async getAll(project_hash) {
    return this.query(project_hash, (item) => item);
  }

  async getAssignmentsByClient(project_hash, client_address) {
    return this.query(
      project_hash,
      (item) => (item.client_address = client_address)
    );
  }

  async getAssignmentsByContractor(project_hash, contractor_address) {
    return this.query(
      project_hash,
      (item) => (item.contractor_address = contractor_address)
    );
  }

  async put(project_hash, assignment) {
    console.log('put', assignment);
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
    // const status = 1;
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
    await this.put(project_hash, assignment);
    return assignment;
  }

  async transitionNext(assignment) {
    assignment.status++;
    // Update assignment in db of contractor
    await this.put(assignment.contractor.address, assignment);

    // Update boq item status in project db
    const handleFn = async (node) => {
      const children = await this.boqService.query(
        assignment.service.project_hash,
        (item) => node.children.some((hash) => item.hash === hash)
      );
      node.status = assignment.status;
      const updated = Promise.all(
        children.map(async (child) => {
          child.status = node.status;
          return child;
        })
      );
      return updated;
    };
    const nodes = await flatHandle(assignment.service, handleFn);

    // Store assignment on chain
    // const children = nodes.map((c) => c.hash);
    // const parents = nodes.map((c) => c.parent);
    // const billings = nodes.map((c) => c.billing_item !== null);
    // await this.factoryContract.methods
    //   .createServiceAgreement(
    //     service.hash,
    //     service.parent,
    //     client.address,
    //     contractor.address,
    //     children,
    //     parents,
    //     billings,
    //     []
    //   )
    //   .send({ from: client.address, gas: 2000000 });
    return nodes;
  }
}

export default AssignmentService;
