module.exports = {
  controllerContract: '0xB2f31174a4166B5D7DA787fF4fe240bAE4631B66',
  ropstenControllerContract: '0xF98761884e7eBdBc3F275ad5a11d721a9133fBE1',
  network: {
    host: '127.0.0.1',
    port: 7545,
    id: '5777',
  },
  server: {
    port: 8888,
  },
  mongodb: {
    uri: 'mongodb://127.0.0.1:27017',
  },
  ipfs: {
    repo: './bim-contracts-ipfs',
    EXPERIMENTAL: { pubsub: true },
    preload: {
      enabled: false,
    },
    config: {
      Addresses: {
        Swarm: [
          '/dns4/wrtc-star2.sjc.dwebops.pub/tcp/443/wss/p2p-webrtc-star/',
        ],
      },
    },
  },
};
