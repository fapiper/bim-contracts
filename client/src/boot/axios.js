import config from '../../../bim-contracts.config';

import Vue from 'vue';
import axios from 'axios';

const axiosConfig = {
  baseURL: `http://127.0.0.1:${config.server.port || 3000}/api`,
};

Vue.prototype.$axios = axios.create(axiosConfig);
