import Web3 from 'web3';

class Assignment {
  constructor(service, client, contractor, status) {
    this.service = service;
    this.client = client;
    this.contractor = contractor;
    this.status = status;
    this.visited = false;
    this.created = new Date().toJSON();
    this.hash = Web3.utils.sha3(
      this.service.hash + this.contractor.address + this.created
    );
  }
}

export default Assignment;
