class UserService {
  constructor(orbitdb, userdb) {
    this.orbitdb = orbitdb;
    this.userdb = userdb;
  }

  static async init(orbitdb) {
    const userdb = await orbitdb.keyvalue('users', {
      create: true,
      accessController: {
        write: ['*'],
      },
    });
    await userdb.load();
    return new UserService(orbitdb, userdb);
  }

  get(address) {
    return this.userdb.get(address);
  }

  getAll() {
    return this.userdb.all;
  }

  async put(user) {
    await this.userdb.put(user.address, user);
    return user;
  }

  async delete(user) {
    const deleted = await this.userdb.del(user.address);
    console.log('deleted user', deleted);
    return deleted;
  }
}

export default UserService;
