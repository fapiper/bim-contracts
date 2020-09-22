import Web3 from 'web3';
import BoQ from 'src/models/boq-model.js';
import Billing from 'src/models/billing-model.js';

class Project {
  constructor(
    name,
    designation,
    description,
    building_contractor,
    general_contractor,
    sub_contractors,
    billing,
    boqs
  ) {
    this.name = name;
    this.designation = designation;
    this.description = description;
    this.building_contractor = building_contractor;
    this.general_contractor = general_contractor;
    this.sub_contractors = sub_contractors;
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
      building_contractor: project.building_contractor,
      general_contractor: project.general_contractor,
      sub_contractors: project.sub_contractors,
      created: project.created,
      billing: Billing.toStore(project.billing),
      boqs: project.boqs.map(BoQ.toStore),
    };
  }

  static fromView(project, billing, boqs, address) {
    return new Project(
      project.name,
      project.designation,
      project.description,
      {
        name: 'Muster Bauherr',
        address: 0x0,
      },
      {
        name: 'Muster Generalunternehmer',
        address: address,
      },
      [],
      billing,
      boqs
    );
  }
}

export default Project;
