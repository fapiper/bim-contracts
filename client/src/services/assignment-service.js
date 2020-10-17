import { abi as ServiceAgreementAbi } from 'src/contracts/ServiceAgreement.json';
import { agreementContract as ServiceAgreementAddress } from 'app/../bim-contracts.config';

const n32 =
  '0x0000000000000000000000000000000000000000000000000000000000000000';

const unflatten = (array) => {
  const hashTable = Object.create(null);
  array.forEach((node) => (hashTable[node.hash] = { ...node, children: [] }));
  const tree = [];
  array.forEach((node) => {
    if (node.parent && hashTable[node.parent])
      hashTable[node.parent].children.push(hashTable[node.hash]);
    else tree.push(hashTable[node.hash]);
  });
  return tree;
};

const traverseHandle = async (node, handleFn, once = true) => {
  const children = node.children || [];
  for (const child of children) {
    if (once) {
      once = false;
      handleFn && (await handleFn(node, children));
    }
    await traverseHandle(child, handleFn);
  }
  return node;
};

class AssignmentService {
  constructor(orbitdb, boqService, web3) {
    this.orbitdb = orbitdb;
    this.assignmentdb = null;
    this.boqService = boqService;
    this.web3 = web3;
    this.serviceAgreementContract = new web3.eth.Contract(
      ServiceAgreementAbi,
      ServiceAgreementAddress
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
    const contracts = await this.serviceAgreementContract.methods
      .getAgreementsByContractor(user_address)
      .call();
    return this._buildContracts(contracts, projectId);
  }

  async getAwardsByProject(projectId, user_address) {
    const contracts = await this.serviceAgreementContract.methods
      .getAgreementsByClient(user_address)
      .call();
    return this._buildContracts(contracts, projectId);
  }

  async _buildContracts(contracts, projectId) {
    const build = async (contract) => {
      contract.service.stage = await this.serviceAgreementContract.methods
        .stageOf(contract.hash, contract.service.hash)
        .call();
      if (contract.stage < contract.service.stage) {
        contract.stage = contract.service.stage;
      }
      return contract;
    };
    return this.query(projectId, (item) =>
      contracts.includes(item.hash)
    ).then((entries) => Promise.all(entries.map(build)));
  }

  async getChildren(projectId, agreement_hash, service_hash) {
    const build = async (service_hash) => {
      const item = await this.boqService
        .get(projectId, service_hash)
        .then((items) => items[0]);
      item.stage = await this.serviceAgreementContract.methods
        .stageOf(agreement_hash, service_hash)
        .call();
      return item;
    };
    const services = await this.serviceAgreementContract.methods
      .getServicesByAgreement(agreement_hash, service_hash)
      .call();
    return Promise.all(services.map(build));
  }

  async getAllServices(projectId, service) {
    const flatHandle = async (node, handleFn, collect = []) => {
      const children = await handleFn(node);
      const _collect = await Promise.all(
        children.map((child) => flatHandle(child, handleFn, collect))
      );
      _collect.push(node);
      return _collect.flat();
    };
    return flatHandle(service, (node) =>
      this.boqService.query(projectId, (item) =>
        node.children.some((hash) => item.hash === hash)
      )
    );
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

  async assign(projectId, contract) {
    await this.serviceAgreementContract.methods
      .createAgreement(
        contract.hash,
        contract.service.hash,
        contract.contractor.address
      )
      .send({ from: contract.client.address, gas: 2000000 });
    const flat = await this.getAllServices(projectId, contract.service);
    contract.children = unflatten(flat);
    await traverseHandle(contract, async (node, children) => {
      const parent =
        node.hash === contract.hash ? node.service.parent || n32 : node.hash;
      const res = await this.serviceAgreementContract.methods
        .addServices(
          contract.hash,
          parent,
          children.map((service) => service.hash),
          children.map(
            (service) =>
              (service.billing_item && service.billing_item.hash) || n32
          )
        )
        .send({
          from: contract.client.address,
          gas: 2000000,
        });
      return res;
    });

    await this.put(projectId, contract);
    return contract;
  }

  async handleTransition(user_address, agreementHash, service, method) {
    return this.serviceAgreementContract.methods[method](
      agreementHash,
      service.hash
    ).send({
      from: user_address,
      gas: 2000000,
    });
  }
}

export default AssignmentService;
