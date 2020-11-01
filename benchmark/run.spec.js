require('dotenv').config();

const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const config = require('../bim-contracts.config');
const { abi } = require('../client/src/contracts/AgreementController.json');

const {
  getOrbitDB,
  parseIcdd,
  getTransactionReceiptMined,
} = require('./helpers');
const Web3 = require('web3');

const n = 60;
const file = 1;

let start = 0;
let end = 0;
let endTx = 0;
let offStart = 0;
let offEnd = 0;
let onStart = 0;
let onEnd = 0;
let onEndTx = 0;

const csvWriter = createCsvWriter({
  path: `./benchmark/LV-${file}_latency.csv`,
  header: [
    { id: 'index', title: 'INDEX' },
    { id: 'gasUsed', title: 'GAS_USED' },
    { id: 'gasUsedTx', title: 'GAS_USED_TX' },
    { id: 'servicesCount', title: 'COUNT_SERVICES' },
    { id: 'serviceSectionCount', title: 'COUNT_SERVICE_SECTION' },
    { id: 'serviceItemCount', title: 'COUNT_SERVICE_ITEM' },
    { id: 'billingCount', title: 'COUNT_BILLING' },
    { id: 'total', title: 'TOTAL' },
    { id: 'off', title: 'OFF_CHAIN' },
    { id: 'on', title: 'ON_CHAIN' },
    { id: 'totalTx', title: 'TOTAL_TX' },
    { id: 'onTx', title: 'ON_CHAIN_TX' },
  ],
});

const persistServices = async (orbitdb, projectId, boqs) => {
  const nodes = boqs.map((boq) => Object.values(boq.nodes));
  const boqdb = await orbitdb.docs(`projects.${projectId}.boqs`, {
    indexBy: 'hash',
  });
  return Promise.all(nodes.map((node) => boqdb.putAll(node)));
};

const createInitialAgreement = async (web3, icdd) => {
  const account = await web3.eth.accounts.privateKeyToAccount(
    process.env.PRIVATE_KEY
  );
  console.log('account', account);

  web3.eth.accounts.wallet.add(account);

  return {
    name: 'Test Agreement',
    services: icdd.boqs.flatMap((boq) => Object.values(boq.nodes)), // ATTENTION: This agreement takes ALL services and NOT only roots (as in default interface)
    client: { address: account.address },
    contractor: { address: account.address },
    hash: Web3.utils.sha3(new Date().toJSON()),
  };
};

const sendInitialAgreement = (agreement, agreementController) => {
  const n32 =
    '0x0000000000000000000000000000000000000000000000000000000000000000';

  const payload = [
    agreement.hash,
    agreement.contractor.address,
    agreement.services.filter((s) => !s.parent).map((s) => s.hash),
    agreement.services.map((s) => s.hash),
    agreement.services.map((s) => s.parent || n32),
  ];

  return agreementController.methods
    .createProject(...payload)
    .send({ from: agreement.client.address, gas: 90000000 });
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
      config.controllerContract
    );

    const projectId = '';
    const icdd = await parseIcdd(path);
    const orbitdb = await getOrbitDB();
    for (let i = 0; i < n; i++) {
      console.log('-----> Starting round', i);
      start = Date.now();

      offStart = Date.now();
      await persistServices(orbitdb, projectId, icdd.boqs);
      offEnd = Date.now();

      const agreement = await createInitialAgreement(web3, icdd);
      onStart = Date.now();
      console.log('sending transaction...');
      const res = await sendInitialAgreement(agreement, agreementController);
      console.log('success sent transaction', res);
      onEnd = Date.now();
      end = Date.now();
      const resTx = await getTransactionReceiptMined(
        web3,
        res.transactionHash,
        500
      );
      onEndTx = Date.now();
      endTx = Date.now();
      metrics.push({
        index: i,
        gasUsed: res.gasUsed,
        gasUsedTx: resTx.gasUsed,
        servicesCount: agreement.services.length,
        serviceSectionCount: agreement.services.filter(
          (service) => !service.qty
        ).length,
        serviceItemCount: agreement.services.filter((service) => service.qty)
          .length,
        billingCount: agreement.services.filter(
          (service) => service.billing_item
        ).length,
        total: end - start,
        totalTx: endTx - start,
        off: offEnd - offStart,
        on: onEnd - onStart,
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
    return process.exit(1);
  }
})();
