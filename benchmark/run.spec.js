const config = require('../bim-contracts.config');

const { abi } = require('../client/src/contracts/AgreementController.json');

const { getOrbitDB, parseIcdd } = require('./helpers');
const Web3 = require('web3');

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

const run = async (path = '/files/3/') => {
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
    const icdd = await parseIcdd(path);
    const orbitdb = await getOrbitDB({
      repo: './benchmark/.ipfs',
    });

    const billingRes = await persistBilling(orbitdb, projectId, icdd.billing);
    console.log('stored billing', billingRes);
    const boqRes = await persistBoQs(orbitdb, projectId, icdd.boqs);
    console.log('stored boqs', boqRes);

    const agreement = await createInitialAgreement(web3, icdd);
    console.log('sending initial Agreement...');
    const res = await sendInitialAgreement(agreement, agreementController);
    console.log('sent initial Agreement', res);

    console.log('[upload-services.benchmark] FINISHED');
    return true;
  } catch (error) {
    console.error('[upload-services.benchmark] ERROR', error);
  }
};

return run();
