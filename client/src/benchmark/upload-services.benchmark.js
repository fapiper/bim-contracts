const config = require('../../../bim-contracts.config');
const IcddParser = require('../utils/icdd-parser.js');
const { abi } = require('../src/contracts/AgreementController.json');

const OrbitDB = require('orbit-db');
const Web3 = require('web3');
const IPFS = require('ipfs');

// Metrics output function
const outputMetrics = (name, db, metrics) => {
  metrics.seconds++;
  console.log(
    `[${name}] ${metrics.queriesPerSecond} queries per second, ${metrics.totalQueries} queries in ${metrics.seconds} seconds (Oplog: ${db._oplog.length})`
  );
  metrics.queriesPerSecond = 0;

  if (metrics.seconds % 10 === 0) {
    console.log(
      `[${name}] --> Average of ${
        metrics.lastTenSeconds / 10
      } q/s in the last 10 seconds`
    );
    metrics.lastTenSeconds = 0;
  }
};

const getOrbitInstance = async () => {
  const ipfs = await IPFS.create(config.ipfs);
  return OrbitDB.createInstance(ipfs);
};

const persistBilling = async (orbitdb, projectId, billing) => {
  const billingdb = await orbitdb.keyvalue(`projects.${projectId}.billings`);
  return billingdb.put(billing);
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
    contractor: { address: accounts[0] },
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

const loadDemoFile = (path) => {
  const BoQFile = require(`${path}/BillingModelShortSzenario2/Payload Documents/Leistungsverzeichnis_1.xml`);
  const BillingModelFile = require(`${path}/BillingModelShortSzenario2/Payload Documents/BillingModel.xml`);

  const project = {
    name: 'Demoprojekt',
    contractor: '',
  };
  const container = {
    boqs: [new File([BoQFile], 'Demo-Leistungsverzeichnis.x83')],
    billingModel: new File([BillingModelFile], 'Demo-BillingModel.xml'),
  };

  return {
    project,
    container,
  };
};

const run = async (path = 'assets/demo/') => {
  try {
    console.log('[upload-services.benchmark] RUN');
    const web3 = new Web3(
      Web3.givenProvider ||
        `http://${config.network.host}:${config.network.port}`
    );
    const agreementController = new web3.eth.Contract(
      abi,
      config.controllerContract
    );

    const projectId = '';
    const file = loadDemoFile(path);
    const icdd = await IcddParser.parseFromFiles(
      file.container.billingModel,
      file.container.boqs
    );
    const orbitdb = await getOrbitInstance();
    await persistBilling(orbitdb, projectId, icdd.billing);
    await persistBoQs(orbitdb, projectId, icdd.boqs);
    const agreement = await createInitialAgreement(web3, icdd);

    const res = await sendInitialAgreement(agreement, agreementController);
    console.log('[upload-services.benchmark] FINISHED', res);
  } catch (error) {
    console.error('[upload-services.benchmark] ERROR', error);
  }
};

module.exports = run;
