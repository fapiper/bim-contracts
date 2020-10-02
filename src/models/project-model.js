import Web3 from 'web3';

class Project {
  constructor(name, owner_address, actor_addresses) {
    this.name = name;
    this.owner_address = owner_address;
    this.actor_addresses = actor_addresses;
    this.created = new Date().toJSON();
    this.hash = Web3.utils.sha3(this.name + this.created);
  }

  static toStore(project) {
    return {
      hash: project.hash,
      name: project.name,
      owner_address: project.owner_address,
      actor_addresses: project.actor_addresses,
      created: project.created,
    };
  }

  static fromView(project, user_address) {
    return new Project(project.name, user_address, []);
  }
}

export default Project;
