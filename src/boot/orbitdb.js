import IPFS from 'ipfs';
import OrbitDB from 'orbit-db';

// types = [ 'counter', 'eventlog', 'feed', 'docstore', 'keyvalue']

const dbs = {
  projectdb: { uri: 'projects', config: { type: 'docstore', indexBy: 'hash' } },
  userdb: { uri: 'users', config: { type: 'keyvalue' } },
  billingdb: { uri: 'billings', config: { type: 'docstore', indexBy: 'hash' } },
  // boqdb: { uri: 'boqs', config:{type: 'docstore', indexBy: 'hash' },
  messagedb: { uri: 'messages', config: { type: 'feed' } },
};

const options = {
  namespace: 'bim-contracts',
  config: {
    create: true,
    accessController: {
      write: ['*'],
    },
  },
};

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
  // const openDb = async (uri, config) => {
  //   const db = await orbitdb.open(`${options.namespace}.${uri}`, {
  //     ...options.config,
  //     ...config,
  //   });
  //   db.events.on('replicated', (args) => console.log('replicated db', ...args));
  //   return db;
  // };
  // const helper = {};
  // await Promise.all(
  //   Object.keys(dbs).map((db) => openDb(dbs[db].uri, dbs[db].config))
  // ).then((opened) => {
  //   Object.keys(dbs).forEach((db, i) => (helper[db] = opened[i]));
  // });
  // helper.open = (uri, config) => {
  //   return openDb(uri, config);
  // };
  Vue.prototype.$orbitdb = orbitdb;
  // await Promise.all(Object.keys(dbs).map((db) => helper[db].load()));
  console.log('loaded all dbs');
  return true;
};
