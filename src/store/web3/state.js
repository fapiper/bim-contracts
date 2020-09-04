export default function () {
  return {
    web3: {
      instance: null,
      networkName: null,
      coinbase: null,
      balance: null,
      error: null,
      isInjected: false,
    },
    contractInstance: null,
  };
}
