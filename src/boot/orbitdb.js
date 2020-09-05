import IPFS from 'ipfs';
import OrbitDB from 'orbit-db';

let orbitdb;

export default async ({ Vue }) => {
  try {
    Vue.prototype.$orbitdb = async () => {
      if (orbitdb) {
        return orbitdb;
      }
      orbitdb = {};
      const ipfs = await IPFS.create({ repo: './bim-contracts-ipfs' });
      const instance = await OrbitDB.createInstance(ipfs);

      const projectdb = await instance.docs('bim-contracts.projects', {
        indexBy: 'hash',
      });
      projectdb.load();

      const userdb = await instance.docs('bim-contracts.users', {
        indexBy: 'hash',
      });
      userdb.load();

      orbitdb.$projectdb = projectdb;
      orbitdb.$userdb = userdb;
      return orbitdb;
    };
  } catch (e) {
    console.log(e, 'Error installing orbit-db plugin', e);
  }
};
