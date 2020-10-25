import Web3 from 'web3';
import { network } from 'app/../bim-contracts.config';

export default async ({ Vue }) => {
  try {
    const web3 = new Web3(
      Web3.givenProvider || `http://${network.host}:${network.port}`
    );
    Vue.prototype.$web3 = web3;
  } catch (error) {
    console.error('Error injecting web3 instance', error);
  }
};
