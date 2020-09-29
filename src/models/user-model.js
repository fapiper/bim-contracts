const Roles = {
  CLIENT: 'Bauherr',
  GENERAL_CONTRACTOR: 'Generalunternehmer',
  SUB_CONTRACTOR: 'Subunternehmer',
};

class User {
  constructor(address, name, role, iban) {
    this.address = address;
    this.name = name;
    this.role = role;
    this.iban = iban;
    this.created = new Date().toJSON();
  }

  static toStore(user) {
    return {
      address: user.address,
      name: user.name,
      role: user.role,
      iban: user.iban,
      created: user.created,
    };
  }
}

export { Roles, User };
