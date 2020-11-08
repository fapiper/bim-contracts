import IPFS from 'ipfs';
import OrbitDB from 'orbit-db';

import config from 'app/../bim-contracts.config';
import BoQService from 'src/services/boq-service.js';
import AssignmentService from 'src/services/assignment-service.js';

import AgreementDb from 'src/services/agreement.db.js';

export default async ({ Vue }) => {
  const ipfs = await IPFS.create(config.ipfs);
  const orbitdb = await OrbitDB.createInstance(ipfs);
  Vue.prototype.$orbitdb = orbitdb;

  const services = {};
  const db = {};

  services.boq = new BoQService(orbitdb);
  services.assignment = new AssignmentService(
    orbitdb,
    services.boq,
    Vue.prototype.$web3
  );

  db.user = await orbitdb.docs('users', {
    accessController: {
      write: ['*'],
    },
  });
  db.service = (projectId) =>
    orbitdb.docs(`projects.${projectId}.services`, {
      indexBy: 'hash',
    });
  db.agreement = new AgreementDb(orbitdb, db.service, Vue.prototype.$web3);

  Vue.prototype.$services = services;
  Vue.prototype.$db = db;

  return true;
};
