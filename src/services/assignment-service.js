import { abi as ServiceContractFactoryAbi } from 'src/contracts/ServiceContractFactory.json';
import { contract as ServiceContractFactoryAddress } from 'app/bim-contracts.config';

const n32 =
  '0x0000000000000000000000000000000000000000000000000000000000000000';

const unflatten = (array) => {
  const hashTable = Object.create(null);
  array.forEach((node) => (hashTable[node.hash] = { ...node, children: [] }));
  const tree = [];
  array.forEach((node) => {
    if (node.parent) hashTable[node.parent].children.push(hashTable[node.hash]);
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
};

class AssignmentService {
  constructor(orbitdb, boqService, web3) {
    this.orbitdb = orbitdb;
    this.assignmentdb = null;
    this.boqService = boqService;
    this.web3 = web3;
    this.factoryContract = new web3.eth.Contract(
      ServiceContractFactoryAbi,
      ServiceContractFactoryAddress
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

  async getAssignmentsByProject(project_hash, user_address) {
    const contracts = await this.factoryContract.methods
      .getContractsByContractor(user_address)
      .call();
    return this._buildContracts(contracts, project_hash);
  }

  async getAwardsByProject(project_hash, user_address) {
    const contracts = await this.factoryContract.methods
      .getContractsByClient(user_address)
      .call();
    return this._buildContracts(contracts, project_hash);
  }

  async _buildContracts(contracts, project_hash) {
    const build = async (contract) => {
      contract.service.stage = await this.factoryContract.methods
        .stageOf(contract.service.hash)
        .call();
      if (contract.stage < contract.service.stage) {
        contract.stage = contract.service.stage;
      }
      return contract;
    };
    return this.query(project_hash, (item) =>
      contracts.includes(item.hash)
    ).then((entries) => Promise.all(entries.map(build)));
  }

  async getChildren(project_hash, service_hash) {
    const build = async (service_hash) => {
      const item = await this.boqService
        .get(project_hash, service_hash)
        .then((items) => items[0]);
      item.stage = await this.factoryContract.methods
        .stageOf(service_hash)
        .call();
      return item;
    };
    const services = await this.factoryContract.methods
      .servicesOf(service_hash)
      .call();
    return Promise.all(services.map(build));
  }

  async getAllServices(project_hash, service) {
    const flatHandle = async (node, handleFn, collect = []) => {
      const children = await handleFn(node);
      const _collect = await Promise.all(
        children.map((child) => flatHandle(child, handleFn, collect))
      );
      _collect.push(node);
      return _collect.flat();
    };
    return flatHandle(service, (node) =>
      this.boqService.query(project_hash, (item) =>
        node.children.some((hash) => item.hash === hash)
      )
    );
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

  async assign(project_hash, contract) {
    await this.factoryContract.methods
      .create(contract.hash, contract.contractor.address)
      .send({ from: contract.client.address, gas: 2000000 });
    const services = await this.getAllServices(project_hash, contract.service);
    contract.children = unflatten(services);
    await traverseHandle(contract, async (node, children) => {
      const res = await this.factoryContract.methods
        .addServices(
          contract.hash,
          node.hash,
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
    await this.put(project_hash, contract);
    return contract;
  }

  async handleTransition(
    project_hash,
    contractor_address,
    service,
    { method, next }
  ) {
    console.log(method, next);
    const services = await this.getAllServices(project_hash, service).then(
      async (services) => {
        for (const _service of services) {
          _service.stage = await this.factoryContract.methods
            .stageOf(_service.hash)
            .call();
          if (_service.stage < next) {
            await this.factoryContract.methods[method](_service.hash).send({
              from: contractor_address,
              gas: 2000000,
            });
          }
        }
        return services;
      }
    );
    return services;
  }
}

export default AssignmentService;
