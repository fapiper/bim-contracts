import { Cookies, Notify } from 'quasar';
const user = {
  data: { id: -1 },
  attributes: {
    email: 'example@email.com',
    name: 'Max Mustermann',
    roleNames: 'generalContractor',
  },
};

export function register(state, data) {
  console.log('register', data);
  return true;
}

export function login(state, data) {
  console.log('login', data);
  state.commit('setUser', user);
  // const token = response.data.token;
  // axiosInstance.defaults.headers.common.Authorization = 'Bearer ' + token;
  state.dispatch('setToken', {
    token: 'EXAMPLE_TOKEN',
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
    Cookies.set('authorization_token', data.token, {
      expires: 365,
    });
  } else {
    Cookies.set('authorization_token', data.token);
  }
}

export async function fetch(state) {
  const token = Cookies.get('authorization_token');
  console.log('fetch', 'w/ token', token);
  if (token) {
    // axiosInstance.defaults.headers.common.Authorization = 'Bearer ' + token;
    state.commit('setUser', user);
  }
}

export function logout(state) {
  console.log('logout');
  Cookies.remove('authorization_token');
  state.commit('setUser', null);
}

export function verify(state, token) {
  console.log('verify', token);
  return true;
}
export function passwordForgot(state, data) {
  console.log('passwordForgot', data);
  return true;
}

export function passwordReset(state, { token, data }) {
  console.log('passwordReset', token, data);
  return true;
}
