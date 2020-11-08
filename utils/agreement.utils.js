const Web3 = require('web3');

const { TreeUtils } = require('./tree.utils.js');

const {
  contract: { development: AgreementControllerAddress },
} = require('../bim-contracts.config');
const {
  abi: AgreementControllerAbi,
} = require('../build/contracts/AgreementController.json');

const n32 =
  '0x0000000000000000000000000000000000000000000000000000000000000000';

class AgreementUtils {
  constructor(serviceDb, web3) {
    this.serviceDb = serviceDb;
    this.web3 = web3;
    this.agreementController = new web3.eth.Contract(
      AgreementControllerAbi,
      AgreementControllerAddress
    );
  }

  async getAssignmentsByProject(projectId, user_address) {
    const assignments = await this.agreementController.methods
      .getAgreementsByContractor(user_address)
      .call();
    return this.buildAgreement(projectId, assignments);
  }

  async getAwardsByProject(projectId, userAddress) {
    const awards = await this.agreementController.methods
      .getAgreementsByClient(userAddress)
      .call();
    return this.buildAgreement(projectId, awards);
  }

  async buildAgreement(projectId, contracts) {
    const builder = async (hash) => {
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
    };

    return Promise.all(contracts.map(builder)).then((agreements) =>
      agreements.filter((a) => a.services[0])
    );
  }

  async getChildren(projectId, serviceHash) {
    const data = await this.agreementController.methods
      .getServicesOf(serviceHash)
      .call();
    const servicedb = await this.serviceDb(projectId);
    await servicedb.load();

    const services = await Promise.all(
      data[0].map((hash, i) => {
        const service = servicedb.get(hash)[0];
        service.client = data[1][i];
        service.contractor = data[2][i];
        service.stage = parseInt(data[3][i]);
        return service;
      })
    );

    return services;
  }

  async addServices(services, agreement) {
    const addFn = async (node, children) => {
      const payload = [
        node.hash,
        children.map((service) => service.hash),
        agreement.contractor,
      ];
      await this.agreementController.methods
        .addServiceSection(...payload)
        .send({
          from: agreement.client,
          gas: 60000000,
        });
    };
    const deep = TreeUtils.unflat(services);
    await TreeUtils.deepHandle({ hash: n32, children: deep }, addFn);
  }

  async create(agreement) {
    await this.agreementController.methods
      .createAgreement(
        Web3.utils.sha3(JSON.stringify(agreement)),
        agreement.contractor,
        agreement.services.map((s) => s.hash)
      )
      .send({ from: agreement.client, gas: 60000000 });
    return agreement;
  }

  async pay(agreement) {
    return this.agreementController.methods.payAgreement(agreement.hash).send({
      from: agreement.client,
      gas: 2000000,
    });
  }

  async handleTransition(userAddress, service, method) {
    return this.agreementController.methods[method](service.hash).send({
      from: userAddress,
      gas: 2000000,
    });
  }
}

export default AgreementUtils;
