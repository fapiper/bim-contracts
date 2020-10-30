require('dotenv').config();

const { network } = require('./bim-contracts.config');
var HDWalletProvider = require('truffle-hdwallet-provider');

module.exports = {
  contracts_build_directory: './client/src/contracts',
  networks: {
    development: {
      host: network.host,
      port: network.port,
      network_id: network.id || '*',
    },
    kovan: {
      provider: () =>
        new HDWalletProvider(
          process.env.MNEMONIC,
          `https://kovan.infura.io/v3/${process.env.INFURA_PROJECT_ID}`
        ),
      network_id: 42,
      gas: 4500000,
      gasPrice: 10000000000,
    },
  },
  mocha: {},
  compilers: {
    solc: {},
  },
};
