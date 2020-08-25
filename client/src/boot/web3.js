import Web3 from 'web3';

export default async ({ Vue }) => {
  if (window.ethereum) {
    try {
      const web3 = new Web3(Web3.givenProvider || 'http://127.0.0.1:9545/');
      // await window.ethereum.send('eth_requestAccounts');
      Vue.prototype.$web3 = web3;
    } catch (error) {
      console.error('Error injecting web3 instance', error);
    }
  } else {
    console.error('Error injecting web3 instance - MetaMask is not installed');
  }
};
