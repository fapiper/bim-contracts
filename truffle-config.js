const { network } = require('./bim-contracts.config');

module.exports = {
  contracts_build_directory: './client/src/contracts',
  networks: {
    development: {
      host: network.host,
      port: network.port,
      network_id: network.id || '*',
    },
  },
  mocha: {},
  compilers: {
    solc: {},
  },
};
