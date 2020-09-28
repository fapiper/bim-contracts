import Web3 from 'web3';

class ServiceNode {
  constructor(id, name, children, billing_item) {
    this.id = id;
    this.name = name;
    this.children = children;
    this.billing_item = billing_item;
    this.created = new Date().toJSON();
  }

  get hash() {
    return Web3.utils.sha3(JSON.stringify(this));
  }

  static fromBoQItem(item) {
    return new ServiceNode(
      item.id,
      item.short_desc,
      item.children,
      item.billing_item
    );
  }

  static fromBoQCtgy(ctgy) {
    return new ServiceNode(
      ctgy.id,
      ctgy.name,
      ctgy.children,
      ctgy.billing_item
    );
  }
}

class ServiceContract extends ServiceNode {
  constructor(id, name, children, client, contractor, billing_item) {
    super(id, name, children, billing_item);
    this.client = client;
    this.contractor = contractor;
  }

  static fromBoQItem(item, actors) {
    return new ServiceContract(
      item.id,
      item.short_desc,
      item.children,
      item.billing_item,
      actors.client,
      actors.contractor
    );
  }

  static fromBoQCtgy(ctgy, actors) {
    return new ServiceContract(
      ctgy.id,
      ctgy.name,
      ctgy.children,
      ctgy.billing_item,
      actors.client,
      actors.contractor
    );
  }
}

export default { ServiceNode, ServiceContract };
