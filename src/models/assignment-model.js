import Web3 from 'web3';

class Assignment {
  constructor(
    address,
    id,
    name,
    children,
    parent,
    service_hash,
    client_address,
    contractor_address
  ) {
    this.address = address;
    this.service = {
      id,
      name,
      children,
      parent,
      hash: service_hash,
    };
    this.client_address = client_address;
    this.contractor_address = contractor_address;
    this.visited = false;
    this.created = new Date().toJSON();
    this.hash = Web3.utils.sha3(this.address + this.created);
  }
}

export default Assignment;
