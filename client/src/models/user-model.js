class User {
  constructor(address, name, iban) {
    this.address = address;
    this.name = name;
    this.iban = iban;
    this.created = new Date().toJSON();
  }

  static toStore(user) {
    return {
      address: user.address,
      name: user.name,
      iban: user.iban,
      created: user.created,
    };
  }
}

export default User;
