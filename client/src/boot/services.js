import IPFS from 'ipfs';
import OrbitDB from 'orbit-db';

import BoQService from 'src/services/boq-service.js';
import AssignmentService from 'src/services/assignment-service.js';

// types = [ 'counter', 'eventlog', 'feed', 'docstore', 'keyvalue']
export default async ({ Vue }) => {
  const ipfs = await IPFS.create({
    repo: './bim-contracts-ipfs',
    EXPERIMENTAL: {
      pubsub: true,
    },
  });
  const orbitdb = await OrbitDB.createInstance(ipfs);
  Vue.prototype.$orbitdb = orbitdb;
  const services = {};
  services.boq = new BoQService(orbitdb);
  services.assignment = new AssignmentService(
    orbitdb,
    services.boq,
    Vue.prototype.$web3
  );
  Vue.prototype.$services = services;
  return true;
};
