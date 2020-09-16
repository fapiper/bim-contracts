import IPFS from 'ipfs';
import OrbitDB from 'orbit-db';

// types = [ 'counter', 'eventlog', 'feed', 'docstore', 'keyvalue']

const dbs = {
  projectdb: { uri: 'projects', type: 'docstore', indexBy: 'hash' },
  userdb: { uri: 'users', type: 'keyvalue', indexBy: 'address' },
  billingdb: { uri: 'billings', type: 'docstore', indexBy: 'hash' },
  boqdb: { uri: 'boqs', type: 'docstore', indexBy: 'hash' },
  messagedb: { uri: 'messages', type: 'feed', indexBy: 'hash' },
};

const options = {
  namespace: 'bim-contracts',
  config: {
    create: true,
    sync: true,
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
    config: {
      Addresses: {
        Swarm: [
          '/dns4/wrtc-star1.par.dwebops.pub/tcp/443/wss/p2p-webrtc-star/',
        ],
      },
    },
  });
  const orbitdb = await OrbitDB.createInstance(ipfs);
  const openDb = async ({ uri, type, indexBy }) => {
    const db = await orbitdb.open(`${options.namespace}.${uri}`, {
      type,
      indexBy,
      ...options.config,
    });
    db.events.on('replicated', (args) => console.log('replicated db', ...args));
    return db;
  };
  const helper = {};
  await Promise.all(Object.keys(dbs).map((db) => openDb(dbs[db]))).then(
    (opened) => {
      Object.keys(dbs).forEach((db, i) => (helper[db] = opened[i]));
    }
  );
  helper.open = (uri, type = 'docstore', indexBy = 'hash') => {
    return openDb({ uri, type, indexBy });
  };
  Vue.prototype.$orbitdb = helper;
  await Promise.all(Object.keys(dbs).map((db) => helper[db].load()));
  return true;
};
