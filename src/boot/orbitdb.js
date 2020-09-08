import IPFS from 'ipfs';
import OrbitDB from 'orbit-db';

export default async ({ Vue }) => {
  const ipfs = await IPFS.create({ repo: './bim-contracts-ipfs' });
  const instance = await OrbitDB.createInstance(ipfs);
  const orbitdb = {};
  orbitdb.projectdb = await instance.docs('bim-contracts.projects', {
    indexBy: 'hash',
  });
  orbitdb.userdb = await instance.docs('bim-contracts.users', {
    indexBy: 'hash',
  });
  orbitdb.billingdb = await instance.docs('bim-contracts.billings', {
    indexBy: 'hash',
  });
  orbitdb.boqdb = await instance.docs('bim-contracts.boqs', {
    indexBy: 'hash',
  });

  Vue.prototype.$orbitdb = orbitdb;

  return true;
};
