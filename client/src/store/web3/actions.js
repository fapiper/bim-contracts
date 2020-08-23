import Web3 from 'web3';

export async function registerWeb3({ commit }) {
  if (window.ethereum) {
    try {
      await window.ethereum.send('eth_requestAccounts');
      const web3 = new Web3(Web3.givenProvider || 'ws://127.0.0.1:9545/');
      const instance = () => web3;
      const networkName = await web3.eth.net.getNetworkType();
      const coinbase = await web3.eth.getCoinbase();
      const balance = await web3.eth.getBalance(coinbase);
      commit('registerWeb3Instance', {
        instance,
        networkName,
        coinbase,
        balance,
      });
    } catch (error) {
      console.error('Error injecting web3 instance', error);
    }
  } else {
    console.error('Error injecting web3 instance - MetaMask is not installed');
  }
}
