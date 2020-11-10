require('dotenv').config();

const { TreeUtils } = require('../utils/tree.utils.js');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const config = require('../bim-contracts.config');
const { abi } = require('../build/contracts/AgreementController.json');

const {
  getOrbitDB,
  parseContainer,
  getTransactionReceiptMined,
} = require('./helpers');
const Web3 = require('web3');

const n = 10;
const file = 5;

const n32 =
  '0x0000000000000000000000000000000000000000000000000000000000000000';

let start = 0;
let end = 0;
let endTx = 0;
let offStart = 0;
let offEnd = 0;
let onStart = 0;
let onEndServices = 0;
let onEnd = 0;
let onEndTx = 0;

const csvWriter = createCsvWriter({
  path: `./benchmark/LV-${file}_latency.csv`,
  header: [
    { id: 'index', title: 'INDEX' },
    { id: 'gasUsedServices', title: 'GAS_USED_SERVICES' },
    { id: 'gasUsedAgreement', title: 'GAS_USED_AGREEMENT' },
    { id: 'gasUsed', title: 'GAS_USED' },
    { id: 'gasUsedTx', title: 'GAS_USED_TX' },
    { id: 'servicesCount', title: 'COUNT_SERVICES' },
    { id: 'serviceSectionCount', title: 'COUNT_SERVICE_SECTION' },
    { id: 'serviceItemCount', title: 'COUNT_SERVICE_ITEM' },
    { id: 'billingCount', title: 'COUNT_BILLING' },
    { id: 'total', title: 'TOTAL' },
    { id: 'off', title: 'OFF_CHAIN' },
    { id: 'on', title: 'ON_CHAIN' },
    { id: 'onServices', title: 'ON_CHAIN_SERVICES' },
    { id: 'onAgreement', title: 'ON_CHAIN_AGREEMENT' },
    { id: 'totalTx', title: 'TOTAL_TX' },
    { id: 'onTx', title: 'ON_CHAIN_TX' },
  ],
});

const persistServices = async (orbitdb, projectId, services) => {
  const servicedb = await orbitdb.docs(`projects.${projectId}.boqs`, {
    indexBy: 'hash',
  });
  return servicedb.putAll(services);
};

const sendServices = async (services, agreement, agreementController) => {
  let gasUsed = 0;
  const addFn = async (node, children) => {
    console.log('send service', node);

    const payload = [
      node.hash,
      children.map((service) => service.hash),
      agreement.contractor,
    ];
    const res = await agreementController.methods
      .addServiceSection(...payload)
      .send({
        from: agreement.client,
        gas: 8000000,
        gasPrice: Web3.utils.toWei('100', 'gwei'),
      });
    console.log('succesfull sent service', res);
    gasUsed += res.gasUsed;
  };
  const deep = TreeUtils.unflat(services);
  await TreeUtils.deepHandle({ hash: n32, children: deep }, addFn);
  return gasUsed;
};

const createAgreement = async (web3, services) => {
  const account = await web3.eth.accounts.privateKeyToAccount(
    process.env.PRIVATE_KEY
  );
  web3.eth.accounts.wallet.add(account);

  return {
    services: services.filter((s) => !s.parent),
    client: account.address,
    contractor: account.address,
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
      gas: 8000000,
      gasPrice: Web3.utils.toWei('100', 'gwei'),
    });
};

(async (path = `/files/${file}/`) => {
  const metrics = [];
  try {
    const web3 = new Web3(
      new Web3.providers.HttpProvider(
        `https://ropsten.infura.io/v3/${process.env.INFURA_PROJECT_ID}`
      )
    );
    const agreementController = new web3.eth.Contract(
      abi,
      config.contract.ropsten
    );

    const projectId = '';
    const container = await parseContainer(path);
    const orbitdb = await getOrbitDB();

    const services = Object.values(container.boq.nodes);
    for (let i = 0; i < n; i++) {
      console.log('-----> Starting round', i);
      start = Date.now();

      offStart = Date.now();
      await persistServices(orbitdb, projectId, services);
      offEnd = Date.now();

      const agreement = await createAgreement(web3, services);
      console.log('sending services...');
      onStart = Date.now();
      const gasUsedServices = await sendServices(
        services,
        agreement,
        agreementController
      );
      console.log('creating agreement...');
      onEndServices = Date.now();
      const res = await sendAgreement(agreement, agreementController);
      onEnd = Date.now();
      end = Date.now();
      console.log('success sent transaction', res);
      const resTx = await getTransactionReceiptMined(
        web3,
        res.transactionHash,
        500
      );
      onEndTx = Date.now();
      endTx = Date.now();
      metrics.push({
        index: i,
        gasUsedServices: gasUsedServices,
        gasUsedAgreement: res.gasUsed,
        gasUsedAgreementTx: resTx.gasUsed,
        gasUsed: gasUsedServices + res.gasUsed,
        servicesCount: agreement.services.length,
        serviceSectionCount: services.filter((service) => !service.qty).length,
        serviceItemCount: services.filter((service) => service.qty).length,
        billingCount: services.filter((service) => service.billing_item).length,
        total: end - start,
        totalTx: endTx - start,
        off: offEnd - offStart,
        on: onEnd - onStart,
        onServices: onEndServices - onStart,
        onAgreement: onEnd - onEndServices,
        onTx: onEndTx - onStart,
      });
    }

    console.log('metrics', metrics);
    await csvWriter
      .writeRecords(metrics) // returns a promise
      .then(() => {
        console.log('...Done');
      });
    console.log('[upload-services.benchmark] FINISHED');
    return process.exit(0);
  } catch (error) {
    console.error('[upload-services.benchmark] ERROR', error);
    console.log('metrics', metrics);
    await csvWriter
      .writeRecords(metrics) // returns a promise
      .then(() => {
        console.log('...Done');
      });
    console.log('[upload-services.benchmark] FINISHED');
    return process.exit(1);
  }
})();
