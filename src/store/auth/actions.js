import { Cookies, Notify } from 'quasar';

const roles = {
  CLIENT: 0,
  GENERAL_CONTRACTOR: 1,
  SUB_CONTRACTOR: 2,
};

export async function register(state, data) {
  const account = await this._vm.$web3.eth.accounts.create();
  const wallet = await this._vm.$web3.eth.accounts.wallet.add(account);
  console.log('REGISTER', 'wallet', wallet, 'account', account);
  const user = {
    name: data.name,
    role: roles[data.role.id],
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
  const account = await this._vm.$web3.eth.accounts.privateKeyToAccount(
    data.privateKey
  );
  const user = {
    name: 'Max Mustermann',
    role: roles.GENERAL_CONTRACTOR,
    account,
  };
  state.commit('setUser', user);
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
  if (data.rememberMe) {
    Cookies.set('authorization_key', data.user.account.privateKey, {
      expires: 365,
    });
  } else {
    Cookies.set('authorization_key', data.user.account.privateKey);
  }
}

export async function fetch(state) {
  const privateKey = Cookies.get('authorization_key');
  if (privateKey) {
    const account = this._vm.$web3.eth.accounts.privateKeyToAccount(privateKey);
    const user = {
      name: 'Max Mustermann',
      role: roles.GENERAL_CONTRACTOR,
      account,
    };
    state.commit('setUser', user);
  }
}

export function logout(state) {
  Cookies.remove('authorization_key');
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
