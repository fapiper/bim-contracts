import { abi as ServiceContractAbi } from 'src/contracts/ServiceContract.json';
import { serviceContract as ServiceContractAddress } from 'app/bim-contracts.config';

// const flatHandle = async (nodes, handleFn) => {
//   return nodes.flatMap(async (node) => {
//     const children = await handleFn(node);
//     if (children.length > 0) {
//       return flatHandle(children.flat(), handleFn);
//     } else {
//       return node;
//     }
//   });
// };

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
      .createServiceContract(
        assignment.hash,
        assignment.contractor.address,
        assignment.services.map((service) => service.hash)
      )
      .send({ from: assignment.client.address, gas: 2000000 });
    console.log('created contract', res);

    const handleFn = async (node) => {
      if (node.children.length > 0) {
        const services = await this.boqService.query(project_hash, (item) =>
          node.children.some((hash) => item.hash === hash)
        );
        const children = await Promise.all(services.map((s) => handleFn(s)));
        return children.flat();
      } else {
        return node;
      }
    };
    const services = await Promise.all(
      assignment.services.map(handleFn)
    ).then((services) => services.flat());

    console.log('services', services);
    console.log('put', assignment);
    await this.put(project_hash, assignment);
    //   batch.add(
    //     this.contract.methods.createCountry(
    //         country.name, 100, 100, 1000, this.account).send.request(this.contractObject, (err, res) => { // values are set to fixed for the example
    //      if (err) {
    //          throw err;
    //      } else {
    //      console.log(res) // this logs the transaction id
    //      }
    //  }));

    const batch = new this.web3.BatchRequest();
    services.slice(0, 2).forEach((service) =>
      batch.add(
        this.serviceContract.methods
          .addService(assignment.hash, service.hash, service.parent)
          .send.request(
            {
              from: '0x2784BbEBb56a6602920C69a15420DE0dcB707196',
              gas: 2000000,
            },
            (err, res) => {
              if (err) {
                throw err;
              } else {
                console.log(res);
              }
            }
          )
      )
    );
    await batch.execute();
    console.log('added res');

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
