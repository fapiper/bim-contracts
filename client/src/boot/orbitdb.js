// import something here
import IPFS from 'ipfs';
import OrbitDB from 'orbit-db';

export default async ({ Vue }) => {
  // Create IPFS instance
  const initIPFSInstance = async () => {
    return await IPFS.create({ repo: './bim-contracts-ipfs' });
  };

  initIPFSInstance().then(async (ipfs) => {
    // instantiate custom store
    const orbitdb = await OrbitDB.createInstance(ipfs);
    const containerdb = await orbitdb.docs('bim-contracts.container', {}); // DIN SPEC 91350 in json
    Vue.prototype.$ipfs = ipfs;
    Vue.prototype.$orbit = {
      containerdb,
    };

    // Create / Open a database
    // const db = await orbitdb.keyvalue('first-database');
    // await db.put('name', 'hello');
    // const value = db.get('name');
    // console.log(value);

    // const db = await orbitdb.log('hello');
    // await db.load();

    // // Listen for updates from peers
    // db.events.on('replicated', (address) => {
    //   console.log(db.iterator({ limit: -1 }).collect());
    // });

    // // Add an entry
    // const hash = await db.add('world');
    // console.log(hash);

    // // Query
    // const result = db.iterator({ limit: -1 }).collect();
    // console.log(JSON.stringify(result, null, 2));
    // const orbit = {};
    // orbit.register = (data) => {
    //   return store.dispatch('auth/register', data);
    // };
    // orbit.loggedIn = () => {
    //   return store.getters['auth/loggedIn'];
    // };
    // orbit.check = (roles) => {
    //   return store.getters['auth/check'](roles);
    // };
    // orbit.login = (data) => {
    //   return store.dispatch('auth/login', data);
    // };
    // orbit.setToken = (user) => {
    //   return store.dispatch('auth/setToken', user);
    // };
    // orbit.logout = () => {
    //   return store.dispatch('auth/logout');
    // };
    // orbit.verify = (user) => {
    //   return store.dispatch('auth/verify', user);
    // };
    // orbit.fetch = () => {
    //   return store.dispatch('auth/fetch');
    // };
    // orbit.user = () => {
    //   return store.getters['auth/user'];
    // };
    // Vue.prototype.$orbit = helper;
  });
};
