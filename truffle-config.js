require('dotenv').config();
const Web3 = require('web3');

const { network } = require('./bim-contracts.config');
var HDWalletProvider = require('truffle-hdwallet-provider');

module.exports = {
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
      // gas: 238822, // Ropsten has a lower block limit than mainnet
      gas: 8000000,
      gasPrice: Web3.utils.toWei('50', 'gwei'),
    },
    kovan: {
      provider: () =>
        new HDWalletProvider(
          process.env.MNEMONIC,
          `https://kovan.infura.io/v3/${process.env.INFURA_PROJECT_ID}`
        ),
      network_id: 42,
      gas: 60000000,
      gasPrice: 10000000000,
    },
  },
  mocha: {},
  compilers: {
    solc: {},
  },
};
