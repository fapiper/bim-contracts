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
    // const build = async (assignment) => {
    //   const contract = new this.web3.eth.Contract(
    //     ServiceAgreementAbi,
    //     '0x849dF15C88150517b0D16301318EE864b1f5486A'
    //   );
    //   console.log('got contract', contract);
    //   // const service = await contract.service.call({
    //   //   from: '0xbE020679ffBb4B8FE98f0B3f728D74c340199F56',
    //   // });
    //   // console.log('got contract service', service);
    //   const stage = await contract.methods
    //     .getServiceStage(assignment.service.hash)
    //     .call();
    //   assignment.stage = stage;
    //   console.log('got assignment', assignment);
    //   return assignment;
    // };
    const _assignments = await this.query(project_hash, (item) => item);
    // const assignments = await Promise.all(_assignments.map(build));
    return _assignments;
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
    console.log('put', assignment);
    await this.put(project_hash, assignment);
    return assignment;
  }

  async nextStage(assignment) {
    const stage = await this.factoryContract.methods.getServiceStage().call();
    console.log('got stage', stage);
    const res = await this.factoryContract.methods
      .setServiceStage(assignment.service.hash, 2)
      .send({ from: assignment.client_address, gas: 2000000 });
    console.log('got res', res);

    return res;
  }
}

export default AssignmentService;
