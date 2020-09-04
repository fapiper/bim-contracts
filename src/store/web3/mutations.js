/*
export function someMutation (state) {
}
*/

export function registerWeb3Instance(state, _web3) {
  console.log('registerWeb3instance Mutation being executed', _web3);
  const web3Copy = state.web3;
  web3Copy.instance = _web3.instance;
  web3Copy.coinbase = _web3.coinbase;
  web3Copy.networkName = _web3.networkName;
  web3Copy.balance = parseInt(_web3.balance, 10);
  web3Copy.isInjected = true;
  state.web3 = web3Copy;
}
