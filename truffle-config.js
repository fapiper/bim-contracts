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
    ropsten: {
      provider: () =>
        new HDWalletProvider(
          process.env.MNEMONIC,
          `https://ropsten.infura.io/v3/${process.env.INFURA_PROJECT_ID}`
        ),
      network_id: 3, // Ropsten's id
      gas: 238822, // Ropsten has a lower block limit than mainnet
      confirmations: 2, // # of confs to wait between deployments. (default: 0)
      timeoutBlocks: 200, // # of blocks before a deployment times out  (minimum/default: 50)
      skipDryRun: true, // Skip dry run before migrations? (default: false for public nets )
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
