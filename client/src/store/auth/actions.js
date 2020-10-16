import { Cookies, Notify, LocalStorage } from 'quasar';
import User from 'src/models/user-model';

const pushPrivateKeyToLocalStorage = (privateKey) => {
  let privateKeys = LocalStorage.getItem('key_history');
  privateKeys = privateKeys ? privateKeys.split(',') : [];
  privateKeys.push(privateKey);
  LocalStorage.set('key_history', privateKeys.toString());
};

export async function register(state, data) {
  const account = await this._vm.$web3.eth.accounts.create();
  await this._vm.$web3.eth.accounts.wallet.add(account);
  const accounts = await this._vm.$web3.eth.getAccounts();
  await this._vm.$web3.eth.sendTransaction({
    from: accounts[0],
    to: account.address,
    value: this._vm.$web3.utils.toWei('10', 'ether'),
  });
  const user = await this._vm.$axios.post('users', {
    address: account.address,
    name: data.name,
    iban: data.iban,
  });
  const privateKey = account.privateKey;
  state.commit('setUser', { privateKey, user });
  state.dispatch('setKey', {
    privateKey,
    rememberMe: data.rememberMe,
  });
  pushPrivateKeyToLocalStorage(privateKey);
  Notify.create({
    message: 'Erfolgreich registriert',
  });
  return true;
}

export async function login(state, { privateKey, rememberMe }) {
  const account = await this._vm.$web3.eth.accounts.privateKeyToAccount(
    privateKey
  );
  const user = await this._vm.$axios.get('users', account.address);
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
    this._vm.$web3.eth.accounts.wallet.add(account);
    this._vm.$web3.eth.defaultAccount = account.address;
    const user = await this._vm.$services.user.get(account.address);
    state.commit('setUser', { user, privateKey });
    return user;
  }
}

export function logout(state) {
  Cookies.remove('authorization_key');
  state.commit('setUser', { user: null });
}
