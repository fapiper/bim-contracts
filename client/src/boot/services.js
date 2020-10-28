import IPFS from 'ipfs';
import OrbitDB from 'orbit-db';

import config from 'app/../bim-contracts.config';
import BoQService from 'src/services/boq-service.js';
import AssignmentService from 'src/services/assignment-service.js';
import ProjectService from 'src/services/project-service.js';
console.log('config.ipfs', config.ipfs);

// types = [ 'counter', 'eventlog', 'feed', 'docstore', 'keyvalue']
export default async ({ Vue }) => {
  const ipfs = await IPFS.create(config.ipfs);
  const orbitdb = await OrbitDB.createInstance(ipfs);
  Vue.prototype.$orbitdb = orbitdb;
  const services = {};
  services.boq = new BoQService(orbitdb);
  services.assignment = new AssignmentService(
    orbitdb,
    services.boq,
    Vue.prototype.$web3
  );
  services.project = new ProjectService(services.boq, orbitdb);
  Vue.prototype.$services = services;
  return true;
};
