import Web3 from 'web3';

export default async ({ Vue }) => {
  try {
    const web3 = new Web3(Web3.givenProvider || 'http://127.0.0.1:9545/');
    Vue.prototype.$web3 = web3;
  } catch (error) {
    console.error('Error injecting web3 instance', error);
  }
};
