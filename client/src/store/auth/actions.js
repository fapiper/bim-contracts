import { uid, Cookies, Notify, LocalStorage } from 'quasar';

const pushPrivateKeyToLocalStorage = (privateKey) => {
  let privateKeys = LocalStorage.getItem('key_history');
  privateKeys = privateKeys ? privateKeys.split(',') : [];
  privateKeys.push(privateKey);
  LocalStorage.set('key_history', privateKeys.toString());
};

async function fetchUser(privateKey) {
  const account = await this._vm.$web3.eth.accounts.privateKeyToAccount(
    privateKey
  );

  this._vm.$web3.eth.accounts.wallet.add(account);
  this._vm.$web3.eth.defaultAccount = account.address;
  await this._vm.$db.user.load();
  const users = this._vm.$db.user.query((u) => u.address === account.address);
  if (users.length > 0) {
    return users[0];
  } else {
    const message = 'Benutzer nicht bekannt';
    Notify.create({
      message,
    });
    throw Error(message);
  }
}

export async function register(state, data) {
  const account = await this._vm.$web3.eth.accounts.create();
  await this._vm.$web3.eth.accounts.wallet.add(account);
  const accounts = await this._vm.$web3.eth.getAccounts();
  await this._vm.$web3.eth.sendTransaction({
    from: accounts[0],
    to: account.address,
    value: this._vm.$web3.utils.toWei('50', 'ether'),
  });
  const privateKey = account.privateKey;

  const user = {
    _id: uid(),
    address: account.address,
    name: data.name,
    iban: data.iban,
    createdAt: new Date().toJSON(),
  };
  await this._vm.$db.user.load();
  await this._vm.$db.user.put(user);
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
  try {
    const user = await fetchUser.call(this, privateKey);
    state.commit('setUser', { user, privateKey });
    state.dispatch('setKey', {
      privateKey,
      rememberMe,
    });
    Notify.create({
      message: 'Erfolgreich eingeloggt',
    });
    return true;
  } catch (error) {
    return false;
  }
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
    try {
      const user = await fetchUser.call(this, privateKey);
      state.commit('setUser', { user, privateKey });
      return true;
    } catch (error) {
      console.error('error user', error);
    }
  }
  return false;
}

export function logout(state) {
  Cookies.remove('authorization_key');
  state.commit('setUser', { user: null });
}
