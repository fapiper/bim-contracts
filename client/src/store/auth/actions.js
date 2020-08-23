import { Cookies, Notify } from 'quasar';

export function register(state, data) {
  return true;
}

export function login(state, data) {
  const user = {
    data: { id: -1 },
    attributes: {
      email: 'example@email.com',
      name: 'Max Mustermann',
      roleNames: 'generalContractor',
      privateKey:
        '4f1c6bd1c97431978901c04227da549f899a30d58eb6671cf8b78ccea6304923',
    },
  };

  state.commit('setUser', user);
  // const token = response.data.token;
  // axiosInstance.defaults.headers.common.Authorization = 'Bearer ' + token;
  state.dispatch('setToken', {
    user: user,
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
    Cookies.set('authorization_user', data.user, {
      expires: 365,
    });
  } else {
    Cookies.set('authorization_user', data.user);
  }
}

export async function fetch(state) {
  const user = Cookies.get('authorization_user');
  if (user) {
    // axiosInstance.defaults.headers.common.Authorization = 'Bearer ' + token;
    state.commit('setUser', user);
  }
}

export function logout(state) {
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
