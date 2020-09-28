import Web3 from 'web3';
import { Utils } from 'quasar';

class Project {
  constructor(_id, name, actors, created) {
    this._id = _id;
    this.name = name;
    this.actors = actors;
    this.created = created;
  }

  get hash() {
    return Web3.utils.sha3(JSON.stringify(this));
  }

  static toStore(project) {
    return {
      _id: project._id,
      name: project.name,
      actors: project.actors,
      created: project.created,
    };
  }

  static fromStore(project) {
    return new Project(
      project.name,
      project._id,
      project.actors,
      project.created
    );
  }

  static build(name, actors) {
    return new Project(Utils.uid(), name, actors, new Date().toJSON());
  }
}

export default Project;
