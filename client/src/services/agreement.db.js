import { abi as AgreementControllerAbi } from 'src/contracts/AgreementController.json';
import { controllerContract as AgreementControllerAddress } from 'app/../bim-contracts.config';
import Web3 from 'web3';

const n32 =
  '0x0000000000000000000000000000000000000000000000000000000000000000';

class AgreementDb {
  constructor(orbitdb, serviceDb, web3) {
    this.orbitdb = orbitdb;
    this.assignmentdb = null;
    this.serviceDb = serviceDb;
    this.web3 = web3;
    this.agreementController = new web3.eth.Contract(
      AgreementControllerAbi,
      AgreementControllerAddress
    );
  }

  async loadDb(projectId) {
    if (this._assigned !== projectId) {
      const assignmentdb = await this.orbitdb.docstore(
        `projects.${projectId}.assignments`,
        {
          indexBy: 'hash',
          create: true,
          accessController: {
            write: ['*'],
          },
        }
      );
      await assignmentdb.load();
      this._assigned = projectId;
      this.assignmentdb = assignmentdb;
    }
    return this.assignmentdb;
  }

  async getAssignmentsByProject(projectId, user_address) {
    const assignments = await this.agreementController.methods
      .getAgreementsByContractor(user_address)
      .call();
    console.log('assignments', assignments);
    return this._buildContracts(projectId, assignments);
  }

  async getAwardsByProject(projectId, userAddress) {
    const awards = await this.agreementController.methods
      .getAgreementsByClient(userAddress)
      .call();
    console.log('awards', awards);
    return this._buildContracts(projectId, awards);
  }

  async _buildContracts(projectId, contracts) {
    return Promise.all(
      contracts.map(async (hash) => {
        const res = await this.agreementController.methods
          .getAgreement(hash)
          .call();
        const agreement = {
          hash,
          payed: res[0],
          client: res[1],
          contractor: res[2],
          services: res[3],
        };
        const servicedb = await this.serviceDb(projectId);
        await servicedb.load();
        agreement.services = await Promise.all(
          agreement.services.map(async (serviceHash) => {
            const data = await this.agreementController.methods
              .getService(serviceHash)
              .call();
            const service = servicedb.get(serviceHash)[0];
            if (service) {
              service.client = data[0];
              service.contractor = data[1];
              service.stage = parseInt(data[2]);
              return service;
            }
          })
        );
        return agreement;
      })
    );
  }

  async getChildren(projectId, agreement_hash, serviceHash) {
    const data = await this.agreementController.methods
      .getServicesOf(serviceHash)
      .call();

    const services = await Promise.all(
      data[0].map(async (hash, i) => {
        const service = await this.boqService
          .get(projectId, hash)
          .then((items) => items[0]);
        service.client = data[1][i];
        service.contractor = data[2][i];
        service.stage = parseInt(data[3][i]);
        return service;
      })
    );

    return services;
  }

  async getAllServices(projectId, services) {
    const flatHandle = async (node, handleFn, collect = []) => {
      const children = await handleFn(node);
      const _collect = await Promise.all(
        children.map((child) => flatHandle(child, handleFn, collect))
      );
      _collect.push(node);
      return _collect.flat();
    };
    const all = await Promise.all(
      services.map((service) =>
        flatHandle(service, (node) => {
          return this.boqService.query(projectId, (item) =>
            node.children.some((hash) => item.hash === hash)
          );
        })
      )
    );
    return all.flat();
  }

  async getSuperServices(projectId, service) {
    const build = async (node, collect = []) => {
      const parents = node.parent
        ? await this.boqService.get(projectId, node.parent)
        : [];
      const _collect = await Promise.all(
        parents.map((child) => build(child, collect))
      );
      _collect.push(node);
      return _collect.flat();
    };
    return build(service);
  }

  async put(projectId, assignment) {
    const assignmentdb = await this.loadDb(projectId);
    const hash = await assignmentdb.put(assignment);
    return hash;
  }

  async query(projectId, queryFn) {
    const assignmentdb = await this.loadDb(projectId);
    const assignments = await assignmentdb.query(queryFn);
    return assignments;
  }

  async addProject(services, agreement) {
    const payload = [
      Web3.utils.sha3(JSON.stringify(agreement)),
      agreement.contractor,
      services.filter((s) => !s.parent).map((s) => s.hash),
      services.map((s) => s.hash),
      services.map((s) => s.parent || n32),
    ];
    await this.agreementController.methods
      .createProject(...payload)
      .send({ from: agreement.client, gas: 60000000 });

    return agreement;
  }

  async assign(projectId, contract) {
    await this.agreementController.methods
      .createAgreement(
        contract.hash,
        contract.contractor.address,
        contract.services.map((s) => s.hash)
      )
      .send({ from: contract.client.address, gas: 2000000 });
    await this.put(projectId, contract);
    return contract;
  }

  async handleTransition(userAddress, service, method) {
    return this.agreementController.methods[method](service.hash).send({
      from: userAddress,
      gas: 2000000,
    });
  }
}

export default AgreementDb;
