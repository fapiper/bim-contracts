export function setUser(state, { user, privateKey }) {
  if (user) {
    user.privateKey = privateKey;
    state.user = user;
  } else {
    state.user = null;
  }
}
