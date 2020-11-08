import IPFS from 'ipfs';
import OrbitDB from 'orbit-db';

import config from 'app/../bim-contracts.config';
import AgreementUtils from 'app/../utils/agreement.utils.js';

export default async ({ Vue }) => {
  const ipfs = await IPFS.create(config.ipfs);
  const orbitdb = await OrbitDB.createInstance(ipfs);
  Vue.prototype.$orbitdb = orbitdb;

  const db = {};
  db.user = await orbitdb.docs('users', {
    accessController: {
      write: ['*'],
    },
  });
  db.service = (projectId) =>
    orbitdb.docs(`projects.${projectId}.services`, {
      indexBy: 'hash',
    });
  db.agreement = new AgreementUtils(db.service, Vue.prototype.$web3);

  Vue.prototype.$db = db;
  return true;
};
