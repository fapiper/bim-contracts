const OrbitDB = require('orbit-db');
const IPFS = require('ipfs');

const getOrbitDB = async (config) => {
  try {
    const ipfs = await IPFS.create(config);
    const orbitdb = await OrbitDB.createInstance(ipfs);
    return orbitdb;
  } catch (err) {
    console.error('Error creating OrbitDB instance', err);
  }
};

module.exports = getOrbitDB;
