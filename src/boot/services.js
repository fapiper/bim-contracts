import IPFS from 'ipfs';
import OrbitDB from 'orbit-db';

import UserService from 'src/services/user-service.js';
import ProjectService from 'src/services/project-service.js';
import BoQService from 'src/services/boq-service.js';
import AssignmentService from 'src/services/assignment-service.js';

// types = [ 'counter', 'eventlog', 'feed', 'docstore', 'keyvalue']

export default async ({ Vue }) => {
  const ipfs = await IPFS.create({
    repo: './bim-contracts-ipfs',
    EXPERIMENTAL: {
      pubsub: true,
    },
    // config: {
    //   Addresses: {
    //     Swarm: [
    //       '/dns4/wrtc-star1.par.dwebops.pub/tcp/443/wss/p2p-webrtc-star/',
    //     ],
    //   },
    // },
  });
  const orbitdb = await OrbitDB.createInstance(ipfs);
  Vue.prototype.$orbitdb = orbitdb;
  const services = {};
  services.user = await UserService.init(orbitdb);
  services.boq = new BoQService(orbitdb);
  services.assignment = new AssignmentService(
    orbitdb,
    services.boq,
    Vue.prototype.$web3
  );
  services.project = await ProjectService.init(
    services.boq,
    services.assignment,
    orbitdb
  );
  Vue.prototype.$services = services;
  return true;
};
