import Web3 from 'web3';

class Assignment {
  constructor(address, service, client, contractor) {
    this.address = address;
    this.service = service;
    this.client = client;
    this.contractor = contractor;
    this.visited = false;
    this.created = new Date().toJSON();
    this.hash = Web3.utils.sha3(this.address + this.created);
  }
}

export default Assignment;
