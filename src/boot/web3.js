import Web3 from 'web3';

export default async ({ Vue }) => {
  try {
    console.log('Web3.givenProvider', Web3.givenProvider);
    const web3 = new Web3(Web3.givenProvider || 'ws://127.0.0.1:8545/');
    Vue.prototype.$web3 = web3;
  } catch (error) {
    console.error('Error injecting web3 instance', error);
  }
};
