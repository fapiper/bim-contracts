const Roles = {
  CLIENT: 'Bauherr',
  GENERAL_CONTRACTOR: 'Generalunternehmer',
  SUB_CONTRACTOR: 'Subunternehmer',
};

class User {
  constructor(address, wallet_address, name, role, iban) {
    this.address = address;
    this.wallet_addresses = [wallet_address];
    this.name = name;
    this.role = role;
    this.iban = iban;
    this.created = new Date().toJSON();
  }
}

export { Roles, User };
