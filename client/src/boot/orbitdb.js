// import something here
import IPFS from 'ipfs';
import OrbitDB from 'orbit-db';

export default async ({ Vue }) => {
  // Create IPFS instance
  const initIPFSInstance = async () => {
    return await IPFS.create({ repo: './js-ipfs-repo' });
  };

  initIPFSInstance().then(async (ipfs) => {
    const orbitdb = await OrbitDB.createInstance(ipfs);
    Vue.prototype.$orbitdb = orbitdb;

    // Create / Open a database
    // const db = await orbitdb.keyvalue('first-database');
    // await db.put('name', 'hello');
    // const value = db.get('name');
    // console.log(value);

    const db = await orbitdb.log('hello');
    await db.load();

    // Listen for updates from peers
    db.events.on('replicated', (address) => {
      console.log(db.iterator({ limit: -1 }).collect());
    });

    // Add an entry
    const hash = await db.add('world');
    console.log(hash);

    // Query
    const result = db.iterator({ limit: -1 }).collect();
    console.log(JSON.stringify(result, null, 2));
  });
};
