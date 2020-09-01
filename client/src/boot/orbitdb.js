import IPFS from 'ipfs';
import OrbitDB from 'orbit-db';

export default async ({ Vue }) => {
  const initIPFSInstance = async () => {
    return await IPFS.create({ repo: './bim-contracts-ipfs' });
  };

  initIPFSInstance().then(async (ipfs) => {
    const orbitdb = await OrbitDB.createInstance(ipfs);
    const projects = await orbitdb.docs('bim-contracts.projects', {
      indexBy: 'hash',
    });
    const container = await orbitdb.docs('bim-contracts.container', {
      indexBy: 'hash',
    }); // DIN SPEC 91350 in json
    const users = await orbitdb.docs('bim-contracts.users');
    Vue.prototype.$db = {
      $projects: projects,
      $container: container,
      $users: users,
    };
  });
};
