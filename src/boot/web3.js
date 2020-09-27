import Web3 from 'web3';
import config from 'app/bim-contracts.config';

export default async ({ Vue }) => {
  try {
    const web3 = new Web3(
      Web3.givenProvider || `ws://${config.host}:${config.port}`
    );
    Vue.prototype.$web3 = web3;
  } catch (error) {
    console.error('Error injecting web3 instance', error);
  }
};
