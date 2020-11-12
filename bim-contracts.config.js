module.exports = {
  contract: {
    development: '0x24CA71Bc5b89f8fE0685885Ed1317153A377B156',
    ropsten: '0x30fE12eEf36Ef6664DeC5e842Bc52F20c33a7B46',
  },
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

// geth --datadir "benchmark/geth/node01" account new
// new pw: 123456,
// address: 0xE20f6209c4AC9a88CEC0e07A7450AF9e6c49Be3c,
// geth --datadir "/geth/benchmark/node01[node02,...]" init /geth/benchmark/genesis.json
// geth --identity "node01" --rpc --rpcport "8000" --rpccorsdomain "*" --datadir "/geth/benchmark/node01/" --port "30303" --nodiscover --rpcapi "db,eth,net,web3,personal,miner,admin" --networkid 1900 --nat "any" --allow-insecure-unlock --targetgaslimit 100000000 --ipcdisable
// admin.addPeer("enode://19ddbb5d884fd44d0a9b54ca29279848bbcc037fd0110372a96334237fd5529149898032ba52dea8747621351648dcd171fce23c76fbda03eeababbac49068ab@127.0.0.1:30303?discport=0")
