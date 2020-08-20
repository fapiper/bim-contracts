import Web3 from 'web3';

export default async ({ Vue }) => {
  if (window.ethereum) {
    try {
      const web3 = new Web3(Web3.givenProvider);
      Vue.prototype.$web3 = web3;
    } catch (error) {
      console.error(
        'Error injecting web3 instance - User denied account access…'
      );
      // User denied account access…
    }
  }
};
