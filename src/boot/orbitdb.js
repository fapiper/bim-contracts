import IPFS from 'ipfs';
import OrbitDB from 'orbit-db';

const _orbitdb = {
  _initialized: false,
};

export default async ({ Vue }) => {
  const orbitdb = {};

  orbitdb.load = async () => {
    if (_orbitdb._initialized) {
      return _orbitdb;
    }
    _orbitdb._initialized = true;

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

    _orbitdb.$projectdb = projectdb;
    _orbitdb.$userdb = userdb;
    return _orbitdb;
  };

  Vue.prototype.$orbitdb = orbitdb;
};
