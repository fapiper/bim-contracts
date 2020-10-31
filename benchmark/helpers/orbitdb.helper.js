const OrbitDB = require('orbit-db');
const IPFS = require('ipfs');

const getOrbitDB = async () => {
  try {
    const ipfs = await IPFS.create({
      repo: './benchmark/.store/ipfs',
    });
    const orbitdb = await OrbitDB.createInstance(ipfs, {
      directory: './benchmark/.store/orbitdb',
    });
    return orbitdb;
  } catch (err) {
    console.error('Error creating OrbitDB instance', err);
  }
};

module.exports = getOrbitDB;
