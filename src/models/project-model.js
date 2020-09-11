/* eslint-disable camelcase */
import Web3 from 'web3';

class Project {
  constructor(
    name,
    designation,
    description,
    building_contractor,
    general_contractor,
    sub_contractors
  ) {
    this.name = name;
    this.designation = designation;
    this.description = description;
    this.building_contractor = building_contractor;
    this.general_contractor = general_contractor;
    this.sub_contractors = sub_contractors;
    this.created = new Date();
    this.hash = Web3.utils.sha3(this.name + this.created);
  }
}

export default Project;
