import { abi as AgreementControllerAbi } from 'src/contracts/AgreementController.json';
import { controllerContract as AgreementControllerAddress } from 'app/../bim-contracts.config';

const n32 =
  '0x0000000000000000000000000000000000000000000000000000000000000000';

class AssignmentService {
  constructor(orbitdb, boqService, web3) {
    this.orbitdb = orbitdb;
    this.assignmentdb = null;
    this.boqService = boqService;
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
    const asignments = await this.agreementController.methods
      .getAgreementsByContractor(user_address)
      .call();
    return this._buildContracts(asignments, projectId);
  }

  async getAwardsByProject(projectId, user_address) {
    const awards = await this.agreementController.methods
      .getAgreementsByClient(user_address)
      .call();
    return this._buildContracts(awards, projectId);
  }

  async _buildContracts(contracts, projectId) {
    const build = async (contract) => {
      contract.stage = 0;
      await Promise.all(
        contract.services.map(async (service) => {
          const stage = await this.agreementController.methods
            .getStage(contract.hash, service.hash)
            .call();
          service.stage = parseInt(stage);
          if (contract.stage < service.stage) contract.stage = service.stage;
        })
      );
      return contract;
    };
    return this.query(projectId, (item) => contracts.includes(item.hash)).then(
      (entries) => {
        return Promise.all(entries.map(build));
      }
    );
  }

  async getChildren(projectId, agreement_hash, service_hash) {
    const build = async (service_hash) => {
      const item = await this.boqService
        .get(projectId, service_hash)
        .then((items) => items[0]);
      item.stage = await this.agreementController.methods
        .getStage(agreement_hash, service_hash)
        .call();
      return item;
    };
    const services = await this.agreementController.methods
      .getServicesByAgreement(agreement_hash, service_hash)
      .call();
    return Promise.all(services.map(build));
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

  // avg cost: 28002061 gwei
  async assignInitial(projectId, contract) {
    const services = await this.getAllServices(
      projectId,
      contract.services
    ).then((list) => list);
    const payload = [
      contract.hash,
      contract.contractor.address,
      services.map((s) => s.hash),
      services.map((s) => s.parent || n32),
      services.map((s) => (s.billing_item ? s.billing_item.hash : n32)),
    ];
    await this.agreementController.methods
      .createInitialAgreement(...payload)
      .send({ from: contract.client.address, gas: 50000000 });

    return contract;
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

  async handleTransition(user_address, agreementHash, service, method) {
    return this.agreementController.methods[method](
      agreementHash,
      service.hash
    ).send({
      from: user_address,
      gas: 2000000,
    });
  }
}

export default AssignmentService;
