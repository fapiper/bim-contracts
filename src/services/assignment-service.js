import { abi as ServiceContractAbi } from 'src/contracts/ServiceContract.json';
import { serviceContract as ServiceContractAddress } from 'app/bim-contracts.config';

const n32 =
  '0x0000000000000000000000000000000000000000000000000000000000000000';
const flatHandle = async (node, handleFn, collect = []) => {
  const children = await handleFn(node);
  const _collect = await Promise.all(
    children.map((child) => flatHandle(child, handleFn, collect))
  );
  _collect.push(node);
  return _collect.flat();
};

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

  async _getStage(service) {
    return this.factoryContract.methods.stageOf(service).call();
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
          service.stage = await this._getStage(service.hash);
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
      item.stage = await this._getStage(item.hash);
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

  async assign(project_hash, assignment) {
    const res = await this.serviceContract.methods
      .createServiceContract(assignment.hash, assignment.contractor.address)
      .send({ from: assignment.client.address, gas: 2000000 });
    console.log('created contract', res);
    const handleFn = async (node) =>
      this.boqService.query(project_hash, (item) =>
        node.children.some((hash) => item.hash === hash)
      );
    const services = await flatHandle(assignment.service, handleFn);
    const sections = services.filter((s) => !s.qty);
    for (const section of sections) {
      const items = services.filter((s) => s.parent === section.hash);
      const billings = items.map(
        (s) => (s.billing_item && s.billing_item.hash) || n32
      );
      console.log(
        'add service payload',
        assignment.hash,
        section.hash,
        items.map((item) => item.hash),
        billings
      );
      const addRes = await this.serviceContract.methods
        .addServiceSection(
          assignment.hash,
          section.hash,
          items.map((item) => item.hash),
          billings
        )
        .send({ from: assignment.client.address, gas: 2000000 });
      console.log('created service section', addRes);
    }

    // await this.put(project_hash, assignment);
    // await Promise.all(
    //   services.map(async (service) => {
    //     const batch = new this.web3.BatchRequest();
    //     console.log('add', service);
    //     batch.add(
    //       this.serviceContract.methods
    //         .addService(assignment.hash, service.hash, service.parent)
    //         .send.request(
    //           {
    //             from: assignment.client.address,
    //             gas: 2000000,
    //           },
    //           (err, res) => {
    //             if (err) {
    //               console.error('Error adding', service, err, res);
    //             } else {
    //               console.log('added', service, res);
    //               return service;
    //             }
    //           }
    //         )
    //     );
    //     return batch.execute();
    //   })
    // );
    return assignment;
  }

  async handleTransition(
    assignment_address,
    contractor_address,
    service_hash,
    method
  ) {
    console.log('set Transition', method);
    const res = await this.serviceContract.methods[method](service_hash).send({
      from: contractor_address,
      gas: 2000000,
    });
    console.log('res', res);
    return res;
  }
}

export default AssignmentService;
