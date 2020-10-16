import { server } from 'app/../bim-contracts.config';

import Vue from 'vue';
import axios from 'axios';

const config = {
  baseURL: `http://127.0.0.1:${server.port || 3000}/api`,
};

Vue.prototype.$axios = axios.create(config);
