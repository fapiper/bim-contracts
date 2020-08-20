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
  return true;
}

export function login(state, data) {
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
  if (token) {
    // axiosInstance.defaults.headers.common.Authorization = 'Bearer ' + token;
    state.commit('setUser', user);
  }
}

export function logout(state) {
  Cookies.remove('authorization_token');
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
