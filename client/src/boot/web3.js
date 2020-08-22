import Web3 from 'web3';

export default async ({ Vue }) => {
  if (window.ethereum) {
    try {
      const web3 = new Web3(Web3.givenProvider);
      await window.ethereum.send('eth_requestAccounts');
      Vue.prototype.$web3 = web3;
    } catch (error) {
      console.error(
        'Error injecting web3 instance - User denied account access',
        error
      );
      // User denied account access…
    }
  } else {
    console.error('Error injecting web3 instance - MetaMask is not installed');
  }
};
