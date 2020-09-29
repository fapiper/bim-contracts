import Web3 from 'web3';
import BoQ from 'src/models/boq-model.js';
import Billing from 'src/models/billing-model.js';

class Project {
  constructor(name, designation, description, actor_address, billing, boqs) {
    this.name = name;
    this.designation = designation;
    this.description = description;
    this.actor_addresses = [actor_address];
    this.created = new Date().toJSON();
    this.hash = Web3.utils.sha3(this.name + this.created);
    this.billing = billing;
    this.boqs = boqs;
  }

  static toStore(project) {
    return {
      hash: project.hash,
      name: project.name,
      designation: project.designation,
      description: project.description,
      actor_addresses: project.actor_addresses,
      created: project.created,
      billing: Billing.toStore(project.billing),
      boqs: project.boqs.map(BoQ.toStore),
    };
  }

  static fromView(project, billing, boqs, user_address) {
    return new Project(
      project.name,
      project.designation,
      project.description,
      user_address,
      billing,
      boqs
    );
  }
}

export default Project;
