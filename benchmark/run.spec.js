require('dotenv').config();

const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const config = require('../bim-contracts.config');
const { abi } = require('../build/contracts/AgreementController.json');

const {
  getOrbitDB,
  parseContainer,
  getTransactionReceiptMined,
} = require('./helpers');
const Web3 = require('web3');

const n = 100;
const file = 5;

const n32 =
  '0x0000000000000000000000000000000000000000000000000000000000000000';

const start = { total: 0, on: 0, off: 0, services: 0, agreement: 0 };
const end = {
  total: 0,
  on: 0,
  off: 0,
  agreement: 0,
  services: 0,
};

const csvWriter = createCsvWriter({
  path: `./benchmark/LV-${file}_latency.csv`,
  header: [
    { id: 'index', title: 'INDEX' },
    { id: 'servicesCount', title: 'COUNT_SERVICES' },
    { id: 'serviceSectionCount', title: 'COUNT_SERVICE_SECTION' },
    { id: 'serviceItemCount', title: 'COUNT_SERVICE_ITEM' },
    { id: 'billingCount', title: 'COUNT_BILLING' },
    { id: 'total', title: 'TOTAL' },
    { id: 'off', title: 'OFF_CHAIN' },
    { id: 'on', title: 'ON_CHAIN' },
    { id: 'services', title: 'SERVICES' },
    { id: 'agreement', title: 'AGREEMENT' },
  ],
});

const persistServices = async (orbitdb, projectId, services) => {
  const servicedb = await orbitdb.docs(`projects.${projectId}.boqs`, {
    indexBy: 'hash',
  });
  return servicedb.putAll(services);
};

const sendServices = (services, agreement, agreementController) => {
  const payload = [
    services.map((s) => s.hash),
    services.map((s) => s.parent || n32),
    agreement.contractor,
  ];
  return agreementController.methods.addServices(...payload).send({
    from: agreement.client,
    gas: 50000000,
    // gasPrice: Web3.utils.toWei('100', 'gwei'),
  });
};

const createAgreement = async (web3, services) => {
  const accounts = await web3.eth.getAccounts();
  const account = accounts[0];
  await web3.eth.personal.unlockAccount(account, '123456', 600);
  return {
    services: services.filter((s) => !s.parent),
    client: account,
    contractor: account,
    createdAt: new Date().toJSON(),
  };
};

const sendAgreement = (agreement, agreementController) => {
  return agreementController.methods
    .createAgreement(
      Web3.utils.sha3(JSON.stringify(agreement)),
      agreement.contractor,
      agreement.services.map((s) => s.hash)
    )
    .send({
      from: agreement.client,
      gas: 50000000,
      // gasPrice: Web3.utils.toWei('100', 'gwei'),
    });
};

(async (path = `/files/${file}/`) => {
  const metrics = [];
  let res = {};

  try {
    const web3 = new Web3(`http://127.0.0.1:8000`);
    const agreementController = new web3.eth.Contract(
      abi,
      config.contract.ropsten
    );

    const projectId = '';
    const container = await parseContainer(path);
    const orbitdb = await getOrbitDB();

    const services = Object.values(container.boq.nodes);
    for (let i = 0; i < n; i++) {
      console.log(
        '----- Starting round ' + (i + 1) + '/' + n + ' [LV-' + file + '] -----'
      );
      start.total = Date.now();
      await persistServices(orbitdb, projectId, services);
      end.off = Date.now();

      const agreement = await createAgreement(web3, services);
      console.log('sending services...');
      res = await sendServices(services, agreement, agreementController);
      console.log('success sending services');
      res = await getTransactionReceiptMined(web3, res.transactionHash, 10);
      end.services = Date.now();
      console.log('service sending mined');
      console.log('creating agreement...');
      res = await sendAgreement(agreement, agreementController);
      console.log('success creating agreement');
      res = await getTransactionReceiptMined(web3, res.transactionHash, 10);
      end.total = Date.now();
      console.log('agreement creation mined');

      metrics.push({
        index: i,
        servicesCount: services.length,
        serviceSectionCount: services.filter((service) => !service.qty).length,
        serviceItemCount: services.filter((service) => service.qty).length,
        billingCount: services.filter((service) => service.billing_item).length,
        total: end.total - start.total,
        off: end.off - start.total,
        on: end.total - end.off,
        services: end.services - end.off,
        agreement: end.total - end.services,
      });
      console.log(
        '----- Finished round ' +
          (i + 1) +
          ' in ' +
          metrics[i].total +
          ' ms -----'
      );
    }
    await csvWriter.writeRecords(metrics); // returns a promise
    console.log('FINISHED');
    return process.exit(0);
  } catch (error) {
    console.log('metrics', metrics);
    await csvWriter.writeRecords(metrics); // returns a promise
    console.error('ERROR', error);
    return process.exit(1);
  }
})();
