const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const csvWriter = createCsvWriter({
  path: './benchmark/res_latency.csv',
  header: [
    { id: 'index', title: 'INDEX' },
    { id: 'total', title: 'TOTAL' },
    { id: 'billing', title: 'BILLING' },
    { id: 'boq', title: 'BOQ' },
    { id: 'agreement', title: 'AGREEMENT' },
  ],
});

const config = require('../bim-contracts.config');

const { abi } = require('../client/src/contracts/AgreementController.json');

const { getOrbitDB, parseIcdd } = require('./helpers');
const Web3 = require('web3');

const persistBilling = async (orbitdb, projectId, billing) => {
  const billingdb = await orbitdb.docs(`projects.${projectId}.billings`, {
    indexBy: 'hash',
  });
  return billingdb.putAll(Object.values(billing.nodes));
};

const persistBoQs = async (orbitdb, projectId, boqs) => {
  const boqdb = await orbitdb.docs(`projects.${projectId}.boqs`, {
    indexBy: 'hash',
  });
  return Promise.all(boqs.map((boq) => boqdb.putAll(Object.values(boq.nodes))));
};

const createInitialAgreement = async (web3, icdd) => {
  const accounts = await web3.eth.getAccounts();
  return {
    name: 'Test Agreement',
    services: icdd.boqs.flatMap((boq) => Object.values(boq.nodes)), // ATTENTION: This agreement takes ALL services and NOT only roots (as in default interface)
    client: { address: accounts[0] },
    contractor: { address: accounts[1] },
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
    agreement.services.map((s) => (s.billing_item ? s.billing_item.hash : n32)),
  ];

  return agreementController.methods
    .createInitialAgreement(...payload)
    .send({ from: agreement.client.address, gas: 90000000 });
};

(async (path = '/files/3/') => {
  const n = 9;

  console.log('RUN');
  const metrics = [];
  try {
    const web3 = new Web3(
      Web3.givenProvider ||
        `http://${config.network.host}:${config.network.port}`
    );
    const agreementController = new web3.eth.Contract(
      abi,
      config.controllerContract
    );

    const projectId = '';
    const icdd = await parseIcdd(path);
    const orbitdb = await getOrbitDB();
    for (let i = 0; i < n; i++) {
      console.log('starting round', i);
      const start = Date.now();

      const billingStart = Date.now();
      await persistBilling(orbitdb, projectId, icdd.billing);
      const billingEnd = Date.now();

      const boqStart = Date.now();
      await persistBoQs(orbitdb, projectId, icdd.boqs);
      const boqEnd = Date.now();

      await createInitialAgreement(web3, icdd);
      const agreementStart = Date.now();
      // await sendInitialAgreement(agreement, agreementController);
      const agreementEnd = Date.now();

      const end = Date.now();
      metrics.push({
        index: i,
        total: end - start,
        boq: boqEnd - boqStart,
        billing: billingEnd - billingStart,
        agreement: agreementEnd - agreementStart,
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
