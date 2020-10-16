import Web3 from 'web3';

class Project {
  constructor(name, owner, actors) {
    this.name = name;
    this.owner = owner;
    this.actors = actors;
    this.created = new Date().toJSON();
    this.hash = Web3.utils.sha3(this.name + this.created);
  }

  static toStore(project) {
    return {
      hash: project.hash,
      name: project.name,
      owner: project.owner,
      actors: project.actors,
    };
  }

  static fromView(project, user_address) {
    return new Project(project.name, user_address, []);
  }
}

export default Project;
