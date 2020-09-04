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
    await projects.load();

    // Listen for updates from peers
    projects.events.on('data', (dbname, event) => {
      console.log('replicated projects', dbname, event);
      // console.log(projects.iterator({ limit: -1 }).collect());
    });

    // projects.events.on('replicated', (address) => {
    //   console.log('replicated projects', address);
    //   console.log(projects.iterator({ limit: -1 }).collect());
    // });

    const users = await orbitdb.docs('bim-contracts.users');
    Vue.prototype.$db = {
      $projects: projects,
      $users: users,
    };
  });
};
