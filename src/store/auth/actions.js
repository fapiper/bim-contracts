import { Cookies, Notify } from 'quasar';
import { User } from 'src/models/user-model';
import Config from 'app/bim-contracts.config';

const useMockData = true;

export async function register(state, data) {
  const account = useMockData
    ? await this._vm.$web3.eth.accounts.privateKeyToAccount(Config.privateKey)
    : await this._vm.$web3.eth.accounts.create();
  const wallet = await this._vm.$web3.eth.accounts.wallet.add(account);
  const user = new User(
    account.address,
    wallet.address,
    data.name,
    data.role,
    data.iban
  );
  await this._vm.$orbitdb.userdb.put(user.address, user);
  const privateKey = account.privateKey;
  state.commit('setUser', { privateKey, user });
  state.dispatch('setKey', {
    privateKey,
    rememberMe: data.rememberMe,
  });
  return true;
}

export async function login(state, { privateKey, rememberMe }) {
  const account = await this._vm.$web3.eth.accounts.privateKeyToAccount(
    privateKey
  );
  const user = await this._vm.$orbitdb.userdb.get(account.address);
  state.commit('setUser', { user, privateKey });
  state.dispatch('setKey', {
    privateKey,
    rememberMe,
  });
  Notify.create({
    message: 'Erfolgreich eingeloggt',
  });
  return true;
}

export function setKey(state, { rememberMe, privateKey }) {
  if (rememberMe) {
    Cookies.set('authorization_key', privateKey, {
      expires: 365,
    });
  } else {
    Cookies.set('authorization_key', privateKey);
  }
}

export async function fetch(state) {
  const privateKey = Cookies.get('authorization_key');
  if (privateKey) {
    const account = await this._vm.$web3.eth.accounts.privateKeyToAccount(
      privateKey
    );
    await this._vm.$orbitdb.userdb.load();
    const user = await this._vm.$orbitdb.userdb.get(account.address);
    state.commit('setUser', { user, privateKey });
    return user;
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
