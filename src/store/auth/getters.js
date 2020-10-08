export function user(state) {
  return state.user;
}

export function loggedIn(state) {
  return state.user !== null;
}

export const check = (state) => (roles) => {
  // const user = state.user;
  // if (user) {
  //   return Array.isArray(roles)
  //     ? roles.includes(Roles[user.role])
  //     : roles === Roles[user.role];
  // }
  return false;
};
