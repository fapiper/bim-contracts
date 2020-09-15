export function setUser(state, { user, privateKey }) {
  console.log('set user mutation', user, privateKey);
  user.privateKey = privateKey;
  state.user = user;
}
