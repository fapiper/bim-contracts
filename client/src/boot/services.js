import IPFS from 'ipfs';
import OrbitDB from 'orbit-db';

import config from 'app/../bim-contracts.config';
import BoQService from 'src/services/boq-service.js';
import AssignmentService from 'src/services/assignment-service.js';

import AgreementDb from 'src/services/agreement.db.js';
import ContainerDb from 'app/src/services/container.db.js';
console.log('config.ipfs', config.ipfs);

// types = [ 'counter', 'eventlog', 'feed', 'docstore', 'keyvalue']
export default async ({ Vue }) => {
  const ipfs = await IPFS.create(config.ipfs);
  const orbitdb = await OrbitDB.createInstance(ipfs);
  Vue.prototype.$orbitdb = orbitdb;
  const services = {};
  const db = {};

  services.boq = new BoQService(orbitdb);
  const payload = [orbitdb, services.boq, Vue.prototype.$web3];
  services.assignment = new AssignmentService(...payload);

  db.container = new ContainerDb(orbitdb);
  db.agreement = new AgreementDb(...payload);
  db.user = await orbitdb.docs('users', {
    accessController: {
      write: ['*'],
    },
  });
  Vue.prototype.$services = services;
  Vue.prototype.$db = db;

  return true;
};
