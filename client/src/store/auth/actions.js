import { Cookies, Notify } from 'quasar';

const roles = {
  CLIENT: 0,
  GENERAL_CONTRACTOR: 1,
  SUB_CONTRACTOR: 2,
};

export async function register(state, data) {
  console.log('register', data);

  const account = await this.$web3.eth.accounts.create();
  await this.$web3.eth.accounts.wallet.add(account);

  const user = {
    name: data.name,
    role: roles[data.role],
    account,
  };
  state.dispatch('setToken', {
    user: user,
    rememberMe: data.rememberMe,
  });
  state.commit('setUser', user);
  return true;
}

export async function login(state, data) {
  console.log('login', data);
  const account = await this._vm.$web3.eth.accounts.privateKeyToAccount(
    data.privateKey
  );
  console.log('got account', account);

  const user = {
    name: 'Max Mustermann',
    role: roles.GENERAL_CONTRACTOR,
    account,
  };
  console.log('created user', user);

  state.commit('setUser', user);
  // const token = response.data.token;
  // axiosInstance.defaults.headers.common.Authorization = 'Bearer ' + token;
  state.dispatch('setToken', {
    user,
    rememberMe: data.rememberMe,
  });
  Notify.create({
    message: 'Erfolgreich eingeloggt',
  });

  return true;
}

export function setToken(state, data) {
  // axiosInstance.defaults.headers.common.Authorization = 'Bearer ' + data.token;
  if (data.rememberMe) {
    Cookies.set('authorization_key', data.user.privateKey, {
      expires: 365,
    });

    Cookies.set('authorization_user', data.user, {
      expires: 365,
    });
  } else {
    Cookies.set('authorization_user', data.user);
  }
}

export async function fetch(state) {
  const privateKey = Cookies.get('authorization_key');
  const user = Cookies.get('authorization_user');

  if (privateKey) {
    const account = this.$web3.eth.accounts.privateKeyToAccount(privateKey);
    const user = {
      name: 'Max Mustermann',
      role: roles.GENERAL_CONTRACTOR,
      account,
    };
    state.commit('setUser', user);
  } else if (user) {
    // axiosInstance.defaults.headers.common.Authorization = 'Bearer ' + token;
    state.commit('setUser', user);
  }
}

export function logout(state) {
  Cookies.remove('authorization_key');
  Cookies.remove('authorization_user');
  state.commit('setUser', null);
}

export function verify(state, token) {
  return true;
}
export function passwordForgot(state, data) {
  return true;
}

export function passwordReset(state, { token, data }) {
  return true;
}
