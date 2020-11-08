module.exports = {
  controllerContract: '0x2F2a5e0d8C377963b03dB50778f8AfF399B38a14',
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
